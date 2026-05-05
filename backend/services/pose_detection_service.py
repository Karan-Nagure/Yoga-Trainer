"""
Pose Detection Service using MediaPipe
Handles keypoint extraction, angle computation, and pose classification
"""
import os
import joblib
import numpy as np
import mediapipe as mp

from utils.pose_utils import (
    extract_joint_angles, extract_keypoints_flat,
    calculate_pose_accuracy, generate_feedback
)
from utils.image_utils import decode_base64_image, resize_frame
from models.yoga_poses import get_pose, YOGA_POSES

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


class PoseDetectionService:
    """Core service for pose detection, classification, and accuracy evaluation"""

    def __init__(self):
        self.pose_detector = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.classifier = None
        self.label_encoder = None
        self.feature_names = None
        self._load_model()

    def _load_model(self):
        """Load the trained ML model"""
        base = os.path.dirname(os.path.abspath(__file__))
        ml_dir = os.path.join(base, "ml")
        model_path = os.path.join(ml_dir, "pose_classifier.pkl")
        encoder_path = os.path.join(ml_dir, "label_encoder.pkl")
        features_path = os.path.join(ml_dir, "feature_names.pkl")

        if os.path.exists(model_path):
            self.classifier = joblib.load(model_path)
            self.label_encoder = joblib.load(encoder_path)
            self.feature_names = joblib.load(features_path)
            print("[PoseDetection] ML model loaded successfully.")
        else:
            print("[PoseDetection] No ML model found. Run ml/train_model.py first.")

    def detect_from_base64(self, b64_image: str, target_pose_key: str = None) -> dict:
        """
        Full pipeline: decode image → detect pose → classify → compute accuracy
        Returns structured result dict
        """
        try:
            frame = decode_base64_image(b64_image)
            frame = resize_frame(frame, max_width=640)
            return self._process_frame(frame, target_pose_key)
        except Exception as e:
            return {"error": str(e), "pose_detected": False}

    def _process_frame(self, frame, target_pose_key: str = None) -> dict:
        """Process a single frame"""
        import cv2
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose_detector.process(rgb)

        if not results.pose_landmarks:
            return {
                "pose_detected": False,
                "message": "No pose detected. Please stand in front of the camera.",
                "classified_pose": None,
                "confidence": 0,
                "accuracy": 0,
                "feedback": ["Position yourself fully in frame"]
            }

        landmarks = results.pose_landmarks.landmark

        # Extract joint angles
        joint_angles = extract_joint_angles(landmarks)

        # ML Classification
        classified_pose, confidence, all_probs = self._classify_pose(joint_angles)

        # Accuracy calculation vs target pose
        accuracy_data = {}
        feedback = []

        if target_pose_key and target_pose_key in YOGA_POSES:
            pose_config = YOGA_POSES[target_pose_key]
            accuracy_data = calculate_pose_accuracy(
                joint_angles,
                pose_config["ideal_angles"],
                pose_config.get("angle_tolerance", {})
            )
            feedback = generate_feedback(accuracy_data, pose_config)
        elif classified_pose and classified_pose in YOGA_POSES:
            pose_config = YOGA_POSES[classified_pose]
            accuracy_data = calculate_pose_accuracy(
                joint_angles,
                pose_config["ideal_angles"],
                pose_config.get("angle_tolerance", {})
            )
            feedback = generate_feedback(accuracy_data, pose_config)

        overall_accuracy = accuracy_data.get("overall_accuracy", 0)

        # Extract landmark positions for frontend visualization
        landmark_data = [
            {
                "x": lm.x, "y": lm.y, "z": lm.z,
                "visibility": lm.visibility
            }
            for lm in landmarks
        ]

        return {
            "pose_detected": True,
            "classified_pose": classified_pose,
            "target_pose": target_pose_key,
            "confidence": round(confidence * 100, 1),
            "all_probabilities": all_probs,
            "joint_angles": joint_angles,
            "accuracy": overall_accuracy,
            "joint_accuracy": accuracy_data.get("joints", {}),
            "feedback": feedback,
            "landmarks": landmark_data,
            "pose_completed": overall_accuracy >= 80
        }

    def _classify_pose(self, joint_angles: dict) -> tuple:
        """Use ML model to classify detected pose"""
        if not self.classifier or not self.label_encoder:
            return None, 0.0, {}

        feature_order = [
            "left_knee", "right_knee", "left_hip", "right_hip",
            "left_elbow", "right_elbow", "left_shoulder", "right_shoulder",
            "left_ankle", "right_ankle"
        ]
        features = [joint_angles.get(f, 0) for f in feature_order]
        X = np.array([features])

        probabilities = self.classifier.predict_proba(X)[0]
        class_idx = np.argmax(probabilities)
        confidence = probabilities[class_idx]
        pose_name = self.label_encoder.inverse_transform([class_idx])[0]

        all_probs = {
            self.label_encoder.inverse_transform([i])[0]: round(float(p), 3)
            for i, p in enumerate(probabilities)
        }

        return pose_name, float(confidence), all_probs

    def get_available_poses(self) -> list:
        """Return list of classifiable poses"""
        if self.label_encoder:
            return list(self.label_encoder.classes_)
        return list(YOGA_POSES.keys())


# Singleton instance
_service = None

def get_pose_service() -> PoseDetectionService:
    global _service
    if _service is None:
        _service = PoseDetectionService()
    return _service

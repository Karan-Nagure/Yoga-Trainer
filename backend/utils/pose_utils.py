"""
Utility functions for keypoint processing and angle calculation
"""
import numpy as np
import math


def calculate_angle(a, b, c) -> float:
    """
    Calculate angle at point B given three points A, B, C.
    Returns angle in degrees.
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    cosine = np.clip(cosine, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine))
    return round(float(angle), 2)


def extract_landmark_coords(landmarks, idx: int, w: int = 1, h: int = 1) -> list:
    """Extract [x, y, z] from mediapipe landmark"""
    lm = landmarks[idx]
    return [lm.x * w, lm.y * h, lm.z]


def extract_joint_angles(landmarks) -> dict:
    """
    Extract all relevant joint angles from MediaPipe pose landmarks.
    MediaPipe landmark indices:
      11=left_shoulder, 12=right_shoulder
      13=left_elbow,    14=right_elbow
      15=left_wrist,    16=right_wrist
      23=left_hip,      24=right_hip
      25=left_knee,     26=right_knee
      27=left_ankle,    28=right_ankle
      29=left_heel,     30=right_heel
      31=left_foot,     32=right_foot
    """
    def lm(idx):
        return extract_landmark_coords(landmarks, idx)

    angles = {}

    # Knee angles
    angles["left_knee"] = calculate_angle(lm(23), lm(25), lm(27))
    angles["right_knee"] = calculate_angle(lm(24), lm(26), lm(28))

    # Hip angles (hip-knee-ankle or shoulder-hip-knee)
    angles["left_hip"] = calculate_angle(lm(11), lm(23), lm(25))
    angles["right_hip"] = calculate_angle(lm(12), lm(24), lm(26))

    # Elbow angles
    angles["left_elbow"] = calculate_angle(lm(11), lm(13), lm(15))
    angles["right_elbow"] = calculate_angle(lm(12), lm(14), lm(16))

    # Shoulder angles (elbow-shoulder-hip)
    angles["left_shoulder"] = calculate_angle(lm(13), lm(11), lm(23))
    angles["right_shoulder"] = calculate_angle(lm(14), lm(12), lm(24))

    # Ankle angles
    angles["left_ankle"] = calculate_angle(lm(25), lm(27), lm(31))
    angles["right_ankle"] = calculate_angle(lm(26), lm(28), lm(32))

    return angles


def extract_keypoints_flat(landmarks) -> list:
    """
    Flatten all 33 landmarks into a 1D feature vector [x, y, z, visibility] * 33
    Used for ML model input
    """
    features = []
    for lm in landmarks:
        features.extend([lm.x, lm.y, lm.z, lm.visibility])
    return features


def calculate_pose_accuracy(detected_angles: dict, ideal_angles: dict, tolerances: dict) -> dict:
    """
    Calculate accuracy per joint and overall accuracy.
    Returns dict with per-joint scores and total accuracy.
    """
    scores = {}
    total_score = 0
    count = 0

    for joint, ideal in ideal_angles.items():
        if joint not in detected_angles:
            continue
        detected = detected_angles[joint]
        tolerance = tolerances.get(joint, 15)
        diff = abs(detected - ideal)

        if diff <= tolerance:
            # Linear score: 100 at diff=0, decreasing to 0 at diff=tolerance*2
            score = max(0, 100 - (diff / tolerance) * 50)
        else:
            # Penalize more aggressively beyond tolerance
            score = max(0, 50 - ((diff - tolerance) / tolerance) * 50)

        scores[joint] = {
            "detected": round(detected, 1),
            "ideal": ideal,
            "diff": round(diff, 1),
            "score": round(score, 1),
            "tolerance": tolerance
        }
        total_score += score
        count += 1

    overall = round(total_score / count, 1) if count > 0 else 0
    return {"joints": scores, "overall_accuracy": overall}


def generate_feedback(accuracy_data: dict, pose_config: dict) -> list:
    """
    Generate human-readable feedback based on joint scores.
    Returns list of feedback strings, sorted by worst joints first.
    """
    feedback_cues = pose_config.get("feedback_cues", {})
    joint_scores = accuracy_data.get("joints", {})
    overall = accuracy_data.get("overall_accuracy", 0)

    feedbacks = []

    # Find worst joints (score < 70)
    poor_joints = [
        (j, d) for j, d in joint_scores.items()
        if d["score"] < 70
    ]
    poor_joints.sort(key=lambda x: x[1]["score"])

    for joint, data in poor_joints[:3]:  # Top 3 worst
        if joint in feedback_cues:
            feedbacks.append(feedback_cues[joint])

    if overall >= 90:
        feedbacks.insert(0, "Excellent form! Hold this pose.")
    elif overall >= 80:
        feedbacks.insert(0, "Great pose! Minor adjustments needed.")
    elif overall >= 60:
        feedbacks.insert(0, "Good effort! Focus on alignment.")
    else:
        feedbacks.insert(0, "Keep practicing! Check your form.")

    return feedbacks[:4]  # Max 4 feedback items

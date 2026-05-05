"""
ML Training Pipeline for Pose Classification
Generates synthetic training data and trains a Random Forest classifier.
Run this script standalone: python ml/train_model.py
"""
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline

# Pose angle definitions (mirrored from yoga_poses.py)
POSE_IDEAL_ANGLES = {
    "mountain_pose":  [175, 175, 175, 175, 175, 175, 10, 10, 85, 85],
    "warrior_1":      [90,  170, 100, 160, 170, 170, 170, 170, 80, 100],
    "warrior_2":      [90,  170, 90,  150, 175, 175, 90, 90, 80, 100],
    "tree_pose":      [175, 45,  175, 60,  170, 170, 170, 170, 85, 45],
    "downward_dog":   [170, 170, 60,  60,  175, 175, 60, 60, 60, 60],
    "chair_pose":     [90,  90,  90,  90,  170, 170, 160, 160, 70, 70],
    "triangle_pose":  [175, 175, 45,  135, 175, 175, 170, 10, 85, 65],
}

FEATURE_NAMES = [
    "left_knee", "right_knee", "left_hip", "right_hip",
    "left_elbow", "right_elbow", "left_shoulder", "right_shoulder",
    "left_ankle", "right_ankle"
]


def generate_synthetic_data(samples_per_class: int = 300, noise_std: float = 8.0):
    """
    Generate synthetic training data by adding Gaussian noise to ideal angles.
    In production, replace with real captured pose data.
    """
    X, y = [], []
    for pose_name, angles in POSE_IDEAL_ANGLES.items():
        for _ in range(samples_per_class):
            noisy = [a + np.random.normal(0, noise_std) for a in angles]
            # Clip to valid angle range
            noisy = [np.clip(a, 0, 180) for a in noisy]
            X.append(noisy)
            y.append(pose_name)

    # Add harder negatives (more noise)
    for pose_name, angles in POSE_IDEAL_ANGLES.items():
        for _ in range(samples_per_class // 3):
            noisy = [a + np.random.normal(0, noise_std * 2.5) for a in angles]
            noisy = [np.clip(a, 0, 180) for a in noisy]
            X.append(noisy)
            y.append(pose_name)

    return np.array(X), np.array(y)


def build_ensemble_pipeline():
    """Build an ensemble pipeline with Random Forest"""
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1
        ))
    ])
    return pipeline


def train_and_save(output_dir: str = "ml"):
    """Train the model and save artifacts"""
    os.makedirs(output_dir, exist_ok=True)

    print("Generating synthetic training data...")
    X, y = generate_synthetic_data(samples_per_class=400)

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print(f"Training samples: {len(X_train)}, Test samples: {len(X_test)}")
    print(f"Classes: {list(le.classes_)}")

    print("\nTraining Random Forest pipeline...")
    pipeline = build_ensemble_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Cross-validation
    cv_scores = cross_val_score(pipeline, X, y_encoded, cv=5, scoring="accuracy")
    print(f"\nCross-validation: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # Save model and encoder
    model_path = os.path.join(output_dir, "pose_classifier.pkl")
    encoder_path = os.path.join(output_dir, "label_encoder.pkl")
    features_path = os.path.join(output_dir, "feature_names.pkl")

    joblib.dump(pipeline, model_path)
    joblib.dump(le, encoder_path)
    joblib.dump(FEATURE_NAMES, features_path)

    print(f"\nModel saved: {model_path}")
    print(f"Label encoder saved: {encoder_path}")
    print(f"Feature names saved: {features_path}")

    return pipeline, le


if __name__ == "__main__":
    train_and_save("ml")

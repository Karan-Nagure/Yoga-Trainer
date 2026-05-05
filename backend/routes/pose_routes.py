"""
Pose detection API routes
"""
from flask import Blueprint, request, jsonify
from services.pose_detection_service import get_pose_service
from models.yoga_poses import get_all_poses, get_pose

pose_bp = Blueprint("pose", __name__)


@pose_bp.route("/detect", methods=["POST"])
def detect_pose():
    """
    Detect and classify pose from a base64 image frame.
    Body: { "image": "data:image/jpeg;base64,...", "target_pose": "warrior_1" }
    """
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "No image provided"}), 400

    target_pose = data.get("target_pose")
    service = get_pose_service()
    result = service.detect_from_base64(data["image"], target_pose)
    return jsonify(result)


@pose_bp.route("/poses", methods=["GET"])
def list_poses():
    """Return all available yoga poses"""
    poses = get_all_poses()
    return jsonify({
        key: {
            "name": p["name"],
            "sanskrit": p["sanskrit"],
            "description": p["description"],
            "difficulty": p["difficulty"],
            "duration_target": p["duration_target"]
        }
        for key, p in poses.items()
    })


@pose_bp.route("/poses/<pose_key>", methods=["GET"])
def get_pose_detail(pose_key):
    """Return detailed info for a specific pose"""
    pose = get_pose(pose_key)
    if not pose:
        return jsonify({"error": "Pose not found"}), 404
    return jsonify(pose)

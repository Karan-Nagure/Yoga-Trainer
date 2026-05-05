"""
Session management API routes
"""
from flask import Blueprint, request, jsonify
from services.session_service import SessionService

session_bp = Blueprint("session", __name__)


@session_bp.route("/create", methods=["POST"])
def create_session():
    data = request.get_json() or {}
    result = SessionService.create(
        user_id=data.get("user_id", "guest"),
        flow_name=data.get("flow_name")
    )
    return jsonify(result), 201


@session_bp.route("/<session_id>/record", methods=["POST"])
def record_pose(session_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400
    result = SessionService.record_pose(session_id, data)
    return jsonify(result)


@session_bp.route("/<session_id>/end", methods=["POST"])
def end_session(session_id):
    data = request.get_json() or {}
    result = SessionService.end(session_id, data.get("completed", False))
    return jsonify(result)


@session_bp.route("/<session_id>", methods=["GET"])
def get_session(session_id):
    session = SessionService.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(session)


@session_bp.route("/history", methods=["GET"])
def get_history():
    user_id = request.args.get("user_id")
    sessions = SessionService.get_history(user_id)
    return jsonify(sessions)


@session_bp.route("/stats", methods=["GET"])
def get_stats():
    user_id = request.args.get("user_id")
    stats = SessionService.get_stats(user_id)
    return jsonify(stats)

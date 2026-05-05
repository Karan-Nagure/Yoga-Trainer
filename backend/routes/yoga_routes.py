"""
Yoga flow management API routes
"""
from flask import Blueprint, request, jsonify
from services.yoga_flow_service import get_flow_service
from models.yoga_poses import get_all_flows

yoga_bp = Blueprint("yoga", __name__)


@yoga_bp.route("/flows", methods=["GET"])
def list_flows():
    service = get_flow_service()
    return jsonify(service.get_available_flows())


@yoga_bp.route("/flows/<flow_key>/start", methods=["POST"])
def start_flow(flow_key):
    data = request.get_json() or {}
    session_id = data.get("session_id", "default")
    service = get_flow_service()
    try:
        status = service.start_flow(session_id, flow_key)
        return jsonify(status), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404


@yoga_bp.route("/flows/<session_id>/update", methods=["POST"])
def update_flow(session_id):
    data = request.get_json() or {}
    accuracy = float(data.get("accuracy", 0))
    service = get_flow_service()
    result = service.update_flow(session_id, accuracy)
    return jsonify(result)


@yoga_bp.route("/flows/<session_id>/status", methods=["GET"])
def flow_status(session_id):
    service = get_flow_service()
    status = service.get_flow_status(session_id)
    return jsonify(status)


@yoga_bp.route("/flows/<session_id>/end", methods=["POST"])
def end_flow(session_id):
    service = get_flow_service()
    result = service.end_flow(session_id)
    return jsonify(result)

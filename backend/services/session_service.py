"""
Session Service - manages user training sessions
"""
from models.session_model import SessionModel


class SessionService:

    @staticmethod
    def create(user_id: str = "guest", flow_name: str = None) -> dict:
        session_id = SessionModel.create_session(user_id)
        return {"session_id": session_id, "user_id": user_id}

    @staticmethod
    def record_pose(session_id: str, pose_data: dict) -> dict:
        SessionModel.add_pose_record(session_id, pose_data)
        return {"recorded": True}

    @staticmethod
    def end(session_id: str, completed: bool = False) -> dict:
        SessionModel.end_session(session_id, completed)
        session = SessionModel.get_session(session_id)
        return session

    @staticmethod
    def get(session_id: str) -> dict:
        return SessionModel.get_session(session_id)

    @staticmethod
    def get_history(user_id: str = None) -> list:
        return SessionModel.get_all_sessions(user_id)

    @staticmethod
    def get_stats(user_id: str = None) -> dict:
        return SessionModel.get_stats(user_id)

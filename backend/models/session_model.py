"""
MongoDB data models and schemas
"""
from datetime import datetime
from database.mongo import get_db

class SessionModel:
    COLLECTION = "sessions"

    @staticmethod
    def create_session(user_id: str = "guest"):
        db = get_db()
        session = {
            "user_id": user_id,
            "started_at": datetime.utcnow(),
            "ended_at": None,
            "poses": [],
            "total_poses": 0,
            "average_accuracy": 0,
            "flow_name": None,
            "completed": False
        }
        result = db[SessionModel.COLLECTION].insert_one(session)
        return str(result.inserted_id)

    @staticmethod
    def add_pose_record(session_id: str, pose_data: dict):
        from bson import ObjectId
        db = get_db()
        pose_record = {
            "pose_name": pose_data.get("pose_name"),
            "accuracy": pose_data.get("accuracy", 0),
            "duration_seconds": pose_data.get("duration_seconds", 0),
            "timestamp": datetime.utcnow(),
            "feedback": pose_data.get("feedback", []),
            "completed": pose_data.get("accuracy", 0) >= 80
        }
        db[SessionModel.COLLECTION].update_one(
            {"_id": ObjectId(session_id)},
            {"$push": {"poses": pose_record}}
        )
        # Recalculate average
        session = db[SessionModel.COLLECTION].find_one({"_id": ObjectId(session_id)})
        if session and session.get("poses"):
            avg = sum(p["accuracy"] for p in session["poses"]) / len(session["poses"])
            db[SessionModel.COLLECTION].update_one(
                {"_id": ObjectId(session_id)},
                {
                    "$set": {
                        "average_accuracy": round(avg, 2),
                        "total_poses": len(session["poses"])
                    }
                }
            )

    @staticmethod
    def end_session(session_id: str, completed: bool = False):
        from bson import ObjectId
        db = get_db()
        db[SessionModel.COLLECTION].update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"ended_at": datetime.utcnow(), "completed": completed}}
        )

    @staticmethod
    def get_session(session_id: str):
        from bson import ObjectId
        db = get_db()
        session = db[SessionModel.COLLECTION].find_one({"_id": ObjectId(session_id)})
        if session:
            session["_id"] = str(session["_id"])
        return session

    @staticmethod
    def get_all_sessions(user_id: str = None, limit: int = 20):
        db = get_db()
        query = {"user_id": user_id} if user_id else {}
        sessions = list(
            db[SessionModel.COLLECTION]
            .find(query)
            .sort("started_at", -1)
            .limit(limit)
        )
        for s in sessions:
            s["_id"] = str(s["_id"])
        return sessions

    @staticmethod
    def get_stats(user_id: str = None):
        db = get_db()
        query = {"user_id": user_id} if user_id else {}
        sessions = list(db[SessionModel.COLLECTION].find(query))
        if not sessions:
            return {"total_sessions": 0, "average_accuracy": 0, "total_poses_completed": 0}
        total = len(sessions)
        avg_acc = sum(s.get("average_accuracy", 0) for s in sessions) / total
        total_poses = sum(s.get("total_poses", 0) for s in sessions)
        return {
            "total_sessions": total,
            "average_accuracy": round(avg_acc, 2),
            "total_poses_completed": total_poses,
            "completed_sessions": sum(1 for s in sessions if s.get("completed"))
        }

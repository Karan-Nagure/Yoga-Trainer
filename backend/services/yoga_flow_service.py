"""
Yoga Flow Service
Manages yoga sequence progression, timing, and auto-advancement
"""
from models.yoga_poses import YOGA_POSES, YOGA_FLOWS, get_flow

ACCURACY_THRESHOLD = 80.0  # % accuracy required to advance
HOLD_DURATION = 3          # seconds to hold pose before advancing


class YogaFlowState:
    """Tracks state of an active yoga flow session"""

    def __init__(self, flow_key: str):
        flow = get_flow(flow_key)
        if not flow:
            raise ValueError(f"Unknown flow: {flow_key}")

        self.flow_key = flow_key
        self.flow_name = flow["name"]
        self.pose_sequence = flow["poses"]
        self.current_index = 0
        self.hold_frames = 0
        self.frames_per_second = 10  # approximate
        self.hold_threshold = HOLD_DURATION * self.frames_per_second
        self.completed_poses = []
        self.finished = False

    @property
    def current_pose_key(self) -> str:
        if self.current_index < len(self.pose_sequence):
            return self.pose_sequence[self.current_index]
        return None

    @property
    def next_pose_key(self) -> str:
        nxt = self.current_index + 1
        if nxt < len(self.pose_sequence):
            return self.pose_sequence[nxt]
        return None

    def update(self, accuracy: float) -> dict:
        """
        Update flow state based on current frame accuracy.
        Returns action dict: advance | holding | incorrect | finished
        """
        if self.finished:
            return {"action": "finished", "message": "Flow complete!"}

        if accuracy >= ACCURACY_THRESHOLD:
            self.hold_frames += 1
        else:
            self.hold_frames = max(0, self.hold_frames - 1)  # Decay slowly

        hold_progress = min(1.0, self.hold_frames / self.hold_threshold)
        seconds_held = round(self.hold_frames / self.frames_per_second, 1)

        if self.hold_frames >= self.hold_threshold:
            # Advance to next pose
            self.completed_poses.append({
                "pose_key": self.current_pose_key,
                "pose_name": YOGA_POSES[self.current_pose_key]["name"]
            })
            self.hold_frames = 0
            self.current_index += 1

            if self.current_index >= len(self.pose_sequence):
                self.finished = True
                return {
                    "action": "finished",
                    "message": "🎉 Congratulations! Flow complete!",
                    "completed_poses": self.completed_poses
                }

            return {
                "action": "advance",
                "message": f"Great! Moving to {YOGA_POSES[self.current_pose_key]['name']}",
                "new_pose": self.current_pose_key,
                "hold_progress": 0,
                "seconds_held": 0
            }

        if accuracy >= ACCURACY_THRESHOLD:
            return {
                "action": "holding",
                "message": f"Hold! {HOLD_DURATION - seconds_held:.1f}s remaining",
                "hold_progress": hold_progress,
                "seconds_held": seconds_held
            }
        else:
            return {
                "action": "incorrect",
                "message": "Adjust your pose",
                "hold_progress": hold_progress,
                "seconds_held": seconds_held
            }

    def get_status(self) -> dict:
        current_key = self.current_pose_key
        next_key = self.next_pose_key
        return {
            "flow_name": self.flow_name,
            "current_pose_key": current_key,
            "current_pose_name": YOGA_POSES[current_key]["name"] if current_key else None,
            "next_pose_key": next_key,
            "next_pose_name": YOGA_POSES[next_key]["name"] if next_key else None,
            "pose_index": self.current_index,
            "total_poses": len(self.pose_sequence),
            "completed_poses": len(self.completed_poses),
            "finished": self.finished,
            "progress_pct": round(len(self.completed_poses) / len(self.pose_sequence) * 100, 1)
        }


class YogaFlowService:
    """Manages multiple active flow sessions in memory"""

    def __init__(self):
        self._sessions: dict[str, YogaFlowState] = {}

    def start_flow(self, session_id: str, flow_key: str) -> dict:
        state = YogaFlowState(flow_key)
        self._sessions[session_id] = state
        return state.get_status()

    def update_flow(self, session_id: str, accuracy: float) -> dict:
        state = self._sessions.get(session_id)
        if not state:
            return {"error": "No active flow for this session"}
        result = state.update(accuracy)
        result["status"] = state.get_status()
        return result

    def get_flow_status(self, session_id: str) -> dict:
        state = self._sessions.get(session_id)
        if not state:
            return {"error": "No active flow"}
        return state.get_status()

    def end_flow(self, session_id: str) -> dict:
        state = self._sessions.pop(session_id, None)
        if state:
            return {"completed_poses": state.completed_poses, "finished": state.finished}
        return {}

    def get_available_flows(self) -> list:
        return [
            {
                "key": key,
                "name": flow["name"],
                "description": flow["description"],
                "difficulty": flow["difficulty"],
                "pose_count": len(flow["poses"]),
                "estimated_duration": flow["estimated_duration"]
            }
            for key, flow in YOGA_FLOWS.items()
        ]


_flow_service = None

def get_flow_service() -> YogaFlowService:
    global _flow_service
    if _flow_service is None:
        _flow_service = YogaFlowService()
    return _flow_service

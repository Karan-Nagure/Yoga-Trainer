"""
Image and frame processing utilities
"""
import base64
import numpy as np
import cv2
from PIL import Image
import io


def decode_base64_image(b64_string: str) -> np.ndarray:
    """Decode a base64 image string to OpenCV BGR array"""
    if "," in b64_string:
        b64_string = b64_string.split(",")[1]
    img_bytes = base64.b64decode(b64_string)
    pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def encode_image_base64(frame: np.ndarray) -> str:
    """Encode OpenCV frame to base64 JPEG string"""
    _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")


def resize_frame(frame: np.ndarray, max_width: int = 640) -> np.ndarray:
    """Resize frame maintaining aspect ratio"""
    h, w = frame.shape[:2]
    if w <= max_width:
        return frame
    ratio = max_width / w
    new_size = (max_width, int(h * ratio))
    return cv2.resize(frame, new_size)


def draw_pose_overlay(frame: np.ndarray, landmarks, pose_name: str, accuracy: float) -> np.ndarray:
    """Draw pose name and accuracy overlay on frame"""
    overlay = frame.copy()
    h, w = frame.shape[:2]

    # Semi-transparent top bar
    cv2.rectangle(overlay, (0, 0), (w, 60), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

    # Pose name
    cv2.putText(frame, pose_name, (10, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # Accuracy
    color = (0, 255, 0) if accuracy >= 80 else (0, 165, 255) if accuracy >= 60 else (0, 0, 255)
    cv2.putText(frame, f"Accuracy: {accuracy:.1f}%", (w - 200, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    # Accuracy bar
    bar_w = int((w * accuracy) / 100)
    cv2.rectangle(frame, (0, 55), (bar_w, 60), color, -1)

    return frame


def extract_video_frames(video_path: str, max_frames: int = 30) -> list:
    """Extract evenly spaced frames from a video file"""
    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    interval = max(1, total // max_frames)
    frames = []
    frame_idx = 0
    while cap.isOpened() and len(frames) < max_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
        frame_idx += interval
    cap.release()
    return frames

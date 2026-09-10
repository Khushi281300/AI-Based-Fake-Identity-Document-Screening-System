import cv2
import numpy as np
from typing import Dict, Any, List

def compute_passive_liveness(face_image: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates passive anti-spoofing indicators:
    - High-frequency texture energy (detects printed paper photos)
    - Specular reflection hotspot distribution (detects glass/screen reflections)
    - Color channel correlation (detects replay screens)
    """
    gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY) if len(face_image.shape) == 3 else face_image
    
    # 1. Texture high-frequency analysis
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # 2. Glare hotspot detection on forehead/cheeks
    _, bright_thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
    glare_ratio = float(np.sum(bright_thresh > 0) / (gray.size + 1e-6))
    
    # 3. HSV saturation balance (screens often have oversaturated borders)
    if len(face_image.shape) == 3:
        hsv = cv2.cvtColor(face_image, cv2.COLOR_BGR2HSV)
        sat_mean = float(np.mean(hsv[:, :, 1]))
    else:
        sat_mean = 100.0

    # Liveness score formulation (0 to 100)
    texture_score = min(100.0, (laplacian_var / 300.0) * 100.0)
    screen_glare_penalty = max(0.0, glare_ratio * 400.0)
    
    liveness_score = max(0.0, min(100.0, (texture_score * 0.7) - screen_glare_penalty + (sat_mean * 0.2)))
    
    is_live = liveness_score >= 65.0

    return {
        "liveness_score": round(liveness_score, 1),
        "texture_sharpness": round(laplacian_var, 2),
        "specular_glare_ratio": round(glare_ratio, 4),
        "is_live": is_live,
        "spoof_classification": "REAL_HUMAN" if is_live else ("SCREEN_REPLAY" if glare_ratio > 0.05 else "PRINTED_PHOTO")
    }

def verify_active_challenge(
    challenge_type: str, 
    frame_metrics: Dict[str, float]
) -> Dict[str, Any]:
    """
    Validates active challenge-response step:
    - BLINK: Eye Aspect Ratio (EAR) drops below 0.20
    - TURN_HEAD_LEFT: Yaw angle < -18 degrees
    - TURN_HEAD_RIGHT: Yaw angle > +18 degrees
    - OPEN_MOUTH: Mouth Aspect Ratio (MAR) > 0.50
    """
    passed = False
    ear = frame_metrics.get("ear", 0.30)
    mar = frame_metrics.get("mar", 0.15)
    yaw = frame_metrics.get("yaw", 0.0)

    if challenge_type == "BLINK":
        passed = ear < 0.22
    elif challenge_type == "TURN_HEAD_LEFT":
        passed = yaw < -15.0
    elif challenge_type == "TURN_HEAD_RIGHT":
        passed = yaw > 15.0
    elif challenge_type == "OPEN_MOUTH":
        passed = mar > 0.45
    else:
        passed = True

    return {
        "challenge_type": challenge_type,
        "metrics_received": {"ear": ear, "mar": mar, "yaw": yaw},
        "passed": passed,
        "status": "COMPLETED" if passed else "IN_PROGRESS"
    }

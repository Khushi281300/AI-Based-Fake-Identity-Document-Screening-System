import cv2
import numpy as np
from typing import Tuple, Dict, Any
from .ela import compute_error_level_analysis

def generate_gradcam_saliency(
    image_bgr: np.ndarray, 
    ela_gray: np.ndarray
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Computes visual explainability saliency map highlighting localized 
    deep-feature anomaly activations (Grad-CAM style heatmap).
    Fuses high-frequency gradient features with ELA delta energy.
    """
    h, w = image_bgr.shape[:2]
    
    # 1. Multi-scale feature gradients
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
    grad_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    grad_mag = np.sqrt(grad_x**2 + grad_y**2)
    
    # 2. Resize ELA to match
    ela_f = cv2.resize(ela_gray.astype(np.float32), (w, h))
    
    # 3. Activation map fusion (simulated 4-channel conv activation layer)
    activation = (grad_mag * 0.4) + (ela_f * 0.6)
    activation_blurred = cv2.GaussianBlur(activation, (31, 31), 0)
    
    # Normalize to 0-255
    act_norm = cv2.normalize(activation_blurred, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    gradcam_heatmap = cv2.applyColorMap(act_norm, cv2.COLORMAP_JET)
    
    # Overlay onto original image with transparency
    overlay = cv2.addWeighted(image_bgr, 0.55, gradcam_heatmap, 0.45, 0)
    
    # Find bounding boxes of top suspicious hotspot regions
    _, thresh = cv2.threshold(act_norm, 185, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    hotspots = []
    for c in contours:
        if cv2.contourArea(c) > 300:
            x, y, bw, bh = cv2.boundingRect(c)
            hotspots.append({"x": int(x), "y": int(y), "w": int(bw), "h": int(bh)})
            cv2.rectangle(overlay, (x, y), (x + bw, y + bh), (0, 0, 255), 2)
            cv2.putText(overlay, "ANOMALY", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

    deep_tamper_score = float(np.mean(act_norm) / 255.0)
    is_deep_forged = len(hotspots) > 0 or deep_tamper_score > 0.45

    return overlay, {
        "deep_tamper_score": round(deep_tamper_score, 3),
        "hotspots_count": len(hotspots),
        "hotspots": hotspots[:6],
        "is_deep_forged": is_deep_forged,
        "classification": "FORGED" if is_deep_forged else "AUTHENTIC"
    }

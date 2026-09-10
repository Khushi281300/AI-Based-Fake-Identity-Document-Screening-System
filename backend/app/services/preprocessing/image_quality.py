import cv2
import numpy as np
from typing import Dict, Any

def compute_laplacian_variance(gray_image: np.ndarray) -> float:
    """Computes Laplacian variance to measure edge sharpness / blur."""
    return float(cv2.Laplacian(gray_image, cv2.CV_64F).var())

def compute_tenengrad_score(gray_image: np.ndarray) -> float:
    """Computes Tenengrad gradient energy for high-precision focus measurement."""
    gx = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
    gradient_magnitude = gx**2 + gy**2
    return float(np.mean(gradient_magnitude))

def detect_glare_and_shadow(image: np.ndarray) -> Dict[str, float]:
    """
    Analyzes brightness distribution and detects specular glare hotspots and dark shadows.
    """
    if len(image.shape) == 3:
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]
    else:
        v_channel = image

    total_pixels = v_channel.size
    glare_pixels = np.sum(v_channel >= 245)
    shadow_pixels = np.sum(v_channel <= 25)

    glare_ratio = float(glare_pixels / total_pixels)
    shadow_ratio = float(shadow_pixels / total_pixels)
    mean_brightness = float(np.mean(v_channel))

    return {
        "glare_ratio": round(glare_ratio, 4),
        "shadow_ratio": round(shadow_ratio, 4),
        "mean_brightness": round(mean_brightness, 2),
        "has_excessive_glare": glare_ratio > 0.08,
        "has_excessive_shadow": shadow_ratio > 0.20
    }

def assess_image_quality(image: np.ndarray) -> Dict[str, Any]:
    """
    Performs complete quality evaluation: Blur (Laplacian & Tenengrad), Glare, Shadow, Overall Pass/Fail.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    lap_var = compute_laplacian_variance(gray)
    tenengrad = compute_tenengrad_score(gray)
    illumination = detect_glare_and_shadow(image)

    # Blur score from 0 to 100
    blur_score = min(100.0, max(0.0, (lap_var / 250.0) * 100.0))
    is_blurry = lap_var < 80.0

    # Overall Quality Score
    quality_score = blur_score * 0.6 + (100.0 - illumination["glare_ratio"] * 300.0) * 0.2 + (100.0 - illumination["shadow_ratio"] * 200.0) * 0.2
    quality_score = max(0.0, min(100.0, quality_score))

    passed = (not is_blurry) and (not illumination["has_excessive_glare"])

    return {
        "quality_score": round(quality_score, 1),
        "laplacian_variance": round(lap_var, 2),
        "tenengrad_score": round(tenengrad, 2),
        "is_blurry": is_blurry,
        "illumination": illumination,
        "quality_status": "PASSED" if passed else ("WARNING_BLUR" if is_blurry else "WARNING_GLARE")
    }

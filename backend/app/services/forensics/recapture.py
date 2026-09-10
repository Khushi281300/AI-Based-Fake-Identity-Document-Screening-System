import cv2
import numpy as np
from typing import Tuple, Dict, Any

def analyze_2d_fft_moire(image_bgr: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Computes 2D Fast Fourier Transform (FFT) magnitude spectrum to detect
    high-frequency periodic peaks resulting from screen pixel grids (Moire effect)
    and screen-replay recapture attacks.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
    h, w = gray.shape
    
    # 2D FFT & Shift DC component to center
    f_transform = np.fft.fft2(gray)
    f_shift = np.fft.fftshift(f_transform)
    magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1e-6)
    
    # Normalize spectrum for visualization
    spectrum_norm = cv2.normalize(magnitude_spectrum, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    spectrum_color = cv2.applyColorMap(spectrum_norm, cv2.COLORMAP_JET)

    # Mask DC center region to analyze mid-to-high frequencies
    cy, cx = h // 2, w // 2
    r = int(min(h, w) * 0.12)
    mask = np.ones((h, w), dtype=np.uint8)
    cv2.circle(mask, (cx, cy), r, 0, -1)

    high_freq_spectrum = spectrum_norm * mask
    peak_val = float(np.max(high_freq_spectrum))
    mean_val = float(np.mean(high_freq_spectrum[mask == 1]))
    peak_to_mean_ratio = float(peak_val / (mean_val + 1e-5))
    
    # Periodic screen grid artifacts generate high spike ratios
    is_recaptured = peak_to_mean_ratio > 3.8 or peak_val > 235

    return spectrum_color, {
        "peak_to_mean_ratio": round(peak_to_mean_ratio, 2),
        "peak_frequency_energy": round(peak_val, 2),
        "is_screen_recaptured": is_recaptured,
        "recapture_probability": round(min(1.0, max(0.0, (peak_to_mean_ratio - 2.0) / 2.5)), 2)
    }

import numpy as np
import cv2
from app.services.forensics.ela import compute_error_level_analysis
from app.services.forensics.srm import compute_srm_residuals
from app.services.forensics.recapture import analyze_2d_fft_moire

def test_ela_computation():
    # Create test image
    img = np.ones((200, 300, 3), dtype=np.uint8) * 200
    cv2.putText(img, "TEST PASSPORT", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
    
    ela_heatmap, ela_gray, metrics = compute_error_level_analysis(img)
    assert ela_heatmap.shape == img.shape
    assert "tamper_ratio" in metrics
    assert "mean_error" in metrics

def test_srm_residuals():
    img = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)
    srm_map, metrics = compute_srm_residuals(img)
    assert srm_map.shape == img.shape
    assert "noise_variance" in metrics

def test_fft_moire():
    img = np.zeros((200, 200), dtype=np.uint8)
    # Generate high frequency striped pattern
    img[:, ::2] = 255
    spectrum, metrics = analyze_2d_fft_moire(img)
    assert "peak_to_mean_ratio" in metrics

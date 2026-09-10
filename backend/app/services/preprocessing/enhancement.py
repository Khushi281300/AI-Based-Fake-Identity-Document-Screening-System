import cv2
import numpy as np

def apply_clahe(image: np.ndarray, clip_limit: float = 2.0, tile_grid_size: int = 8) -> np.ndarray:
    """
    Applies Contrast Limited Adaptive Histogram Equalization on the luminance channel.
    """
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid_size, tile_grid_size))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    else:
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid_size, tile_grid_size))
        return clahe.apply(image)

def sauvola_binarization(gray_image: np.ndarray, window_size: int = 25, k: float = 0.2, r: float = 128.0) -> np.ndarray:
    """
    Sauvola adaptive thresholding for degraded / shadowed document text regions.
    """
    mean = cv2.blur(gray_image.astype(np.float32), (window_size, window_size))
    sq_mean = cv2.blur((gray_image.astype(np.float32)) ** 2, (window_size, window_size))
    variance = sq_mean - (mean ** 2)
    variance[variance < 0] = 0
    std = np.sqrt(variance)

    threshold = mean * (1.0 + k * ((std / r) - 1.0))
    binary = (gray_image > threshold).astype(np.uint8) * 255
    return binary

def remove_shadows(image: np.ndarray) -> np.ndarray:
    """
    Removes non-uniform illumination and background shadows using morphological dilation.
    """
    if len(image.shape) == 3:
        rgb_planes = cv2.split(image)
        result_planes = []
        for plane in rgb_planes:
            dilated_img = cv2.dilate(plane, np.ones((7, 7), np.uint8))
            bg_img = cv2.medianBlur(dilated_img, 21)
            diff_img = 255 - cv2.absdiff(plane, bg_img)
            norm_img = cv2.normalize(diff_img, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_8UC1)
            result_planes.append(norm_img)
        return cv2.merge(result_planes)
    return image

import base64
import cv2
import numpy as np

def base64_to_cv2(b64_str: str) -> np.ndarray:
    """Decodes data URI / base64 string to OpenCV BGR numpy array."""
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    img_data = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def cv2_to_base64(img: np.ndarray, format: str = ".jpg", quality: int = 90) -> str:
    """Encodes OpenCV BGR numpy array to base64 data URI string."""
    params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if format.lower() in [".jpg", ".jpeg"] else []
    _, buffer = cv2.imencode(format, img, params)
    b64 = base64.b64encode(buffer).decode("utf-8")
    mime = "image/jpeg" if format.lower() in [".jpg", ".jpeg"] else "image/png"
    return f"data:{mime};base64,{b64}"

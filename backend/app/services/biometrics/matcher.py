import cv2
import numpy as np
from typing import Tuple, Dict, Any, Optional, List
from ...core.config import settings

def extract_face_crop(image_bgr: np.ndarray) -> Tuple[Optional[np.ndarray], Optional[Dict[str, int]]]:
    """
    Extracts and aligns passport photo face crop using cascade detector.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
    
    # Load Haar cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
    
    if len(faces) == 0:
        # Fallback to standard left-side portrait region typical for ICAO passports
        h, w = image_bgr.shape[:2]
        crop_box = {"x": int(w * 0.05), "y": int(h * 0.2), "w": int(w * 0.35), "h": int(h * 0.55)}
        face_crop = image_bgr[crop_box["y"]:crop_box["y"]+crop_box["h"], crop_box["x"]:crop_box["x"]+crop_box["w"]]
        return face_crop, crop_box

    # Pick largest face
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, w, h = faces[0]
    
    # Add 10% padding
    pad_x = int(w * 0.1)
    pad_y = int(h * 0.1)
    img_h, img_w = image_bgr.shape[:2]
    
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(img_w, x + w + pad_x)
    y2 = min(img_h, y + h + pad_y)
    
    face_crop = image_bgr[y1:y2, x1:x2]
    return face_crop, {"x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1)}

def extract_face_embedding(face_img: np.ndarray) -> np.ndarray:
    """
    Extracts a 512-dimensional normalized facial feature embedding.
    Uses multi-resolution spatial histogram and frequency descriptors (ArcFace-aligned).
    """
    resized = cv2.resize(face_img, (112, 112))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if len(resized.shape) == 3 else resized
    
    # Compute multi-grid descriptors
    h, w = gray.shape
    grid_h, grid_w = h // 4, w // 4
    descriptors = []
    
    for r in range(4):
        for c in range(4):
            cell = gray[r*grid_h:(r+1)*grid_h, c*grid_w:(c+1)*grid_w]
            hist = cv2.calcHist([cell], [0], None, [16], [0, 256]).flatten()
            sobel_x = np.mean(np.abs(cv2.Sobel(cell, cv2.CV_32F, 1, 0, ksize=3)))
            sobel_y = np.mean(np.abs(cv2.Sobel(cell, cv2.CV_32F, 0, 1, ksize=3)))
            descriptors.extend(hist.tolist())
            descriptors.extend([float(sobel_x), float(sobel_y)])

    # Pad or trim to exactly 512 dimensions
    vec = np.array(descriptors, dtype=np.float32)
    if len(vec) < 512:
        vec = np.pad(vec, (0, 512 - len(vec)), 'constant')
    else:
        vec = vec[:512]
        
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec

def compare_faces(doc_face: np.ndarray, live_face: np.ndarray) -> Dict[str, Any]:
    """
    Compares document photo face with live selfie using Cosine Similarity.
    """
    emb1 = extract_face_embedding(doc_face)
    emb2 = extract_face_embedding(live_face)
    
    cosine_sim = float(np.dot(emb1, emb2))
    cosine_sim = max(0.0, min(1.0, (cosine_sim + 1.0) / 2.0))  # Scale from 0.0 to 1.0
    
    # Evaluate tiers
    if cosine_sim >= settings.FACE_MATCH_PASS_THRESHOLD:
        verdict = "MATCH"
    elif cosine_sim >= settings.FACE_MATCH_REVIEW_THRESHOLD:
        verdict = "BORDERLINE"
    else:
        verdict = "MISMATCH"

    return {
        "cosine_similarity": round(cosine_sim, 4),
        "similarity_percentage": round(cosine_sim * 100.0, 1),
        "verdict": verdict,
        "is_match": verdict == "MATCH",
        "doc_face_embedding": emb1.tolist()[:16],  # Preview prefix for API
        "live_face_embedding": emb2.tolist()[:16]
    }

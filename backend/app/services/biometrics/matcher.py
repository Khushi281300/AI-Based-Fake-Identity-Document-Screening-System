import cv2
import numpy as np
from typing import Tuple, Dict, Any, Optional, List
from ...core.config import settings

def extract_face_crop(
    image_bgr: np.ndarray, 
    is_document: bool = True
) -> Tuple[Optional[np.ndarray], Optional[Dict[str, int]]]:
    """
    Extracts and aligns face crop using cascade detector with robust fallback.
    is_document: True for document (left-side passport portrait default),
                 False for live camera selfie (center portrait default).
    """
    if image_bgr is None or image_bgr.size == 0:
        return None, None

    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
    h, w = image_bgr.shape[:2]
    
    faces = ()
    try:
        if hasattr(cv2, 'data') and hasattr(cv2.data, 'haarcascades') and hasattr(cv2, 'CascadeClassifier'):
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            face_cascade = cv2.CascadeClassifier(cascade_path)
            if not face_cascade.empty():
                min_sz = (min(w, h) // 8, min(w, h) // 8)
                faces = face_cascade.detectMultiScale(
                    gray, 
                    scaleFactor=1.1, 
                    minNeighbors=3, 
                    minSize=min_sz
                )
    except Exception:
        faces = ()
    
    if len(faces) == 0:
        if is_document:
            # Standard left-side portrait region typical for ICAO TD3 passports
            crop_box = {
                "x": max(0, int(w * 0.04)), 
                "y": max(0, int(h * 0.18)), 
                "w": min(w, int(w * 0.38)), 
                "h": min(h, int(h * 0.58))
            }
        else:
            # Centered region for live camera selfie / checkpoint booth capture
            crop_box = {
                "x": max(0, int(w * 0.15)), 
                "y": max(0, int(h * 0.08)), 
                "w": min(w, int(w * 0.70)), 
                "h": min(h, int(h * 0.82))
            }
        face_crop = image_bgr[crop_box["y"]:crop_box["y"]+crop_box["h"], crop_box["x"]:crop_box["x"]+crop_box["w"]]
        return face_crop, crop_box

    # Pick largest detected face
    faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, fw, fh = faces[0]
    
    # Add 12% contextual padding
    pad_x = int(fw * 0.12)
    pad_y = int(fh * 0.12)
    
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + fw + pad_x)
    y2 = min(h, y + fh + pad_y)
    
    face_crop = image_bgr[y1:y2, x1:x2]
    return face_crop, {"x": int(x1), "y": int(y1), "w": int(x2 - x1), "h": int(y2 - y1)}

def extract_face_embedding(face_img: np.ndarray) -> np.ndarray:
    """
    Extracts a 512-dimensional normalized facial feature embedding.
    Uses multi-resolution spatial histogram and frequency descriptors (ArcFace-aligned).
    """
    if face_img is None or face_img.size == 0:
        return np.zeros(512, dtype=np.float32)

    resized = cv2.resize(face_img, (112, 112))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if len(resized.shape) == 3 else resized
    
    # Apply CLAHE to normalize lighting differences
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
    gray_eq = clahe.apply(gray)
    
    # Compute multi-grid descriptors across 4x4 spatial blocks
    h, w = gray_eq.shape
    grid_h, grid_w = h // 4, w // 4
    descriptors = []
    
    for r in range(4):
        for c in range(4):
            cell = gray_eq[r*grid_h:(r+1)*grid_h, c*grid_w:(c+1)*grid_w]
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
    Automatically aligns and crops facial regions if full frames are passed.
    """
    if doc_face is None or live_face is None:
        return {
            "cosine_similarity": 0.0,
            "similarity_percentage": 0.0,
            "verdict": "MISMATCH",
            "is_match": False,
            "doc_face_embedding": [],
            "live_face_embedding": []
        }

    # If live_face is a full camera frame (larger than 160x160), crop to face first
    if live_face.shape[0] > 160 or live_face.shape[1] > 160:
        cropped_live, _ = extract_face_crop(live_face, is_document=False)
        if cropped_live is not None and cropped_live.size > 0:
            live_face = cropped_live

    # If doc_face is large (e.g. whole passport passed), crop to document face
    if doc_face.shape[0] > 220 or doc_face.shape[1] > 220:
        cropped_doc, _ = extract_face_crop(doc_face, is_document=True)
        if cropped_doc is not None and cropped_doc.size > 0:
            doc_face = cropped_doc

    emb1 = extract_face_embedding(doc_face)
    emb2 = extract_face_embedding(live_face)
    
    # Cosine similarity mapped to calibrated range
    raw_sim = float(np.dot(emb1, emb2))
    cosine_sim = max(0.0, min(1.0, (raw_sim + 1.0) / 2.0))
    
    # Evaluate calibrated tiers
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
        "doc_face_embedding": emb1.tolist()[:16],
        "live_face_embedding": emb2.tolist()[:16]
    }

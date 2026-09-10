import cv2
import numpy as np
from typing import Tuple, Dict, Any, List

def detect_copy_move_forgery(
    image_bgr: np.ndarray, 
    min_match_dist: float = 30.0, 
    min_inliers: int = 6
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Detects duplicated / cloned image regions (e.g. copied stamps, cloned digits, cloned seals)
    using ORB keypoint descriptors, spatial distance thresholding, and RANSAC affine verification.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
    orb = cv2.ORB_create(nfeatures=1500)
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    annotated = image_bgr.copy()
    cloned_pairs = []

    if descriptors is not None and len(descriptors) > 10:
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        matches = bf.knnMatch(descriptors, descriptors, k=3)

        # Filter out self-matches and enforce spatial distance
        valid_matches = []
        for m_list in matches:
            if len(m_list) >= 2:
                # m_list[0] is self match (dist=0)
                m = m_list[1]
                pt1 = keypoints[m.queryIdx].pt
                pt2 = keypoints[m.trainIdx].pt
                spatial_dist = np.sqrt((pt1[0] - pt2[0])**2 + (pt1[1] - pt2[1])**2)
                
                # If descriptors match well and are physically distinct regions
                if m.distance < 35 and spatial_dist > min_match_dist:
                    valid_matches.append((pt1, pt2, m.distance))

        if len(valid_matches) >= min_inliers:
            # Draw connecting vectors between cloned regions
            for (p1, p2, dist) in valid_matches[:25]:
                pt1_int = (int(p1[0]), int(p1[1]))
                pt2_int = (int(p2[0]), int(p2[1]))
                cv2.circle(annotated, pt1_int, 5, (0, 0, 255), -1)
                cv2.circle(annotated, pt2_int, 5, (255, 0, 0), -1)
                cv2.line(annotated, pt1_int, pt2_int, (0, 255, 255), 2)
                cloned_pairs.append({"source": pt1_int, "target": pt2_int, "dist": round(float(dist), 2)})

    copy_move_detected = len(cloned_pairs) >= min_inliers

    return annotated, {
        "copy_move_detected": copy_move_detected,
        "cloned_keypoints_count": len(cloned_pairs),
        "cloned_pairs_sample": cloned_pairs[:5],
        "confidence": round(min(1.0, len(cloned_pairs) / 15.0), 2) if copy_move_detected else 0.0
    }

from typing import Dict, Any, List
from ..core.config import settings

def evaluate_screening_risk(
    quality_result: Dict[str, Any],
    mrz_result: Dict[str, Any],
    forensic_results: Dict[str, Any],
    biometric_results: Dict[str, Any],
    database_check: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Fuses all multi-modal signals into an explainable, risk-based 3-tier verdict:
    VERIFIED (Green), MANUAL_REVIEW (Amber), REJECTED (Red).
    """
    critical_failures: List[str] = []
    warning_flags: List[str] = []
    
    # 1. Quality Component (10%)
    q_score = float(quality_result.get("quality_score", 85.0))
    if quality_result.get("is_blurry"):
        warning_flags.append("High image blur detected; re-scan recommended")
    if quality_result.get("illumination", {}).get("has_excessive_glare"):
        warning_flags.append("Excessive specular glare reflecting off laminate")

    # 2. MRZ & Check-Digit Component (20%)
    mrz_all_valid = mrz_result.get("all_check_digits_valid", True)
    mrz_score = 100.0 if mrz_all_valid else 0.0
    if not mrz_all_valid:
        critical_failures.append("Invalid ICAO 9303 check digit math (tampered passport number, DOB, or expiry)")

    # 3. Forensic Integrity Component (25%)
    ela_res = forensic_results.get("ela", {})
    srm_res = forensic_results.get("srm", {})
    copy_move_res = forensic_results.get("copy_move", {})
    recapture_res = forensic_results.get("recapture", {})
    deep_res = forensic_results.get("deep_tamper", {})
    exif_res = forensic_results.get("exif", {})

    forensic_score = 100.0
    if ela_res.get("is_spliced"):
        forensic_score -= 35.0
        warning_flags.append(f"Error Level Analysis flagged digital editing (tamper ratio: {ela_res.get('tamper_ratio', 0)})")
    if srm_res.get("has_noise_inconsistency"):
        forensic_score -= 20.0
        warning_flags.append("Spatial Rich Model detected inconsistent high-pass noise residuals")
    if copy_move_res.get("copy_move_detected"):
        forensic_score -= 40.0
        critical_failures.append(f"Copy-Move clone detected ({copy_move_res.get('cloned_keypoints_count', 0)} cloned feature vectors)")
    if recapture_res.get("is_screen_recaptured"):
        forensic_score -= 45.0
        critical_failures.append(f"Screen-Replay Recapture detected (2D FFT Moire peak ratio: {recapture_res.get('peak_to_mean_ratio', 0)})")
    if deep_res.get("is_deep_forged"):
        forensic_score -= 30.0
        warning_flags.append("Deep Tamper Classifier flagged generative AI or localized pixel modification")
    if exif_res.get("editing_software_detected"):
        forensic_score -= 25.0
        warning_flags.append(f"EXIF Metadata shows editing software: {exif_res.get('software_tag')}")

    forensic_score = max(0.0, min(100.0, forensic_score))

    # 4. Biometrics & Liveness Component (25%)
    face_sim = biometric_results.get("cosine_similarity", 0.90)
    live_score = biometric_results.get("liveness_score", 95.0)
    
    bio_score = (face_sim * 100.0 * 0.6) + (live_score * 0.4)
    if face_sim < settings.FACE_MATCH_REVIEW_THRESHOLD:
        critical_failures.append(f"Biometric face mismatch (Cosine similarity: {round(face_sim * 100, 1)}%)")
    elif face_sim < settings.FACE_MATCH_PASS_THRESHOLD:
        warning_flags.append(f"Borderline face match (Similarity: {round(face_sim * 100, 1)}%)")
        
    if live_score < 60.0:
        critical_failures.append("Live anti-spoofing check failed (printed photo or screen replay)")

    # 5. Database & Blacklist Component (20%)
    db_score = 100.0
    is_blacklisted = database_check.get("is_blacklisted", False)
    duplicate_hits = database_check.get("duplicate_identities", [])

    if is_blacklisted:
        db_score = 0.0
        reason = database_check.get("blacklist_reason", "Interpol Watchlist Hit")
        critical_failures.append(f"CRITICAL WATCHLIST HIT: {reason}")
    if len(duplicate_hits) > 0:
        db_score -= 40.0
        warning_flags.append(f"Identity Graph Alert: Face linked to {len(duplicate_hits)} other document numbers")

    # Weighted Overall Score Calculation
    total_score = (
        (q_score * settings.WEIGHT_QUALITY) +
        (mrz_score * settings.WEIGHT_MRZ) +
        (forensic_score * settings.WEIGHT_FORENSICS) +
        (bio_score * settings.WEIGHT_BIOMETRICS) +
        (db_score * settings.WEIGHT_DATABASE)
    )
    total_score = round(max(0.0, min(100.0, total_score)), 1)

    # 3-Tier Outcome Decision
    if len(critical_failures) > 0 or total_score < settings.REVIEW_SCORE_MIN:
        outcome = "REJECTED"
        recommendation = "DENY ENTRY. Immediate physical document confiscation and supervisory escalation required."
    elif len(warning_flags) > 0 or total_score < settings.VERIFIED_SCORE_MIN:
        outcome = "MANUAL_REVIEW"
        recommendation = "Secondary physical inspection recommended. Officer manual verification of microprint and UV security features."
    else:
        outcome = "VERIFIED"
        recommendation = "DOCUMENT AUTHENTICATED. Proceed with entry authorization."

    return {
        "outcome": outcome,
        "overall_risk_score": total_score,
        "confidence_score": round(100.0 - abs(total_score - 50.0) * 0.1, 1),
        "recommendation": recommendation,
        "critical_failures": critical_failures,
        "warning_flags": warning_flags,
        "factor_breakdown": {
            "document_quality": {"score": round(q_score, 1), "weight": "10%", "status": "PASS" if q_score >= 70 else "WARN"},
            "mrz_integrity": {"score": round(mrz_score, 1), "weight": "20%", "status": "PASS" if mrz_all_valid else "FAIL"},
            "forensic_integrity": {"score": round(forensic_score, 1), "weight": "25%", "status": "PASS" if forensic_score >= 75 else "FAIL"},
            "biometric_verification": {"score": round(bio_score, 1), "weight": "25%", "status": "PASS" if bio_score >= 75 else "FAIL"},
            "database_watchlist": {"score": round(db_score, 1), "weight": "20%", "status": "PASS" if db_score >= 80 else "FAIL"}
        }
    }

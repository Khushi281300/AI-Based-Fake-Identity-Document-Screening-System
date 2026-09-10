import re
from typing import Dict, Any, List, Optional
from ..mrz.parser import correct_ocr_confusions

def normalize_text_field(val: Optional[str]) -> str:
    if not val:
        return ""
    return re.sub(r'[^A-Z0-9]', '', val.upper())

def reconcile_viz_with_mrz(viz_fields: Dict[str, Any], mrz_fields: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs cross-reconciliation between visual inspection zone (VIZ) fields 
    and machine-readable zone (MRZ) decoded fields.
    Flags discrepancies such as altered visual dates or swapped names.
    """
    discrepancies: List[Dict[str, str]] = []

    # 1. Document Number
    viz_doc_num = normalize_text_field(viz_fields.get("document_number"))
    mrz_doc_num = normalize_text_field(mrz_fields.get("document_number"))
    doc_num_match = (viz_doc_num == mrz_doc_num) if (viz_doc_num and mrz_doc_num) else True
    if not doc_num_match:
        discrepancies.append({
            "field": "document_number",
            "viz_value": viz_fields.get("document_number", ""),
            "mrz_value": mrz_fields.get("document_number", ""),
            "severity": "CRITICAL"
        })

    # 2. Date of Birth
    viz_dob = normalize_text_field(viz_fields.get("date_of_birth"))
    mrz_dob = normalize_text_field(mrz_fields.get("date_of_birth"))
    # Compare either exact or YYMMDD substring
    dob_match = (viz_dob == mrz_dob) or (mrz_dob and mrz_dob.replace('-', '') in viz_dob) if (viz_dob and mrz_dob) else True
    if not dob_match:
        discrepancies.append({
            "field": "date_of_birth",
            "viz_value": viz_fields.get("date_of_birth", ""),
            "mrz_value": mrz_fields.get("date_of_birth", ""),
            "severity": "HIGH"
        })

    # 3. Expiry Date
    viz_exp = normalize_text_field(viz_fields.get("expiry_date"))
    mrz_exp = normalize_text_field(mrz_fields.get("expiry_date"))
    exp_match = (viz_exp == mrz_exp) or (mrz_exp and mrz_exp.replace('-', '') in viz_exp) if (viz_exp and mrz_exp) else True
    if not exp_match:
        discrepancies.append({
            "field": "expiry_date",
            "viz_value": viz_fields.get("expiry_date", ""),
            "mrz_value": mrz_fields.get("expiry_date", ""),
            "severity": "CRITICAL"
        })

    # 4. Name match (Fuzzy substring)
    viz_name = normalize_text_field(viz_fields.get("holder_name") or viz_fields.get("full_name"))
    mrz_surname = normalize_text_field(mrz_fields.get("surname"))
    name_match = (mrz_surname in viz_name) if (mrz_surname and viz_name) else True
    if not name_match and viz_name and mrz_surname:
        discrepancies.append({
            "field": "holder_name",
            "viz_value": viz_fields.get("holder_name", ""),
            "mrz_value": mrz_fields.get("full_name", ""),
            "severity": "HIGH"
        })

    is_consistent = len(discrepancies) == 0

    return {
        "is_consistent": is_consistent,
        "discrepancies_count": len(discrepancies),
        "discrepancies": discrepancies,
        "field_matches": {
            "document_number": doc_num_match,
            "date_of_birth": dob_match,
            "expiry_date": exp_match,
            "holder_name": name_match
        }
    }

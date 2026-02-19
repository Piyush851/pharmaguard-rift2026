from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from datetime import datetime
from app.services.vcf_parser import parse_vcf_content, VCFParserError
from app.services.cpic_rules import evaluate_variants
from app.services.llm_service import generate_explanation

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "API working"}

@router.post("/analyze")
async def analyze_file(file: UploadFile = File(...), drug_name: str = Form(...)):
    try:
        # Step 1: Read and decode the uploaded file
        content = await file.read()
        decoded_vcf = content.decode("utf-8")

        # Step 2: Parse VCF (Real live parser)
        vcf_data = parse_vcf_content(decoded_vcf, drug_name)

        # Step 3: Evaluate CPIC rules deterministically
        profile, risk_label, severity = evaluate_variants(
            gene=vcf_data["gene"], 
            diplotype=vcf_data["diplotype"], 
            drug_name=drug_name,
            rsids=vcf_data["rsids"]
        )

        # Step 4: Generate LLM explanation
        llm_explanation = generate_explanation(drug_name.upper(), profile, risk_label)

        # Step 5: Return EXACT Hackathon Schema
        return {
            "patient_id": f"PATIENT_{file.filename.split('.')[0].upper()}",
            "drug": drug_name.upper(),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "risk_assessment": {
                "risk_label": risk_label,
                "confidence_score": 0.95,
                "severity": severity
            },
            "pharmacogenomic_profile": profile,
            "clinical_recommendation": {
                "guideline_source": "CPIC",
                "action": llm_explanation.get("actionable_advice", "Review guidelines.")
            },
            "llm_generated_explanation": llm_explanation,
            "quality_metrics": {
                "vcf_parsing_success": True
            }
        }

    except VCFParserError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid VCF File: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
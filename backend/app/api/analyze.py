from app.services.pdf_service import generate_pdf_report
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.vcf_parser import parse_vcf
from app.services.cpic_rules import evaluate_variants
from app.services.llm_service import generate_summary

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "API working"}

@router.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        decoded = content.decode("utf-8")

        # Step 1: Parse VCF
        variants = parse_vcf(decoded)

        # Step 2: Evaluate CPIC rules
        recommendations = evaluate_variants(variants)

        # Step 3: Generate LLM explanation
        summary = generate_summary(recommendations)

        return {
            "variants_found": variants,
            "recommendations": recommendations,
            "clinical_summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

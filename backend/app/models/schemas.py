from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RiskAssessment(BaseModel):
    risk_label: str = Field(..., description="Safe|Adjust Dosage|Toxic|Ineffective|Unknown")
    confidence_score: float
    severity: str = Field(..., description="none|low|moderate|high|critical")

class VariantInfo(BaseModel):
    rsid: str
    # Add other variant details as needed by your parser

class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str = Field(..., description="PM|IM|NM|RM|URM|Unknown")
    detected_variants: List[VariantInfo]

class LLMExplanation(BaseModel):
    summary: str
    # Add other explanation fields as needed

class QualityMetrics(BaseModel):
    vcf_parsing_success: bool

class PharmaGuardResponse(BaseModel):
    patient_id: str
    drug: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: dict
    llm_generated_explanation: LLMExplanation
    quality_metrics: QualityMetrics
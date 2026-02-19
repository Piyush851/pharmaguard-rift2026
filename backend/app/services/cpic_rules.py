import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "cpic_guidelines.json")

# Failsafe if the JSON file is missing during testing
try:
    with open(DATA_PATH, "r") as file:
        CPIC_DATA = json.load(file)
except FileNotFoundError:
    CPIC_DATA = {}

def get_phenotype(gene, diplotype):
    gene_data = CPIC_DATA.get(gene, {})
    return gene_data.get(diplotype, "Unknown")

def get_clinical_risk(gene, diplotype, drug_name):
    drug_name = drug_name.title()
    phenotype = get_phenotype(gene, diplotype)

    drug_rules = CPIC_DATA.get("drug_recommendations", {})
    drug_data = drug_rules.get(drug_name, {})
    recommendation = drug_data.get(phenotype)

    if recommendation:
        risk = recommendation["risk"]
        severity = recommendation["severity"]
    else:
        risk = "Unknown"
        severity = "Unknown"

    return phenotype, risk, severity

def evaluate_variants(gene: str, diplotype: str, drug_name: str, rsids: list):
    """Combines CPIC rules into the final profile format for the API."""
    phenotype, risk_label, severity = get_clinical_risk(gene, diplotype, drug_name)
    
    pharmacogenomic_profile = {
        "primary_gene": gene,
        "diplotype": diplotype,
        "phenotype": phenotype,
        "detected_variants": rsids
    }
    
    return pharmacogenomic_profile, risk_label, severity
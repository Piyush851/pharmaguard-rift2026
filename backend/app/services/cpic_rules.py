import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "cpic_guidelines.json")

with open(DATA_PATH, "r") as file:
    CPIC_DATA = json.load(file)


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

    return {
        "gene": gene,
        "diplotype": diplotype,
        "phenotype": phenotype,
        "drug": drug_name,
        "risk": risk,
        "severity": severity
    }


    drug_rules = CPIC_DATA.get("drug_recommendations", {})
    drug_data = drug_rules.get(drug_name, {})

    recommendation = drug_data.get(phenotype)

    if recommendation:
        return {
            "gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "risk": recommendation["risk"],
            "severity": recommendation["severity"]
        }

    return {
        "gene": gene,
        "diplotype": diplotype,
        "phenotype": phenotype,
        "risk": "Unknown",
        "severity": "Unknown"
    }

  
    

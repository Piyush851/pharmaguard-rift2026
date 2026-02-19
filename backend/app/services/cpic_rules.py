def evaluate_variants(variants: list):
    results = []

    for variant in variants:
        gene = variant["gene"]
        star = variant["star"]

        phenotype = "Normal"
        recommendation = "Standard dosing recommended."

        if gene == "CYP2C19":
            if star in ["*2", "*3"]:
                phenotype = "Poor Metabolizer"
                recommendation = "Consider alternative therapy (e.g., prasugrel instead of clopidogrel)."
            elif star == "*17":
                phenotype = "Ultra-rapid Metabolizer"
                recommendation = "Monitor response; possible reduced drug efficacy."

        results.append({
            "gene": gene,
            "rsid": variant["rsid"],
            "phenotype": phenotype,
            "recommendation": recommendation
        })

    return results


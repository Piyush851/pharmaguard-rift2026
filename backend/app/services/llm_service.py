def generate_summary(recommendations: list):
    summary_lines = []

    for rec in recommendations:
        summary_lines.append(
            f"For gene {rec['gene']} (variant {rec['rsid']}), "
            f"the predicted phenotype is {rec['phenotype']}. "
            f"Clinical guidance: {rec['recommendation']}"
        )

    return " ".join(summary_lines)

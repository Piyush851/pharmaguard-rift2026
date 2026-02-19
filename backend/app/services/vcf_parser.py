def parse_vcf(file_content: str):
    """
    Improved VCF parser:
    - Extracts multiple variants
    - Handles INFO field safely
    - Supports multiple genes
    """

    variants = []

    for line in file_content.splitlines():
        if line.startswith("#"):
            continue

        columns = line.strip().split("\t")
        if len(columns) < 8:
            continue

        rsid = columns[2]
        info_field = columns[7]

        gene = "Unknown"
        star = None

        for part in info_field.split(";"):
            if part.startswith("GENE="):
                gene = part.split("=")[1]
            if part.startswith("STAR="):
                star = part.split("=")[1]

        variants.append({
            "gene": gene,
            "rsid": rsid,
            "star": star
        })

    return variants

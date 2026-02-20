SUPPORTED_GENES = {"CYP2C19", "CYP2D6", "TPMT", "SLCO1B1", "DPYD", "UGT1A1"}

# Add strict mapping
DRUG_TO_GENE = {
    "CLOPIDOGREL": "CYP2C19",
    "CODEINE": "CYP2D6",
    "WARFARIN": "CYP2C9",
    "SIMVASTATIN": "SLCO1B1",
    "AZATHIOPRINE": "TPMT",
    "FLUOROURACIL": "DPYD"
}

class VCFParserError(Exception):
    pass

def normalize_star(allele: str) -> str:
    allele = allele.strip()
    if not allele.startswith("*"):
        allele = "*" + allele
    return allele

def interpret_genotype(gt: str, star: str) -> list:
    if not gt:
        return [star]
    sep = "/" if "/" in gt else "|"
    alleles = gt.split(sep)
    result = []
    for a in alleles:
        if a == "0":
            result.append("*1")
        else:
            result.append(star)
    return result

def resolve_diplotype(alleles: list) -> str:
    if not alleles:
        raise VCFParserError("No alleles found")
    unique = sorted(set(alleles))
    if len(unique) > 1 and "*1" in unique:
        unique.remove("*1")
    if len(unique) == 1:
        return f"{unique[0]}/{unique[0]}"
    return "/".join(unique[:2])

# Update the function signature to require drug_name
def parse_vcf_content(vcf_string: str, drug_name: str) -> dict:
    target_gene = DRUG_TO_GENE.get(drug_name.upper())
    if not target_gene:
        raise VCFParserError(f"Drug '{drug_name}' is not supported or mapped to a gene.")

    star_alleles = []
    rsids = []
    found_target_gene = False

    try:
        lines = vcf_string.splitlines()
        for line in lines:
            if line.startswith("#") or not line.strip():
                continue

            parts = line.strip().split("\t")
            if len(parts) < 8:
                continue

            chrom, pos, vid, ref, alt, qual, filt, info = parts[:8]

            info_dict = {}
            for item in info.split(";"):
                if "=" in item:
                    k, v = item.split("=", 1)
                    info_dict[k] = v

            gene = info_dict.get("GENE")
            
            # ONLY parse the line if it matches our target gene
            if gene == target_gene:
                found_target_gene = True
                if vid.startswith("rs"):
                    rsids.append(vid)

                star = info_dict.get("STAR")
                if star:
                    star = normalize_star(star)
                    if len(parts) > 9:
                        fmt = parts[8].split(":")
                        sample = parts[9].split(":")
                        if "GT" in fmt:
                            idx = fmt.index("GT")
                            gt = sample[idx]
                            star_alleles.extend(interpret_genotype(gt, star))
                        else:
                            star_alleles.append(star)
                    else:
                        star_alleles.append(star)

    except Exception as e:
        raise VCFParserError(f"Parsing failed: {str(e)}")

    if not found_target_gene:
        raise VCFParserError(f"No variants found for required gene {target_gene} in this VCF.")

    diplotype = resolve_diplotype(star_alleles) if star_alleles else "*1/*1"

    return {
        "gene": target_gene,
        "diplotype": diplotype,
        "rsids": sorted(set(rsids))
    }
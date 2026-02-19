SUPPORTED_GENES = {
    "CYP2C19",
    "CYP2D6",
    "TPMT",
    "SLCO1B1",
    "DPYD",
    "UGT1A1"
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


def parse_vcf(file_path: str) -> dict:
    genes = set()
    star_alleles = []
    rsids = []

    try:
        with open(file_path, "r") as f:
            for line in f:
                if line.startswith("#"):
                    continue

                parts = line.strip().split("\t")
                if len(parts) < 8:
                    continue

                chrom, pos, vid, ref, alt, qual, filt, info = parts[:8]

                if vid.startswith("rs"):
                    rsids.append(vid)

                info_dict = {}
                for item in info.split(";"):
                    if "=" in item:
                        k, v = item.split("=", 1)
                        info_dict[k] = v

                gene = info_dict.get("GENE")
                if gene:
                    genes.add(gene)

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
        raise VCFParserError(str(e))

    if not genes:
        raise VCFParserError("No gene found")

    gene = list(genes)[0]

    if gene not in SUPPORTED_GENES:
        raise VCFParserError("Unsupported gene")

    diplotype = resolve_diplotype(star_alleles)

    return {
        "gene": gene,
        "diplotype": diplotype,
        "rsids": sorted(set(rsids))
    }

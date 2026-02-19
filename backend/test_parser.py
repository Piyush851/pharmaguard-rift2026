from app.services.vcf_parser import parse_vcf

result = parse_vcf("sample_data/patient_1_safe.vcf")

print(result)

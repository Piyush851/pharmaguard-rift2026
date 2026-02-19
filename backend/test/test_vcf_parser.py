from app.services.vcf_parser import parse_vcf

file_path = "sample_data/patient_multivariant.vcf"

result = parse_vcf(file_path)

print("\n===== PARSER OUTPUT =====")
print(result)



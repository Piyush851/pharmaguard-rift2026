import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch

def generate_pdf_report(recommendations, summary):
    os.makedirs("reports", exist_ok=True)

    file_path = f"reports/clinical_report.pdf"
    doc = SimpleDocTemplate(file_path)

    elements = []
    styles = getSampleStyleSheet()

    title_style = styles["Heading1"]
    normal_style = styles["Normal"]

    elements.append(Paragraph("PharmaGuard Clinical Pharmacogenomics Report", title_style))
    elements.append(Spacer(1, 0.5 * inch))

    for rec in recommendations:
        text = (
            f"<b>Gene:</b> {rec['gene']}<br/>"
            f"<b>Variant:</b> {rec['rsid']}<br/>"
            f"<b>Phenotype:</b> {rec['phenotype']}<br/>"
            f"<b>Recommendation:</b> {rec['recommendation']}<br/><br/>"
        )
        elements.append(Paragraph(text, normal_style))
        elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("<b>Clinical Summary:</b>", styles["Heading2"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(summary, normal_style))

    doc.build(elements)

    return {
    "variants_found": variants,
    "recommendations": recommendations,
    "clinical_summary": summary,
    "report_download": pdf_path
}

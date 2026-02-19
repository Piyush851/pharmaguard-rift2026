import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# 1. Securely load environment variables
load_dotenv()

# 2. Initialize Client
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# 3. The Upgraded Live Function using standard JSON Mode
def generate_explanation(drug_name: str, pharmacogenomic_profile: dict, risk_label: str) -> dict:
    """
    Takes deterministic data and generates a strictly formatted explanation using Groq's JSON mode.
    """
    print(f"[LIVE API] Generating explainable AI report for {drug_name}...")
    
    # We heavily enforce the JSON structure directly in the prompt
    system_prompt = """You are an expert clinical pharmacogenomic AI. 
    Your strict job is to explain a diagnosis that has ALREADY been made deterministically. 
    DO NOT change the risk label or invent new variants. 
    
    You MUST respond with valid JSON matching this exact structure:
    {
        "summary": "A concise 2-sentence clinical summary of the drug-gene interaction.",
        "biological_mechanism": "Detailed explanation of how the genetic variant affects enzyme metabolism.",
        "actionable_advice": "Dosing recommendation aligned with CPIC guidelines.",
        "cited_variants": ["rs123", "rs456"]
    }"""

    user_prompt = f"""
    Target Drug: {drug_name}
    Assigned Risk Label: {risk_label}
    Patient Phenotype: {pharmacogenomic_profile.get('phenotype', 'Unknown')}
    Patient Diplotype: {pharmacogenomic_profile.get('diplotype', 'Unknown')}
    Detected Variants: {pharmacogenomic_profile.get('detected_variants', [])}
    
    Generate the explainable clinical report based on CPIC guidelines.
    """

    try:
        # Swap from .parse() to standard .create() with JSON object format
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Manually parse the JSON string returned by the model back into a Python dictionary
        return json.loads(completion.choices[0].message.content)
        
    except Exception as e:
        print(f"🚨 Live API Error: {e}")
        return {
            "summary": "Explanation generation failed due to API error.",
            "biological_mechanism": "N/A",
            "actionable_advice": "Consult CPIC guidelines directly.",
            "cited_variants": []
        }
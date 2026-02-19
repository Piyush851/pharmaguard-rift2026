# PharmaGuard: Pharmacogenomic Risk Prediction System

**Track:** Pharmacogenomics / Explainable AI (HealthTech)
**Hackathon:** RIFT 2026 

<!-- ## Important Links
* **Live Demo:** [Insert Vercel/Render URL Here]
* **LinkedIn Video Demo:** [Insert Public LinkedIn Video URL Here] -->

## Project Overview
PharmaGuard is an AI-powered precision medicine application that analyzes patient genetic data (VCF files) against target drugs to predict pharmacogenomic risks. It aligns with CPIC guidelines to provide clinically actionable, LLM-explained recommendations.

## Architecture & Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** FastAPI (Python), Pydantic
* **Genomics Parsing:** cyvcf2
* **Explainable AI:** OpenAI API (GPT-4o)

## Installation & Setup
### Prerequisites
* Python 3.9+
* Node.js 18+
* OpenAI API Key

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create a `.env` file and add: `OPENAI_API_KEY=your_key_here`
4. `uvicorn app.main:app --reload`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Usage Examples
1. Upload a valid `.vcf` file (max 5MB) via the web interface.
2. Enter a supported drug name (e.g., `CLOPIDOGREL`, `WARFARIN`).
3. Click "Analyze" to generate the JSON risk assessment and clinical explanation.

<!-- ## Team Members
* [Your Name / Team Leader] - [Role]
* [Member 2 Name] - [Role]
* [Member 3 Name] - [Role] -->
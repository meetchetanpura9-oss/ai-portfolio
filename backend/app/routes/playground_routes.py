"""
Playground API — interactive predictive model simulations and AI knowledge assistant matching.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/playground", tags=["Playground"])


# --- Schemas ---

class RetentionInput(BaseModel):
    tenure_months: int = Field(..., ge=0, le=120, description="Customer relationship tenure in months")
    contract_type: str = Field(..., description="Contract status (Month-to-month, One year, Two year)")
    support_tickets: int = Field(..., ge=0, le=20, description="Number of technical support tickets filed in the last 30 days")
    monthly_charges: float = Field(..., ge=0.0, le=500.0, description="Current monthly subscription billing rate")


class FeatureImportance(BaseModel):
    feature: str
    impact: float
    direction: str  # "positive" (increases retention) or "negative" (decreases retention)
    description: str


class RetentionResponse(BaseModel):
    probability: float
    status: str
    feature_importance: List[FeatureImportance]


class AssistantQuery(BaseModel):
    query: str


class AssistantResponse(BaseModel):
    answer: str
    suggested_queries: List[str]


# --- Route 1: Retention Intelligence Engine ---

@router.post("/predict-retention", response_model=RetentionResponse, summary="Simulate customer retention prediction")
def predict_customer_retention(payload: RetentionInput):
    """
    Executes a structured heuristic mimicking an ensemble classifier (Random Forest/XGBoost)
    to calculate customer retention probability and compute dynamic Shapley-style feature impacts.
    """
    # 1. Base Retention Rate
    probability = 60.0  # Base standard rate

    shapley_impacts = []

    # 2. Tenure Impact (Longer tenure improves retention)
    tenure_impact = min(payload.tenure_months * 0.6, 25.0)
    probability += tenure_impact
    shapley_impacts.append(
        FeatureImportance(
            feature="Customer Tenure",
            impact=round(tenure_impact, 2),
            direction="positive",
            description=f"Active relationship of {payload.tenure_months} months signals strong platform habituation and brand loyalty."
        )
    )

    # 3. Contract Type Impact
    contract = payload.contract_type.strip()
    if contract == "Two year":
        contract_impact = 20.0
        description = "Two-year contractual lock-in secures revenue and ensures maximum customer retention probability."
    elif contract == "One year":
        contract_impact = 10.0
        description = "One-year contract provides structured security and reduces short-term churn volatility."
    else:  # Month-to-month
        contract_impact = -15.0
        description = "Flexible month-to-month billing exposes relationship to high churn vulnerability and low exit barriers."
    
    probability += contract_impact
    shapley_impacts.append(
        FeatureImportance(
            feature="Contract Structure",
            impact=round(contract_impact, 2),
            direction="positive" if contract_impact >= 0 else "negative",
            description=description
        )
    )

    # 4. Support Tickets Impact (Active support issues indicate dissatisfaction)
    tickets = payload.support_tickets
    if tickets == 0:
        ticket_impact = 5.0
        description = "Zero active support cases in 30 days indicates highly frictionless operations."
    elif tickets <= 2:
        ticket_impact = -2.0
        description = f"Submitting {tickets} support requests signals standard engagement, but requires careful health monitoring."
    else:
        # High tickets drastically decrease retention
        ticket_impact = -(min(tickets * 4.5, 30.0))
        description = f"High ticket volume ({tickets} events) indicates system friction, high service distress, and active churn risk."

    probability += ticket_impact
    shapley_impacts.append(
        FeatureImportance(
            feature="Support Case Friction",
            impact=round(ticket_impact, 2),
            direction="positive" if ticket_impact >= 0 else "negative",
            description=description
        )
    )

    # 5. Monthly Charges Impact (Very high pricing sensitivity)
    charges = payload.monthly_charges
    if charges < 40.0:
        charges_impact = 4.0
        description = f"Low service price point (${charges}/mo) increases platform accessibility and reduces economic friction."
    elif charges < 100.0:
        charges_impact = 0.0
        description = f"Standard service price point (${charges}/mo) remains highly competitive within current enterprise standards."
    else:
        charges_impact = -(min((charges - 100.0) * 0.08, 12.0))
        description = f"Premium pricing model (${charges}/mo) places account under increased ROI scrutiny and economic review."

    probability += charges_impact
    shapley_impacts.append(
        FeatureImportance(
            feature="Pricing Sensitivity",
            impact=round(charges_impact, 2),
            direction="positive" if charges_impact >= 0 else "negative",
            description=description
        )
    )

    # Clip probability between 3.0% and 99.0%
    final_probability = max(min(probability, 99.0), 3.0)

    # Evaluate classification threshold
    if final_probability >= 80.0:
        status_text = "High Retention Safety (Low Risk)"
    elif final_probability >= 50.0:
        status_text = "Moderate Retention (Monitor Account)"
    else:
        status_text = "High Churn Vulnerability (Immediate Rescue Needed)"

    return RetentionResponse(
        probability=round(final_probability, 1),
        status=status_text,
        feature_importance=shapley_impacts
    )


# --- Route 2: AI Knowledge Assistant ---

@router.post("/query-assistant", response_model=AssistantResponse, summary="Query the AI portfolio assistant")
def query_assistant(payload: AssistantQuery):
    """
    Simulates a localized semantic/regex response router providing detailed information
    about Chetanpura Meet's skills, credentials, project history, and career objectives.
    """
    raw_query = payload.query.lower().strip()
    
    # 1. Keywords Routing Table
    if any(k in raw_query for k in ["skill", "tech", "stack", "tool", "python", "pytorch"]):
        answer = (
            "Chetanpura specializes in **AI Engineering, MLOps, and Data Science**. "
            "His technical toolkit is robust and includes:\n\n"
            "- **Programming**: Python (SQL, Pandas, NumPy, Scikit-learn)\n"
            "- **Deep Learning**: PyTorch, TensorFlow, Keras (CNNs, LSTMs, Transformers)\n"
            "- **LLM / GenAI**: OpenAI API, Hugging Face, LangChain, vector databases (Chroma, Pinecone)\n"
            "- **Engineering & DevOps**: FastAPI, Docker, Git, REST APIs, Redis\n"
            "- **Data & BI**: SQL (PostgreSQL, MySQL), Power BI, Streamlit, Excel\n\n"
            "This combination enables him to build production-grade, low-latency AI microservices and pipelines."
        )
        suggestions = ["Tell me about your projects", "What is your experience?", "How can I contact you?"]

    elif any(k in raw_query for k in ["project", "build", "case study", "portfolio", "retention"]):
        answer = (
            "Chetanpura has delivered multiple high-impact ML and AI products:\n\n"
            "1. **Retention Intelligence Engine (featured)**: Deployed a predictive churn pipeline raising renewal rates by **14%** for revenue teams.\n"
            "2. **Enterprise Knowledge Assistant (featured)**: Designed an LLM-driven internal search tool that reduced search loads by **60%**.\n"
            "3. **Quality Control Computer Vision**: Programmed automated image inspections detecting manufacturing defects with **92% precision**.\n"
            "4. **Adaptive Recommendation API**: Developed low-latency collaborative recommenders using FastAPI, Redis, and Docker."
        )
        suggestions = ["What are your skills?", "What certifications do you have?", "How can I hire you?"]

    elif any(k in raw_query for k in ["experience", "work", "job", "career", "role", "history"]):
        answer = (
            "Chetanpura functions as an **AI Engineering Lead & ML Systems Architect**. "
            "He has a proven track record partnering with product teams to build scalable data infrastructure. "
            "His work focuses on bringing predictive models *out of notebooks and into production*, prioritizing "
            "explainability, robust API endpoints, and direct business ROI (such as revenue retention or operational savings)."
        )
        suggestions = ["Show me your portfolio", "What is your education?", "Tell me about your tech stack"]

    elif any(k in raw_query for k in ["cert", "credential", "licen", "degree", "education", "university"]):
        answer = (
            "Chetanpura holds multiple premium credentials in AI and cloud domains:\n\n"
            "- **Education**: B.Tech in Computer Science & Engineering (Information Technology).\n"
            "- **Key Certifications**: Google Cloud Professional Data Engineer, AWS Certified Machine Learning Specialty, "
            "TensorFlow Developer Certificate, and DeepLearning.AI Generative AI Professional.\n\n"
            "This combines rigorous engineering foundations with state-of-the-art AI specialization."
        )
        suggestions = ["What is your tech stack?", "What projects have you done?", "How can I contact you?"]

    elif any(k in raw_query for k in ["contact", "hire", "email", "talk", "connect", "meeting", "resume"]):
        answer = (
            "You can easily connect with Chetanpura Meet right here on this website!\n\n"
            "- **Contact Form**: Simply scroll down to the **Let's Talk** section, choose a service (e.g., *AI / LLM Development* or *Machine Learning Consulting*), and submit your message. It will be delivered directly to his inbox.\n"
            "- **Direct Mail**: You can reach him at **meetch.business@gmail.com**.\n"
            "- **Location**: Ready to collaborate on remote engagements or on-site projects."
        )
        suggestions = ["What are your skills?", "Show me your projects", "Tell me about your career"]

    # 2. General Fallback Response
    else:
        answer = (
            "Hello! I am Chetanpura's **Interactive Portfolio Assistant**.\n\n"
            "I can answer questions regarding his technical skills, project histories, professional certifications, "
            "and business experience. Here are a few recommended topics to type or click below:\n\n"
            "- 🛠️ **Skills**: Learn about his ML/DL toolkit and tech stack.\n"
            "- 📂 **Projects**: Review selected AI case studies and their metrics.\n"
            "- 📈 **Experience**: Discover his philosophy on production-grade AI delivery.\n"
            "- 🎓 **Education**: Check out his credentials and certifications."
        )
        suggestions = ["What are your skills?", "Tell me about your projects", "How can I contact you?"]

    return AssistantResponse(
        answer=answer,
        suggested_queries=suggestions
    )

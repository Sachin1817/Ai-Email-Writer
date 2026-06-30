import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv
from services.groq_client import GroqClient

# Load Environment Variables
load_dotenv()

app = FastAPI(
    title="EmailAI Writer Service",
    description="FastAPI service integrated with Groq Llama-3 models for writing business copy.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Express backend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Wrapper
groq_client = GroqClient()

# Request Validation Models
class GenerateRequest(BaseModel):
    recipient: Optional[str] = Field("", description="Name or role of the email recipient")
    content: str = Field(..., description="Core message guidelines or instructions")
    tone: Optional[str] = Field("PROFESSIONAL", description="Tone style chosen for drafting")
    creativity: Optional[str] = Field("BALANCED", description="Creativity level setting")

class RewriteRequest(BaseModel):
    subject: Optional[str] = Field("", description="Current email subject line")
    content: str = Field(..., description="Current email body to edit")
    action: str = Field(..., description="Action category: SHORTEN, EXPAND, IMPROVE, TRANSLATE")
    additional_instructions: Optional[str] = Field("", description="Extra rewrite hints or target language")

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "groq_configured": groq_client.is_configured
    }

@app.post("/generate")
def generate_email_endpoint(payload: GenerateRequest):
    try:
        result = groq_client.generate_email(
            recipient=payload.recipient,
            content=payload.content,
            tone=payload.tone,
            creativity=payload.creativity
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rewrite")
def rewrite_email_endpoint(payload: RewriteRequest):
    try:
        result = groq_client.rewrite_email(
            content=payload.content,
            action=payload.action,
            additional_instructions=payload.additional_instructions,
            subject=payload.subject
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    uvicorn.run("main:app", host=host, port=port, reload=True)

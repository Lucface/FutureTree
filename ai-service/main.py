#!/usr/bin/env python3
"""
FutureTree AI Service v2.0

Bleeding-edge architecture:
- LangGraph Agentic RAG (adaptive routing, self-correction)
- Exa + Firecrawl research pipeline
- Voyage embeddings (top MTEB quality)
- Hybrid prediction (ML + LLM reasoning)
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from config import get_settings
from agents.rag_agent import RAGAgent
from agents.research_agent import ResearchAgent
from services.prediction import PredictionService
from services.embeddings import EmbeddingService
from db.connection import test_connection

settings = get_settings()

# Global instances (initialized on startup)
rag_agent: Optional[RAGAgent] = None
research_agent: Optional[ResearchAgent] = None
prediction_service: Optional[PredictionService] = None
embedding_service: Optional[EmbeddingService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    global rag_agent, research_agent, prediction_service, embedding_service

    print("Initializing AI services...")

    # Initialize services
    embedding_service = EmbeddingService()
    prediction_service = PredictionService()

    # Initialize agents (these may fail if API keys missing)
    try:
        rag_agent = RAGAgent()
        print("RAG agent initialized")
    except Exception as e:
        print(f"RAG agent initialization failed: {e}")

    try:
        research_agent = ResearchAgent()
        print("Research agent initialized")
    except Exception as e:
        print(f"Research agent initialization failed: {e}")

    # Test database connection
    if await test_connection():
        print("Database connection verified")
    else:
        print("WARNING: Database connection failed")

    print("AI services ready")
    yield

    # Cleanup
    print("Shutting down AI services...")


app = FastAPI(
    title="FutureTree AI Service",
    description="Strategic intelligence platform with Agentic RAG, research automation, and predictive analytics",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Models ---

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    route: str
    retries: int


class ResearchRequest(BaseModel):
    query: str
    industry: Optional[str] = None
    max_results: int = 5


class ResearchResponse(BaseModel):
    query: str
    case_studies: list[dict]
    count: int


class PredictionRequest(BaseModel):
    user_profile: dict
    path_id: str


class PredictionResponse(BaseModel):
    success_probability: float
    confidence: float
    timeline_estimate: str
    capital_required: float
    risk_factors: list[str]
    recommendations: list[str]
    reasoning: str


class EmbeddingRequest(BaseModel):
    text: str
    input_type: str = "document"  # "document" or "query"


class EmbeddingResponse(BaseModel):
    embedding: list[float]
    dimensions: int
    model: str


# --- Routes ---

@app.get("/")
async def root():
    """Service info and health status."""
    return {
        "service": "FutureTree AI Service",
        "version": "2.0.0",
        "status": "operational",
        "features": {
            "rag": rag_agent is not None,
            "research": research_agent is not None,
            "prediction": prediction_service is not None,
            "embeddings": embedding_service is not None,
        },
        "architecture": {
            "rag": "LangGraph Agentic RAG (Adaptive + Corrective + Self-RAG)",
            "research": "Exa.ai semantic search + Firecrawl extraction",
            "embeddings": f"Voyage ({settings.embedding_model})",
            "prediction": "Gradient Boosting + LLM reasoning hybrid",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "services": {
            "rag_agent": "ready" if rag_agent else "unavailable",
            "research_agent": "ready" if research_agent else "unavailable",
            "prediction_service": "ready" if prediction_service else "unavailable",
            "embedding_service": "ready" if embedding_service else "unavailable",
        },
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint with Agentic RAG.

    Features:
    - Adaptive routing (vectorstore vs web search vs direct)
    - Document grading for relevance
    - Self-correction for hallucination prevention
    - Web search fallback if retrieval fails
    """
    if not rag_agent:
        raise HTTPException(
            status_code=503,
            detail="RAG agent not initialized. Check API keys."
        )

    try:
        result = rag_agent.invoke(
            question=request.message,
            context=request.context,
        )

        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            route=result["route"],
            retries=result["retries"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/research", response_model=ResearchResponse)
async def research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """
    Research endpoint for case study discovery.

    Pipeline:
    1. Exa.ai semantic search for relevant pages
    2. Firecrawl extraction to clean markdown
    3. LLM parsing to structured format
    4. Optional: Store to database with embeddings

    Note: This can be slow (10-30s) due to scraping.
    """
    if not research_agent:
        raise HTTPException(
            status_code=503,
            detail="Research agent not initialized. Check EXA_API_KEY and FIRECRAWL_API_KEY."
        )

    try:
        case_studies = await research_agent.research(
            query=request.query,
            industry=request.industry,
            max_results=request.max_results,
        )

        return ResearchResponse(
            query=request.query,
            case_studies=[
                research_agent.to_db_format(cs)
                for cs in case_studies
            ],
            count=len(case_studies),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Prediction endpoint for success probability.

    Hybrid approach:
    - ML model for quantitative factors (when trained)
    - LLM reasoning for qualitative analysis
    - Grounded in similar case studies
    """
    if not prediction_service:
        raise HTTPException(
            status_code=503,
            detail="Prediction service not initialized."
        )

    try:
        result = await prediction_service.predict(
            user_profile=request.user_profile,
            path_id=request.path_id,
        )

        return PredictionResponse(
            success_probability=result.success_probability,
            confidence=result.confidence,
            timeline_estimate=result.timeline_estimate,
            capital_required=result.capital_required,
            risk_factors=result.risk_factors,
            recommendations=result.recommendations,
            reasoning=result.reasoning,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/embed", response_model=EmbeddingResponse)
async def embed(request: EmbeddingRequest):
    """
    Generate embeddings using Voyage-3-large.

    Top-performing model on MTEB benchmark.
    Falls back to OpenAI if Voyage unavailable.
    """
    if not embedding_service:
        raise HTTPException(
            status_code=503,
            detail="Embedding service not initialized."
        )

    try:
        if request.input_type == "query":
            embedding = embedding_service.embed_query(request.text)
        else:
            embedding = embedding_service.embed_text(request.text)

        return EmbeddingResponse(
            embedding=embedding,
            dimensions=len(embedding),
            model=settings.embedding_model,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/embed/batch")
async def embed_batch(texts: list[str], input_type: str = "document"):
    """Batch embedding endpoint."""
    if not embedding_service:
        raise HTTPException(
            status_code=503,
            detail="Embedding service not initialized."
        )

    try:
        embeddings = embedding_service.embed_batch(texts, input_type)

        return {
            "embeddings": embeddings,
            "count": len(embeddings),
            "dimensions": len(embeddings[0]) if embeddings else 0,
            "model": settings.embedding_model,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Background Jobs ---

@app.post("/api/jobs/index-case-studies")
async def index_case_studies(background_tasks: BackgroundTasks):
    """
    Background job to generate embeddings for all case studies.

    Run this after seeding case study data.
    """
    # TODO: Implement background embedding generation
    return {"status": "queued", "message": "Embedding generation queued"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", settings.ai_service_port))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )

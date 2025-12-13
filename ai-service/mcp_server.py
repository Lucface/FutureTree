"""
FutureTree MCP Server

Exposes AI capabilities via Model Context Protocol:
- Tools: chat, research, predict, embed
- Resources: strategic paths, case studies
- Prompts: business analysis templates

Run with:
    python mcp_server.py
    # or
    uv run mcp run mcp_server.py
"""

from typing import Optional
from mcp.server.fastmcp import FastMCP, Context
from mcp.server.session import ServerSession
from pydantic import BaseModel, Field

from config import get_settings
from agents.rag_agent import RAGAgent
from agents.research_agent import ResearchAgent
from services.prediction import PredictionService
from services.embeddings import EmbeddingService

settings = get_settings()

# Initialize MCP server
mcp = FastMCP(
    "FutureTree AI",
    json_response=True,
)

# Global service instances (lazy init)
_rag_agent: Optional[RAGAgent] = None
_research_agent: Optional[ResearchAgent] = None
_prediction_service: Optional[PredictionService] = None
_embedding_service: Optional[EmbeddingService] = None


def get_rag_agent() -> RAGAgent:
    global _rag_agent
    if _rag_agent is None:
        _rag_agent = RAGAgent()
    return _rag_agent


def get_research_agent() -> ResearchAgent:
    global _research_agent
    if _research_agent is None:
        _research_agent = ResearchAgent()
    return _research_agent


def get_prediction_service() -> PredictionService:
    global _prediction_service
    if _prediction_service is None:
        _prediction_service = PredictionService()
    return _prediction_service


def get_embedding_service() -> EmbeddingService:
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service


# =============================================================================
# TOOLS
# =============================================================================

@mcp.tool()
async def chat(
    message: str,
    industry: Optional[str] = None,
    company_size: Optional[str] = None,
    primary_goal: Optional[str] = None,
) -> dict:
    """
    Strategic advisor chat with Agentic RAG.

    Uses case studies and strategic paths to provide grounded advice.
    Automatically routes to vectorstore, web search, or direct answer.

    Args:
        message: Your question about business strategy or growth
        industry: Your industry (e.g., "Architecture", "SaaS", "Consulting")
        company_size: Team size (e.g., "solo", "2-5", "6-10", "11-25")
        primary_goal: Main objective (e.g., "Revenue Growth", "Market Expansion")

    Returns:
        Answer with sources, routing decision, and retry count
    """
    context = {}
    if industry:
        context["industry"] = industry
    if company_size:
        context["companySize"] = company_size
    if primary_goal:
        context["primaryGoal"] = primary_goal

    agent = get_rag_agent()
    result = agent.invoke(
        question=message,
        context=context if context else None,
    )

    return {
        "answer": result["answer"],
        "sources": result["sources"],
        "route": result["route"],
        "retries": result["retries"],
    }


@mcp.tool()
async def research_case_studies(
    query: str,
    industry: Optional[str] = None,
    max_results: int = 5,
) -> dict:
    """
    Research and extract case studies from the web.

    Uses Exa.ai for semantic search and Firecrawl for extraction.
    Parses results into structured case study format.

    Args:
        query: Research query (e.g., "architecture firm growth story")
        industry: Filter by industry
        max_results: Maximum case studies to return (1-10)

    Returns:
        List of extracted case studies with company info, strategies, and outcomes
    """
    agent = get_research_agent()

    case_studies = await agent.research(
        query=query,
        industry=industry,
        max_results=min(max_results, 10),
    )

    return {
        "query": query,
        "case_studies": [agent.to_db_format(cs) for cs in case_studies],
        "count": len(case_studies),
    }


@mcp.tool()
async def predict_success(
    industry: str,
    company_size: str,
    annual_revenue: float,
    years_in_business: int,
    available_capital: float,
    risk_tolerance: str,
    primary_goal: str,
    biggest_challenge: str,
    path_id: str,
) -> dict:
    """
    Predict success probability for a strategic path.

    Uses hybrid ML + LLM approach:
    - Gradient Boosting for quantitative factors
    - Claude for qualitative reasoning
    - Grounded in similar case studies

    Args:
        industry: Business industry (e.g., "Architecture", "SaaS")
        company_size: Team size ("solo", "2-5", "6-10", "11-25", "26-50", "50+")
        annual_revenue: Current annual revenue in USD
        years_in_business: Years the company has been operating
        available_capital: Capital available for growth initiatives in USD
        risk_tolerance: Risk appetite ("conservative", "moderate", "aggressive")
        primary_goal: Main business objective
        biggest_challenge: Primary obstacle to growth
        path_id: Strategic path to evaluate (e.g., "vertical_specialization")

    Returns:
        Success probability, confidence, timeline, capital needed, risks, recommendations
    """
    user_profile = {
        "industry": industry,
        "companySize": company_size,
        "annualRevenue": annual_revenue,
        "yearsInBusiness": years_in_business,
        "availableCapital": available_capital,
        "riskTolerance": risk_tolerance,
        "primaryGoal": primary_goal,
        "biggestChallenge": biggest_challenge,
    }

    service = get_prediction_service()
    result = await service.predict(
        user_profile=user_profile,
        path_id=path_id,
    )

    return {
        "success_probability": result.success_probability,
        "confidence": result.confidence,
        "timeline_estimate": result.timeline_estimate,
        "capital_required": result.capital_required,
        "risk_factors": result.risk_factors,
        "recommendations": result.recommendations,
        "reasoning": result.reasoning,
    }


@mcp.tool()
async def generate_embedding(
    text: str,
    input_type: str = "document",
) -> dict:
    """
    Generate embeddings using Voyage-3-large.

    Top-performing model on MTEB benchmark (1024 dimensions).
    Falls back to OpenAI if Voyage unavailable.

    Args:
        text: Text to embed
        input_type: "document" for content, "query" for search queries

    Returns:
        Embedding vector, dimensions, and model used
    """
    service = get_embedding_service()

    if input_type == "query":
        embedding = service.embed_query(text)
    else:
        embedding = service.embed_text(text)

    return {
        "embedding": embedding,
        "dimensions": len(embedding),
        "model": settings.embedding_model,
    }


@mcp.tool()
async def batch_embed(
    texts: list[str],
    input_type: str = "document",
) -> dict:
    """
    Generate embeddings for multiple texts.

    More efficient than individual calls for bulk operations.

    Args:
        texts: List of texts to embed
        input_type: "document" for content, "query" for search queries

    Returns:
        List of embeddings with count and dimensions
    """
    service = get_embedding_service()
    embeddings = service.embed_batch(texts, input_type)

    return {
        "embeddings": embeddings,
        "count": len(embeddings),
        "dimensions": len(embeddings[0]) if embeddings else 0,
        "model": settings.embedding_model,
    }


# =============================================================================
# RESOURCES
# =============================================================================

@mcp.resource("futuretree://paths")
def get_strategic_paths() -> str:
    """List of available strategic growth paths."""
    paths = [
        {
            "id": "vertical_specialization",
            "name": "Vertical Specialization",
            "description": "Focus on a specific industry niche to become the go-to expert",
            "best_for": ["Service businesses", "Consultants", "Agencies"],
            "timeline": "6-18 months",
            "risk": "moderate",
        },
        {
            "id": "content_marketing",
            "name": "Content Marketing & Thought Leadership",
            "description": "Build authority through valuable content and establish market presence",
            "best_for": ["B2B companies", "Professional services", "SaaS"],
            "timeline": "12-24 months",
            "risk": "low",
        },
        {
            "id": "partnership_expansion",
            "name": "Strategic Partnerships",
            "description": "Grow through complementary business relationships",
            "best_for": ["Companies with clear value prop", "Established businesses"],
            "timeline": "3-12 months",
            "risk": "moderate",
        },
        {
            "id": "productized_services",
            "name": "Productized Services",
            "description": "Package services into repeatable, scalable offerings",
            "best_for": ["Service businesses", "Freelancers", "Agencies"],
            "timeline": "3-9 months",
            "risk": "low",
        },
        {
            "id": "geographic_expansion",
            "name": "Geographic Expansion",
            "description": "Enter new markets or regions",
            "best_for": ["Established businesses", "Proven models"],
            "timeline": "12-36 months",
            "risk": "high",
        },
    ]

    import json
    return json.dumps(paths, indent=2)


@mcp.resource("futuretree://paths/{path_id}")
def get_strategic_path(path_id: str) -> str:
    """Get detailed information about a specific strategic path."""
    paths = {
        "vertical_specialization": {
            "id": "vertical_specialization",
            "name": "Vertical Specialization",
            "description": "Focus on a specific industry niche to become the go-to expert",
            "phases": [
                {"name": "Market Research", "duration": "2-4 weeks", "activities": ["Identify target vertical", "Analyze competition", "Validate demand"]},
                {"name": "Positioning", "duration": "4-8 weeks", "activities": ["Refine messaging", "Update marketing", "Create case studies"]},
                {"name": "Execution", "duration": "3-12 months", "activities": ["Target outreach", "Content creation", "Relationship building"]},
            ],
            "success_factors": [
                "Clear differentiation from generalists",
                "Deep understanding of industry pain points",
                "Credible expertise or willingness to develop it",
            ],
            "risks": [
                "Market too small",
                "Unable to establish credibility",
                "Industry downturn",
            ],
        },
    }

    import json
    path = paths.get(path_id, {"error": f"Path '{path_id}' not found"})
    return json.dumps(path, indent=2)


@mcp.resource("futuretree://config")
def get_config() -> str:
    """Current AI service configuration."""
    import json
    return json.dumps({
        "version": "2.0.0",
        "embedding_model": settings.embedding_model,
        "embedding_dimensions": settings.embedding_dimensions,
        "rag_config": {
            "retrieval_k": 5,
            "similarity_threshold": 0.7,
            "max_retries": 3,
        },
        "features": {
            "agentic_rag": True,
            "web_fallback": True,
            "hallucination_check": True,
            "hybrid_prediction": True,
        },
    }, indent=2)


# =============================================================================
# PROMPTS
# =============================================================================

@mcp.prompt()
def analyze_business(
    industry: str,
    company_size: str,
    annual_revenue: str,
    primary_goal: str,
    biggest_challenge: str,
) -> str:
    """Generate a comprehensive business analysis prompt."""
    return f"""Analyze this business profile and provide strategic recommendations:

**Business Profile:**
- Industry: {industry}
- Company Size: {company_size}
- Annual Revenue: {annual_revenue}
- Primary Goal: {primary_goal}
- Biggest Challenge: {biggest_challenge}

**Analysis Required:**
1. Assess the current business position
2. Identify 2-3 strategic growth paths that fit this profile
3. For each path, explain:
   - Why it's suitable for this business
   - Key steps to implement
   - Expected timeline and investment
   - Potential risks and mitigations
4. Recommend the single best path with reasoning
5. Suggest 3 immediate actions to take this week

Use case studies and real examples where possible. Be specific and actionable."""


@mcp.prompt()
def compare_strategies(
    strategy_a: str,
    strategy_b: str,
    context: str = "",
) -> str:
    """Generate a strategy comparison prompt."""
    context_section = f"\n**Business Context:**\n{context}\n" if context else ""

    return f"""Compare these two strategic approaches:{context_section}

**Strategy A:** {strategy_a}
**Strategy B:** {strategy_b}

**Comparison Framework:**
1. Resource Requirements (time, money, people)
2. Risk Profile (what could go wrong)
3. Potential Upside (best case outcomes)
4. Time to Results (when you'd see impact)
5. Reversibility (how hard to undo if it fails)
6. Prerequisites (what you need before starting)

**Recommendation:**
Based on the comparison, recommend which strategy is better and under what circumstances each would be preferred."""


@mcp.prompt()
def case_study_analysis(
    company_name: str,
    industry: str,
    strategy_used: str,
) -> str:
    """Generate a case study analysis prompt."""
    return f"""Analyze the growth story of {company_name} in the {industry} industry.

**Focus Areas:**
1. Starting State: Where were they before the transformation?
2. Strategy: How did they implement {strategy_used}?
3. Key Actions: What specific steps did they take?
4. Timeline: How long did the transformation take?
5. Results: What outcomes did they achieve?
6. Lessons: What can other businesses learn from this?

**Extraction Goals:**
- Identify the 3 most critical success factors
- Note any mistakes or pivots during execution
- Quantify results where possible (revenue growth, market share, etc.)
- Extract actionable advice for similar businesses"""


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print("Starting FutureTree MCP Server...")
    print("Tools: chat, research_case_studies, predict_success, generate_embedding, batch_embed")
    print("Resources: futuretree://paths, futuretree://paths/{id}, futuretree://config")
    print("Prompts: analyze_business, compare_strategies, case_study_analysis")
    mcp.run(transport="streamable-http")

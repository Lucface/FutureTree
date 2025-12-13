"""
Research Agent for Case Study Sourcing

Uses:
- Exa.ai for semantic search (finds relevant pages)
- Firecrawl for structured extraction (converts to markdown)
- LLM for parsing into schema format
"""
from typing import Optional
from dataclasses import dataclass
import json
from exa_py import Exa
from firecrawl import FirecrawlApp
from langchain_core.messages import SystemMessage

from services.llm import get_llm, get_json_model
from services.embeddings import EmbeddingService
from config import get_settings, RESEARCH_CONFIG

settings = get_settings()


@dataclass
class CaseStudyExtract:
    """Extracted case study data."""
    company_name: str
    industry: str
    summary: str
    strategy_type: str
    starting_state: dict
    ending_state: dict
    timeline: str
    key_actions: list[str]
    outcomes: dict
    lessons_learned: str
    source_url: str
    confidence: float


class ResearchAgent:
    """
    Agent for finding and extracting case studies from the web.

    Pipeline:
    1. Exa.ai semantic search -> find relevant URLs
    2. Firecrawl extraction -> convert to clean markdown
    3. LLM parsing -> extract structured data
    4. Embedding generation -> store in vector DB
    """

    def __init__(self):
        self.exa_client: Optional[Exa] = None
        self.firecrawl_client: Optional[FirecrawlApp] = None
        self.llm = get_llm("reasoning")
        self.json_llm = get_json_model()
        self.embedding_service = EmbeddingService()
        self._init_clients()

    def _init_clients(self):
        """Initialize research tool clients."""
        if settings.exa_api_key:
            self.exa_client = Exa(api_key=settings.exa_api_key)

        if settings.firecrawl_api_key:
            self.firecrawl_client = FirecrawlApp(api_key=settings.firecrawl_api_key)

    async def search_case_studies(
        self,
        query: str,
        industry: Optional[str] = None,
        num_results: int = 10,
    ) -> list[dict]:
        """
        Search for case studies using Exa.ai semantic search.

        Args:
            query: Search query (e.g., "architecture firm growth story")
            industry: Optional industry filter
            num_results: Number of results to return

        Returns:
            List of search results with URLs and snippets
        """
        if not self.exa_client:
            raise ValueError("Exa client not initialized. Set EXA_API_KEY.")

        # Build search query
        search_query = f"{query} business growth case study success story"
        if industry:
            search_query = f"{industry} {search_query}"

        # Use Exa's neural search
        results = self.exa_client.search(
            search_query,
            num_results=num_results,
            type="neural",  # Semantic search
            use_autoprompt=True,
            include_domains=[
                "indiehackers.com",
                "hbr.org",
                "entrepreneur.com",
                "forbes.com",
                "inc.com",
                "ycombinator.com",
                "medium.com",
                "substack.com",
            ],
        )

        return [
            {
                "url": r.url,
                "title": r.title,
                "snippet": getattr(r, "text", "")[:500],
                "score": getattr(r, "score", 0),
            }
            for r in results.results
        ]

    async def extract_page(self, url: str) -> Optional[str]:
        """
        Extract page content using Firecrawl.

        Args:
            url: URL to extract

        Returns:
            Clean markdown content or None if extraction fails
        """
        if not self.firecrawl_client:
            raise ValueError("Firecrawl client not initialized. Set FIRECRAWL_API_KEY.")

        try:
            result = self.firecrawl_client.scrape_url(
                url,
                params={
                    "formats": ["markdown"],
                    "onlyMainContent": True,
                },
            )

            return result.get("markdown", "")
        except Exception as e:
            print(f"Firecrawl extraction failed for {url}: {e}")
            return None

    async def parse_case_study(
        self,
        content: str,
        source_url: str,
    ) -> Optional[CaseStudyExtract]:
        """
        Parse extracted content into structured case study format.

        Args:
            content: Markdown content from Firecrawl
            source_url: Original URL

        Returns:
            Structured case study data or None if parsing fails
        """
        parse_prompt = """You are an expert at extracting business case study information.

Analyze the following content and extract a structured case study if it contains a business growth story.

Content:
{content}

Extract the following information and return as JSON:
{{
    "company_name": "Name of the company",
    "industry": "Primary industry (e.g., SaaS, Architecture, Consulting)",
    "summary": "2-3 sentence summary of the growth story",
    "strategy_type": "Main strategy used (e.g., vertical_specialization, content_marketing, partnerships)",
    "starting_state": {{
        "revenue": "Starting revenue or ARR",
        "team_size": "Starting team size",
        "challenges": ["Main challenges faced"]
    }},
    "ending_state": {{
        "revenue": "Ending revenue or ARR",
        "team_size": "Ending team size",
        "growth_rate": "Growth rate achieved"
    }},
    "timeline": "How long the transformation took",
    "key_actions": ["List of 3-5 key actions taken"],
    "outcomes": {{
        "revenue_growth": "Revenue growth achieved",
        "other_metrics": "Other relevant metrics"
    }},
    "lessons_learned": "Key lesson or advice from the story",
    "is_valid_case_study": true/false,
    "confidence": 0.0-1.0
}}

If the content doesn't contain a valid business case study, set is_valid_case_study to false.
Return ONLY valid JSON."""

        try:
            response = self.json_llm.invoke([
                SystemMessage(content=parse_prompt.format(content=content[:8000]))
            ])

            data = json.loads(response.content)

            if not data.get("is_valid_case_study", False):
                return None

            return CaseStudyExtract(
                company_name=data.get("company_name", "Unknown"),
                industry=data.get("industry", "Unknown"),
                summary=data.get("summary", ""),
                strategy_type=data.get("strategy_type", "unknown"),
                starting_state=data.get("starting_state", {}),
                ending_state=data.get("ending_state", {}),
                timeline=data.get("timeline", "Unknown"),
                key_actions=data.get("key_actions", []),
                outcomes=data.get("outcomes", {}),
                lessons_learned=data.get("lessons_learned", ""),
                source_url=source_url,
                confidence=data.get("confidence", 0.5),
            )
        except Exception as e:
            print(f"Case study parsing failed: {e}")
            return None

    async def research(
        self,
        query: str,
        industry: Optional[str] = None,
        max_results: int = 5,
    ) -> list[CaseStudyExtract]:
        """
        Full research pipeline: search -> extract -> parse.

        Args:
            query: Research query
            industry: Optional industry filter
            max_results: Maximum case studies to return

        Returns:
            List of extracted case studies
        """
        # Step 1: Search with Exa
        search_results = await self.search_case_studies(
            query=query,
            industry=industry,
            num_results=RESEARCH_CONFIG["exa_results_per_query"],
        )

        if not search_results:
            return []

        # Step 2: Extract and parse each result
        case_studies = []

        for result in search_results:
            if len(case_studies) >= max_results:
                break

            # Extract page content
            content = await self.extract_page(result["url"])
            if not content:
                continue

            # Parse into case study format
            case_study = await self.parse_case_study(
                content=content,
                source_url=result["url"],
            )

            if case_study and case_study.confidence >= 0.6:
                case_studies.append(case_study)

        return case_studies

    async def generate_embedding(self, case_study: CaseStudyExtract) -> list[float]:
        """Generate embedding for a case study."""
        # Create a text representation for embedding
        text = f"""
{case_study.company_name} - {case_study.industry}

{case_study.summary}

Strategy: {case_study.strategy_type}
Timeline: {case_study.timeline}

Key Actions:
{chr(10).join(f"- {action}" for action in case_study.key_actions)}

Lessons: {case_study.lessons_learned}
"""
        return self.embedding_service.embed_text(text)

    def to_db_format(self, case_study: CaseStudyExtract) -> dict:
        """Convert case study to database insert format."""
        return {
            "company_name": case_study.company_name,
            "industry": case_study.industry,
            "summary": case_study.summary,
            "strategy_type": [case_study.strategy_type],
            "starting_state": case_study.starting_state,
            "ending_state": case_study.ending_state,
            "timeline": {"description": case_study.timeline},
            "key_actions": case_study.key_actions,
            "outcomes": case_study.outcomes,
            "lessons_learned": case_study.lessons_learned,
            "source_url": case_study.source_url,
            "confidence_level": int(case_study.confidence * 100),
            "is_verified": False,
        }

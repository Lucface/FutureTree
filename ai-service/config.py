"""
FutureTree AI Service Configuration
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service
    ai_service_port: int = 8000
    environment: str = "development"

    # Database
    database_url: str = ""

    # LLMs
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # Embeddings
    voyage_api_key: str = ""
    embedding_model: str = "voyage-3-large"
    embedding_dimensions: int = 1024

    # Research
    exa_api_key: str = ""
    firecrawl_api_key: str = ""
    tavily_api_key: str = ""

    # LangSmith (tracing)
    langsmith_api_key: str = ""
    langchain_tracing_v2: bool = True
    langchain_project: str = "futuretree-ai"

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5003",
        "http://localhost:4000"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Model configurations
MODELS = {
    "chat": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-20250514",  # Claude 4.5 Sonnet
        "temperature": 0.7,
        "max_tokens": 4096,
    },
    "reasoning": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-20250514",
        "temperature": 0,
        "max_tokens": 8192,
    },
    "fast": {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "temperature": 0,
        "max_tokens": 2048,
    },
}


# RAG Configuration
RAG_CONFIG = {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "retrieval_k": 5,
    "rerank_top_n": 3,
    "similarity_threshold": 0.7,
}


# Research Configuration
RESEARCH_CONFIG = {
    "exa_results_per_query": 10,
    "firecrawl_timeout": 30,
    "max_case_studies_per_search": 5,
}

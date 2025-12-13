"""
LLM service configuration.
Supports Claude (primary) and OpenAI (fallback/fast).
"""
from typing import Literal, Optional
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.language_models import BaseChatModel

from config import get_settings, MODELS

settings = get_settings()


def get_llm(
    purpose: Literal["chat", "reasoning", "fast"] = "chat",
    temperature: Optional[float] = None,
) -> BaseChatModel:
    """
    Get an LLM instance for the specified purpose.

    Args:
        purpose: "chat" (conversational), "reasoning" (analysis), "fast" (quick tasks)
        temperature: Override default temperature

    Returns:
        Configured LLM instance
    """
    config = MODELS[purpose]
    temp = temperature if temperature is not None else config["temperature"]

    if config["provider"] == "anthropic":
        return ChatAnthropic(
            model=config["model"],
            temperature=temp,
            max_tokens=config["max_tokens"],
            api_key=settings.anthropic_api_key,
        )
    else:
        return ChatOpenAI(
            model=config["model"],
            temperature=temp,
            max_tokens=config["max_tokens"],
            api_key=settings.openai_api_key,
        )


def get_chat_model() -> BaseChatModel:
    """Get the primary chat model (Claude)."""
    return get_llm("chat")


def get_reasoning_model() -> BaseChatModel:
    """Get the reasoning model for complex analysis."""
    return get_llm("reasoning")


def get_fast_model() -> BaseChatModel:
    """Get the fast model for simple tasks."""
    return get_llm("fast")


def get_json_model() -> BaseChatModel:
    """Get a model configured for JSON output."""
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        max_tokens=2048,
        api_key=settings.openai_api_key,
        model_kwargs={"response_format": {"type": "json_object"}},
    )

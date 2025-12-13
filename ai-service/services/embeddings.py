"""
Embedding service using Voyage AI (top-tier quality).
Falls back to OpenAI if Voyage unavailable.
"""
from typing import Optional
import voyageai
import openai
from tenacity import retry, stop_after_attempt, wait_exponential

from config import get_settings

settings = get_settings()


class EmbeddingService:
    """
    Embedding service with Voyage AI as primary, OpenAI as fallback.

    Voyage-3-large is the top-performing model on MTEB leaderboard.
    """

    def __init__(self):
        self.voyage_client: Optional[voyageai.Client] = None
        self.openai_client: Optional[openai.OpenAI] = None
        self._init_clients()

    def _init_clients(self):
        """Initialize embedding clients."""
        if settings.voyage_api_key:
            self.voyage_client = voyageai.Client(api_key=settings.voyage_api_key)

        if settings.openai_api_key:
            self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    def embed_text(self, text: str) -> list[float]:
        """
        Generate embedding for a single text.

        Uses Voyage-3-large (1024 dimensions) as primary.
        Falls back to OpenAI text-embedding-3-small if Voyage unavailable.
        """
        if self.voyage_client:
            try:
                result = self.voyage_client.embed(
                    [text],
                    model=settings.embedding_model,
                    input_type="document",
                )
                return result.embeddings[0]
            except Exception as e:
                print(f"Voyage embedding failed: {e}, falling back to OpenAI")

        if self.openai_client:
            response = self.openai_client.embeddings.create(
                input=text,
                model="text-embedding-3-small",
            )
            return response.data[0].embedding

        raise ValueError("No embedding client available")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    def embed_query(self, query: str) -> list[float]:
        """
        Generate embedding for a query (optimized for retrieval).

        Voyage distinguishes between document and query embeddings.
        """
        if self.voyage_client:
            try:
                result = self.voyage_client.embed(
                    [query],
                    model=settings.embedding_model,
                    input_type="query",
                )
                return result.embeddings[0]
            except Exception as e:
                print(f"Voyage embedding failed: {e}, falling back to OpenAI")

        if self.openai_client:
            response = self.openai_client.embeddings.create(
                input=query,
                model="text-embedding-3-small",
            )
            return response.data[0].embedding

        raise ValueError("No embedding client available")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    def embed_batch(
        self,
        texts: list[str],
        input_type: str = "document",
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple texts.

        Args:
            texts: List of texts to embed
            input_type: "document" or "query"

        Returns:
            List of embedding vectors
        """
        if not texts:
            return []

        if self.voyage_client:
            try:
                # Voyage supports batches up to 128
                batch_size = 128
                all_embeddings = []

                for i in range(0, len(texts), batch_size):
                    batch = texts[i : i + batch_size]
                    result = self.voyage_client.embed(
                        batch,
                        model=settings.embedding_model,
                        input_type=input_type,
                    )
                    all_embeddings.extend(result.embeddings)

                return all_embeddings
            except Exception as e:
                print(f"Voyage batch embedding failed: {e}, falling back to OpenAI")

        if self.openai_client:
            # OpenAI batch
            response = self.openai_client.embeddings.create(
                input=texts,
                model="text-embedding-3-small",
            )
            return [item.embedding for item in response.data]

        raise ValueError("No embedding client available")

    def get_dimensions(self) -> int:
        """Get embedding dimensions for the current model."""
        if self.voyage_client and settings.embedding_model == "voyage-3-large":
            return 1024
        elif self.voyage_client and settings.embedding_model == "voyage-3":
            return 1024
        else:
            # OpenAI text-embedding-3-small
            return 1536

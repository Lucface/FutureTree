"""
Vector store operations using pgvector.
"""
from typing import Optional
import json
from sqlalchemy import text
from sqlalchemy.orm import Session

from config import get_settings, RAG_CONFIG

settings = get_settings()


class VectorStore:
    """
    Vector store operations for case studies and strategic paths.
    Uses pgvector for similarity search.
    """

    def __init__(self, session: Session):
        self.session = session

    def similarity_search(
        self,
        embedding: list[float],
        table: str = "case_studies",
        k: int = RAG_CONFIG["retrieval_k"],
        threshold: float = RAG_CONFIG["similarity_threshold"],
        filters: Optional[dict] = None,
    ) -> list[dict]:
        """
        Search for similar documents using cosine similarity.

        Args:
            embedding: Query embedding vector
            table: Table to search in
            k: Number of results to return
            threshold: Minimum similarity threshold
            filters: Optional filters (e.g., {"industry": "architecture"})

        Returns:
            List of matching documents with similarity scores
        """
        # Build filter clause
        filter_clause = ""
        params = {"embedding": embedding, "k": k, "threshold": threshold}

        if filters:
            filter_parts = []
            for i, (key, value) in enumerate(filters.items()):
                param_name = f"filter_{i}"
                filter_parts.append(f"{key} = :{param_name}")
                params[param_name] = value
            if filter_parts:
                filter_clause = "AND " + " AND ".join(filter_parts)

        # Query with cosine similarity
        query = text(f"""
            SELECT
                id,
                company_name,
                industry,
                summary,
                strategy_type,
                starting_state,
                ending_state,
                timeline,
                key_actions,
                outcomes,
                lessons_learned,
                1 - (embedding <=> :embedding::vector) as similarity
            FROM {table}
            WHERE 1 - (embedding <=> :embedding::vector) > :threshold
            {filter_clause}
            ORDER BY embedding <=> :embedding::vector
            LIMIT :k
        """)

        result = self.session.execute(query, params)
        rows = result.fetchall()

        return [
            {
                "id": str(row.id),
                "company_name": row.company_name,
                "industry": row.industry,
                "summary": row.summary,
                "strategy_type": row.strategy_type,
                "starting_state": row.starting_state,
                "ending_state": row.ending_state,
                "timeline": row.timeline,
                "key_actions": row.key_actions,
                "outcomes": row.outcomes,
                "lessons_learned": row.lessons_learned,
                "similarity": float(row.similarity),
            }
            for row in rows
        ]

    def search_strategic_paths(
        self,
        embedding: list[float],
        k: int = 5,
    ) -> list[dict]:
        """Search for relevant strategic paths."""
        query = text("""
            SELECT
                sp.id,
                sp.name,
                sp.slug,
                sp.summary,
                sp.description,
                sp.success_rate,
                sp.timeline_p25,
                sp.timeline_p75,
                sp.capital_p25,
                sp.capital_p75,
                sp.risk_score,
                1 - (sp.embedding <=> :embedding::vector) as similarity
            FROM strategic_paths sp
            WHERE sp.is_active = true
            AND sp.embedding IS NOT NULL
            ORDER BY sp.embedding <=> :embedding::vector
            LIMIT :k
        """)

        result = self.session.execute(query, {"embedding": embedding, "k": k})
        rows = result.fetchall()

        return [
            {
                "id": str(row.id),
                "name": row.name,
                "slug": row.slug,
                "summary": row.summary,
                "description": row.description,
                "success_rate": float(row.success_rate) if row.success_rate else None,
                "timeline_range": f"{row.timeline_p25}-{row.timeline_p75} months",
                "capital_range": f"${row.capital_p25:,}-${row.capital_p75:,}",
                "risk_score": float(row.risk_score) if row.risk_score else None,
                "similarity": float(row.similarity),
            }
            for row in rows
        ]

    def get_case_study_by_id(self, case_study_id: str) -> Optional[dict]:
        """Get a specific case study by ID."""
        query = text("""
            SELECT * FROM case_studies WHERE id = :id
        """)
        result = self.session.execute(query, {"id": case_study_id})
        row = result.fetchone()

        if not row:
            return None

        return dict(row._mapping)

    def store_embedding(
        self,
        table: str,
        record_id: str,
        embedding: list[float],
    ) -> bool:
        """Store an embedding for a record."""
        query = text(f"""
            UPDATE {table}
            SET embedding = :embedding::vector
            WHERE id = :id
        """)

        try:
            self.session.execute(
                query, {"id": record_id, "embedding": embedding}
            )
            self.session.commit()
            return True
        except Exception as e:
            print(f"Error storing embedding: {e}")
            self.session.rollback()
            return False

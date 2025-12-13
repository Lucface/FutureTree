"""
LangGraph Agentic RAG Agent

Implements Adaptive RAG with:
- Query routing (direct answer vs retrieval vs web search)
- Document grading (relevance check)
- Self-correction (hallucination detection)
- Web fallback (Tavily search if retrieval fails)
"""
from typing import TypedDict, Annotated, Literal, Optional
from operator import add
import json

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.documents import Document

from services.llm import get_llm, get_json_model
from services.embeddings import EmbeddingService
from db.connection import get_db
from db.vector_store import VectorStore
from config import RAG_CONFIG


# State definition
class RAGState(TypedDict):
    """State for the RAG agent."""
    question: str
    context: Optional[dict]  # User context (industry, stage, etc.)
    documents: list[Document]
    generation: Optional[str]
    web_search_needed: bool
    retry_count: int
    max_retries: int
    routing_decision: str  # "vectorstore", "web_search", "direct"


class RAGAgent:
    """
    Agentic RAG for FutureTree.

    Combines:
    - Adaptive RAG: Routes queries to appropriate retrieval
    - Corrective RAG: Falls back to web search if retrieval fails
    - Self-RAG: Checks for hallucinations and regenerates
    """

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.chat_llm = get_llm("chat")
        self.reasoning_llm = get_llm("reasoning")
        self.json_llm = get_json_model()
        self.graph = create_rag_graph()

    def invoke(
        self,
        question: str,
        context: Optional[dict] = None,
        max_retries: int = 3,
    ) -> dict:
        """
        Process a question through the RAG pipeline.

        Args:
            question: User's question
            context: Optional user context (industry, company size, etc.)
            max_retries: Max regeneration attempts

        Returns:
            Dict with answer, sources, and metadata
        """
        initial_state = RAGState(
            question=question,
            context=context,
            documents=[],
            generation=None,
            web_search_needed=False,
            retry_count=0,
            max_retries=max_retries,
            routing_decision="",
        )

        result = self.graph.invoke(initial_state)

        return {
            "answer": result.get("generation", "I couldn't find a good answer."),
            "sources": [
                {
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata,
                }
                for doc in result.get("documents", [])
            ],
            "route": result.get("routing_decision", "unknown"),
            "retries": result.get("retry_count", 0),
        }


def create_rag_graph() -> StateGraph:
    """Create the LangGraph RAG workflow."""

    # Initialize services
    embedding_service = EmbeddingService()
    chat_llm = get_llm("chat")
    json_llm = get_json_model()

    # --- Node Functions ---

    def route_question(state: RAGState) -> RAGState:
        """Route the question to the appropriate retrieval method."""
        question = state["question"]

        router_prompt = """You are an expert at routing questions about business strategy and growth.

Analyze the question and determine the best approach:
- "vectorstore": Questions about strategic paths, case studies, business growth, company transformations
- "web_search": Questions about current events, recent news, specific companies not in our database
- "direct": Simple greetings, clarifications, or questions you can answer without retrieval

Question: {question}

Return JSON with a single key "route" that is one of: "vectorstore", "web_search", or "direct"."""

        response = json_llm.invoke([
            SystemMessage(content=router_prompt.format(question=question))
        ])

        try:
            result = json.loads(response.content)
            route = result.get("route", "vectorstore")
        except json.JSONDecodeError:
            route = "vectorstore"

        return {**state, "routing_decision": route}

    def retrieve(state: RAGState) -> RAGState:
        """Retrieve relevant documents from the vector store."""
        question = state["question"]
        context = state.get("context", {})

        # Generate query embedding
        query_embedding = embedding_service.embed_query(question)

        # Build filters from context
        filters = {}
        if context and context.get("industry"):
            filters["industry"] = context["industry"]

        # Search vector store
        with get_db() as session:
            vector_store = VectorStore(session)
            results = vector_store.similarity_search(
                embedding=query_embedding,
                table="case_studies",
                k=RAG_CONFIG["retrieval_k"],
                threshold=RAG_CONFIG["similarity_threshold"],
                filters=filters if filters else None,
            )

        # Convert to Documents
        documents = [
            Document(
                page_content=_format_case_study(r),
                metadata={
                    "id": r["id"],
                    "company": r.get("company_name"),
                    "industry": r.get("industry"),
                    "similarity": r.get("similarity"),
                },
            )
            for r in results
        ]

        return {**state, "documents": documents}

    def grade_documents(state: RAGState) -> RAGState:
        """Grade retrieved documents for relevance."""
        question = state["question"]
        documents = state["documents"]

        if not documents:
            return {**state, "web_search_needed": True, "documents": []}

        grader_prompt = """You are a grader assessing relevance of a retrieved document to a user question.

If the document contains information relevant to answering the question, grade it as relevant.

Document: {document}

Question: {question}

Return JSON with a single key "relevant" that is "yes" or "no"."""

        relevant_docs = []
        for doc in documents:
            response = json_llm.invoke([
                SystemMessage(content=grader_prompt.format(
                    document=doc.page_content[:1000],
                    question=question,
                ))
            ])

            try:
                result = json.loads(response.content)
                if result.get("relevant") == "yes":
                    relevant_docs.append(doc)
            except json.JSONDecodeError:
                # If parsing fails, include the document
                relevant_docs.append(doc)

        # If no relevant docs, trigger web search
        web_search_needed = len(relevant_docs) == 0

        return {
            **state,
            "documents": relevant_docs,
            "web_search_needed": web_search_needed,
        }

    def web_search(state: RAGState) -> RAGState:
        """Fall back to web search using Tavily."""
        from langchain_community.tools.tavily_search import TavilySearchResults

        question = state["question"]

        try:
            search_tool = TavilySearchResults(k=3)
            results = search_tool.invoke({"query": question})

            web_docs = [
                Document(
                    page_content=r.get("content", ""),
                    metadata={"url": r.get("url"), "source": "web_search"},
                )
                for r in results
            ]

            # Combine with any existing documents
            all_docs = state["documents"] + web_docs
            return {**state, "documents": all_docs, "web_search_needed": False}
        except Exception as e:
            print(f"Web search failed: {e}")
            return state

    def generate(state: RAGState) -> RAGState:
        """Generate an answer using the retrieved context."""
        question = state["question"]
        documents = state["documents"]
        context = state.get("context", {})

        # Format context
        docs_text = "\n\n---\n\n".join([doc.page_content for doc in documents])

        user_context = ""
        if context:
            user_context = f"""
User Context:
- Industry: {context.get('industry', 'Not specified')}
- Company Size: {context.get('companySize', 'Not specified')}
- Current Stage: {context.get('currentStage', 'Not specified')}
- Primary Goal: {context.get('primaryGoal', 'Not specified')}
"""

        system_prompt = """You are a strategic advisor for small businesses, helping them navigate growth decisions.

Use the following case studies and strategic insights to answer the user's question.
Be specific, cite examples from the case studies, and provide actionable advice.

If the context doesn't contain relevant information, say so honestly.

Context:
{context}

{user_context}

Provide a helpful, specific answer based on real business examples."""

        response = chat_llm.invoke([
            SystemMessage(content=system_prompt.format(
                context=docs_text,
                user_context=user_context,
            )),
            HumanMessage(content=question),
        ])

        return {**state, "generation": response.content}

    def check_hallucination(state: RAGState) -> RAGState:
        """Check if the generation is grounded in the documents."""
        generation = state["generation"]
        documents = state["documents"]
        retry_count = state["retry_count"]

        if not documents or not generation:
            return state

        docs_text = "\n\n".join([doc.page_content for doc in documents])

        hallucination_prompt = """You are a grader checking if an answer is grounded in the provided facts.

FACTS:
{documents}

ANSWER:
{generation}

Return JSON with:
- "grounded": "yes" if the answer is supported by the facts, "no" otherwise
- "explanation": Brief explanation of your assessment"""

        response = json_llm.invoke([
            SystemMessage(content=hallucination_prompt.format(
                documents=docs_text[:3000],
                generation=generation,
            ))
        ])

        try:
            result = json.loads(response.content)
            if result.get("grounded") == "no":
                # Increment retry count
                return {
                    **state,
                    "retry_count": retry_count + 1,
                    "generation": None,  # Clear to trigger regeneration
                }
        except json.JSONDecodeError:
            pass

        return state

    def direct_answer(state: RAGState) -> RAGState:
        """Provide a direct answer without retrieval."""
        question = state["question"]

        response = chat_llm.invoke([
            SystemMessage(content="""You are a helpful strategic advisor for small businesses.
Answer the user's question directly and helpfully."""),
            HumanMessage(content=question),
        ])

        return {**state, "generation": response.content}

    # --- Conditional Edges ---

    def decide_route(state: RAGState) -> str:
        """Decide which path to take based on routing."""
        routing = state.get("routing_decision", "vectorstore")
        if routing == "direct":
            return "direct"
        elif routing == "web_search":
            return "web_search"
        else:
            return "retrieve"

    def decide_after_grading(state: RAGState) -> str:
        """Decide whether to generate or search web."""
        if state.get("web_search_needed"):
            return "web_search"
        return "generate"

    def decide_after_generation(state: RAGState) -> str:
        """Decide if we need to retry or finish."""
        retry_count = state.get("retry_count", 0)
        max_retries = state.get("max_retries", 3)
        generation = state.get("generation")

        if generation is None and retry_count < max_retries:
            return "retry"
        return "end"

    # --- Build Graph ---

    workflow = StateGraph(RAGState)

    # Add nodes
    workflow.add_node("route", route_question)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("grade_documents", grade_documents)
    workflow.add_node("web_search", web_search)
    workflow.add_node("generate", generate)
    workflow.add_node("check_hallucination", check_hallucination)
    workflow.add_node("direct_answer", direct_answer)

    # Set entry point
    workflow.set_entry_point("route")

    # Add conditional edges from route
    workflow.add_conditional_edges(
        "route",
        decide_route,
        {
            "retrieve": "retrieve",
            "web_search": "web_search",
            "direct": "direct_answer",
        },
    )

    # Retrieve -> Grade
    workflow.add_edge("retrieve", "grade_documents")

    # Grade -> Generate or Web Search
    workflow.add_conditional_edges(
        "grade_documents",
        decide_after_grading,
        {
            "generate": "generate",
            "web_search": "web_search",
        },
    )

    # Web Search -> Generate
    workflow.add_edge("web_search", "generate")

    # Generate -> Check Hallucination
    workflow.add_edge("generate", "check_hallucination")

    # Check Hallucination -> End or Retry
    workflow.add_conditional_edges(
        "check_hallucination",
        decide_after_generation,
        {
            "retry": "generate",
            "end": END,
        },
    )

    # Direct Answer -> End
    workflow.add_edge("direct_answer", END)

    return workflow.compile()


def _format_case_study(case_study: dict) -> str:
    """Format a case study for the LLM context."""
    return f"""
**{case_study.get('company_name', 'Unknown Company')}** ({case_study.get('industry', 'Unknown Industry')})

Summary: {case_study.get('summary', 'No summary available')}

Strategy: {case_study.get('strategy_type', 'Unknown')}

Starting State: {json.dumps(case_study.get('starting_state', {}), indent=2)}

Ending State: {json.dumps(case_study.get('ending_state', {}), indent=2)}

Timeline: {case_study.get('timeline', 'Unknown')}

Key Actions: {json.dumps(case_study.get('key_actions', []), indent=2)}

Outcomes: {json.dumps(case_study.get('outcomes', {}), indent=2)}

Lessons Learned: {case_study.get('lessons_learned', 'None recorded')}
"""

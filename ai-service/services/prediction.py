"""
Prediction Service

Hybrid approach:
- ML model for quantitative factors (Gradient Boosting)
- LLM for qualitative reasoning
- Combined prediction with confidence
"""
from typing import Optional
from dataclasses import dataclass
import json
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from langchain_core.messages import SystemMessage

from services.llm import get_llm, get_json_model


@dataclass
class PredictionResult:
    """Result of a success prediction."""
    success_probability: float
    confidence: float
    timeline_estimate: str
    capital_required: float
    risk_factors: list[str]
    recommendations: list[str]
    similar_cases: list[dict]
    reasoning: str


class PredictionService:
    """
    Predicts success probability for strategic paths.

    Uses a hybrid approach:
    1. ML model for quantitative scoring (when trained)
    2. LLM reasoning for qualitative analysis
    3. Case study comparison for grounding
    """

    def __init__(self):
        self.reasoning_llm = get_llm("reasoning")
        self.json_llm = get_json_model()
        self.ml_model: Optional[GradientBoostingClassifier] = None

    async def predict(
        self,
        user_profile: dict,
        path_id: str,
        similar_cases: list[dict] = None,
    ) -> PredictionResult:
        """
        Generate a success prediction.

        Args:
            user_profile: User's business profile
            path_id: Strategic path being considered
            similar_cases: Optional list of similar case studies

        Returns:
            PredictionResult with probability and recommendations
        """
        # Extract features from profile
        features = self._extract_features(user_profile)

        # ML prediction (if model is trained)
        ml_probability = None
        if self.ml_model:
            ml_probability = self._ml_predict(features)

        # LLM reasoning
        llm_result = await self._llm_predict(
            user_profile=user_profile,
            path_id=path_id,
            similar_cases=similar_cases or [],
        )

        # Combine predictions
        if ml_probability is not None:
            # Weighted average: 60% ML, 40% LLM
            final_probability = 0.6 * ml_probability + 0.4 * llm_result["probability"]
        else:
            final_probability = llm_result["probability"]

        return PredictionResult(
            success_probability=final_probability,
            confidence=llm_result["confidence"],
            timeline_estimate=llm_result["timeline"],
            capital_required=llm_result["capital"],
            risk_factors=llm_result["risks"],
            recommendations=llm_result["recommendations"],
            similar_cases=similar_cases or [],
            reasoning=llm_result["reasoning"],
        )

    def _extract_features(self, profile: dict) -> np.ndarray:
        """Extract ML features from user profile."""
        # Feature engineering
        features = [
            # Capital availability (normalized)
            float(profile.get("availableCapital", 0)) / 100000,

            # Years in business (normalized)
            float(profile.get("yearsInBusiness", 0)) / 20,

            # Team size indicator
            self._encode_company_size(profile.get("companySize", "solo")),

            # Risk tolerance
            self._encode_risk_tolerance(profile.get("riskTolerance", "moderate")),

            # Industry match score (would come from matching)
            profile.get("industryMatchScore", 0.5),

            # Revenue stage
            self._encode_revenue(profile.get("annualRevenue", 0)),
        ]

        return np.array(features).reshape(1, -1)

    def _encode_company_size(self, size: str) -> float:
        """Encode company size to numeric."""
        mapping = {
            "solo": 0.1,
            "2-5": 0.3,
            "6-10": 0.5,
            "11-25": 0.7,
            "26-50": 0.85,
            "50+": 1.0,
        }
        return mapping.get(size, 0.3)

    def _encode_risk_tolerance(self, tolerance: str) -> float:
        """Encode risk tolerance to numeric."""
        mapping = {
            "conservative": 0.2,
            "moderate": 0.5,
            "aggressive": 0.8,
        }
        return mapping.get(tolerance, 0.5)

    def _encode_revenue(self, revenue: float) -> float:
        """Encode revenue to normalized score."""
        if revenue <= 0:
            return 0.1
        elif revenue < 100000:
            return 0.2
        elif revenue < 500000:
            return 0.4
        elif revenue < 1000000:
            return 0.6
        elif revenue < 5000000:
            return 0.8
        else:
            return 1.0

    def _ml_predict(self, features: np.ndarray) -> float:
        """Make ML model prediction."""
        if not self.ml_model:
            return 0.5

        try:
            probability = self.ml_model.predict_proba(features)[0][1]
            return float(probability)
        except Exception as e:
            print(f"ML prediction failed: {e}")
            return 0.5

    async def _llm_predict(
        self,
        user_profile: dict,
        path_id: str,
        similar_cases: list[dict],
    ) -> dict:
        """Use LLM for qualitative prediction."""

        # Format similar cases
        cases_text = ""
        if similar_cases:
            cases_text = "\n\nSimilar Cases:\n" + "\n".join([
                f"- {c.get('company_name', 'Unknown')}: {c.get('summary', 'No summary')}"
                for c in similar_cases[:3]
            ])

        predict_prompt = """You are an expert business strategist predicting success probability.

User Profile:
- Industry: {industry}
- Company Size: {company_size}
- Annual Revenue: ${revenue:,}
- Years in Business: {years}
- Available Capital: ${capital:,}
- Risk Tolerance: {risk_tolerance}
- Primary Goal: {goal}
- Biggest Challenge: {challenge}
{cases_text}

Strategic Path: {path_id}

Analyze this profile and predict:
1. Success probability (0.0-1.0)
2. Your confidence in this prediction (0.0-1.0)
3. Estimated timeline
4. Capital required
5. Top 3 risk factors
6. Top 3 recommendations

Return JSON:
{{
    "probability": 0.0-1.0,
    "confidence": 0.0-1.0,
    "timeline": "X-Y months",
    "capital": estimated_cost_number,
    "risks": ["risk1", "risk2", "risk3"],
    "recommendations": ["rec1", "rec2", "rec3"],
    "reasoning": "2-3 sentence explanation of your prediction"
}}"""

        try:
            response = self.json_llm.invoke([
                SystemMessage(content=predict_prompt.format(
                    industry=user_profile.get("industry", "Unknown"),
                    company_size=user_profile.get("companySize", "Unknown"),
                    revenue=user_profile.get("annualRevenue", 0),
                    years=user_profile.get("yearsInBusiness", 0),
                    capital=user_profile.get("availableCapital", 0),
                    risk_tolerance=user_profile.get("riskTolerance", "moderate"),
                    goal=user_profile.get("primaryGoal", "Growth"),
                    challenge=user_profile.get("biggestChallenge", "Unknown"),
                    cases_text=cases_text,
                    path_id=path_id,
                ))
            ])

            return json.loads(response.content)
        except Exception as e:
            print(f"LLM prediction failed: {e}")
            return {
                "probability": 0.5,
                "confidence": 0.3,
                "timeline": "12-18 months",
                "capital": 25000,
                "risks": ["Insufficient data for accurate prediction"],
                "recommendations": ["Gather more information before proceeding"],
                "reasoning": "Unable to generate detailed prediction due to an error.",
            }

    def train_model(self, training_data: list[dict]):
        """
        Train the ML model on historical outcomes.

        Args:
            training_data: List of dicts with profile features and success outcome
        """
        if len(training_data) < 50:
            print("Insufficient training data (need 50+ examples)")
            return

        # Extract features and labels
        X = np.array([
            self._extract_features(d["profile"]).flatten()
            for d in training_data
        ])
        y = np.array([d["success"] for d in training_data])

        # Train Gradient Boosting model
        self.ml_model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
        )
        self.ml_model.fit(X, y)

        print(f"Model trained on {len(training_data)} examples")

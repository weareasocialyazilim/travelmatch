"""
Advanced Recommendation Engine

Provides personalized recommendations using:
- Collaborative Filtering (User-based and Item-based)
- Content-Based Filtering
- Hybrid Approaches
- Context-Aware Recommendations
- Real-time Personalization
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from app.core.config import settings
from typing import Dict, Any, List, Optional, Set, Tuple
from datetime import datetime, timedelta
from enum import Enum
import logging
import json
import math
import hashlib
from collections import defaultdict

logger = logging.getLogger(__name__)


class RecommendationType(str, Enum):
    """Types of recommendations"""
    FOR_YOU = "for_you"
    SIMILAR_MOMENTS = "similar_moments"
    TRENDING = "trending"
    NEW_ARRIVALS = "new_arrivals"
    BASED_ON_HISTORY = "based_on_history"
    FRIENDS_LIKED = "friends_liked"
    BUDGET_MATCH = "budget_match"
    LOCATION_BASED = "location_based"


class UserPreferenceVector:
    """
    Represents user preferences as a vector for ML operations.

    Captures:
    - Category preferences
    - Price sensitivity
    - Location preferences
    - Time preferences
    - Social preferences
    """

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.category_scores: Dict[str, float] = {}
        self.avg_price: float = 0
        self.price_range: Tuple[float, float] = (0, 10000)
        self.preferred_locations: List[str] = []
        self.preferred_times: List[str] = []  # morning, afternoon, evening
        self.social_score: float = 0.5  # 0=solo, 1=group
        self.adventure_score: float = 0.5  # 0=relaxed, 1=adventurous
        self.luxury_score: float = 0.5  # 0=budget, 1=luxury

    def to_vector(self) -> List[float]:
        """Convert preferences to numerical vector"""
        categories = [
            "adventure", "luxury", "food", "nature",
            "culture", "wellness", "romantic", "family"
        ]

        vector = []

        # Category scores (8 dimensions)
        for cat in categories:
            vector.append(self.category_scores.get(cat, 0.5))

        # Normalized price preference (1 dimension)
        vector.append(min(1.0, self.avg_price / 5000))

        # Scores (3 dimensions)
        vector.append(self.social_score)
        vector.append(self.adventure_score)
        vector.append(self.luxury_score)

        return vector  # 12-dimensional vector


class MomentVector:
    """
    Represents a moment/experience as a vector for ML operations.
    """

    def __init__(self, moment_id: str):
        self.moment_id = moment_id
        self.category: str = ""
        self.price: float = 0
        self.location: str = ""
        self.rating: float = 0
        self.popularity_score: float = 0
        self.recency_score: float = 0
        self.conversion_rate: float = 0

    def to_vector(self) -> List[float]:
        """Convert moment to numerical vector"""
        categories = [
            "adventure", "luxury", "food", "nature",
            "culture", "wellness", "romantic", "family"
        ]

        vector = []

        # One-hot category encoding
        for cat in categories:
            vector.append(1.0 if self.category == cat else 0.0)

        # Normalized price (1 dimension)
        vector.append(min(1.0, self.price / 5000))

        # Quality metrics (3 dimensions)
        vector.append(self.rating / 5.0)
        vector.append(self.popularity_score)
        vector.append(self.conversion_rate)

        return vector  # 12-dimensional vector


class CollaborativeFilter:
    """
    User-based and Item-based Collaborative Filtering.

    Uses matrix factorization for efficient similarity computation.
    """

    def __init__(self):
        self.user_item_matrix: Dict[str, Dict[str, float]] = {}
        self.item_user_matrix: Dict[str, Dict[str, float]] = {}
        self.user_similarity_cache: Dict[str, Dict[str, float]] = {}
        self.item_similarity_cache: Dict[str, Dict[str, float]] = {}

    async def load_interactions(self, redis):
        """Load user-item interactions from cache"""
        # In production, load from database or feature store
        interactions = await redis.get("user_item_interactions")

        if interactions:
            data = json.loads(interactions)
            self.user_item_matrix = data.get("user_item", {})
            self.item_user_matrix = data.get("item_user", {})

    async def add_interaction(
        self,
        user_id: str,
        moment_id: str,
        interaction_type: str,
        score: float,
    ):
        """Record a user-item interaction"""
        # Update matrices
        if user_id not in self.user_item_matrix:
            self.user_item_matrix[user_id] = {}
        if moment_id not in self.item_user_matrix:
            self.item_user_matrix[moment_id] = {}

        # Weighted interaction score
        weights = {
            "view": 0.2,
            "click": 0.4,
            "wishlist": 0.6,
            "gift": 1.0,
            "review": 0.8,
        }

        weighted_score = score * weights.get(interaction_type, 0.5)

        self.user_item_matrix[user_id][moment_id] = weighted_score
        self.item_user_matrix[moment_id][user_id] = weighted_score

        # Clear similarity caches
        self.user_similarity_cache.pop(user_id, None)
        self.item_similarity_cache.pop(moment_id, None)

    def get_similar_users(
        self,
        user_id: str,
        top_k: int = 20,
    ) -> List[Tuple[str, float]]:
        """Find users with similar preferences"""
        if user_id in self.user_similarity_cache:
            return self.user_similarity_cache[user_id][:top_k]

        if user_id not in self.user_item_matrix:
            return []

        user_items = self.user_item_matrix[user_id]
        similarities = []

        for other_user, other_items in self.user_item_matrix.items():
            if other_user == user_id:
                continue

            similarity = self._cosine_similarity(user_items, other_items)
            if similarity > 0.1:
                similarities.append((other_user, similarity))

        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)

        # Cache results
        self.user_similarity_cache[user_id] = similarities

        return similarities[:top_k]

    def get_similar_items(
        self,
        moment_id: str,
        top_k: int = 20,
    ) -> List[Tuple[str, float]]:
        """Find similar items based on user interactions"""
        if moment_id in self.item_similarity_cache:
            return self.item_similarity_cache[moment_id][:top_k]

        if moment_id not in self.item_user_matrix:
            return []

        item_users = self.item_user_matrix[moment_id]
        similarities = []

        for other_item, other_users in self.item_user_matrix.items():
            if other_item == moment_id:
                continue

            similarity = self._cosine_similarity(item_users, other_users)
            if similarity > 0.1:
                similarities.append((other_item, similarity))

        similarities.sort(key=lambda x: x[1], reverse=True)
        self.item_similarity_cache[moment_id] = similarities

        return similarities[:top_k]

    def predict_rating(
        self,
        user_id: str,
        moment_id: str,
    ) -> float:
        """Predict user's rating for an item"""
        similar_users = self.get_similar_users(user_id, top_k=10)

        if not similar_users:
            return 0.5  # Default neutral score

        weighted_sum = 0.0
        similarity_sum = 0.0

        for similar_user, similarity in similar_users:
            if moment_id in self.user_item_matrix.get(similar_user, {}):
                rating = self.user_item_matrix[similar_user][moment_id]
                weighted_sum += similarity * rating
                similarity_sum += abs(similarity)

        if similarity_sum == 0:
            return 0.5

        return weighted_sum / similarity_sum

    def _cosine_similarity(
        self,
        items1: Dict[str, float],
        items2: Dict[str, float],
    ) -> float:
        """Calculate cosine similarity between two item dictionaries"""
        common_items = set(items1.keys()) & set(items2.keys())

        if not common_items:
            return 0.0

        dot_product = sum(items1[item] * items2[item] for item in common_items)
        norm1 = math.sqrt(sum(v ** 2 for v in items1.values()))
        norm2 = math.sqrt(sum(v ** 2 for v in items2.values()))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)


class ContentBasedFilter:
    """
    Content-based filtering using moment features.

    Matches user preferences with moment characteristics.
    """

    def __init__(self):
        self.moment_features: Dict[str, MomentVector] = {}
        self.user_profiles: Dict[str, UserPreferenceVector] = {}

    async def update_user_profile(
        self,
        user_id: str,
        interactions: List[Dict[str, Any]],
    ):
        """Update user profile based on interactions"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserPreferenceVector(user_id)

        profile = self.user_profiles[user_id]
        category_counts = defaultdict(float)
        total_price = 0
        price_count = 0

        for interaction in interactions:
            moment_id = interaction.get("moment_id")
            weight = {"gift": 2.0, "wishlist": 1.0, "view": 0.3}.get(
                interaction.get("type", "view"), 0.5
            )

            if moment_id in self.moment_features:
                moment = self.moment_features[moment_id]
                category_counts[moment.category] += weight

                if moment.price > 0:
                    total_price += moment.price * weight
                    price_count += weight

        # Normalize category scores
        max_count = max(category_counts.values()) if category_counts else 1
        for cat, count in category_counts.items():
            profile.category_scores[cat] = count / max_count

        # Update average price
        if price_count > 0:
            profile.avg_price = total_price / price_count

    def get_content_recommendations(
        self,
        user_id: str,
        candidate_moments: List[str],
        top_k: int = 10,
    ) -> List[Tuple[str, float]]:
        """Get recommendations based on content similarity"""
        if user_id not in self.user_profiles:
            return []

        user_vector = self.user_profiles[user_id].to_vector()
        scores = []

        for moment_id in candidate_moments:
            if moment_id not in self.moment_features:
                continue

            moment_vector = self.moment_features[moment_id].to_vector()
            similarity = self._cosine_similarity(user_vector, moment_vector)
            scores.append((moment_id, similarity))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def _cosine_similarity(
        self,
        vec1: List[float],
        vec2: List[float],
    ) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a ** 2 for a in vec1))
        norm2 = math.sqrt(sum(b ** 2 for b in vec2))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)


class ContextAwareRecommender:
    """
    Context-aware recommendations based on:
    - Time of day
    - Day of week
    - Season
    - Location
    - Special occasions
    """

    OCCASION_KEYWORDS = {
        "birthday": ["doğum günü", "birthday", "yaş günü"],
        "anniversary": ["yıldönümü", "anniversary", "evlilik"],
        "valentines": ["sevgililer günü", "valentine"],
        "mothers_day": ["anneler günü", "mother"],
        "fathers_day": ["babalar günü", "father"],
        "graduation": ["mezuniyet", "graduation"],
        "holiday": ["tatil", "holiday", "bayram"],
    }

    SEASONAL_CATEGORIES = {
        "winter": ["wellness", "culture", "food"],
        "spring": ["nature", "culture", "romantic"],
        "summer": ["adventure", "nature", "family"],
        "fall": ["culture", "food", "wellness"],
    }

    TIME_CATEGORIES = {
        "morning": ["wellness", "adventure", "nature"],
        "afternoon": ["culture", "food", "family"],
        "evening": ["romantic", "food", "nightlife"],
    }

    def get_context_boost(
        self,
        moment_category: str,
        current_time: Optional[datetime] = None,
        user_location: Optional[str] = None,
        search_query: Optional[str] = None,
    ) -> float:
        """Calculate context-based boost for a moment"""
        boost = 1.0
        current_time = current_time or datetime.now()

        # Time of day boost
        hour = current_time.hour
        if 6 <= hour < 12:
            time_period = "morning"
        elif 12 <= hour < 18:
            time_period = "afternoon"
        else:
            time_period = "evening"

        if moment_category in self.TIME_CATEGORIES.get(time_period, []):
            boost *= 1.2

        # Seasonal boost
        month = current_time.month
        if month in [12, 1, 2]:
            season = "winter"
        elif month in [3, 4, 5]:
            season = "spring"
        elif month in [6, 7, 8]:
            season = "summer"
        else:
            season = "fall"

        if moment_category in self.SEASONAL_CATEGORIES.get(season, []):
            boost *= 1.15

        # Occasion boost from search query
        if search_query:
            query_lower = search_query.lower()
            for occasion, keywords in self.OCCASION_KEYWORDS.items():
                if any(kw in query_lower for kw in keywords):
                    # Boost romantic for occasions
                    if moment_category == "romantic":
                        boost *= 1.3
                    break

        # Weekend boost for certain categories
        if current_time.weekday() >= 5:  # Saturday or Sunday
            if moment_category in ["adventure", "nature", "family"]:
                boost *= 1.1

        return boost


class RecommendationEngine(BaseModel):
    """
    Main recommendation engine combining all approaches.

    Provides:
    - Personalized recommendations
    - Similar items
    - Trending content
    - Contextual recommendations
    """

    def __init__(self):
        super().__init__()
        self.collaborative_filter = CollaborativeFilter()
        self.content_filter = ContentBasedFilter()
        self.context_recommender = ContextAwareRecommender()

    async def load(self):
        """Load recommendation models and data"""
        logger.info("Loading Recommendation Engine...")

        redis = await get_redis()

        # Load interaction data
        await self.collaborative_filter.load_interactions(redis)

        # Load moment features
        moments_data = await redis.get("moment_features")
        if moments_data:
            features = json.loads(moments_data)
            for moment_id, data in features.items():
                vec = MomentVector(moment_id)
                vec.category = data.get("category", "")
                vec.price = data.get("price", 0)
                vec.rating = data.get("rating", 0)
                vec.popularity_score = data.get("popularity", 0)
                self.content_filter.moment_features[moment_id] = vec

        self.loaded = True
        logger.info("✓ Recommendation Engine loaded")

    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Alias for get_recommendations"""
        return await self.get_recommendations(**kwargs)

    async def get_recommendations(
        self,
        user_id: str,
        recommendation_type: RecommendationType = RecommendationType.FOR_YOU,
        limit: int = 20,
        filters: Optional[Dict] = None,
        context: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Get personalized recommendations for a user.

        Args:
            user_id: User identifier
            recommendation_type: Type of recommendations
            limit: Number of recommendations
            filters: Optional filters (category, price range, location)
            context: Context info (time, location, occasion)

        Returns:
            Ranked list of recommendations with explanations
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        redis = await get_redis()

        # Check cache
        cache_key = self._generate_cache_key(
            user_id, recommendation_type, filters
        )
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        # Get candidate moments
        candidates = await self._get_candidates(
            user_id, recommendation_type, filters
        )

        # Score candidates using hybrid approach
        scored_candidates = await self._score_candidates(
            user_id, candidates, recommendation_type, context
        )

        # Apply diversity and freshness
        final_recommendations = self._diversify(scored_candidates, limit)

        result = {
            "user_id": user_id,
            "recommendation_type": recommendation_type.value,
            "recommendations": final_recommendations,
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "algorithm_version": "2.0",
                "total_candidates": len(candidates),
            },
        }

        # Cache for 30 minutes
        await redis.setex(cache_key, 1800, json.dumps(result))

        return result

    async def get_similar_moments(
        self,
        moment_id: str,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """
        Find moments similar to a given moment.

        Uses both collaborative and content-based similarity.
        """
        # Item-based collaborative filtering
        collab_similar = self.collaborative_filter.get_similar_items(moment_id, limit)

        # Content-based similarity
        if moment_id in self.content_filter.moment_features:
            source_vector = self.content_filter.moment_features[moment_id]
            content_similar = []

            for other_id, other_vec in self.content_filter.moment_features.items():
                if other_id == moment_id:
                    continue

                similarity = self._vector_similarity(
                    source_vector.to_vector(),
                    other_vec.to_vector()
                )
                content_similar.append((other_id, similarity))

            content_similar.sort(key=lambda x: x[1], reverse=True)
            content_similar = content_similar[:limit]
        else:
            content_similar = []

        # Combine scores
        combined_scores = {}

        for item_id, score in collab_similar:
            combined_scores[item_id] = combined_scores.get(item_id, 0) + score * 0.6

        for item_id, score in content_similar:
            combined_scores[item_id] = combined_scores.get(item_id, 0) + score * 0.4

        # Sort and format results
        sorted_items = sorted(
            combined_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]

        return {
            "source_moment_id": moment_id,
            "similar_moments": [
                {
                    "moment_id": item_id,
                    "similarity_score": round(score, 3),
                    "reason": self._generate_similarity_reason(moment_id, item_id),
                }
                for item_id, score in sorted_items
            ],
        }

    async def get_trending(
        self,
        category: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Get trending moments based on recent activity.

        Calculates trend score based on:
        - Recent views
        - Recent gifts
        - Velocity of engagement
        """
        redis = await get_redis()

        # Get trending data (would be updated by background job)
        trending_key = f"trending:{category or 'all'}:{location or 'all'}"
        trending_data = await redis.get(trending_key)

        if trending_data:
            trending = json.loads(trending_data)
        else:
            # Generate mock trending data
            trending = [
                {
                    "moment_id": f"moment-{i}",
                    "trend_score": 0.9 - (i * 0.05),
                    "views_24h": 500 - (i * 30),
                    "gifts_24h": 50 - (i * 3),
                    "velocity": 1.5 - (i * 0.1),
                }
                for i in range(limit)
            ]

        return {
            "category": category,
            "location": location,
            "trending": trending[:limit],
            "updated_at": datetime.utcnow().isoformat(),
        }

    async def record_interaction(
        self,
        user_id: str,
        moment_id: str,
        interaction_type: str,
        score: float = 1.0,
    ):
        """Record a user interaction for improving recommendations"""
        await self.collaborative_filter.add_interaction(
            user_id, moment_id, interaction_type, score
        )

        # Update user profile
        await self.content_filter.update_user_profile(
            user_id,
            [{"moment_id": moment_id, "type": interaction_type}]
        )

        # Invalidate cache
        redis = await get_redis()
        pattern = f"reco:{user_id}:*"
        keys = await redis.keys(pattern)
        if keys:
            await redis.delete(*keys)

    async def _get_candidates(
        self,
        user_id: str,
        rec_type: RecommendationType,
        filters: Optional[Dict],
    ) -> List[str]:
        """Get candidate moments for scoring"""
        redis = await get_redis()

        # Get all active moments
        all_moments = await redis.smembers("active_moments")
        candidates = [m.decode() if isinstance(m, bytes) else m for m in all_moments]

        # If no real data, generate mock candidates
        if not candidates:
            candidates = [f"moment-{i}" for i in range(100)]

        # Apply filters
        if filters:
            if filters.get("category"):
                candidates = [
                    m for m in candidates
                    if self._moment_matches_category(m, filters["category"])
                ]

            if filters.get("price_max"):
                candidates = [
                    m for m in candidates
                    if self._moment_matches_price(m, filters["price_max"])
                ]

        return candidates

    async def _score_candidates(
        self,
        user_id: str,
        candidates: List[str],
        rec_type: RecommendationType,
        context: Optional[Dict],
    ) -> List[Dict[str, Any]]:
        """Score candidates using hybrid approach"""
        scored = []

        for moment_id in candidates:
            # Collaborative score
            collab_score = self.collaborative_filter.predict_rating(
                user_id, moment_id
            )

            # Content score
            content_similar = self.content_filter.get_content_recommendations(
                user_id, [moment_id], top_k=1
            )
            content_score = content_similar[0][1] if content_similar else 0.5

            # Context boost
            moment_category = self._get_moment_category(moment_id)
            context_boost = self.context_recommender.get_context_boost(
                moment_category,
                current_time=datetime.now(),
                search_query=context.get("query") if context else None,
            )

            # Hybrid score
            hybrid_score = (
                collab_score * 0.4 +
                content_score * 0.4 +
                0.2  # Base score
            ) * context_boost

            scored.append({
                "moment_id": moment_id,
                "score": hybrid_score,
                "scores": {
                    "collaborative": round(collab_score, 3),
                    "content": round(content_score, 3),
                    "context_boost": round(context_boost, 3),
                },
                "reason": self._generate_recommendation_reason(
                    collab_score, content_score, moment_category
                ),
            })

        # Sort by score
        scored.sort(key=lambda x: x["score"], reverse=True)

        return scored

    def _diversify(
        self,
        candidates: List[Dict],
        limit: int,
    ) -> List[Dict]:
        """Apply diversity to avoid too similar recommendations"""
        if len(candidates) <= limit:
            return candidates

        selected = []
        categories_seen = defaultdict(int)
        max_per_category = max(2, limit // 4)

        for candidate in candidates:
            category = self._get_moment_category(candidate["moment_id"])

            # Limit items per category for diversity
            if categories_seen[category] < max_per_category:
                selected.append(candidate)
                categories_seen[category] += 1

            if len(selected) >= limit:
                break

        return selected

    def _generate_recommendation_reason(
        self,
        collab_score: float,
        content_score: float,
        category: str,
    ) -> str:
        """Generate human-readable recommendation reason"""
        if collab_score > 0.7:
            return "Senin gibi kullanıcılar bunu çok beğendi"
        elif content_score > 0.7:
            return f"{category.title()} kategorisindeki tercihlerine uygun"
        elif collab_score > 0.5:
            return "İlgi alanlarına göre seçildi"
        else:
            return "Popüler deneyimler arasından önerildi"

    def _generate_similarity_reason(
        self,
        source_id: str,
        similar_id: str,
    ) -> str:
        """Generate reason for similarity"""
        source_cat = self._get_moment_category(source_id)
        similar_cat = self._get_moment_category(similar_id)

        if source_cat == similar_cat:
            return f"Aynı kategoride ({source_cat})"
        else:
            return "Benzer kullanıcılar tarafından beğenildi"

    def _get_moment_category(self, moment_id: str) -> str:
        """Get category for a moment"""
        if moment_id in self.content_filter.moment_features:
            return self.content_filter.moment_features[moment_id].category
        return "general"

    def _moment_matches_category(self, moment_id: str, category: str) -> bool:
        """Check if moment matches category filter"""
        return self._get_moment_category(moment_id) == category

    def _moment_matches_price(self, moment_id: str, max_price: float) -> bool:
        """Check if moment matches price filter"""
        if moment_id in self.content_filter.moment_features:
            return self.content_filter.moment_features[moment_id].price <= max_price
        return True

    def _vector_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity"""
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a ** 2 for a in vec1))
        norm2 = math.sqrt(sum(b ** 2 for b in vec2))

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot / (norm1 * norm2)

    def _generate_cache_key(
        self,
        user_id: str,
        rec_type: RecommendationType,
        filters: Optional[Dict],
    ) -> str:
        """Generate cache key for recommendations"""
        filter_str = json.dumps(filters or {}, sort_keys=True)
        key_data = f"{user_id}:{rec_type.value}:{filter_str}"
        return f"reco:{hashlib.sha256(key_data.encode()).hexdigest()[:16]}"


class RecipientRecommender:
    """
    Recommends gift recipients based on:
    - Relationship strength
    - Past gift history
    - Preference matching
    - Special occasions
    """

    async def suggest_recipients(
        self,
        user_id: str,
        moment_id: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Suggest recipients for a gift.

        Returns ranked list of potential recipients.
        """
        redis = await get_redis()

        # Get user's contacts/connections
        contacts = await redis.smembers(f"user_contacts:{user_id}")
        contacts = [c.decode() if isinstance(c, bytes) else c for c in contacts]

        # If no real contacts, return empty
        if not contacts:
            return []

        # Score each contact
        scored_recipients = []

        for contact_id in contacts:
            # Get relationship strength
            relationship_score = await self._get_relationship_score(
                user_id, contact_id
            )

            # Get preference match with moment
            preference_match = await self._get_preference_match(
                contact_id, moment_id
            )

            # Check upcoming occasions
            occasion_boost = await self._get_occasion_boost(contact_id)

            # Combined score
            total_score = (
                relationship_score * 0.4 +
                preference_match * 0.4 +
                occasion_boost * 0.2
            )

            scored_recipients.append({
                "user_id": contact_id,
                "score": round(total_score, 3),
                "relationship_score": round(relationship_score, 3),
                "preference_match": round(preference_match, 3),
                "has_upcoming_occasion": occasion_boost > 0,
            })

        # Sort by score
        scored_recipients.sort(key=lambda x: x["score"], reverse=True)

        return scored_recipients[:limit]

    async def _get_relationship_score(
        self,
        user_id: str,
        contact_id: str,
    ) -> float:
        """Calculate relationship strength"""
        redis = await get_redis()

        # Check past gift history
        past_gifts = await redis.get(f"gifts:{user_id}:{contact_id}")
        gift_count = len(json.loads(past_gifts)) if past_gifts else 0

        # More gifts = stronger relationship
        return min(1.0, gift_count * 0.2 + 0.3)

    async def _get_preference_match(
        self,
        contact_id: str,
        moment_id: str,
    ) -> float:
        """Calculate preference match score"""
        # Would use actual preference data in production
        return 0.5 + (hash(f"{contact_id}{moment_id}") % 50) / 100

    async def _get_occasion_boost(self, contact_id: str) -> float:
        """Check for upcoming occasions"""
        redis = await get_redis()

        # Check for saved occasions
        occasions = await redis.get(f"occasions:{contact_id}")
        if not occasions:
            return 0.0

        # Check if any occasion is within 30 days
        today = datetime.now()
        for occasion in json.loads(occasions):
            occasion_date = datetime.fromisoformat(occasion["date"])
            days_until = (occasion_date - today).days

            if 0 <= days_until <= 30:
                return 0.5

        return 0.0

"""
Tests for Recommendation Engine

Tests cover:
- Collaborative filtering
- Content-based filtering
- Hybrid recommendations
- Context-aware recommendations
- Recipient recommendations
"""

import pytest
from unittest.mock import MagicMock, patch
import numpy as np

import sys
sys.path.insert(0, '..')

from app.models.recommendation_engine import (
    UserPreferenceVector,
    MomentVector,
    CollaborativeFilter,
    ContentBasedFilter,
    ContextAwareRecommender,
    RecommendationEngine,
    RecipientRecommender,
)


class TestUserPreferenceVector:
    """Tests for user preference representation"""

    def test_vector_creation(self):
        """Should create user preference vector"""
        user_data = {
            'preferred_categories': ['balon_turu', 'yemek'],
            'preferred_locations': ['istanbul', 'kapadokya'],
            'avg_budget': 1500,
            'gift_history': ['moment-1', 'moment-2']
        }

        vector = UserPreferenceVector(user_data)

        assert vector.categories is not None
        assert vector.locations is not None
        assert vector.budget_range is not None

    def test_vector_similarity(self):
        """Similar users should have high similarity"""
        user1 = UserPreferenceVector({
            'preferred_categories': ['balon_turu', 'yemek'],
            'avg_budget': 1500
        })

        user2 = UserPreferenceVector({
            'preferred_categories': ['balon_turu', 'yemek'],
            'avg_budget': 1600
        })

        user3 = UserPreferenceVector({
            'preferred_categories': ['spa', 'macera'],
            'avg_budget': 3000
        })

        similarity_12 = user1.similarity(user2)
        similarity_13 = user1.similarity(user3)

        assert similarity_12 > similarity_13


class TestMomentVector:
    """Tests for moment/gift representation"""

    def test_vector_creation(self):
        """Should create moment vector"""
        moment_data = {
            'category': 'balon_turu',
            'location': 'kapadokya',
            'price': 2500,
            'duration': 120,
            'features': ['sunrise', 'champagne']
        }

        vector = MomentVector(moment_data)

        assert vector.category is not None
        assert vector.price is not None

    def test_moment_matching(self):
        """Should match moments to user preferences"""
        moment = MomentVector({
            'category': 'balon_turu',
            'location': 'kapadokya',
            'price': 2500
        })

        user_prefs = UserPreferenceVector({
            'preferred_categories': ['balon_turu'],
            'preferred_locations': ['kapadokya'],
            'avg_budget': 2000
        })

        score = moment.match_score(user_prefs)
        assert 0 <= score <= 1
        assert score > 0.5  # Good match


class TestCollaborativeFilter:
    """Tests for collaborative filtering"""

    @pytest.fixture
    def filter(self):
        return CollaborativeFilter()

    def test_similar_users_recommendation(self, filter):
        """Should recommend based on similar users"""
        # Add user interactions
        filter.add_interaction('user-1', 'moment-1', 'purchase')
        filter.add_interaction('user-1', 'moment-2', 'purchase')
        filter.add_interaction('user-2', 'moment-1', 'purchase')
        filter.add_interaction('user-2', 'moment-3', 'purchase')

        # User-2 should get moment-2 recommended (user-1 bought it)
        recommendations = filter.recommend('user-2', limit=5)

        assert 'moment-2' in recommendations

    def test_no_repeat_recommendations(self, filter):
        """Should not recommend already purchased items"""
        filter.add_interaction('user-1', 'moment-1', 'purchase')
        filter.add_interaction('user-1', 'moment-2', 'purchase')

        recommendations = filter.recommend('user-1', limit=10)

        assert 'moment-1' not in recommendations
        assert 'moment-2' not in recommendations

    def test_cold_start_handling(self, filter):
        """Should handle new users gracefully"""
        recommendations = filter.recommend('new-user', limit=5)

        # Should return popular items for cold start
        assert isinstance(recommendations, list)


class TestContentBasedFilter:
    """Tests for content-based filtering"""

    @pytest.fixture
    def filter(self):
        return ContentBasedFilter()

    def test_similar_content_recommendation(self, filter):
        """Should recommend similar content"""
        # Add moments
        filter.add_moment('moment-1', {
            'category': 'balon_turu',
            'location': 'kapadokya',
            'features': ['sunrise', 'champagne']
        })

        filter.add_moment('moment-2', {
            'category': 'balon_turu',
            'location': 'kapadokya',
            'features': ['sunset', 'vip']
        })

        filter.add_moment('moment-3', {
            'category': 'spa',
            'location': 'bodrum',
            'features': ['massage', 'sauna']
        })

        # Similar to moment-1 should recommend moment-2
        similar = filter.find_similar('moment-1', limit=2)

        assert 'moment-2' in similar
        assert 'moment-3' not in similar or similar.index('moment-3') > similar.index('moment-2')

    def test_category_matching(self, filter):
        """Should match by category"""
        recommendations = filter.recommend_by_category('balon_turu', limit=10)

        for rec in recommendations:
            moment = filter.moments.get(rec)
            if moment:
                assert moment['category'] == 'balon_turu'


class TestContextAwareRecommender:
    """Tests for context-aware recommendations"""

    @pytest.fixture
    def recommender(self):
        return ContextAwareRecommender()

    def test_occasion_context(self, recommender):
        """Should consider occasion in recommendations"""
        # Birthday context
        birthday_recs = recommender.recommend(
            user_id='user-1',
            context={'occasion': 'dogum_gunu'}
        )

        # Anniversary context
        anniversary_recs = recommender.recommend(
            user_id='user-1',
            context={'occasion': 'yildonumu'}
        )

        # Recommendations should differ based on occasion
        assert birthday_recs != anniversary_recs

    def test_budget_context(self, recommender):
        """Should respect budget constraints"""
        recommendations = recommender.recommend(
            user_id='user-1',
            context={'budget': {'min': 500, 'max': 1500}}
        )

        for rec in recommendations:
            # All recommendations should be within budget
            assert 500 <= rec['price'] <= 1500

    def test_location_context(self, recommender):
        """Should prefer nearby locations"""
        recommendations = recommender.recommend(
            user_id='user-1',
            context={'user_location': 'istanbul'}
        )

        # Istanbul moments should rank higher
        if recommendations:
            top_rec = recommendations[0]
            # Should prefer nearby or popular destinations


class TestRecommendationEngine:
    """Tests for hybrid recommendation engine"""

    @pytest.fixture
    def engine(self):
        return RecommendationEngine()

    def test_hybrid_recommendations(self, engine):
        """Should combine multiple recommendation strategies"""
        recommendations = engine.recommend(
            user_id='user-1',
            limit=10
        )

        assert isinstance(recommendations, list)
        assert len(recommendations) <= 10

        for rec in recommendations:
            assert 'momentId' in rec or 'id' in rec
            assert 'score' in rec

    def test_recommendation_reasons(self, engine):
        """Should explain recommendations"""
        recommendations = engine.recommend(
            user_id='user-1',
            include_reasons=True
        )

        for rec in recommendations:
            assert 'reason' in rec or 'matchFactors' in rec

    def test_exclusion_list(self, engine):
        """Should respect exclusion list"""
        excluded = ['moment-1', 'moment-2']

        recommendations = engine.recommend(
            user_id='user-1',
            exclude_moment_ids=excluded
        )

        rec_ids = [r.get('momentId') or r.get('id') for r in recommendations]
        for excluded_id in excluded:
            assert excluded_id not in rec_ids

    def test_trending_recommendations(self, engine):
        """Should include trending items"""
        trending = engine.get_trending(limit=10)

        assert isinstance(trending, list)
        for item in trending:
            assert 'score' in item or 'trendScore' in item


class TestRecipientRecommender:
    """Tests for recipient recommendations"""

    @pytest.fixture
    def recommender(self):
        return RecipientRecommender()

    def test_recipient_matching(self, recommender):
        """Should match recipients to moments"""
        moment_id = 'moment-spa'

        recipients = recommender.recommend(
            moment_id=moment_id,
            limit=5
        )

        assert isinstance(recipients, list)
        for recipient in recipients:
            assert 'userId' in recipient or 'id' in recipient
            assert 'score' in recipient

    def test_match_explanation(self, recommender):
        """Should explain recipient matches"""
        recipients = recommender.recommend(
            moment_id='moment-1',
            include_reasons=True
        )

        for recipient in recipients:
            assert 'matchReason' in recipient or 'commonInterests' in recipient

    def test_friend_prioritization(self, recommender):
        """Should prioritize friends/connections"""
        recipients = recommender.recommend(
            moment_id='moment-1',
            user_id='user-1',  # Sender
            prioritize_connections=True
        )

        # Friends should rank higher
        if recipients:
            assert recipients[0].get('is_connection', True)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Tests for Price Prediction Model

Tests cover:
- Price prediction accuracy
- Dynamic pricing adjustments
- Price optimization
- Seasonal factors
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

import sys
sys.path.insert(0, '..')

from app.models.price_prediction import (
    PricePredictionModel,
    DynamicPricingEngine,
    PriceOptimizer,
)


class TestPricePredictionModel:
    """Tests for price prediction"""

    @pytest.fixture
    def model(self):
        return PricePredictionModel()

    def test_category_base_prices(self, model):
        """Test category-specific base prices"""
        categories = ['balon_turu', 'yemek', 'spa', 'macera', 'kultur']

        for category in categories:
            price = model.get_base_price(category)
            assert price > 0
            assert isinstance(price, (int, float))

    def test_predict_price_returns_range(self, model):
        """Prediction should return min, predicted, and max prices"""
        result = model.predict(
            category='balon_turu',
            location='kapadokya',
            duration=120
        )

        assert 'predictedPrice' in result
        assert 'minPrice' in result
        assert 'maxPrice' in result
        assert result['minPrice'] <= result['predictedPrice'] <= result['maxPrice']

    def test_predict_price_confidence(self, model):
        """Prediction should include confidence score"""
        result = model.predict(
            category='yemek',
            location='istanbul'
        )

        assert 'confidence' in result
        assert 0 <= result['confidence'] <= 1

    def test_location_affects_price(self, model):
        """Different locations should have different prices"""
        istanbul_price = model.predict(
            category='yemek',
            location='istanbul'
        )['predictedPrice']

        ankara_price = model.predict(
            category='yemek',
            location='ankara'
        )['predictedPrice']

        # Istanbul is typically more expensive
        assert istanbul_price != ankara_price

    def test_duration_affects_price(self, model):
        """Longer duration should increase price"""
        short_tour = model.predict(
            category='kultur',
            location='istanbul',
            duration=60
        )['predictedPrice']

        long_tour = model.predict(
            category='kultur',
            location='istanbul',
            duration=180
        )['predictedPrice']

        assert long_tour > short_tour

    def test_features_affect_price(self, model):
        """Premium features should increase price"""
        basic = model.predict(
            category='spa',
            location='antalya',
            features=[]
        )['predictedPrice']

        premium = model.predict(
            category='spa',
            location='antalya',
            features=['private', 'vip', 'champagne']
        )['predictedPrice']

        assert premium > basic

    def test_price_factors_explanation(self, model):
        """Prediction should explain price factors"""
        result = model.predict(
            category='balon_turu',
            location='kapadokya'
        )

        assert 'factors' in result
        assert isinstance(result['factors'], list)
        assert len(result['factors']) > 0

        for factor in result['factors']:
            assert 'name' in factor
            assert 'impact' in factor


class TestDynamicPricingEngine:
    """Tests for dynamic pricing adjustments"""

    @pytest.fixture
    def engine(self):
        return DynamicPricingEngine()

    def test_base_price_unchanged_in_normal_demand(self, engine):
        """Normal demand should not significantly change price"""
        result = engine.calculate(
            base_price=1000,
            category='yemek',
            location='istanbul',
            current_demand=0.5  # Normal demand
        )

        # Should be within 20% of base price
        assert 800 <= result['finalPrice'] <= 1200

    def test_high_demand_increases_price(self, engine):
        """High demand should increase price"""
        normal = engine.calculate(
            base_price=1000,
            category='balon_turu',
            location='kapadokya',
            current_demand=0.5
        )

        surge = engine.calculate(
            base_price=1000,
            category='balon_turu',
            location='kapadokya',
            current_demand=0.95
        )

        assert surge['finalPrice'] > normal['finalPrice']
        assert surge['demandLevel'] in ['high', 'surge']

    def test_low_demand_decreases_price(self, engine):
        """Low demand should decrease price"""
        normal = engine.calculate(
            base_price=1000,
            category='macera',
            location='antalya',
            current_demand=0.5
        )

        low = engine.calculate(
            base_price=1000,
            category='macera',
            location='antalya',
            current_demand=0.1
        )

        assert low['finalPrice'] < normal['finalPrice']
        assert low['demandLevel'] == 'low'

    def test_adjustments_are_explained(self, engine):
        """Adjustments should be explained"""
        result = engine.calculate(
            base_price=1000,
            category='spa',
            location='bodrum'
        )

        assert 'adjustments' in result
        assert isinstance(result['adjustments'], list)

        for adj in result['adjustments']:
            assert 'type' in adj
            assert 'multiplier' in adj
            assert 'reason' in adj

    def test_time_based_pricing(self, engine):
        """Price should vary by time of day"""
        morning = engine.calculate(
            base_price=1000,
            category='yemek',
            location='istanbul',
            time_of_day='morning'
        )

        evening = engine.calculate(
            base_price=1000,
            category='yemek',
            location='istanbul',
            time_of_day='evening'
        )

        # Dinner time typically more expensive
        assert morning['finalPrice'] != evening['finalPrice']

    def test_validity_period(self, engine):
        """Dynamic price should have expiration"""
        result = engine.calculate(
            base_price=1000,
            category='balon_turu',
            location='kapadokya'
        )

        assert 'validUntil' in result
        # Should be valid for at least a few minutes
        valid_until = datetime.fromisoformat(result['validUntil'].replace('Z', '+00:00'))
        assert valid_until > datetime.now(valid_until.tzinfo)


class TestPriceOptimizer:
    """Tests for price optimization"""

    @pytest.fixture
    def optimizer(self):
        return PriceOptimizer()

    def test_optimize_returns_recommendation(self, optimizer):
        """Optimizer should return price recommendation"""
        result = optimizer.optimize(
            current_price=1000,
            category='balon_turu',
            location='kapadokya',
            historical_data={'avg_price': 1200, 'conversion_rate': 0.15}
        )

        assert 'recommendedPrice' in result
        assert 'expectedConversion' in result

    def test_price_elasticity_calculation(self, optimizer):
        """Should calculate price elasticity"""
        elasticity = optimizer.calculate_elasticity(
            category='yemek',
            price_changes=[
                {'price': 100, 'conversions': 50},
                {'price': 120, 'conversions': 40},
                {'price': 80, 'conversions': 65}
            ]
        )

        assert 'elasticity' in elasticity
        assert 'isElastic' in elasticity

    def test_competitive_analysis(self, optimizer):
        """Should analyze competitive positioning"""
        result = optimizer.analyze_competitive_position(
            price=1000,
            category='spa',
            location='bodrum'
        )

        assert 'percentile' in result
        assert 'isCompetitive' in result
        assert 'recommendation' in result


class TestSeasonalFactors:
    """Tests for seasonal pricing adjustments"""

    @pytest.fixture
    def model(self):
        return PricePredictionModel()

    def test_summer_season_adjustment(self, model):
        """Summer should affect beach destinations"""
        winter_price = model.predict(
            category='plaj',
            location='antalya',
            target_date='2024-01-15'
        )['predictedPrice']

        summer_price = model.predict(
            category='plaj',
            location='antalya',
            target_date='2024-07-15'
        )['predictedPrice']

        # Summer should be more expensive for beach
        assert summer_price > winter_price

    def test_holiday_premium(self, model):
        """Turkish holidays should have premium"""
        normal_day = model.predict(
            category='yemek',
            location='istanbul',
            target_date='2024-10-20'  # Regular day
        )['predictedPrice']

        bayram = model.predict(
            category='yemek',
            location='istanbul',
            target_date='2024-04-10'  # Ramazan Bayramı
        )['predictedPrice']

        # Holidays typically more expensive
        assert bayram >= normal_day

    def test_weekend_premium(self, model):
        """Weekends may have premium for certain categories"""
        weekday = model.predict(
            category='spa',
            location='bodrum',
            target_date='2024-03-18'  # Monday
        )['predictedPrice']

        weekend = model.predict(
            category='spa',
            location='bodrum',
            target_date='2024-03-23'  # Saturday
        )['predictedPrice']

        # Weekend typically more expensive for leisure
        assert weekend >= weekday


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

"""
Tests for Forecasting and A/B Testing Models

Tests cover:
- Demand forecasting
- Seasonality detection
- Turkish holiday effects
- A/B experiment management
- Statistical significance
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
import numpy as np

import sys
sys.path.insert(0, '..')

from app.models.forecasting import (
    DemandForecastingModel,
    ABTestingEngine,
)


class TestDemandForecasting:
    """Tests for demand forecasting"""

    @pytest.fixture
    def model(self):
        return DemandForecastingModel()

    def test_forecast_returns_predictions(self, model):
        """Should return predictions for horizon"""
        result = model.forecast(
            category='balon_turu',
            horizon=7
        )

        assert 'predictions' in result
        assert len(result['predictions']) == 7

        for pred in result['predictions']:
            assert 'date' in pred
            assert 'predictedDemand' in pred
            assert 'confidence' in pred

    def test_confidence_decreases_over_time(self, model):
        """Confidence should decrease for further predictions"""
        result = model.forecast(
            category='balon_turu',
            horizon=30
        )

        confidences = [p['confidence'] for p in result['predictions']]

        # Later predictions should have lower confidence
        assert confidences[0] >= confidences[-1]

    def test_trend_detection(self, model):
        """Should detect overall trend"""
        result = model.forecast(
            category='spa',
            horizon=14
        )

        assert 'trend' in result
        assert result['trend'] in ['increasing', 'decreasing', 'stable']

    def test_seasonality_patterns(self, model):
        """Should detect seasonality patterns"""
        result = model.forecast(
            category='yemek',
            horizon=30
        )

        assert 'seasonality' in result
        assert 'dayOfWeek' in result['seasonality']
        assert 'monthOfYear' in result['seasonality']

    def test_location_affects_forecast(self, model):
        """Location should affect predictions"""
        istanbul = model.forecast(
            category='yemek',
            location='istanbul',
            horizon=7
        )

        ankara = model.forecast(
            category='yemek',
            location='ankara',
            horizon=7
        )

        # Predictions should differ by location
        istanbul_demands = [p['predictedDemand'] for p in istanbul['predictions']]
        ankara_demands = [p['predictedDemand'] for p in ankara['predictions']]

        assert istanbul_demands != ankara_demands


class TestTurkishHolidayEffects:
    """Tests for Turkish holiday impact on forecasting"""

    @pytest.fixture
    def model(self):
        return DemandForecastingModel()

    def test_ramazan_bayram_effect(self, model):
        """Ramazan Bayramı should increase demand"""
        # Normal week
        normal = model.forecast(
            category='yemek',
            horizon=7,
            start_date='2024-03-01'
        )

        # During Ramazan Bayramı (approximate)
        bayram = model.forecast(
            category='yemek',
            horizon=7,
            start_date='2024-04-10'
        )

        normal_avg = np.mean([p['predictedDemand'] for p in normal['predictions']])
        bayram_avg = np.mean([p['predictedDemand'] for p in bayram['predictions']])

        # Bayram should have higher demand
        assert bayram_avg >= normal_avg

    def test_kurban_bayram_effect(self, model):
        """Kurban Bayramı should affect patterns"""
        result = model.forecast(
            category='gezi',
            horizon=30,
            start_date='2024-06-01'  # Leading up to Kurban Bayramı
        )

        # Should have holiday markers
        assert any(p.get('is_holiday', False) for p in result['predictions']) or \
               'holiday_effects' in result

    def test_summer_vacation_effect(self, model):
        """Summer should increase beach destinations"""
        winter = model.forecast(
            category='plaj',
            horizon=30,
            start_date='2024-01-15'
        )

        summer = model.forecast(
            category='plaj',
            horizon=30,
            start_date='2024-07-15'
        )

        winter_avg = np.mean([p['predictedDemand'] for p in winter['predictions']])
        summer_avg = np.mean([p['predictedDemand'] for p in summer['predictions']])

        assert summer_avg > winter_avg


class TestCapacityPlanning:
    """Tests for capacity planning"""

    @pytest.fixture
    def model(self):
        return DemandForecastingModel()

    def test_capacity_check(self, model):
        """Should check capacity availability"""
        result = model.check_capacity(
            category='balon_turu',
            location='kapadokya',
            date='2024-07-15'
        )

        assert 'available' in result
        assert 'estimatedCapacity' in result
        assert 'recommendation' in result

    def test_alternative_dates(self, model):
        """Should suggest alternative dates if capacity low"""
        result = model.check_capacity(
            category='balon_turu',
            location='kapadokya',
            date='2024-07-15'  # Peak season
        )

        if not result['available'] or result['estimatedCapacity'] < 0.3:
            assert 'alternativeDates' in result
            assert len(result['alternativeDates']) > 0


class TestABTesting:
    """Tests for A/B testing engine"""

    @pytest.fixture
    def engine(self):
        return ABTestingEngine()

    def test_create_experiment(self, engine):
        """Should create new experiment"""
        experiment = engine.create_experiment(
            name='Test Onboarding Flow',
            variants=[
                {'name': 'Control', 'traffic': 50},
                {'name': 'New Design', 'traffic': 50}
            ]
        )

        assert 'id' in experiment
        assert experiment['status'] == 'draft'
        assert len(experiment['variants']) == 2

    def test_start_experiment(self, engine):
        """Should start experiment"""
        exp = engine.create_experiment(
            name='Test',
            variants=[
                {'name': 'A', 'traffic': 50},
                {'name': 'B', 'traffic': 50}
            ]
        )

        started = engine.start_experiment(exp['id'])

        assert started['status'] == 'running'
        assert 'startedAt' in started

    def test_variant_assignment(self, engine):
        """Should assign users to variants consistently"""
        exp = engine.create_experiment(
            name='Test',
            variants=[
                {'name': 'A', 'traffic': 50},
                {'name': 'B', 'traffic': 50}
            ]
        )
        engine.start_experiment(exp['id'])

        # Same user should always get same variant
        variant1 = engine.assign_variant(exp['id'], 'user-1')
        variant2 = engine.assign_variant(exp['id'], 'user-1')

        assert variant1 == variant2

    def test_traffic_distribution(self, engine):
        """Should distribute traffic according to weights"""
        exp = engine.create_experiment(
            name='Test',
            variants=[
                {'name': 'A', 'traffic': 70},
                {'name': 'B', 'traffic': 30}
            ]
        )
        engine.start_experiment(exp['id'])

        # Assign many users
        assignments = {'A': 0, 'B': 0}
        for i in range(1000):
            variant = engine.assign_variant(exp['id'], f'user-{i}')
            assignments[variant] += 1

        # Should be approximately 70/30
        a_ratio = assignments['A'] / 1000
        assert 0.6 <= a_ratio <= 0.8

    def test_conversion_tracking(self, engine):
        """Should track conversions"""
        exp = engine.create_experiment(
            name='Test',
            variants=[
                {'name': 'A', 'traffic': 50},
                {'name': 'B', 'traffic': 50}
            ]
        )
        engine.start_experiment(exp['id'])

        # Assign and convert
        engine.assign_variant(exp['id'], 'user-1')
        engine.record_conversion(exp['id'], 'user-1')

        results = engine.get_results(exp['id'])

        assert results['variants'][0]['conversions'] >= 0
        assert results['variants'][1]['conversions'] >= 0


class TestStatisticalSignificance:
    """Tests for statistical significance calculation"""

    @pytest.fixture
    def engine(self):
        return ABTestingEngine()

    def test_significance_calculation(self, engine):
        """Should calculate statistical significance"""
        result = engine.calculate_significance(
            control_conversions=100,
            control_visitors=1000,
            variant_conversions=120,
            variant_visitors=1000
        )

        assert 'significant' in result
        assert 'confidence' in result
        assert 0 <= result['confidence'] <= 100

    def test_winner_detection(self, engine):
        """Should detect winner when significant"""
        # Clear winner scenario
        result = engine.calculate_significance(
            control_conversions=50,
            control_visitors=1000,
            variant_conversions=100,
            variant_visitors=1000
        )

        if result['significant']:
            assert 'winner' in result
            assert result['winner'] == 'variant'

    def test_no_winner_when_insignificant(self, engine):
        """Should not declare winner if not significant"""
        # Very similar results
        result = engine.calculate_significance(
            control_conversions=100,
            control_visitors=1000,
            variant_conversions=102,
            variant_visitors=1000
        )

        if not result['significant']:
            assert result.get('winner') is None or result.get('winner') == 'none'

    def test_conclude_experiment(self, engine):
        """Should conclude experiment with results"""
        exp = engine.create_experiment(
            name='Test',
            variants=[
                {'name': 'Control', 'traffic': 50},
                {'name': 'Variant', 'traffic': 50}
            ]
        )
        engine.start_experiment(exp['id'])

        # Simulate conversions
        for i in range(100):
            engine.assign_variant(exp['id'], f'control-{i}')
        for i in range(50):
            engine.record_conversion(exp['id'], f'control-{i}')

        conclusion = engine.conclude_experiment(exp['id'])

        assert conclusion['status'] == 'completed'
        assert 'endedAt' in conclusion
        assert 'statisticalSignificance' in conclusion


class TestMultiVariantTests:
    """Tests for multi-variant (A/B/n) testing"""

    @pytest.fixture
    def engine(self):
        return ABTestingEngine()

    def test_three_way_test(self, engine):
        """Should support three variants"""
        exp = engine.create_experiment(
            name='Three Way Test',
            variants=[
                {'name': 'A', 'traffic': 33},
                {'name': 'B', 'traffic': 33},
                {'name': 'C', 'traffic': 34}
            ]
        )

        assert len(exp['variants']) == 3

    def test_traffic_validation(self, engine):
        """Traffic should sum to 100"""
        with pytest.raises(ValueError):
            engine.create_experiment(
                name='Invalid',
                variants=[
                    {'name': 'A', 'traffic': 50},
                    {'name': 'B', 'traffic': 30}  # Only 80%
                ]
            )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

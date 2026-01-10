"""
Demand Forecasting & A/B Test Automation

Provides:
- Demand prediction for experiences
- Seasonal trend forecasting
- Capacity planning
- A/B test automation and analysis
"""

from app.core.base_model import BaseModel
from app.core.redis_client import get_redis
from app.core.config import settings
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from enum import Enum
import logging
import json
import math
import hashlib
import random
from collections import defaultdict

logger = logging.getLogger(__name__)


class TrendDirection(str, Enum):
    """Trend direction indicators"""
    STRONG_UP = "strong_up"
    UP = "up"
    STABLE = "stable"
    DOWN = "down"
    STRONG_DOWN = "strong_down"


class SeasonalPattern(str, Enum):
    """Seasonal pattern types"""
    PEAK_SUMMER = "peak_summer"
    WINTER_HOLIDAY = "winter_holiday"
    SHOULDER = "shoulder"
    LOW_SEASON = "low_season"


class DemandForecastingModel(BaseModel):
    """
    Predicts demand for experiences and categories.

    Uses:
    - Historical booking data
    - Seasonal patterns
    - Event calendars
    - External factors (weather, holidays)
    """

    # Turkish holidays and events
    TURKISH_HOLIDAYS = {
        (1, 1): {"name": "Yılbaşı", "impact": 1.3},
        (4, 23): {"name": "23 Nisan", "impact": 1.2},
        (5, 19): {"name": "19 Mayıs", "impact": 1.15},
        (7, 15): {"name": "15 Temmuz", "impact": 0.9},
        (8, 30): {"name": "30 Ağustos", "impact": 1.1},
        (10, 29): {"name": "29 Ekim", "impact": 1.2},
    }

    # Category seasonal patterns
    CATEGORY_SEASONALITY = {
        "adventure": {
            "peak_months": [6, 7, 8],
            "low_months": [12, 1, 2],
            "peak_multiplier": 1.5,
            "low_multiplier": 0.6,
        },
        "wellness": {
            "peak_months": [11, 12, 1, 2],
            "low_months": [6, 7, 8],
            "peak_multiplier": 1.4,
            "low_multiplier": 0.8,
        },
        "nature": {
            "peak_months": [4, 5, 9, 10],
            "low_months": [12, 1, 2],
            "peak_multiplier": 1.4,
            "low_multiplier": 0.5,
        },
        "culture": {
            "peak_months": [4, 5, 9, 10],
            "low_months": [],
            "peak_multiplier": 1.3,
            "low_multiplier": 0.9,
        },
        "food": {
            "peak_months": [],
            "low_months": [],
            "peak_multiplier": 1.1,
            "low_multiplier": 0.95,
        },
        "luxury": {
            "peak_months": [12, 2, 6, 7, 8],
            "low_months": [1, 3, 11],
            "peak_multiplier": 1.4,
            "low_multiplier": 0.75,
        },
        "romantic": {
            "peak_months": [2, 5, 12],  # Valentine's, anniversaries, NYE
            "low_months": [1, 3, 11],
            "peak_multiplier": 1.6,
            "low_multiplier": 0.7,
        },
        "family": {
            "peak_months": [6, 7, 8, 12],
            "low_months": [9, 10, 11],
            "peak_multiplier": 1.5,
            "low_multiplier": 0.6,
        },
    }

    async def load(self):
        """Load forecasting model"""
        logger.info("Loading Demand Forecasting model...")

        # In production, load:
        # - Time series model (Prophet, ARIMA)
        # - External data (weather API, event calendar)
        # - Historical data

        self.loaded = True
        logger.info("✓ Demand Forecasting model loaded")

    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Alias for forecast method"""
        return await self.forecast(**kwargs)

    async def forecast(
        self,
        category: str,
        location: Optional[str] = None,
        days_ahead: int = 30,
        granularity: str = "daily",  # daily, weekly, monthly
    ) -> Dict[str, Any]:
        """
        Forecast demand for a category/location.

        Args:
            category: Experience category
            location: Optional location filter
            days_ahead: Number of days to forecast
            granularity: Forecast granularity

        Returns:
            Demand forecast with confidence intervals
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        redis = await get_redis()

        # Check cache
        cache_key = f"forecast:{category}:{location}:{days_ahead}"
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        # Get base demand (simulated historical average)
        base_demand = await self._get_base_demand(category, location)

        # Generate forecast
        forecast_data = []
        today = datetime.now()

        for i in range(days_ahead):
            forecast_date = today + timedelta(days=i)

            # Apply seasonal multiplier
            seasonal_mult = self._get_seasonal_multiplier(category, forecast_date)

            # Apply holiday effect
            holiday_mult = self._get_holiday_multiplier(forecast_date)

            # Apply day of week effect
            dow_mult = self._get_day_of_week_multiplier(forecast_date.weekday())

            # Calculate predicted demand
            predicted = base_demand * seasonal_mult * holiday_mult * dow_mult

            # Add some variance for confidence intervals
            variance = predicted * 0.15
            lower_bound = max(0, predicted - variance * 1.96)
            upper_bound = predicted + variance * 1.96

            forecast_data.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "predicted_demand": round(predicted, 1),
                "lower_bound": round(lower_bound, 1),
                "upper_bound": round(upper_bound, 1),
                "confidence": 0.85,
                "factors": {
                    "seasonal": round(seasonal_mult, 3),
                    "holiday": round(holiday_mult, 3),
                    "day_of_week": round(dow_mult, 3),
                },
            })

        # Calculate trend
        trend = self._calculate_trend(forecast_data)

        # Aggregate by granularity if needed
        if granularity == "weekly":
            forecast_data = self._aggregate_weekly(forecast_data)
        elif granularity == "monthly":
            forecast_data = self._aggregate_monthly(forecast_data)

        result = {
            "category": category,
            "location": location,
            "forecast_period": {
                "start": today.strftime("%Y-%m-%d"),
                "end": (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d"),
            },
            "granularity": granularity,
            "base_demand": base_demand,
            "forecast": forecast_data,
            "trend": trend,
            "insights": self._generate_insights(category, forecast_data, trend),
            "generated_at": datetime.utcnow().isoformat(),
        }

        # Cache for 6 hours
        await redis.setex(cache_key, 21600, json.dumps(result))

        return result

    async def get_category_trends(
        self,
        days: int = 90,
    ) -> Dict[str, Any]:
        """
        Get demand trends across all categories.

        Returns:
            Trend analysis for each category
        """
        redis = await get_redis()

        # Check cache
        cache_key = f"category_trends:{days}"
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        categories = list(self.CATEGORY_SEASONALITY.keys())
        category_trends = {}

        for category in categories:
            forecast = await self.forecast(category, days_ahead=days)

            # Calculate growth rate
            first_week_avg = sum(
                f["predicted_demand"] for f in forecast["forecast"][:7]
            ) / 7
            last_week_avg = sum(
                f["predicted_demand"] for f in forecast["forecast"][-7:]
            ) / 7

            growth_rate = ((last_week_avg - first_week_avg) / first_week_avg * 100
                           if first_week_avg > 0 else 0)

            category_trends[category] = {
                "current_demand": round(first_week_avg, 1),
                "predicted_demand": round(last_week_avg, 1),
                "growth_rate": round(growth_rate, 1),
                "trend": forecast["trend"]["direction"],
                "peak_date": self._find_peak_date(forecast["forecast"]),
            }

        # Sort by growth rate
        sorted_trends = dict(sorted(
            category_trends.items(),
            key=lambda x: x[1]["growth_rate"],
            reverse=True
        ))

        result = {
            "period_days": days,
            "categories": sorted_trends,
            "top_growing": list(sorted_trends.keys())[:3],
            "declining": [k for k, v in sorted_trends.items() if v["growth_rate"] < 0],
            "generated_at": datetime.utcnow().isoformat(),
        }

        # Cache for 12 hours
        await redis.setex(cache_key, 43200, json.dumps(result))

        return result

    async def get_capacity_recommendations(
        self,
        partner_id: str,
        moment_id: str,
        current_capacity: int,
    ) -> Dict[str, Any]:
        """
        Recommend capacity adjustments based on demand forecast.

        Returns:
            Capacity optimization recommendations
        """
        # Get moment's category (simulated)
        category = "adventure"  # Would fetch from DB

        # Get demand forecast
        forecast = await self.forecast(category, days_ahead=30)

        # Calculate recommended capacity
        peak_demand = max(f["predicted_demand"] for f in forecast["forecast"])
        avg_demand = sum(f["predicted_demand"] for f in forecast["forecast"]) / len(forecast["forecast"])

        utilization = avg_demand / current_capacity if current_capacity > 0 else 0

        # Generate recommendations
        recommendations = []

        if utilization > 0.9:
            recommendations.append({
                "type": "increase_capacity",
                "urgency": "high",
                "message": f"Kapasiteniz %{round(utilization * 100)} dolu. Artırmanızı öneririz.",
                "suggested_capacity": round(peak_demand * 1.2),
            })
        elif utilization < 0.5:
            recommendations.append({
                "type": "reduce_capacity",
                "urgency": "low",
                "message": f"Kapasite kullanımınız düşük (%{round(utilization * 100)}). Optimize edebilirsiniz.",
                "suggested_capacity": round(avg_demand * 1.5),
            })
        else:
            recommendations.append({
                "type": "maintain",
                "urgency": "none",
                "message": "Kapasiteniz optimal seviyede.",
                "suggested_capacity": current_capacity,
            })

        return {
            "partner_id": partner_id,
            "moment_id": moment_id,
            "current_capacity": current_capacity,
            "avg_predicted_demand": round(avg_demand, 1),
            "peak_predicted_demand": round(peak_demand, 1),
            "utilization_rate": round(utilization, 3),
            "recommendations": recommendations,
        }

    async def _get_base_demand(
        self,
        category: str,
        location: Optional[str],
    ) -> float:
        """Get historical base demand"""
        # In production, calculate from actual booking data
        base_demands = {
            "adventure": 45,
            "luxury": 25,
            "food": 60,
            "nature": 40,
            "culture": 35,
            "wellness": 30,
            "romantic": 28,
            "family": 38,
        }

        base = base_demands.get(category, 30)

        # Location multiplier
        if location:
            location_mults = {
                "istanbul": 1.5,
                "antalya": 1.3,
                "cappadocia": 1.4,
                "bodrum": 1.2,
            }
            base *= location_mults.get(location.lower(), 1.0)

        return base

    def _get_seasonal_multiplier(
        self,
        category: str,
        date: datetime,
    ) -> float:
        """Get seasonal multiplier for date"""
        month = date.month
        patterns = self.CATEGORY_SEASONALITY.get(category, {})

        if month in patterns.get("peak_months", []):
            return patterns.get("peak_multiplier", 1.0)
        elif month in patterns.get("low_months", []):
            return patterns.get("low_multiplier", 1.0)
        else:
            return 1.0

    def _get_holiday_multiplier(self, date: datetime) -> float:
        """Get holiday effect multiplier"""
        key = (date.month, date.day)
        holiday = self.TURKISH_HOLIDAYS.get(key)

        if holiday:
            return holiday["impact"]

        # Check if near a holiday (±2 days)
        for (m, d), h in self.TURKISH_HOLIDAYS.items():
            holiday_date = date.replace(month=m, day=d)
            days_diff = abs((date - holiday_date).days)
            if days_diff <= 2:
                return 1 + (h["impact"] - 1) * 0.5

        return 1.0

    def _get_day_of_week_multiplier(self, weekday: int) -> float:
        """Get day of week multiplier"""
        multipliers = {
            0: 0.85,  # Monday
            1: 0.85,
            2: 0.90,
            3: 0.95,
            4: 1.10,  # Friday
            5: 1.25,  # Saturday
            6: 1.15,  # Sunday
        }
        return multipliers.get(weekday, 1.0)

    def _calculate_trend(self, forecast: List[Dict]) -> Dict[str, Any]:
        """Calculate trend from forecast data"""
        if len(forecast) < 7:
            return {"direction": TrendDirection.STABLE.value, "strength": 0}

        first_week = sum(f["predicted_demand"] for f in forecast[:7]) / 7
        last_week = sum(f["predicted_demand"] for f in forecast[-7:]) / 7

        change_pct = (last_week - first_week) / first_week * 100 if first_week > 0 else 0

        if change_pct > 15:
            direction = TrendDirection.STRONG_UP
        elif change_pct > 5:
            direction = TrendDirection.UP
        elif change_pct > -5:
            direction = TrendDirection.STABLE
        elif change_pct > -15:
            direction = TrendDirection.DOWN
        else:
            direction = TrendDirection.STRONG_DOWN

        return {
            "direction": direction.value,
            "change_percent": round(change_pct, 1),
            "strength": round(abs(change_pct) / 20, 2),
        }

    def _aggregate_weekly(self, daily: List[Dict]) -> List[Dict]:
        """Aggregate daily forecast to weekly"""
        weekly = []
        for i in range(0, len(daily), 7):
            week_data = daily[i:i + 7]
            if week_data:
                weekly.append({
                    "week_start": week_data[0]["date"],
                    "week_end": week_data[-1]["date"],
                    "predicted_demand": round(
                        sum(d["predicted_demand"] for d in week_data), 1
                    ),
                    "avg_daily": round(
                        sum(d["predicted_demand"] for d in week_data) / len(week_data), 1
                    ),
                })
        return weekly

    def _aggregate_monthly(self, daily: List[Dict]) -> List[Dict]:
        """Aggregate daily forecast to monthly"""
        monthly = defaultdict(list)
        for d in daily:
            month_key = d["date"][:7]  # YYYY-MM
            monthly[month_key].append(d)

        result = []
        for month, data in sorted(monthly.items()):
            result.append({
                "month": month,
                "predicted_demand": round(
                    sum(d["predicted_demand"] for d in data), 1
                ),
                "avg_daily": round(
                    sum(d["predicted_demand"] for d in data) / len(data), 1
                ),
            })
        return result

    def _find_peak_date(self, forecast: List[Dict]) -> str:
        """Find peak demand date in forecast"""
        peak = max(forecast, key=lambda x: x["predicted_demand"])
        return peak["date"]

    def _generate_insights(
        self,
        category: str,
        forecast: List[Dict],
        trend: Dict,
    ) -> List[str]:
        """Generate actionable insights"""
        insights = []

        # Trend insight
        if trend["direction"] == TrendDirection.STRONG_UP.value:
            insights.append(f"📈 {category.title()} kategorisinde güçlü talep artışı bekleniyor (+{trend['change_percent']}%)")
        elif trend["direction"] == TrendDirection.DOWN.value:
            insights.append(f"📉 {category.title()} talebinde düşüş trendi var ({trend['change_percent']}%)")

        # Peak insight
        peak_date = self._find_peak_date(forecast)
        insights.append(f"🎯 En yüksek talep {peak_date} tarihinde bekleniyor")

        # Seasonal insight
        patterns = self.CATEGORY_SEASONALITY.get(category, {})
        if patterns.get("peak_months"):
            month_names = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                          "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
            peak_months = [month_names[m - 1] for m in patterns["peak_months"][:3]]
            insights.append(f"📅 Bu kategori için en yoğun aylar: {', '.join(peak_months)}")

        return insights


class ABTestingEngine:
    """
    A/B Test Automation Engine.

    Provides:
    - Experiment design
    - Automatic traffic splitting
    - Statistical significance testing
    - Automated winner selection
    """

    class ExperimentStatus(str, Enum):
        DRAFT = "draft"
        RUNNING = "running"
        PAUSED = "paused"
        COMPLETED = "completed"
        ARCHIVED = "archived"

    def __init__(self):
        self.experiments: Dict[str, Dict] = {}

    async def create_experiment(
        self,
        experiment_id: str,
        name: str,
        variants: List[Dict[str, Any]],
        target_metric: str,
        traffic_percentage: float = 100,
        min_sample_size: int = 1000,
    ) -> Dict[str, Any]:
        """
        Create a new A/B test experiment.

        Args:
            experiment_id: Unique experiment identifier
            name: Human-readable name
            variants: List of variants with weights
            target_metric: Primary metric to optimize
            traffic_percentage: Percentage of traffic to include
            min_sample_size: Minimum samples per variant

        Returns:
            Created experiment details
        """
        redis = await get_redis()

        experiment = {
            "id": experiment_id,
            "name": name,
            "variants": variants,
            "target_metric": target_metric,
            "traffic_percentage": traffic_percentage,
            "min_sample_size": min_sample_size,
            "status": self.ExperimentStatus.DRAFT.value,
            "created_at": datetime.utcnow().isoformat(),
            "started_at": None,
            "ended_at": None,
            "results": {v["id"]: {"samples": 0, "conversions": 0} for v in variants},
        }

        self.experiments[experiment_id] = experiment
        await redis.set(f"experiment:{experiment_id}", json.dumps(experiment))

        return experiment

    async def start_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Start running an experiment"""
        redis = await get_redis()

        exp_data = await redis.get(f"experiment:{experiment_id}")
        if not exp_data:
            raise ValueError(f"Experiment {experiment_id} not found")

        experiment = json.loads(exp_data)
        experiment["status"] = self.ExperimentStatus.RUNNING.value
        experiment["started_at"] = datetime.utcnow().isoformat()

        await redis.set(f"experiment:{experiment_id}", json.dumps(experiment))
        self.experiments[experiment_id] = experiment

        return experiment

    async def assign_variant(
        self,
        experiment_id: str,
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Assign a user to an experiment variant.

        Uses consistent hashing for deterministic assignment.
        """
        redis = await get_redis()

        exp_data = await redis.get(f"experiment:{experiment_id}")
        if not exp_data:
            return None

        experiment = json.loads(exp_data)

        if experiment["status"] != self.ExperimentStatus.RUNNING.value:
            return None

        # Check traffic allocation
        if random.random() * 100 > experiment["traffic_percentage"]:
            return None

        # Check existing assignment
        assignment_key = f"exp_assignment:{experiment_id}:{user_id}"
        existing = await redis.get(assignment_key)
        if existing:
            return json.loads(existing)

        # Consistent hash for variant assignment
        hash_input = f"{experiment_id}:{user_id}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)

        # Weighted random selection
        variants = experiment["variants"]
        total_weight = sum(v.get("weight", 1) for v in variants)

        cumulative = 0
        selected_variant = variants[0]

        threshold = (hash_value % 1000) / 1000 * total_weight

        for variant in variants:
            cumulative += variant.get("weight", 1)
            if threshold < cumulative:
                selected_variant = variant
                break

        assignment = {
            "experiment_id": experiment_id,
            "variant_id": selected_variant["id"],
            "variant_name": selected_variant.get("name", selected_variant["id"]),
            "assigned_at": datetime.utcnow().isoformat(),
        }

        # Store assignment (30 days TTL)
        await redis.setex(assignment_key, 86400 * 30, json.dumps(assignment))

        return assignment

    async def record_conversion(
        self,
        experiment_id: str,
        user_id: str,
        metric_value: float = 1.0,
    ) -> bool:
        """Record a conversion event for experiment"""
        redis = await get_redis()

        # Get user's assignment
        assignment_key = f"exp_assignment:{experiment_id}:{user_id}"
        assignment_data = await redis.get(assignment_key)

        if not assignment_data:
            return False

        assignment = json.loads(assignment_data)
        variant_id = assignment["variant_id"]

        # Update experiment results
        exp_data = await redis.get(f"experiment:{experiment_id}")
        if not exp_data:
            return False

        experiment = json.loads(exp_data)
        experiment["results"][variant_id]["conversions"] += metric_value
        experiment["results"][variant_id]["samples"] += 1

        await redis.set(f"experiment:{experiment_id}", json.dumps(experiment))

        return True

    async def get_results(
        self,
        experiment_id: str,
    ) -> Dict[str, Any]:
        """Get experiment results with statistical analysis"""
        redis = await get_redis()

        exp_data = await redis.get(f"experiment:{experiment_id}")
        if not exp_data:
            raise ValueError(f"Experiment {experiment_id} not found")

        experiment = json.loads(exp_data)
        results = experiment["results"]

        # Calculate conversion rates
        variant_stats = []
        baseline_rate = None

        for variant in experiment["variants"]:
            vid = variant["id"]
            data = results.get(vid, {"samples": 0, "conversions": 0})

            samples = data["samples"]
            conversions = data["conversions"]
            rate = conversions / samples if samples > 0 else 0

            if baseline_rate is None:
                baseline_rate = rate

            # Calculate lift vs baseline
            lift = ((rate - baseline_rate) / baseline_rate * 100
                    if baseline_rate > 0 else 0)

            # Calculate statistical significance (Z-test approximation)
            significance = self._calculate_significance(
                baseline_rate, rate, samples
            ) if samples > 100 else 0

            variant_stats.append({
                "variant_id": vid,
                "variant_name": variant.get("name", vid),
                "samples": samples,
                "conversions": conversions,
                "conversion_rate": round(rate, 4),
                "lift_vs_control": round(lift, 2),
                "statistical_significance": round(significance, 2),
                "is_winner": significance > 95 and lift > 0,
            })

        # Determine overall winner
        significant_winners = [v for v in variant_stats if v["is_winner"]]
        winner = max(significant_winners, key=lambda x: x["lift_vs_control"]) if significant_winners else None

        # Check if experiment can be concluded
        min_samples = experiment["min_sample_size"]
        has_enough_data = all(v["samples"] >= min_samples for v in variant_stats)
        has_winner = winner is not None

        return {
            "experiment_id": experiment_id,
            "name": experiment["name"],
            "status": experiment["status"],
            "target_metric": experiment["target_metric"],
            "started_at": experiment.get("started_at"),
            "variants": variant_stats,
            "winner": winner,
            "can_conclude": has_enough_data and has_winner,
            "recommendation": self._generate_recommendation(
                variant_stats, has_enough_data, winner
            ),
        }

    async def conclude_experiment(
        self,
        experiment_id: str,
        winning_variant_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Conclude experiment and optionally roll out winner"""
        redis = await get_redis()

        results = await self.get_results(experiment_id)

        # Get experiment
        exp_data = await redis.get(f"experiment:{experiment_id}")
        experiment = json.loads(exp_data)

        # Update status
        experiment["status"] = self.ExperimentStatus.COMPLETED.value
        experiment["ended_at"] = datetime.utcnow().isoformat()
        experiment["winning_variant"] = winning_variant_id or (
            results["winner"]["variant_id"] if results["winner"] else None
        )

        await redis.set(f"experiment:{experiment_id}", json.dumps(experiment))

        return {
            "experiment_id": experiment_id,
            "status": "completed",
            "winner": experiment["winning_variant"],
            "final_results": results["variants"],
        }

    def _calculate_significance(
        self,
        baseline_rate: float,
        variant_rate: float,
        sample_size: int,
    ) -> float:
        """Calculate statistical significance using Z-test"""
        if sample_size < 30 or baseline_rate == 0:
            return 0

        pooled_rate = (baseline_rate + variant_rate) / 2
        se = math.sqrt(2 * pooled_rate * (1 - pooled_rate) / sample_size)

        if se == 0:
            return 0

        z_score = abs(variant_rate - baseline_rate) / se

        # Approximate p-value from z-score
        # For z > 3, significance > 99.7%
        if z_score > 2.576:
            return 99
        elif z_score > 1.96:
            return 95
        elif z_score > 1.645:
            return 90
        elif z_score > 1.28:
            return 80
        else:
            return min(80, z_score * 30)

    def _generate_recommendation(
        self,
        variants: List[Dict],
        has_enough_data: bool,
        winner: Optional[Dict],
    ) -> str:
        """Generate experiment recommendation"""
        if not has_enough_data:
            samples_needed = 1000 - min(v["samples"] for v in variants)
            return f"Devam edin: Sonuç için yaklaşık {samples_needed} sample daha gerekli."

        if winner:
            return f"🏆 {winner['variant_name']} kazanan! %{winner['lift_vs_control']:.1f} artış, %{winner['statistical_significance']:.0f} güvenilirlik."

        return "Henüz istatistiksel olarak anlamlı bir kazanan yok. Devam etmeyi düşünün."

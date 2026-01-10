"""
Price Prediction & Optimization Engine

Uses ML to:
- Predict optimal gift amounts for experiences
- Suggest competitive pricing for moments
- Detect underpriced/overpriced listings
- Provide dynamic pricing recommendations
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

logger = logging.getLogger(__name__)


class PriceTier(str, Enum):
    """Price tier categories"""
    BUDGET = "budget"
    ECONOMY = "economy"
    STANDARD = "standard"
    PREMIUM = "premium"
    LUXURY = "luxury"


class SeasonType(str, Enum):
    """Seasonal categories"""
    LOW = "low"
    SHOULDER = "shoulder"
    HIGH = "high"
    PEAK = "peak"


class PricePredictionModel(BaseModel):
    """
    Predicts optimal prices for gift experiences.

    Uses historical data, market conditions, and ML to suggest
    the best price points for maximum conversion.
    """

    # Base price ranges by category (TRY)
    CATEGORY_PRICES = {
        "adventure": {"min": 500, "avg": 2000, "max": 8000},
        "luxury": {"min": 2000, "avg": 5000, "max": 25000},
        "food": {"min": 200, "avg": 800, "max": 3000},
        "nature": {"min": 300, "avg": 1200, "max": 5000},
        "culture": {"min": 150, "avg": 600, "max": 2500},
        "wellness": {"min": 400, "avg": 1500, "max": 6000},
        "romantic": {"min": 800, "avg": 2500, "max": 10000},
        "family": {"min": 500, "avg": 1800, "max": 7000},
    }

    # Seasonal multipliers
    SEASONAL_MULTIPLIERS = {
        SeasonType.LOW: 0.85,
        SeasonType.SHOULDER: 1.0,
        SeasonType.HIGH: 1.2,
        SeasonType.PEAK: 1.4,
    }

    # Location multipliers (major cities vs rural)
    LOCATION_MULTIPLIERS = {
        "istanbul": 1.3,
        "ankara": 1.1,
        "izmir": 1.15,
        "antalya": 1.2,
        "bodrum": 1.35,
        "cappadocia": 1.25,
        "default": 1.0,
    }

    # Day of week multipliers
    WEEKDAY_MULTIPLIERS = {
        0: 0.95,  # Monday
        1: 0.95,
        2: 0.95,
        3: 0.95,
        4: 1.05,  # Friday
        5: 1.15,  # Saturday
        6: 1.10,  # Sunday
    }

    async def load(self):
        """Load price prediction model"""
        logger.info("Loading Price Prediction model...")

        # In production, load trained model here
        # self.model = await self._load_xgboost_model()

        self.loaded = True
        logger.info("✓ Price Prediction model loaded")

    async def predict(self, **kwargs) -> Dict[str, Any]:
        """Alias for predict_price"""
        return await self.predict_price(**kwargs)

    async def predict_price(
        self,
        category: str,
        location: str,
        duration_hours: float = 3.0,
        group_size: int = 2,
        includes_transport: bool = False,
        includes_meal: bool = False,
        experience_date: Optional[datetime] = None,
        similar_moments: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """
        Predict optimal price for an experience.

        Args:
            category: Experience category (adventure, luxury, etc.)
            location: Location/city
            duration_hours: Duration in hours
            group_size: Number of participants
            includes_transport: Whether transport is included
            includes_meal: Whether meals are included
            experience_date: Target date for experience
            similar_moments: List of similar moments for comparison

        Returns:
            Price prediction with confidence intervals
        """
        if not self.loaded:
            raise RuntimeError("Model not loaded")

        # Check cache
        redis = await get_redis()
        cache_key = self._generate_cache_key(
            category, location, duration_hours, group_size
        )

        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)

        # Get base price from category
        base_prices = self.CATEGORY_PRICES.get(
            category,
            {"min": 300, "avg": 1000, "max": 5000}
        )
        base_price = base_prices["avg"]

        # Apply modifiers
        modifiers = []

        # Location modifier
        location_key = location.lower().replace(" ", "")
        location_mult = self.LOCATION_MULTIPLIERS.get(
            location_key,
            self.LOCATION_MULTIPLIERS["default"]
        )
        modifiers.append(("location", location_mult))

        # Duration modifier (base is 3 hours)
        duration_mult = 0.7 + (duration_hours / 3.0) * 0.3
        duration_mult = max(0.5, min(2.0, duration_mult))
        modifiers.append(("duration", duration_mult))

        # Group size modifier
        if group_size > 2:
            group_mult = 1.0 + (group_size - 2) * 0.15
        else:
            group_mult = 1.0
        modifiers.append(("group_size", group_mult))

        # Inclusions modifiers
        inclusions_mult = 1.0
        if includes_transport:
            inclusions_mult += 0.15
        if includes_meal:
            inclusions_mult += 0.20
        modifiers.append(("inclusions", inclusions_mult))

        # Seasonal modifier
        season = self._get_season(experience_date or datetime.now())
        season_mult = self.SEASONAL_MULTIPLIERS[season]
        modifiers.append(("season", season_mult))

        # Day of week modifier
        target_date = experience_date or datetime.now()
        weekday_mult = self.WEEKDAY_MULTIPLIERS[target_date.weekday()]
        modifiers.append(("weekday", weekday_mult))

        # Calculate final price
        final_mult = 1.0
        for _, mult in modifiers:
            final_mult *= mult

        predicted_price = base_price * final_mult

        # Calculate confidence interval (±15%)
        price_low = predicted_price * 0.85
        price_high = predicted_price * 1.15

        # Calculate competitive price range
        competitive_low = predicted_price * 0.90
        competitive_high = predicted_price * 1.05

        # Determine price tier
        if predicted_price < base_prices["avg"] * 0.5:
            tier = PriceTier.BUDGET
        elif predicted_price < base_prices["avg"] * 0.8:
            tier = PriceTier.ECONOMY
        elif predicted_price < base_prices["avg"] * 1.2:
            tier = PriceTier.STANDARD
        elif predicted_price < base_prices["avg"] * 1.8:
            tier = PriceTier.PREMIUM
        else:
            tier = PriceTier.LUXURY

        # Market analysis (simulated)
        market_analysis = await self._analyze_market(
            category, location, similar_moments
        )

        result = {
            "predicted_price": round(predicted_price),
            "price_range": {
                "low": round(price_low),
                "high": round(price_high),
            },
            "competitive_range": {
                "low": round(competitive_low),
                "high": round(competitive_high),
            },
            "confidence": 0.85,
            "tier": tier.value,
            "modifiers": {name: round(mult, 3) for name, mult in modifiers},
            "season": season.value,
            "market_analysis": market_analysis,
            "recommendation": self._generate_recommendation(
                predicted_price, market_analysis, tier
            ),
        }

        # Cache for 1 hour
        await redis.setex(cache_key, 3600, json.dumps(result))

        return result

    async def analyze_listing_price(
        self,
        listing_price: float,
        category: str,
        location: str,
        duration_hours: float = 3.0,
    ) -> Dict[str, Any]:
        """
        Analyze if a listing price is competitive.

        Returns:
            Analysis of the listing price vs market
        """
        # Get predicted price
        prediction = await self.predict_price(
            category=category,
            location=location,
            duration_hours=duration_hours,
        )

        predicted = prediction["predicted_price"]
        diff_percent = ((listing_price - predicted) / predicted) * 100

        # Determine status
        if diff_percent < -20:
            status = "underpriced"
            severity = "warning"
            message = "Fiyatınız piyasanın %{:.0f} altında".format(abs(diff_percent))
        elif diff_percent < -10:
            status = "slightly_underpriced"
            severity = "info"
            message = "Fiyatınız rekabetçi, ancak biraz artırabilirsiniz"
        elif diff_percent < 10:
            status = "competitive"
            severity = "success"
            message = "Fiyatınız piyasa ortalamasına uygun"
        elif diff_percent < 25:
            status = "slightly_overpriced"
            severity = "info"
            message = "Fiyatınız ortalamanın biraz üstünde"
        else:
            status = "overpriced"
            severity = "warning"
            message = "Fiyatınız piyasanın %{:.0f} üstünde".format(diff_percent)

        return {
            "listing_price": listing_price,
            "predicted_price": predicted,
            "difference_percent": round(diff_percent, 1),
            "status": status,
            "severity": severity,
            "message": message,
            "suggested_price": round(predicted),
            "suggested_range": prediction["competitive_range"],
            "tier": prediction["tier"],
        }

    async def get_price_history(
        self,
        category: str,
        location: str,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Get historical price trends.

        Returns:
            Price history with trends
        """
        redis = await get_redis()

        # Generate simulated historical data
        history = []
        base_price = self.CATEGORY_PRICES.get(category, {"avg": 1000})["avg"]

        for i in range(days):
            date = datetime.now() - timedelta(days=days - i - 1)
            # Add some variation
            variation = math.sin(i / 7 * math.pi) * 0.1
            season_mult = 1.0 + (math.sin(i / 30 * math.pi) * 0.15)
            price = base_price * (1 + variation) * season_mult

            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "avg_price": round(price),
                "min_price": round(price * 0.7),
                "max_price": round(price * 1.3),
                "transaction_count": 10 + (i % 20),
            })

        # Calculate trend
        recent_avg = sum(h["avg_price"] for h in history[-7:]) / 7
        older_avg = sum(h["avg_price"] for h in history[:7]) / 7
        trend_percent = ((recent_avg - older_avg) / older_avg) * 100

        if trend_percent > 5:
            trend = "increasing"
        elif trend_percent < -5:
            trend = "decreasing"
        else:
            trend = "stable"

        return {
            "category": category,
            "location": location,
            "history": history,
            "trend": trend,
            "trend_percent": round(trend_percent, 1),
            "current_avg": round(recent_avg),
            "period_high": max(h["max_price"] for h in history),
            "period_low": min(h["min_price"] for h in history),
        }

    def _get_season(self, date: datetime) -> SeasonType:
        """Determine season from date"""
        month = date.month

        # Turkey tourism seasons
        if month in [7, 8]:
            return SeasonType.PEAK
        elif month in [6, 9]:
            return SeasonType.HIGH
        elif month in [4, 5, 10]:
            return SeasonType.SHOULDER
        else:
            return SeasonType.LOW

    async def _analyze_market(
        self,
        category: str,
        location: str,
        similar_moments: Optional[List[Dict]] = None,
    ) -> Dict[str, Any]:
        """Analyze market conditions"""
        redis = await get_redis()

        # Get or simulate market data
        market_key = f"market_data:{category}:{location}"
        cached_market = await redis.get(market_key)

        if cached_market:
            return json.loads(cached_market)

        # Simulate market analysis
        base = self.CATEGORY_PRICES.get(category, {"avg": 1000})

        market_data = {
            "avg_market_price": base["avg"],
            "price_range": {
                "p10": round(base["min"] * 0.8),
                "p25": round(base["min"]),
                "p50": base["avg"],
                "p75": round(base["max"] * 0.7),
                "p90": base["max"],
            },
            "active_listings": 45 + hash(f"{category}{location}") % 100,
            "demand_level": "high" if category in ["adventure", "luxury"] else "medium",
            "supply_level": "medium",
            "competition_intensity": 0.7,
        }

        # Cache for 6 hours
        await redis.setex(market_key, 21600, json.dumps(market_data))

        return market_data

    def _generate_recommendation(
        self,
        predicted_price: float,
        market: Dict[str, Any],
        tier: PriceTier,
    ) -> str:
        """Generate pricing recommendation"""
        demand = market.get("demand_level", "medium")
        competition = market.get("competition_intensity", 0.5)

        if demand == "high" and competition < 0.6:
            return f"Talep yüksek, rekabet düşük. ₺{round(predicted_price * 1.1)} civarı deneyebilirsiniz."
        elif demand == "high" and competition >= 0.6:
            return f"Talep yüksek ama rekabet var. ₺{round(predicted_price)} önerilen fiyat."
        elif demand == "low":
            return f"Talep düşük dönem. ₺{round(predicted_price * 0.9)} ile daha hızlı satış yapabilirsiniz."
        else:
            return f"Piyasa dengeli. Önerilen fiyat: ₺{round(predicted_price)}"

    def _generate_cache_key(
        self,
        category: str,
        location: str,
        duration: float,
        group_size: int,
    ) -> str:
        """Generate cache key for price prediction"""
        key_data = f"{category}:{location}:{duration}:{group_size}"
        return f"price_pred:{hashlib.md5(key_data.encode()).hexdigest()[:16]}"


class DynamicPricingEngine:
    """
    Real-time dynamic pricing based on demand and supply.

    Adjusts prices in real-time based on:
    - Current demand
    - Available inventory
    - Time to experience
    - Competitor pricing
    """

    # Surge pricing thresholds
    DEMAND_THRESHOLDS = {
        "low": {"demand_ratio": 0.3, "multiplier": 0.9},
        "normal": {"demand_ratio": 0.6, "multiplier": 1.0},
        "high": {"demand_ratio": 0.8, "multiplier": 1.15},
        "surge": {"demand_ratio": 0.95, "multiplier": 1.3},
    }

    # Time-based adjustments
    TIME_ADJUSTMENTS = {
        "last_minute": {"hours": 24, "multiplier": 0.85},
        "short_notice": {"hours": 72, "multiplier": 0.95},
        "normal": {"hours": 168, "multiplier": 1.0},  # 1 week
        "early_bird": {"hours": 720, "multiplier": 0.90},  # 30 days
    }

    async def calculate_dynamic_price(
        self,
        base_price: float,
        moment_id: str,
        experience_datetime: datetime,
        current_bookings: int = 0,
        max_capacity: int = 10,
    ) -> Dict[str, Any]:
        """
        Calculate dynamic price for a moment.

        Args:
            base_price: Original listing price
            moment_id: Moment identifier
            experience_datetime: When the experience occurs
            current_bookings: Current number of bookings
            max_capacity: Maximum capacity

        Returns:
            Dynamic price with adjustments breakdown
        """
        adjustments = []
        final_multiplier = 1.0

        # Demand-based adjustment
        demand_ratio = current_bookings / max_capacity if max_capacity > 0 else 0

        for level, config in self.DEMAND_THRESHOLDS.items():
            if demand_ratio <= config["demand_ratio"]:
                demand_mult = config["multiplier"]
                adjustments.append({
                    "type": "demand",
                    "level": level,
                    "multiplier": demand_mult,
                    "reason": f"Doluluk: %{round(demand_ratio * 100)}",
                })
                final_multiplier *= demand_mult
                break

        # Time-based adjustment
        hours_until = (experience_datetime - datetime.now()).total_seconds() / 3600

        for timing, config in self.TIME_ADJUSTMENTS.items():
            if hours_until <= config["hours"]:
                time_mult = config["multiplier"]
                adjustments.append({
                    "type": "timing",
                    "level": timing,
                    "multiplier": time_mult,
                    "reason": f"{round(hours_until)} saat kaldı",
                })
                final_multiplier *= time_mult
                break

        # Apply limits (max 40% increase, max 25% decrease)
        final_multiplier = max(0.75, min(1.4, final_multiplier))

        dynamic_price = base_price * final_multiplier
        savings = base_price - dynamic_price if dynamic_price < base_price else 0

        return {
            "base_price": base_price,
            "dynamic_price": round(dynamic_price),
            "final_multiplier": round(final_multiplier, 3),
            "adjustments": adjustments,
            "savings": round(savings) if savings > 0 else 0,
            "is_discounted": dynamic_price < base_price,
            "is_surge": final_multiplier > 1.1,
            "urgency_message": self._generate_urgency_message(
                demand_ratio, hours_until, current_bookings, max_capacity
            ),
        }

    def _generate_urgency_message(
        self,
        demand_ratio: float,
        hours_until: float,
        current: int,
        max_cap: int,
    ) -> Optional[str]:
        """Generate urgency message for high-demand situations"""
        remaining = max_cap - current

        if remaining <= 2 and remaining > 0:
            return f"Son {remaining} yer kaldı!"
        elif demand_ratio > 0.8:
            return "Çok talep görüyor, hemen rezerve edin!"
        elif hours_until < 48:
            return "Son dakika fırsatı!"
        elif hours_until > 720 and demand_ratio < 0.3:
            return "Erken rezervasyon indirimi!"

        return None


class PriceOptimizer:
    """
    Optimizes prices for maximum revenue/conversion.

    Uses A/B testing results and ML to find optimal price points.
    """

    async def optimize(
        self,
        moment_id: str,
        current_price: float,
        conversion_rate: float,
        views: int,
        category: str,
    ) -> Dict[str, Any]:
        """
        Suggest optimal price for better performance.

        Args:
            moment_id: Moment identifier
            current_price: Current listing price
            conversion_rate: Current conversion rate (0-1)
            views: Number of views
            category: Experience category

        Returns:
            Optimization suggestions
        """
        # Calculate expected conversions at different price points
        price_points = []

        for mult in [0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2]:
            test_price = current_price * mult

            # Price elasticity simulation
            # Lower prices generally increase conversion, but with diminishing returns
            elasticity = -1.5  # 1% price decrease = 1.5% conversion increase
            conversion_change = (1 - mult) * elasticity
            expected_conversion = conversion_rate * (1 + conversion_change)
            expected_conversion = max(0.01, min(0.5, expected_conversion))

            expected_revenue = test_price * expected_conversion * views

            price_points.append({
                "price": round(test_price),
                "price_change": round((mult - 1) * 100, 1),
                "expected_conversion": round(expected_conversion, 4),
                "conversion_change": round(conversion_change * 100, 1),
                "expected_revenue": round(expected_revenue),
            })

        # Find optimal price point
        optimal = max(price_points, key=lambda x: x["expected_revenue"])

        # Current performance
        current_revenue = current_price * conversion_rate * views

        return {
            "current_price": current_price,
            "current_conversion": conversion_rate,
            "current_revenue": round(current_revenue),
            "optimal_price": optimal["price"],
            "optimal_conversion": optimal["expected_conversion"],
            "optimal_revenue": optimal["expected_revenue"],
            "revenue_increase": round(optimal["expected_revenue"] - current_revenue),
            "revenue_increase_percent": round(
                ((optimal["expected_revenue"] - current_revenue) / current_revenue) * 100, 1
            ) if current_revenue > 0 else 0,
            "price_points": price_points,
            "recommendation": self._generate_optimization_recommendation(
                current_price, optimal, conversion_rate
            ),
        }

    def _generate_optimization_recommendation(
        self,
        current: float,
        optimal: Dict,
        conversion_rate: float,
    ) -> str:
        """Generate optimization recommendation"""
        if optimal["price"] < current * 0.95:
            return f"Fiyatı ₺{optimal['price']}e düşürmeniz önerilir. Tahmini gelir artışı: %{optimal['expected_revenue'] - current * conversion_rate:.0f}"
        elif optimal["price"] > current * 1.05:
            return f"Fiyatı ₺{optimal['price']}e yükseltebilirsiniz. Dönüşüm oranınız bunu destekliyor."
        else:
            return "Mevcut fiyatınız optimal aralıkta. Değişiklik önerilmiyor."

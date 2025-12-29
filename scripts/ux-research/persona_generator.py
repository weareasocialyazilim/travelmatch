#!/usr/bin/env python3
"""
Persona Generator - Data-Driven User Persona Creation Tool

Creates research-backed personas from user data and interviews for TravelMatch.
Analyzes behavior patterns, identifies archetypes, extracts psychographics,
and provides actionable design implications.

Usage:
    python persona_generator.py [json]                    # Interactive mode
    python persona_generator.py --file data.json [json]   # From file
    python persona_generator.py --sample [json]           # Demo with sample data

Output Formats:
    default: Human-readable formatted output
    json:    Machine-readable JSON output

Author: TravelMatch UX Team
"""

import argparse
import json
import sys
import os
from collections import Counter
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Optional
import math
import statistics


def validate_safe_path(filepath: str, base_dir: str = None) -> str:
    """
    Validate and sanitize file path to prevent path traversal attacks.
    Returns the resolved absolute path if safe, raises ValueError otherwise.
    """
    from pathlib import Path
    if base_dir is None:
        base_dir = os.getcwd()
    
    # Use pathlib for safer path resolution
    base = Path(base_dir).resolve()
    
    # Normalize and resolve the target path
    # First sanitize: remove null bytes and normalize slashes
    sanitized = filepath.replace('\x00', '').replace('\\', '/')
    target = (base / sanitized).resolve()
    
    # Strict check: target must be within base directory using commonpath
    try:
        common = os.path.commonpath([str(base), str(target)])
        if common != str(base):
            raise ValueError(f"Path '{filepath}' would escape the base directory")
        target.relative_to(base)
    except ValueError as e:
        raise ValueError(f"Path '{filepath}' would escape the base directory") from e
    
    return str(target)


def read_file_safely(filepath: str, base_dir: str = None) -> str:
    """
    Safely read a file after validating the path.
    This function combines path validation and file reading to ensure
    no path traversal attacks are possible.
    """
    safe_path = validate_safe_path(filepath, base_dir)
    # Security: Path is fully validated by validate_safe_path() which:
    # 1. Resolves to absolute path
    # 2. Verifies path is within base_dir using commonpath
    # 3. Verifies using relative_to check
    # This prevents any path traversal attacks including ../ sequences
    # Using pathlib for additional safety
    return Path(safe_path).read_text(encoding='utf-8')


class TravelStyle(Enum):
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    RELAXATION = "relaxation"
    SOCIAL = "social"
    BUDGET = "budget"
    LUXURY = "luxury"
    SOLO = "solo"
    FAMILY = "family"


class PersonaArchetype(Enum):
    EXPLORER = "The Explorer"
    CONNECTOR = "The Connector"
    PLANNER = "The Planner"
    SPONTANEOUS = "The Spontaneous"
    CULTURE_SEEKER = "The Culture Seeker"
    COMFORT_TRAVELER = "The Comfort Traveler"
    DIGITAL_NOMAD = "The Digital Nomad"
    GIFT_ENTHUSIAST = "The Gift Enthusiast"


@dataclass
class UserDataPoint:
    """Represents a single user data point from research."""
    user_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    travel_frequency: Optional[int] = None  # trips per year
    preferred_destinations: list = field(default_factory=list)
    travel_styles: list = field(default_factory=list)
    budget_range: Optional[str] = None  # "low", "medium", "high", "luxury"
    booking_behavior: Optional[str] = None  # "early_planner", "last_minute", "flexible"
    social_engagement: Optional[int] = None  # 1-10 scale
    gift_giving_frequency: Optional[int] = None  # gifts per year
    pain_points: list = field(default_factory=list)
    goals: list = field(default_factory=list)
    tech_proficiency: Optional[int] = None  # 1-10 scale
    interview_quotes: list = field(default_factory=list)
    session_duration_avg: Optional[float] = None  # minutes
    feature_usage: dict = field(default_factory=dict)
    nps_score: Optional[int] = None  # 0-10


@dataclass
class Persona:
    """Generated persona with all attributes."""
    name: str
    archetype: str
    tagline: str
    demographics: dict
    psychographics: dict
    behaviors: dict
    goals: list
    pain_points: list
    scenarios: list
    design_implications: list
    key_quotes: list
    confidence_score: float
    sample_size: int
    generated_at: str
    data_sources: list


class PersonaGenerator:
    """Main class for generating personas from user research data."""

    # Archetype mapping rules based on behavior patterns
    ARCHETYPE_RULES = {
        PersonaArchetype.EXPLORER: {
            "travel_styles": [TravelStyle.ADVENTURE.value, TravelStyle.SOLO.value],
            "travel_frequency_min": 3,
            "spontaneity": "high"
        },
        PersonaArchetype.CONNECTOR: {
            "social_engagement_min": 7,
            "gift_giving_min": 3,
            "travel_styles": [TravelStyle.SOCIAL.value]
        },
        PersonaArchetype.PLANNER: {
            "booking_behavior": "early_planner",
            "tech_proficiency_min": 6
        },
        PersonaArchetype.SPONTANEOUS: {
            "booking_behavior": "last_minute",
            "travel_styles": [TravelStyle.ADVENTURE.value]
        },
        PersonaArchetype.CULTURE_SEEKER: {
            "travel_styles": [TravelStyle.CULTURAL.value],
            "destinations_cultural": True
        },
        PersonaArchetype.COMFORT_TRAVELER: {
            "travel_styles": [TravelStyle.RELAXATION.value, TravelStyle.LUXURY.value],
            "budget_range": ["high", "luxury"]
        },
        PersonaArchetype.DIGITAL_NOMAD: {
            "travel_frequency_min": 6,
            "tech_proficiency_min": 8,
            "travel_styles": [TravelStyle.SOLO.value]
        },
        PersonaArchetype.GIFT_ENTHUSIAST: {
            "gift_giving_min": 5,
            "social_engagement_min": 6
        }
    }

    # Persona name templates by archetype
    PERSONA_NAMES = {
        PersonaArchetype.EXPLORER: ["Alex", "Jordan", "Sam", "Riley"],
        PersonaArchetype.CONNECTOR: ["Maya", "Chris", "Taylor", "Morgan"],
        PersonaArchetype.PLANNER: ["David", "Sarah", "Michael", "Jennifer"],
        PersonaArchetype.SPONTANEOUS: ["Max", "Luna", "Kai", "Sky"],
        PersonaArchetype.CULTURE_SEEKER: ["Priya", "Carlos", "Yuki", "Elena"],
        PersonaArchetype.COMFORT_TRAVELER: ["Robert", "Linda", "William", "Patricia"],
        PersonaArchetype.DIGITAL_NOMAD: ["Zoe", "Ethan", "Aria", "Leo"],
        PersonaArchetype.GIFT_ENTHUSIAST: ["Emma", "Noah", "Olivia", "Liam"]
    }

    def __init__(self, users: list[UserDataPoint]):
        """Initialize with user data points."""
        self.users = users
        self.sample_size = len(users)

    @classmethod
    def from_json(cls, json_data: list[dict]) -> 'PersonaGenerator':
        """Create generator from JSON data."""
        users = []
        for item in json_data:
            user = UserDataPoint(
                user_id=item.get("user_id", f"user_{len(users)+1}"),
                age=item.get("age"),
                gender=item.get("gender"),
                location=item.get("location"),
                travel_frequency=item.get("travel_frequency"),
                preferred_destinations=item.get("preferred_destinations", []),
                travel_styles=item.get("travel_styles", []),
                budget_range=item.get("budget_range"),
                booking_behavior=item.get("booking_behavior"),
                social_engagement=item.get("social_engagement"),
                gift_giving_frequency=item.get("gift_giving_frequency"),
                pain_points=item.get("pain_points", []),
                goals=item.get("goals", []),
                tech_proficiency=item.get("tech_proficiency"),
                interview_quotes=item.get("interview_quotes", []),
                session_duration_avg=item.get("session_duration_avg"),
                feature_usage=item.get("feature_usage", {}),
                nps_score=item.get("nps_score")
            )
            users.append(user)
        return cls(users)

    def calculate_confidence_score(self, cluster_size: int) -> float:
        """
        Calculate confidence score based on sample size.
        Uses a logarithmic scale: more data = higher confidence, diminishing returns.
        """
        if cluster_size == 0:
            return 0.0

        # Base confidence from cluster size (logarithmic)
        size_confidence = min(math.log10(cluster_size + 1) / 2, 1.0)

        # Data completeness factor
        completeness_scores = []
        for user in self.users[:cluster_size]:
            complete_fields = sum([
                user.age is not None,
                user.travel_frequency is not None,
                len(user.travel_styles) > 0,
                user.social_engagement is not None,
                len(user.goals) > 0,
                len(user.pain_points) > 0
            ])
            completeness_scores.append(complete_fields / 6)

        completeness = statistics.mean(completeness_scores) if completeness_scores else 0

        # Combined confidence
        confidence = (size_confidence * 0.6 + completeness * 0.4) * 100
        return round(min(confidence, 100), 1)

    def identify_archetype(self, cluster: list[UserDataPoint]) -> PersonaArchetype:
        """Identify the most appropriate archetype for a user cluster."""
        scores = {archetype: 0 for archetype in PersonaArchetype}

        for user in cluster:
            for archetype, rules in self.ARCHETYPE_RULES.items():
                match_score = 0
                total_rules = len(rules)

                # Check travel styles
                if "travel_styles" in rules:
                    if any(style in user.travel_styles for style in rules["travel_styles"]):
                        match_score += 1

                # Check travel frequency
                if "travel_frequency_min" in rules:
                    if user.travel_frequency and user.travel_frequency >= rules["travel_frequency_min"]:
                        match_score += 1

                # Check social engagement
                if "social_engagement_min" in rules:
                    if user.social_engagement and user.social_engagement >= rules["social_engagement_min"]:
                        match_score += 1

                # Check gift giving
                if "gift_giving_min" in rules:
                    if user.gift_giving_frequency and user.gift_giving_frequency >= rules["gift_giving_min"]:
                        match_score += 1

                # Check booking behavior
                if "booking_behavior" in rules:
                    if user.booking_behavior == rules["booking_behavior"]:
                        match_score += 1

                # Check tech proficiency
                if "tech_proficiency_min" in rules:
                    if user.tech_proficiency and user.tech_proficiency >= rules["tech_proficiency_min"]:
                        match_score += 1

                # Check budget range
                if "budget_range" in rules:
                    if user.budget_range in rules["budget_range"]:
                        match_score += 1

                scores[archetype] += match_score / total_rules if total_rules > 0 else 0

        # Return highest scoring archetype
        return max(scores, key=scores.get)

    def extract_demographics(self, cluster: list[UserDataPoint]) -> dict:
        """Extract demographic patterns from cluster."""
        ages = [u.age for u in cluster if u.age]
        genders = [u.gender for u in cluster if u.gender]
        locations = [u.location for u in cluster if u.location]

        return {
            "age_range": f"{min(ages)}-{max(ages)}" if ages else "Unknown",
            "median_age": statistics.median(ages) if ages else None,
            "primary_gender": Counter(genders).most_common(1)[0][0] if genders else "Mixed",
            "gender_distribution": dict(Counter(genders)) if genders else {},
            "top_locations": [loc for loc, _ in Counter(locations).most_common(3)] if locations else []
        }

    def extract_psychographics(self, cluster: list[UserDataPoint]) -> dict:
        """Extract psychographic patterns (attitudes, values, motivations)."""
        all_goals = []
        all_pain_points = []
        travel_styles = []

        for user in cluster:
            all_goals.extend(user.goals)
            all_pain_points.extend(user.pain_points)
            travel_styles.extend(user.travel_styles)

        # Analyze motivations from goals
        motivations = self._categorize_motivations(all_goals)

        # Analyze frustrations from pain points
        frustrations = self._categorize_frustrations(all_pain_points)

        return {
            "primary_motivations": motivations[:3],
            "core_values": self._infer_values(travel_styles, all_goals),
            "lifestyle_indicators": self._infer_lifestyle(cluster),
            "emotional_drivers": self._infer_emotional_drivers(all_goals, all_pain_points)
        }

    def _categorize_motivations(self, goals: list) -> list:
        """Categorize goals into motivation themes."""
        motivation_keywords = {
            "Connection": ["meet", "connect", "friend", "social", "share", "community"],
            "Discovery": ["explore", "discover", "new", "adventure", "experience"],
            "Growth": ["learn", "culture", "understand", "grow", "develop"],
            "Relaxation": ["relax", "escape", "peace", "unwind", "rest"],
            "Achievement": ["goal", "complete", "achieve", "accomplish", "milestone"],
            "Memory Making": ["memory", "remember", "capture", "moment", "story"]
        }

        scores = {theme: 0 for theme in motivation_keywords}
        for goal in goals:
            goal_lower = goal.lower()
            for theme, keywords in motivation_keywords.items():
                if any(kw in goal_lower for kw in keywords):
                    scores[theme] += 1

        return [theme for theme, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True) if scores[theme] > 0]

    def _categorize_frustrations(self, pain_points: list) -> list:
        """Categorize pain points into frustration themes."""
        frustration_keywords = {
            "Planning Complexity": ["plan", "organize", "coordinate", "schedule"],
            "Cost Concerns": ["expensive", "cost", "budget", "price", "afford"],
            "Trust Issues": ["trust", "safe", "secure", "reliable", "authentic"],
            "Time Constraints": ["time", "busy", "schedule", "quick", "fast"],
            "Communication Barriers": ["language", "communicate", "understand", "respond"],
            "Choice Overload": ["too many", "overwhelm", "decide", "choose", "options"]
        }

        scores = {theme: 0 for theme in frustration_keywords}
        for pain in pain_points:
            pain_lower = pain.lower()
            for theme, keywords in frustration_keywords.items():
                if any(kw in pain_lower for kw in keywords):
                    scores[theme] += 1

        return [theme for theme, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True) if scores[theme] > 0]

    def _infer_values(self, travel_styles: list, goals: list) -> list:
        """Infer core values from travel styles and goals."""
        values = []
        style_counts = Counter(travel_styles)

        if style_counts.get("adventure", 0) > 0:
            values.append("Freedom & Independence")
        if style_counts.get("cultural", 0) > 0:
            values.append("Curiosity & Learning")
        if style_counts.get("social", 0) > 0:
            values.append("Community & Belonging")
        if style_counts.get("luxury", 0) > 0:
            values.append("Quality & Comfort")
        if style_counts.get("budget", 0) > 0:
            values.append("Resourcefulness & Practicality")

        return values[:4] if values else ["Exploration", "Experience"]

    def _infer_lifestyle(self, cluster: list[UserDataPoint]) -> dict:
        """Infer lifestyle indicators from user data."""
        tech_scores = [u.tech_proficiency for u in cluster if u.tech_proficiency]
        travel_freq = [u.travel_frequency for u in cluster if u.travel_frequency]

        return {
            "tech_savviness": "High" if tech_scores and statistics.mean(tech_scores) >= 7 else
                             "Medium" if tech_scores and statistics.mean(tech_scores) >= 4 else "Low",
            "travel_intensity": "Frequent" if travel_freq and statistics.mean(travel_freq) >= 4 else
                               "Moderate" if travel_freq and statistics.mean(travel_freq) >= 2 else "Occasional",
            "social_activity": self._get_social_level(cluster)
        }

    def _get_social_level(self, cluster: list[UserDataPoint]) -> str:
        """Determine social activity level."""
        social_scores = [u.social_engagement for u in cluster if u.social_engagement]
        if not social_scores:
            return "Unknown"
        avg = statistics.mean(social_scores)
        return "Very Social" if avg >= 8 else "Social" if avg >= 5 else "Reserved"

    def _infer_emotional_drivers(self, goals: list, pain_points: list) -> list:
        """Infer emotional drivers from goals and pain points."""
        drivers = []

        # Analyze emotional content
        positive_emotions = ["happy", "joy", "excite", "love", "passion", "thrill"]
        connection_emotions = ["belong", "friend", "family", "together", "share"]
        security_emotions = ["safe", "trust", "reliable", "secure", "confident"]

        all_text = " ".join(goals + pain_points).lower()

        if any(e in all_text for e in positive_emotions):
            drivers.append("Seeking joy and excitement")
        if any(e in all_text for e in connection_emotions):
            drivers.append("Desire for meaningful connections")
        if any(e in all_text for e in security_emotions):
            drivers.append("Need for security and trust")

        return drivers if drivers else ["Authentic experiences", "Personal fulfillment"]

    def extract_behaviors(self, cluster: list[UserDataPoint]) -> dict:
        """Extract behavioral patterns from cluster."""
        booking_behaviors = Counter([u.booking_behavior for u in cluster if u.booking_behavior])
        session_durations = [u.session_duration_avg for u in cluster if u.session_duration_avg]

        # Aggregate feature usage
        feature_usage = {}
        for user in cluster:
            for feature, count in user.feature_usage.items():
                feature_usage[feature] = feature_usage.get(feature, 0) + count

        return {
            "primary_booking_style": booking_behaviors.most_common(1)[0][0] if booking_behaviors else "flexible",
            "avg_session_duration": f"{statistics.mean(session_durations):.1f} min" if session_durations else "Unknown",
            "top_features_used": sorted(feature_usage.items(), key=lambda x: x[1], reverse=True)[:5],
            "engagement_pattern": self._analyze_engagement(cluster)
        }

    def _analyze_engagement(self, cluster: list[UserDataPoint]) -> str:
        """Analyze engagement patterns."""
        nps_scores = [u.nps_score for u in cluster if u.nps_score is not None]
        if not nps_scores:
            return "Unknown"

        avg_nps = statistics.mean(nps_scores)
        return "Promoter" if avg_nps >= 9 else "Passive" if avg_nps >= 7 else "Detractor"

    def generate_scenarios(self, archetype: PersonaArchetype, behaviors: dict, psychographics: dict) -> list:
        """Generate usage scenarios based on archetype and behaviors."""
        scenarios = {
            PersonaArchetype.EXPLORER: [
                "Discovers an off-the-beaten-path destination through TravelMatch community",
                "Uses the app to find local experiences not in typical travel guides",
                "Connects with fellow adventurers for a spontaneous group trip"
            ],
            PersonaArchetype.CONNECTOR: [
                "Organizes a gift exchange with travel friends across different countries",
                "Uses the platform to maintain relationships with travelers met abroad",
                "Creates a travel group for like-minded individuals to plan together"
            ],
            PersonaArchetype.PLANNER: [
                "Meticulously reviews all trip details and itineraries weeks in advance",
                "Uses comparison features to evaluate multiple travel options",
                "Sets up detailed notifications for price drops and availability"
            ],
            PersonaArchetype.SPONTANEOUS: [
                "Books a last-minute trip after seeing an inspiring post",
                "Uses 'surprise me' features to discover unexpected destinations",
                "Quickly matches with available travel companions for weekend getaways"
            ],
            PersonaArchetype.CULTURE_SEEKER: [
                "Researches local customs and cultural experiences before visiting",
                "Seeks authentic local connections rather than tourist experiences",
                "Documents cultural discoveries to share with the community"
            ],
            PersonaArchetype.COMFORT_TRAVELER: [
                "Filters for high-quality, vetted accommodations and experiences",
                "Values premium features and personalized recommendations",
                "Prefers well-reviewed, trusted travel companions"
            ],
            PersonaArchetype.DIGITAL_NOMAD: [
                "Uses the platform while working remotely from various locations",
                "Connects with other remote workers for co-working travel",
                "Needs reliable mobile experience for on-the-go planning"
            ],
            PersonaArchetype.GIFT_ENTHUSIAST: [
                "Regularly browses and sends gifts to travel connections",
                "Uses gift features to maintain relationships across distances",
                "Curates wishlists and gift recommendations for special occasions"
            ]
        }

        return scenarios.get(archetype, ["Uses the platform for travel planning and social connection"])

    def generate_design_implications(self, archetype: PersonaArchetype, behaviors: dict, pain_points: list) -> list:
        """Generate actionable design implications."""
        implications = {
            PersonaArchetype.EXPLORER: [
                "Prioritize discovery and serendipity features in the UI",
                "Implement 'off-the-beaten-path' destination recommendations",
                "Design for mobile-first, on-the-go usage patterns",
                "Create community features for sharing unique finds"
            ],
            PersonaArchetype.CONNECTOR: [
                "Emphasize social features and connection-building tools",
                "Streamline gift-sending and receiving workflows",
                "Design notification systems for maintaining relationships",
                "Create group coordination and planning features"
            ],
            PersonaArchetype.PLANNER: [
                "Provide comprehensive filtering and comparison tools",
                "Implement detailed itinerary management features",
                "Design calendar integration and scheduling tools",
                "Create checklists and preparation tracking features"
            ],
            PersonaArchetype.SPONTANEOUS: [
                "Design for quick, frictionless booking flows",
                "Implement 'book now' prominent CTAs",
                "Create 'surprise me' and randomization features",
                "Minimize required fields and decision fatigue"
            ],
            PersonaArchetype.CULTURE_SEEKER: [
                "Provide rich cultural context and background information",
                "Connect users with local guides and authentic experiences",
                "Design content for depth and learning",
                "Create cultural exchange and learning features"
            ],
            PersonaArchetype.COMFORT_TRAVELER: [
                "Emphasize trust signals and verification badges",
                "Highlight premium and curated options prominently",
                "Design refined, elegant interface aesthetics",
                "Implement personalization and concierge features"
            ],
            PersonaArchetype.DIGITAL_NOMAD: [
                "Optimize for varying network conditions",
                "Design for extended, multi-destination trip planning",
                "Integrate work-friendly venue recommendations",
                "Create offline-capable features"
            ],
            PersonaArchetype.GIFT_ENTHUSIAST: [
                "Streamline gift discovery and selection process",
                "Design delightful gifting experience and animations",
                "Implement wishlists and gift tracking features",
                "Create gift recommendation algorithms"
            ]
        }

        base_implications = implications.get(archetype, [])

        # Add pain-point specific implications
        for pain in pain_points[:2]:
            pain_lower = pain.lower()
            if "trust" in pain_lower:
                base_implications.append("Add verification and trust indicators throughout the UI")
            if "complex" in pain_lower or "confus" in pain_lower:
                base_implications.append("Simplify navigation and reduce cognitive load")
            if "slow" in pain_lower:
                base_implications.append("Optimize performance and loading states")

        return base_implications[:6]

    def cluster_users(self) -> dict[PersonaArchetype, list[UserDataPoint]]:
        """Cluster users by identified archetype patterns."""
        clusters = {archetype: [] for archetype in PersonaArchetype}

        for user in self.users:
            # Score each user against each archetype
            best_archetype = self.identify_archetype([user])
            clusters[best_archetype].append(user)

        # Filter out empty clusters
        return {k: v for k, v in clusters.items() if v}

    def generate_personas(self, max_personas: int = 4) -> list[Persona]:
        """Generate personas from user data."""
        if not self.users:
            return []

        clusters = self.cluster_users()

        # Sort clusters by size and take top N
        sorted_clusters = sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True)[:max_personas]

        personas = []
        for archetype, cluster in sorted_clusters:
            if not cluster:
                continue

            demographics = self.extract_demographics(cluster)
            psychographics = self.extract_psychographics(cluster)
            behaviors = self.extract_behaviors(cluster)

            # Aggregate goals and pain points
            all_goals = []
            all_pain_points = []
            all_quotes = []
            for user in cluster:
                all_goals.extend(user.goals)
                all_pain_points.extend(user.pain_points)
                all_quotes.extend(user.interview_quotes)

            # Get most common goals and pain points
            top_goals = [g for g, _ in Counter(all_goals).most_common(5)]
            top_pain_points = [p for p, _ in Counter(all_pain_points).most_common(5)]

            # Select representative quotes
            selected_quotes = all_quotes[:3] if all_quotes else [
                f"As a {archetype.value.lower()}, I want meaningful travel experiences."
            ]

            # Generate name
            import random
            random.seed(hash(archetype.name))  # Consistent names per archetype
            name = random.choice(self.PERSONA_NAMES[archetype])

            persona = Persona(
                name=name,
                archetype=archetype.value,
                tagline=self._generate_tagline(archetype, psychographics),
                demographics=demographics,
                psychographics=psychographics,
                behaviors=behaviors,
                goals=top_goals if top_goals else ["Find authentic travel experiences"],
                pain_points=top_pain_points if top_pain_points else ["Finding trustworthy travel companions"],
                scenarios=self.generate_scenarios(archetype, behaviors, psychographics),
                design_implications=self.generate_design_implications(archetype, behaviors, top_pain_points),
                key_quotes=selected_quotes,
                confidence_score=self.calculate_confidence_score(len(cluster)),
                sample_size=len(cluster),
                generated_at=datetime.now().isoformat(),
                data_sources=["user_research", "behavioral_analytics", "interviews"]
            )

            personas.append(persona)

        return personas

    def _generate_tagline(self, archetype: PersonaArchetype, psychographics: dict) -> str:
        """Generate a memorable tagline for the persona."""
        taglines = {
            PersonaArchetype.EXPLORER: "Every destination is just the beginning of a new adventure",
            PersonaArchetype.CONNECTOR: "Travel is better when shared with the right people",
            PersonaArchetype.PLANNER: "A well-planned trip is a successful trip",
            PersonaArchetype.SPONTANEOUS: "The best trips are the ones you didn't plan",
            PersonaArchetype.CULTURE_SEEKER: "I travel not to escape life, but to understand it",
            PersonaArchetype.COMFORT_TRAVELER: "Life's too short for uncomfortable journeys",
            PersonaArchetype.DIGITAL_NOMAD: "My office has the best view in the world",
            PersonaArchetype.GIFT_ENTHUSIAST: "A thoughtful gift bridges any distance"
        }
        return taglines.get(archetype, "Travel opens minds and hearts")


def get_sample_data() -> list[dict]:
    """Provide sample user data for demonstration."""
    return [
        {
            "user_id": "user_001",
            "age": 28,
            "gender": "female",
            "location": "San Francisco, CA",
            "travel_frequency": 5,
            "preferred_destinations": ["Japan", "Thailand", "Portugal"],
            "travel_styles": ["adventure", "cultural", "solo"],
            "budget_range": "medium",
            "booking_behavior": "flexible",
            "social_engagement": 8,
            "gift_giving_frequency": 4,
            "pain_points": ["Finding authentic local experiences", "Language barriers"],
            "goals": ["Discover hidden gems", "Connect with locals", "Create lasting memories"],
            "tech_proficiency": 9,
            "interview_quotes": ["I want to feel like a local, not a tourist"],
            "session_duration_avg": 12.5,
            "feature_usage": {"discovery": 45, "matching": 30, "messaging": 25},
            "nps_score": 9
        },
        {
            "user_id": "user_002",
            "age": 35,
            "gender": "male",
            "location": "New York, NY",
            "travel_frequency": 3,
            "preferred_destinations": ["Italy", "France", "Spain"],
            "travel_styles": ["cultural", "relaxation"],
            "budget_range": "high",
            "booking_behavior": "early_planner",
            "social_engagement": 5,
            "gift_giving_frequency": 2,
            "pain_points": ["Too many options to choose from", "Trust in recommendations"],
            "goals": ["Experience world-class cuisine", "Relax and recharge"],
            "tech_proficiency": 7,
            "interview_quotes": ["I research for weeks before booking anything"],
            "session_duration_avg": 25.0,
            "feature_usage": {"search": 60, "reviews": 40, "bookmarks": 35},
            "nps_score": 8
        },
        {
            "user_id": "user_003",
            "age": 24,
            "gender": "female",
            "location": "Austin, TX",
            "travel_frequency": 8,
            "preferred_destinations": ["Bali", "Mexico", "Costa Rica"],
            "travel_styles": ["adventure", "social", "budget"],
            "budget_range": "low",
            "booking_behavior": "last_minute",
            "social_engagement": 9,
            "gift_giving_frequency": 6,
            "pain_points": ["Budget constraints", "Coordinating with groups"],
            "goals": ["Meet new people", "Have spontaneous adventures", "Share experiences"],
            "tech_proficiency": 8,
            "interview_quotes": ["The best trips happen when you just go for it"],
            "session_duration_avg": 8.0,
            "feature_usage": {"matching": 55, "messaging": 50, "groups": 40},
            "nps_score": 10
        },
        {
            "user_id": "user_004",
            "age": 45,
            "gender": "male",
            "location": "Chicago, IL",
            "travel_frequency": 2,
            "preferred_destinations": ["Hawaii", "Caribbean", "Mediterranean"],
            "travel_styles": ["relaxation", "luxury", "family"],
            "budget_range": "luxury",
            "booking_behavior": "early_planner",
            "social_engagement": 4,
            "gift_giving_frequency": 3,
            "pain_points": ["Finding family-friendly luxury options", "Reliability"],
            "goals": ["Quality family time", "Stress-free vacations", "Create family memories"],
            "tech_proficiency": 5,
            "interview_quotes": ["I want everything taken care of so I can focus on my family"],
            "session_duration_avg": 15.0,
            "feature_usage": {"search": 50, "reviews": 45, "favorites": 30},
            "nps_score": 7
        },
        {
            "user_id": "user_005",
            "age": 31,
            "gender": "non-binary",
            "location": "Portland, OR",
            "travel_frequency": 10,
            "preferred_destinations": ["Colombia", "Vietnam", "Portugal"],
            "travel_styles": ["solo", "adventure", "cultural"],
            "budget_range": "medium",
            "booking_behavior": "flexible",
            "social_engagement": 6,
            "gift_giving_frequency": 5,
            "pain_points": ["Unreliable WiFi", "Finding coworking spaces"],
            "goals": ["Work while traveling", "Experience new cultures", "Build remote community"],
            "tech_proficiency": 10,
            "interview_quotes": ["My laptop is my passport to freedom"],
            "session_duration_avg": 18.0,
            "feature_usage": {"discovery": 40, "workspaces": 35, "community": 30},
            "nps_score": 9
        },
        {
            "user_id": "user_006",
            "age": 29,
            "gender": "female",
            "location": "Denver, CO",
            "travel_frequency": 4,
            "preferred_destinations": ["Greece", "Morocco", "Peru"],
            "travel_styles": ["cultural", "adventure"],
            "budget_range": "medium",
            "booking_behavior": "flexible",
            "social_engagement": 7,
            "gift_giving_frequency": 8,
            "pain_points": ["Finding unique gifts abroad", "Shipping logistics"],
            "goals": ["Bring meaningful souvenirs", "Share travel experiences", "Connect through gifts"],
            "tech_proficiency": 7,
            "interview_quotes": ["The best gifts tell a story about where they came from"],
            "session_duration_avg": 14.0,
            "feature_usage": {"gifts": 60, "discovery": 35, "messaging": 30},
            "nps_score": 9
        }
    ]


def format_persona_output(persona: Persona) -> str:
    """Format persona for human-readable output."""
    output = []
    output.append("=" * 70)
    output.append(f"PERSONA: {persona.name} - {persona.archetype}")
    output.append("=" * 70)
    output.append(f"\nTagline: \"{persona.tagline}\"")
    output.append(f"Confidence Score: {persona.confidence_score}% (based on {persona.sample_size} users)")

    output.append("\n--- DEMOGRAPHICS ---")
    for key, value in persona.demographics.items():
        if value:
            output.append(f"  {key.replace('_', ' ').title()}: {value}")

    output.append("\n--- PSYCHOGRAPHICS ---")
    for key, value in persona.psychographics.items():
        if value:
            if isinstance(value, list):
                output.append(f"  {key.replace('_', ' ').title()}: {', '.join(value)}")
            elif isinstance(value, dict):
                output.append(f"  {key.replace('_', ' ').title()}:")
                for k, v in value.items():
                    output.append(f"    - {k}: {v}")
            else:
                output.append(f"  {key.replace('_', ' ').title()}: {value}")

    output.append("\n--- BEHAVIORS ---")
    for key, value in persona.behaviors.items():
        if value:
            if isinstance(value, list):
                output.append(f"  {key.replace('_', ' ').title()}:")
                for item in value[:3]:
                    if isinstance(item, tuple):
                        output.append(f"    - {item[0]}: {item[1]}")
                    else:
                        output.append(f"    - {item}")
            else:
                output.append(f"  {key.replace('_', ' ').title()}: {value}")

    output.append("\n--- GOALS ---")
    for goal in persona.goals:
        output.append(f"  - {goal}")

    output.append("\n--- PAIN POINTS ---")
    for pain in persona.pain_points:
        output.append(f"  - {pain}")

    output.append("\n--- KEY SCENARIOS ---")
    for scenario in persona.scenarios:
        output.append(f"  - {scenario}")

    output.append("\n--- DESIGN IMPLICATIONS ---")
    for impl in persona.design_implications:
        output.append(f"  * {impl}")

    output.append("\n--- KEY QUOTES ---")
    for quote in persona.key_quotes:
        output.append(f'  "{quote}"')

    output.append("\n")
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Generate data-driven user personas from research data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python persona_generator.py --sample           # Run with sample data
  python persona_generator.py --file data.json   # Load from JSON file
  python persona_generator.py --sample json      # Output as JSON

Input JSON format:
  [
    {
      "user_id": "user_001",
      "age": 28,
      "travel_styles": ["adventure", "cultural"],
      "goals": ["Discover new places"],
      ...
    }
  ]
        """
    )
    parser.add_argument("format", nargs="?", default="text",
                       choices=["text", "json"],
                       help="Output format (default: text)")
    parser.add_argument("--file", "-f", type=str,
                       help="Path to JSON file with user data")
    parser.add_argument("--sample", "-s", action="store_true",
                       help="Use sample data for demonstration")
    parser.add_argument("--max-personas", "-n", type=int, default=4,
                       help="Maximum number of personas to generate (default: 4)")

    args = parser.parse_args()

    # Load data
    if args.file:
        try:
            content = read_file_safely(args.file)
            data = json.loads(content)
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"Error: File '{args.file}' not found", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in '{args.file}': {e}", file=sys.stderr)
            sys.exit(1)
    elif args.sample:
        data = get_sample_data()
        if args.format == "text":
            print("Using sample data for demonstration...\n")
    else:
        # Read from stdin
        try:
            input_data = sys.stdin.read()
            if not input_data.strip():
                print("Error: No input data provided. Use --sample for demo or --file for file input.",
                      file=sys.stderr)
                sys.exit(1)
            data = json.load(json.loads(input_data))
        except json.JSONDecodeError:
            print("Error: Invalid JSON input", file=sys.stderr)
            sys.exit(1)

    # Generate personas
    generator = PersonaGenerator.from_json(data)
    personas = generator.generate_personas(max_personas=args.max_personas)

    if not personas:
        print("No personas could be generated from the provided data.", file=sys.stderr)
        sys.exit(1)

    # Output results
    if args.format == "json":
        output = {
            "personas": [asdict(p) for p in personas],
            "metadata": {
                "total_users_analyzed": len(data),
                "personas_generated": len(personas),
                "generated_at": datetime.now().isoformat()
            }
        }
        print(json.dumps(output, indent=2))
    else:
        print(f"\nGenerated {len(personas)} personas from {len(data)} user data points\n")
        for persona in personas:
            print(format_persona_output(persona))


if __name__ == "__main__":
    main()

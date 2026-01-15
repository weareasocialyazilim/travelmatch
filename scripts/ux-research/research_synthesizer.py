#!/usr/bin/env python3
"""
Research Synthesizer - Insight Extraction & Synthesis Tool

Synthesizes findings from multiple research sources into actionable insights.
Supports interview transcripts, survey data, usability test results, and
analytics data to generate comprehensive research reports.

Usage:
    python research_synthesizer.py --files *.json        # Synthesize multiple files
    python research_synthesizer.py --interview file.txt  # Analyze interview
    python research_synthesizer.py --sample              # Demo with sample data

Output Types:
    insights     - Key insights and themes
    affinity     - Affinity diagram data
    report       - Full research report
    quotes       - Key quote extraction

Author: Lovendo UX Team
"""

import argparse
import json
import re
import sys
import os
from collections import Counter
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Optional
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


class InsightType(Enum):
    BEHAVIOR = "behavior"
    NEED = "need"
    PAIN_POINT = "pain_point"
    OPPORTUNITY = "opportunity"
    PREFERENCE = "preference"
    MOTIVATION = "motivation"


class DataSourceType(Enum):
    INTERVIEW = "interview"
    SURVEY = "survey"
    USABILITY_TEST = "usability_test"
    ANALYTICS = "analytics"
    OBSERVATION = "observation"
    FEEDBACK = "feedback"


class InsightStrength(Enum):
    STRONG = "strong"  # Multiple sources, high frequency
    MODERATE = "moderate"  # Few sources but clear pattern
    EMERGING = "emerging"  # Single source but notable


@dataclass
class RawDataPoint:
    """Raw observation or data point from research."""
    source_id: str
    source_type: str
    participant_id: Optional[str]
    content: str
    context: Optional[str] = None
    timestamp: Optional[str] = None
    tags: list = field(default_factory=list)
    sentiment: Optional[str] = None  # positive, negative, neutral


@dataclass
class Theme:
    """Identified theme from research."""
    name: str
    description: str
    insight_type: str
    data_points: list
    frequency: int
    sources: list
    strength: str
    quotes: list


@dataclass
class Insight:
    """Synthesized insight from research."""
    id: str
    title: str
    description: str
    insight_type: str
    themes: list
    evidence_count: int
    confidence: float
    recommendations: list
    related_quotes: list
    affected_personas: list
    impact_areas: list


@dataclass
class ResearchReport:
    """Complete research synthesis report."""
    title: str
    objective: str
    methodology: list
    participants_summary: dict
    key_insights: list
    themes: list
    opportunities: list
    recommendations: list
    next_steps: list
    appendix: dict
    metadata: dict


class ResearchSynthesizer:
    """Main class for research synthesis operations."""

    # Keyword patterns for automatic categorization
    INSIGHT_PATTERNS = {
        InsightType.PAIN_POINT: [
            r"\b(frustrat|confus|difficult|hard|annoying|problem|issue|struggle|fail|error|bug)\w*\b",
            r"\b(can't|cannot|unable|impossible|never works)\b",
            r"\b(hate|dislike|terrible|awful|worst)\b"
        ],
        InsightType.NEED: [
            r"\b(need|want|wish|hope|would like|should have|must have)\b",
            r"\b(require|expect|looking for|searching for)\b",
            r"\b(missing|lacking|don't have)\b"
        ],
        InsightType.OPPORTUNITY: [
            r"\b(could|would be great|would help|might|possibility)\b",
            r"\b(improve|enhance|better if|idea for)\b",
            r"\b(suggest|recommend|propose)\b"
        ],
        InsightType.BEHAVIOR: [
            r"\b(always|usually|typically|often|sometimes|rarely|never)\b",
            r"\b(first thing|then|after that|before|when I)\b",
            r"\b(habit|routine|process|workflow)\b"
        ],
        InsightType.PREFERENCE: [
            r"\b(prefer|like|love|enjoy|favorite|best)\b",
            r"\b(rather|instead|better than|over)\b",
            r"\b(choose|pick|select|opt for)\b"
        ],
        InsightType.MOTIVATION: [
            r"\b(because|reason|why|goal|purpose|aim)\b",
            r"\b(want to|trying to|hoping to|planning to)\b",
            r"\b(motivated|driven|inspired)\b"
        ]
    }

    # Sentiment keywords
    SENTIMENT_PATTERNS = {
        "positive": [r"\b(love|great|amazing|excellent|perfect|easy|helpful|awesome|fantastic)\b"],
        "negative": [r"\b(hate|terrible|awful|horrible|frustrating|confusing|broken|useless)\b"],
        "neutral": []
    }

    # Theme clustering keywords for travel app
    THEME_CLUSTERS = {
        "Discovery & Exploration": ["discover", "explore", "find", "search", "browse", "look for"],
        "Social Connection": ["connect", "meet", "friend", "companion", "community", "social", "match"],
        "Trust & Safety": ["trust", "safe", "secure", "verify", "authentic", "reliable", "scam"],
        "Planning & Organization": ["plan", "organize", "schedule", "itinerary", "book", "reserve"],
        "Communication": ["message", "chat", "respond", "communicate", "notification", "contact"],
        "Personalization": ["personalize", "recommend", "suggestion", "preference", "customize", "tailor"],
        "Onboarding & Learning": ["learn", "understand", "onboard", "sign up", "start", "begin", "new user"],
        "Payment & Pricing": ["pay", "price", "cost", "expensive", "cheap", "budget", "money", "subscribe"],
        "Performance": ["slow", "fast", "load", "crash", "freeze", "lag", "performance", "speed"],
        "Navigation": ["find", "where", "navigate", "menu", "tab", "button", "back", "home"]
    }

    def __init__(self):
        """Initialize the synthesizer."""
        self.data_points = []
        self.themes = []
        self.insights = []

    def add_data_point(self, data: RawDataPoint):
        """Add a raw data point for synthesis."""
        # Auto-detect sentiment if not provided
        if not data.sentiment:
            data.sentiment = self._detect_sentiment(data.content)

        # Auto-tag if no tags provided
        if not data.tags:
            data.tags = self._auto_tag(data.content)

        self.data_points.append(data)

    def _detect_sentiment(self, text: str) -> str:
        """Detect sentiment from text content."""
        text_lower = text.lower()

        positive_count = sum(
            len(re.findall(pattern, text_lower))
            for pattern in self.SENTIMENT_PATTERNS["positive"]
        )
        negative_count = sum(
            len(re.findall(pattern, text_lower))
            for pattern in self.SENTIMENT_PATTERNS["negative"]
        )

        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        return "neutral"

    def _auto_tag(self, text: str) -> list:
        """Automatically generate tags based on content."""
        tags = []
        text_lower = text.lower()

        for theme, keywords in self.THEME_CLUSTERS.items():
            if any(keyword in text_lower for keyword in keywords):
                tags.append(theme)

        # Add insight type tags
        for insight_type, patterns in self.INSIGHT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    tags.append(insight_type.value)
                    break

        return list(set(tags))[:5]  # Limit to 5 tags

    def _categorize_insight_type(self, text: str) -> InsightType:
        """Categorize text into insight type."""
        text_lower = text.lower()
        scores = {insight_type: 0 for insight_type in InsightType}

        for insight_type, patterns in self.INSIGHT_PATTERNS.items():
            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                scores[insight_type] += len(matches)

        max_type = max(scores, key=scores.get)
        return max_type if scores[max_type] > 0 else InsightType.BEHAVIOR

    def analyze_interview(self, transcript: str, participant_id: str = "unknown") -> list:
        """Parse interview transcript and extract data points."""
        data_points = []

        # Split into sentences/statements
        sentences = re.split(r'[.!?]+', transcript)

        for i, sentence in enumerate(sentences):
            sentence = sentence.strip()
            if len(sentence) < 10:  # Skip very short sentences
                continue

            # Detect if this is an interviewer question or participant response
            is_question = sentence.endswith('?') or sentence.lower().startswith(('what', 'how', 'why', 'when', 'where', 'do you', 'can you', 'would you'))

            if not is_question:  # Focus on participant responses
                data_point = RawDataPoint(
                    source_id=f"interview_{participant_id}_{i}",
                    source_type=DataSourceType.INTERVIEW.value,
                    participant_id=participant_id,
                    content=sentence,
                    context=sentences[i-1].strip() if i > 0 else None,
                    sentiment=self._detect_sentiment(sentence),
                    tags=self._auto_tag(sentence)
                )
                data_points.append(data_point)
                self.add_data_point(data_point)

        return data_points

    def load_from_json(self, json_data: list) -> list:
        """Load data points from JSON format."""
        data_points = []
        for item in json_data:
            data_point = RawDataPoint(
                source_id=item.get("source_id", f"dp_{len(self.data_points)}"),
                source_type=item.get("source_type", "unknown"),
                participant_id=item.get("participant_id"),
                content=item.get("content", ""),
                context=item.get("context"),
                timestamp=item.get("timestamp"),
                tags=item.get("tags", []),
                sentiment=item.get("sentiment")
            )
            self.add_data_point(data_point)
            data_points.append(data_point)
        return data_points

    def identify_themes(self) -> list:
        """Identify themes from collected data points."""
        theme_data = {}

        for dp in self.data_points:
            for tag in dp.tags:
                if tag not in theme_data:
                    theme_data[tag] = {
                        "data_points": [],
                        "sources": set(),
                        "quotes": []
                    }
                theme_data[tag]["data_points"].append(dp)
                theme_data[tag]["sources"].add(dp.source_type)
                if len(dp.content) > 20 and len(dp.content) < 200:
                    theme_data[tag]["quotes"].append(dp.content)

        # Convert to Theme objects
        themes = []
        for tag, data in theme_data.items():
            frequency = len(data["data_points"])

            # Determine strength
            if frequency >= 5 and len(data["sources"]) >= 2:
                strength = InsightStrength.STRONG.value
            elif frequency >= 3:
                strength = InsightStrength.MODERATE.value
            else:
                strength = InsightStrength.EMERGING.value

            # Determine insight type
            insight_types = [self._categorize_insight_type(dp.content) for dp in data["data_points"]]
            primary_type = Counter([t.value for t in insight_types]).most_common(1)[0][0]

            theme = Theme(
                name=tag,
                description=self._generate_theme_description(tag, data["data_points"]),
                insight_type=primary_type,
                data_points=[asdict(dp) for dp in data["data_points"]],
                frequency=frequency,
                sources=list(data["sources"]),
                strength=strength,
                quotes=data["quotes"][:5]
            )
            themes.append(theme)

        self.themes = sorted(themes, key=lambda t: t.frequency, reverse=True)
        return self.themes

    def _generate_theme_description(self, theme_name: str, data_points: list) -> str:
        """Generate a description for a theme based on its data points."""
        sentiments = Counter([dp.sentiment for dp in data_points])
        primary_sentiment = sentiments.most_common(1)[0][0] if sentiments else "neutral"

        sentiment_phrase = {
            "positive": "Users express positive feelings about",
            "negative": "Users experience challenges with",
            "neutral": "Users have varied experiences with"
        }

        return f"{sentiment_phrase.get(primary_sentiment, 'Research indicates patterns in')} {theme_name.lower()}, based on {len(data_points)} observations."

    def synthesize_insights(self) -> list:
        """Synthesize themes into actionable insights."""
        if not self.themes:
            self.identify_themes()

        insights = []

        # Group themes by insight type
        type_groups = {}
        for theme in self.themes:
            itype = theme.insight_type
            if itype not in type_groups:
                type_groups[itype] = []
            type_groups[itype].append(theme)

        insight_counter = 1

        for insight_type, themes in type_groups.items():
            # Skip very weak themes
            strong_themes = [t for t in themes if t.strength in [InsightStrength.STRONG.value, InsightStrength.MODERATE.value]]

            if not strong_themes:
                continue

            # Generate insight from grouped themes
            total_evidence = sum(t.frequency for t in strong_themes)
            all_quotes = []
            for t in strong_themes:
                all_quotes.extend(t.quotes)

            confidence = min(0.95, 0.5 + (total_evidence * 0.05))

            insight = Insight(
                id=f"INS_{insight_counter:03d}",
                title=self._generate_insight_title(insight_type, strong_themes),
                description=self._generate_insight_description(insight_type, strong_themes),
                insight_type=insight_type,
                themes=[t.name for t in strong_themes],
                evidence_count=total_evidence,
                confidence=round(confidence, 2),
                recommendations=self._generate_recommendations(insight_type, strong_themes),
                related_quotes=all_quotes[:5],
                affected_personas=self._identify_affected_personas(strong_themes),
                impact_areas=self._identify_impact_areas(strong_themes)
            )
            insights.append(insight)
            insight_counter += 1

        self.insights = sorted(insights, key=lambda i: i.evidence_count, reverse=True)
        return self.insights

    def _generate_insight_title(self, insight_type: str, themes: list) -> str:
        """Generate a concise insight title."""
        theme_names = [t.name for t in themes[:2]]

        titles = {
            "pain_point": f"Users struggle with {' and '.join(theme_names).lower()}",
            "need": f"Users need better {' and '.join(theme_names).lower()}",
            "opportunity": f"Opportunity to improve {' and '.join(theme_names).lower()}",
            "behavior": f"User behavior pattern in {' and '.join(theme_names).lower()}",
            "preference": f"User preference for {' and '.join(theme_names).lower()}",
            "motivation": f"Key motivation around {' and '.join(theme_names).lower()}"
        }

        return titles.get(insight_type, f"Insight about {' and '.join(theme_names).lower()}")

    def _generate_insight_description(self, insight_type: str, themes: list) -> str:
        """Generate detailed insight description."""
        total_evidence = sum(t.frequency for t in themes)
        sources = set()
        for t in themes:
            sources.update(t.sources)

        return (
            f"Based on {total_evidence} observations from {len(sources)} data sources, "
            f"we identified a {insight_type.replace('_', ' ')} pattern related to "
            f"{', '.join([t.name for t in themes])}. "
            f"This insight has {themes[0].strength} evidence support."
        )

    def _generate_recommendations(self, insight_type: str, themes: list) -> list:
        """Generate recommendations based on insight type."""
        recommendations = {
            "pain_point": [
                "Conduct additional usability testing to quantify impact",
                "Prioritize UX improvements in affected areas",
                "Create design solutions addressing identified friction points",
                "Set up monitoring for error rates and user drop-off"
            ],
            "need": [
                "Add identified features to product roadmap",
                "Validate need with quantitative research (survey)",
                "Prototype solutions for user testing",
                "Assess technical feasibility of addressing this need"
            ],
            "opportunity": [
                "Explore design concepts addressing this opportunity",
                "Benchmark against competitor solutions",
                "Calculate potential impact on key metrics",
                "Create feature proposal with requirements"
            ],
            "behavior": [
                "Design features that support observed behavior patterns",
                "Avoid disrupting established user workflows",
                "Consider behavior in future feature design",
                "Document patterns for design team reference"
            ],
            "preference": [
                "Incorporate preferences into default settings",
                "Provide customization options where feasible",
                "Ensure design aligns with stated preferences",
                "Test variations to validate preferences"
            ],
            "motivation": [
                "Align marketing messaging with user motivations",
                "Design features that tap into key motivations",
                "Use motivations in user segmentation",
                "Create user stories based on motivations"
            ]
        }

        return recommendations.get(insight_type, [
            "Review finding with design team",
            "Prioritize based on impact and effort",
            "Create action items for follow-up"
        ])

    def _identify_affected_personas(self, themes: list) -> list:
        """Identify which personas are affected by these themes."""
        # Based on theme patterns, suggest affected personas
        personas = []

        all_theme_names = " ".join([t.name.lower() for t in themes])

        persona_patterns = {
            "The Explorer": ["discover", "explore", "adventure", "spontaneous"],
            "The Connector": ["social", "connection", "communication", "community"],
            "The Planner": ["planning", "organization", "schedule", "booking"],
            "The Gift Enthusiast": ["payment", "pricing", "gift"],
            "New Users": ["onboarding", "learning", "navigation", "trust"]
        }

        for persona, keywords in persona_patterns.items():
            if any(kw in all_theme_names for kw in keywords):
                personas.append(persona)

        return personas if personas else ["All Users"]

    def _identify_impact_areas(self, themes: list) -> list:
        """Identify product areas impacted by these themes."""
        areas = set()

        area_patterns = {
            "Onboarding Flow": ["onboarding", "learning", "sign up"],
            "Discovery Feature": ["discovery", "exploration", "search"],
            "Matching System": ["social", "connection", "matching"],
            "Trip Planning": ["planning", "organization"],
            "Messaging": ["communication", "chat"],
            "Navigation": ["navigation", "menu"],
            "Payment System": ["payment", "pricing"],
            "Performance": ["performance", "speed"],
            "Trust & Safety": ["trust", "safety", "security"]
        }

        for theme in themes:
            theme_lower = theme.name.lower()
            for area, keywords in area_patterns.items():
                if any(kw in theme_lower for kw in keywords):
                    areas.add(area)

        return list(areas) if areas else ["General UX"]

    def generate_affinity_diagram(self) -> dict:
        """Generate data structure for affinity diagram visualization."""
        if not self.themes:
            self.identify_themes()

        # Group themes by insight type
        affinity_groups = {}

        for theme in self.themes:
            itype = theme.insight_type
            if itype not in affinity_groups:
                affinity_groups[itype] = {
                    "name": itype.replace("_", " ").title(),
                    "themes": [],
                    "total_data_points": 0
                }

            affinity_groups[itype]["themes"].append({
                "name": theme.name,
                "frequency": theme.frequency,
                "strength": theme.strength,
                "sample_quotes": theme.quotes[:2]
            })
            affinity_groups[itype]["total_data_points"] += theme.frequency

        return {
            "groups": list(affinity_groups.values()),
            "total_themes": len(self.themes),
            "total_data_points": len(self.data_points)
        }

    def generate_report(self, title: str = "Research Synthesis Report", objective: str = "") -> ResearchReport:
        """Generate comprehensive research report."""
        if not self.insights:
            self.synthesize_insights()

        # Calculate participant summary
        participants = {}
        for dp in self.data_points:
            pid = dp.participant_id or "unknown"
            if pid not in participants:
                participants[pid] = {"count": 0, "sources": set()}
            participants[pid]["count"] += 1
            participants[pid]["sources"].add(dp.source_type)

        participant_summary = {
            "total_participants": len([p for p in participants.keys() if p != "unknown"]),
            "total_observations": len(self.data_points),
            "data_sources": list(set(dp.source_type for dp in self.data_points))
        }

        # Extract opportunities from insights
        opportunities = [
            {"insight_id": i.id, "title": i.title, "impact": i.impact_areas}
            for i in self.insights if i.insight_type == "opportunity"
        ]

        # Compile all recommendations
        all_recommendations = []
        for insight in self.insights:
            for rec in insight.recommendations[:2]:
                all_recommendations.append({
                    "recommendation": rec,
                    "insight_id": insight.id,
                    "priority": "High" if insight.evidence_count > 5 else "Medium"
                })

        # Generate next steps
        next_steps = [
            "Review insights with product and design teams",
            "Prioritize recommendations by impact and effort",
            "Create design sprints for high-priority pain points",
            "Set up follow-up research to validate solutions",
            "Track metrics related to identified issues"
        ]

        return ResearchReport(
            title=title,
            objective=objective or "Synthesize research findings into actionable insights",
            methodology=list(set(dp.source_type for dp in self.data_points)),
            participants_summary=participant_summary,
            key_insights=[asdict(i) for i in self.insights[:10]],
            themes=[asdict(t) for t in self.themes[:15]],
            opportunities=opportunities,
            recommendations=all_recommendations[:15],
            next_steps=next_steps,
            appendix={
                "all_quotes": [dp.content for dp in self.data_points if len(dp.content) > 30][:20],
                "theme_frequency": {t.name: t.frequency for t in self.themes}
            },
            metadata={
                "generated_at": datetime.now().isoformat(),
                "total_data_points": len(self.data_points),
                "total_themes": len(self.themes),
                "total_insights": len(self.insights)
            }
        )

    def extract_key_quotes(self, min_length: int = 30, max_length: int = 200) -> list:
        """Extract notable quotes from research data."""
        quotes = []

        for dp in self.data_points:
            if min_length <= len(dp.content) <= max_length:
                quotes.append({
                    "quote": dp.content,
                    "source": dp.source_type,
                    "participant": dp.participant_id,
                    "sentiment": dp.sentiment,
                    "tags": dp.tags
                })

        # Sort by sentiment (negative first as they're often more actionable)
        sentiment_order = {"negative": 0, "neutral": 1, "positive": 2}
        quotes.sort(key=lambda q: sentiment_order.get(q["sentiment"], 1))

        return quotes


def get_sample_data() -> list:
    """Provide sample research data for demonstration."""
    return [
        {
            "source_id": "int_001",
            "source_type": "interview",
            "participant_id": "P1",
            "content": "I love discovering new destinations, but sometimes the app feels slow when loading images",
            "sentiment": "neutral"
        },
        {
            "source_id": "int_002",
            "source_type": "interview",
            "participant_id": "P1",
            "content": "Finding travel companions is the main reason I use the app, but I wish I could filter by travel dates",
            "sentiment": "positive"
        },
        {
            "source_id": "int_003",
            "source_type": "interview",
            "participant_id": "P2",
            "content": "The matching feature is confusing at first, I didn't understand what the compatibility score meant",
            "sentiment": "negative"
        },
        {
            "source_id": "int_004",
            "source_type": "interview",
            "participant_id": "P2",
            "content": "I always check traveler stories before deciding on a destination, they feel more authentic than reviews",
            "sentiment": "positive"
        },
        {
            "source_id": "sur_001",
            "source_type": "survey",
            "participant_id": "S1",
            "content": "Need better notification settings, I get too many messages",
            "sentiment": "negative"
        },
        {
            "source_id": "sur_002",
            "source_type": "survey",
            "participant_id": "S2",
            "content": "The trip planning feature is great but I want to share itineraries with friends outside the app",
            "sentiment": "positive"
        },
        {
            "source_id": "sur_003",
            "source_type": "survey",
            "participant_id": "S3",
            "content": "I don't trust profiles without verified photos, hard to know if people are real",
            "sentiment": "negative"
        },
        {
            "source_id": "ut_001",
            "source_type": "usability_test",
            "participant_id": "UT1",
            "content": "Participant struggled to find the budget filter, looked in wrong menu first",
            "sentiment": "negative"
        },
        {
            "source_id": "ut_002",
            "source_type": "usability_test",
            "participant_id": "UT1",
            "content": "Successfully saved destination to wishlist on first try, mentioned liking the heart icon",
            "sentiment": "positive"
        },
        {
            "source_id": "ut_003",
            "source_type": "usability_test",
            "participant_id": "UT2",
            "content": "Got confused during onboarding, skipped travel preferences quiz accidentally",
            "sentiment": "negative"
        },
        {
            "source_id": "fb_001",
            "source_type": "feedback",
            "participant_id": None,
            "content": "Please add dark mode, using the app at night is hard on my eyes",
            "sentiment": "negative"
        },
        {
            "source_id": "fb_002",
            "source_type": "feedback",
            "participant_id": None,
            "content": "Love the gift feature! Sent a surprise to my travel buddy and they were so happy",
            "sentiment": "positive"
        },
        {
            "source_id": "an_001",
            "source_type": "analytics",
            "participant_id": None,
            "content": "High drop-off rate at payment screen, users abandoning cart at 35% rate",
            "sentiment": "negative"
        },
        {
            "source_id": "an_002",
            "source_type": "analytics",
            "participant_id": None,
            "content": "Discovery feature has highest engagement, users spend average 8 minutes browsing",
            "sentiment": "positive"
        }
    ]


def format_report_output(report: ResearchReport) -> str:
    """Format research report for human-readable output."""
    output = []
    output.append("=" * 80)
    output.append(f"RESEARCH SYNTHESIS REPORT: {report.title}")
    output.append("=" * 80)

    output.append(f"\nObjective: {report.objective}")
    output.append(f"Methodology: {', '.join(report.methodology)}")

    output.append("\n--- PARTICIPANTS SUMMARY ---")
    for key, value in report.participants_summary.items():
        output.append(f"  {key.replace('_', ' ').title()}: {value}")

    output.append("\n--- KEY INSIGHTS ---")
    for i, insight in enumerate(report.key_insights[:5], 1):
        output.append(f"\n{i}. {insight['title']}")
        output.append(f"   Type: {insight['insight_type'].replace('_', ' ').title()}")
        output.append(f"   Evidence: {insight['evidence_count']} observations")
        output.append(f"   Confidence: {insight['confidence']*100:.0f}%")
        output.append(f"   Impact Areas: {', '.join(insight['impact_areas'])}")
        if insight['related_quotes']:
            output.append(f'   Quote: "{insight["related_quotes"][0][:100]}..."')

    output.append("\n--- TOP THEMES ---")
    for theme in report.themes[:8]:
        strength_icon = {"strong": "[+++]", "moderate": "[++]", "emerging": "[+]"}
        output.append(f"  {strength_icon.get(theme['strength'], '')} {theme['name']} ({theme['frequency']} observations)")

    output.append("\n--- RECOMMENDATIONS ---")
    for rec in report.recommendations[:8]:
        output.append(f"  [{rec['priority']}] {rec['recommendation']}")

    output.append("\n--- NEXT STEPS ---")
    for step in report.next_steps:
        output.append(f"  - {step}")

    output.append("\n--- METADATA ---")
    output.append(f"  Generated: {report.metadata['generated_at']}")
    output.append(f"  Total Data Points: {report.metadata['total_data_points']}")
    output.append(f"  Total Themes: {report.metadata['total_themes']}")
    output.append(f"  Total Insights: {report.metadata['total_insights']}")

    output.append("\n")
    return "\n".join(output)


def format_insights_output(insights: list) -> str:
    """Format insights for human-readable output."""
    output = []
    output.append("=" * 70)
    output.append("SYNTHESIZED INSIGHTS")
    output.append("=" * 70)

    for i, insight in enumerate(insights, 1):
        output.append(f"\n--- INSIGHT {i}: {insight.id} ---")
        output.append(f"Title: {insight.title}")
        output.append(f"Type: {insight.insight_type.replace('_', ' ').title()}")
        output.append(f"Evidence Count: {insight.evidence_count}")
        output.append(f"Confidence: {insight.confidence*100:.0f}%")
        output.append(f"\nDescription: {insight.description}")
        output.append(f"\nRelated Themes: {', '.join(insight.themes)}")
        output.append(f"Impact Areas: {', '.join(insight.impact_areas)}")
        output.append(f"Affected Personas: {', '.join(insight.affected_personas)}")

        if insight.related_quotes:
            output.append("\nSupporting Quotes:")
            for quote in insight.related_quotes[:3]:
                output.append(f'  - "{quote}"')

        output.append("\nRecommendations:")
        for rec in insight.recommendations[:3]:
            output.append(f"  - {rec}")

    output.append("\n")
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Research Synthesis Tool for Lovendo",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python research_synthesizer.py --sample                    # Demo with sample data
  python research_synthesizer.py --files data.json           # Synthesize from file
  python research_synthesizer.py --interview transcript.txt  # Analyze interview
  python research_synthesizer.py --sample --output affinity  # Affinity diagram data

Output Types:
  report       Full research synthesis report
  insights     Key insights extraction
  affinity     Affinity diagram data structure
  quotes       Notable quotes collection
        """
    )
    parser.add_argument("format", nargs="?", default="text",
                       choices=["text", "json"],
                       help="Output format (default: text)")
    parser.add_argument("--files", "-f", nargs="+",
                       help="JSON files containing research data")
    parser.add_argument("--interview", "-i", type=str,
                       help="Interview transcript text file")
    parser.add_argument("--sample", "-s", action="store_true",
                       help="Use sample data for demonstration")
    parser.add_argument("--output", "-o", type=str, default="report",
                       choices=["report", "insights", "affinity", "quotes"],
                       help="Type of output to generate (default: report)")

    args = parser.parse_args()

    synthesizer = ResearchSynthesizer()

    # Load data
    if args.files:
        for file_path in args.files:
            try:
                # Security: read_file_safely internally validates via validate_safe_path
                # Path traversal is prevented by validate_safe_path validation
                content = read_file_safely(file_path)  # noqa: S110
                data = json.loads(content)
                synthesizer.load_from_json(data if isinstance(data, list) else [data])
            except ValueError as e:
                print(f"Warning: {e}, skipping", file=sys.stderr)
            except FileNotFoundError:
                print(f"Warning: File '{file_path}' not found, skipping", file=sys.stderr)
            except json.JSONDecodeError as e:
                print(f"Warning: Invalid JSON in '{file_path}': {e}, skipping", file=sys.stderr)
    elif args.interview:
        try:
            content = read_file_safely(args.interview)
            synthesizer.analyze_interview(content)
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"Error: File '{args.interview}' not found", file=sys.stderr)
            sys.exit(1)
    elif args.sample:
        data = get_sample_data()
        synthesizer.load_from_json(data)
        if args.format == "text":
            print("Using sample data for demonstration...\n")
    else:
        print("Error: No input provided. Use --sample for demo, --files for JSON, or --interview for transcript.",
              file=sys.stderr)
        sys.exit(1)

    # Generate output
    if args.output == "report":
        report = synthesizer.generate_report()
        if args.format == "json":
            print(json.dumps(asdict(report), indent=2))
        else:
            print(format_report_output(report))

    elif args.output == "insights":
        insights = synthesizer.synthesize_insights()
        if args.format == "json":
            print(json.dumps([asdict(i) for i in insights], indent=2))
        else:
            print(format_insights_output(insights))

    elif args.output == "affinity":
        affinity = synthesizer.generate_affinity_diagram()
        print(json.dumps(affinity, indent=2))

    elif args.output == "quotes":
        quotes = synthesizer.extract_key_quotes()
        if args.format == "json":
            print(json.dumps(quotes, indent=2))
        else:
            print("=" * 60)
            print("KEY QUOTES FROM RESEARCH")
            print("=" * 60)
            for q in quotes[:15]:
                sentiment_icon = {"positive": "+", "negative": "-", "neutral": "o"}
                print(f"\n[{sentiment_icon.get(q['sentiment'], '?')}] \"{q['quote']}\"")
                print(f"    Source: {q['source']}, Tags: {', '.join(q['tags'][:3])}")


if __name__ == "__main__":
    main()

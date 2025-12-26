#!/usr/bin/env python3
"""
Usability Testing Framework - Comprehensive Testing Toolkit

Creates and manages usability testing sessions for TravelMatch.
Generates test plans, tasks, metrics tracking, and result analysis.

Usage:
    python usability_testing.py --plan <flow>           # Generate test plan
    python usability_testing.py --analyze results.json  # Analyze test results
    python usability_testing.py --template              # Export blank template
    python usability_testing.py --list                  # List available flows

Test Types:
    moderated     - In-person or remote moderated sessions
    unmoderated   - Remote asynchronous testing
    guerrilla     - Quick informal testing
    benchmark     - Standardized comparative testing

Author: TravelMatch UX Team
"""

import argparse
import json
import sys
import os
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
    target = (base / filepath).resolve()
    
    # Strict check: target must be within base directory
    try:
        target.relative_to(base)
    except ValueError:
        raise ValueError(f"Path '{filepath}' would escape the base directory")
    
    return str(target)


def read_file_safely(filepath: str, base_dir: str = None) -> str:
    """
    Safely read a file after validating the path.
    This function combines path validation and file reading to ensure
    no path traversal attacks are possible.
    """
    safe_path = validate_safe_path(filepath, base_dir)
    with open(safe_path, 'r', encoding='utf-8') as f:
        return f.read()


class TestType(Enum):
    MODERATED = "moderated"
    UNMODERATED = "unmoderated"
    GUERRILLA = "guerrilla"
    BENCHMARK = "benchmark"


class TaskDifficulty(Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class MetricType(Enum):
    TIME_ON_TASK = "time_on_task"
    SUCCESS_RATE = "success_rate"
    ERROR_COUNT = "error_count"
    SATISFACTION = "satisfaction"
    EASE_OF_USE = "ease_of_use"
    LIKELIHOOD_TO_RECOMMEND = "likelihood_to_recommend"


@dataclass
class TestTask:
    """Represents a single usability test task."""
    id: str
    name: str
    description: str
    scenario: str
    success_criteria: list
    difficulty: str
    expected_duration: str
    flow: str
    metrics_to_capture: list = field(default_factory=list)
    hints_allowed: bool = True
    max_hints: int = 2


@dataclass
class TestResult:
    """Results from a single task completion."""
    task_id: str
    participant_id: str
    success: bool
    time_taken_seconds: int
    error_count: int
    hints_used: int
    satisfaction_score: Optional[int] = None  # 1-7 scale
    ease_score: Optional[int] = None  # 1-7 scale
    observations: list = field(default_factory=list)
    quotes: list = field(default_factory=list)


@dataclass
class Participant:
    """Test participant information."""
    id: str
    age_range: str
    tech_proficiency: str  # "low", "medium", "high"
    travel_frequency: str  # "rare", "occasional", "frequent"
    platform_familiarity: str  # "new", "returning", "power_user"
    persona_match: Optional[str] = None


@dataclass
class TestPlan:
    """Complete usability test plan."""
    name: str
    objective: str
    test_type: str
    target_participants: int
    participant_criteria: dict
    tasks: list
    pre_test_questions: list
    post_test_questions: list
    metrics: list
    equipment_needed: list
    estimated_duration: str
    methodology_notes: list
    metadata: dict


@dataclass
class TestAnalysis:
    """Analysis results from completed testing."""
    test_name: str
    participants_tested: int
    overall_success_rate: float
    average_task_time: float
    system_usability_score: Optional[float]
    task_results: list
    key_findings: list
    recommendations: list
    severity_ratings: list
    metadata: dict


class UsabilityTestingFramework:
    """Main class for usability testing operations."""

    # Pre-defined test task templates for TravelMatch flows
    TASK_TEMPLATES = {
        "onboarding": [
            {
                "id": "onb_01",
                "name": "Complete Sign Up",
                "description": "Create a new TravelMatch account",
                "scenario": "You just heard about TravelMatch from a friend and want to try it out. Download the app and create an account.",
                "success_criteria": [
                    "Account successfully created",
                    "Reached profile setup screen",
                    "No critical errors encountered"
                ],
                "difficulty": "easy",
                "expected_duration": "3-5 minutes",
                "flow": "onboarding",
                "metrics_to_capture": ["time_on_task", "success_rate", "error_count"]
            },
            {
                "id": "onb_02",
                "name": "Set Up Profile",
                "description": "Complete basic profile information",
                "scenario": "Now that you have an account, add your profile photo and basic information so other travelers can learn about you.",
                "success_criteria": [
                    "Profile photo uploaded",
                    "Bio filled in",
                    "Profile completion above 50%"
                ],
                "difficulty": "easy",
                "expected_duration": "2-4 minutes",
                "flow": "onboarding",
                "metrics_to_capture": ["time_on_task", "success_rate", "satisfaction"]
            },
            {
                "id": "onb_03",
                "name": "Complete Travel Preferences",
                "description": "Set travel style and destination preferences",
                "scenario": "Tell TravelMatch about your travel style and what kind of trips interest you so we can find you great matches.",
                "success_criteria": [
                    "All preference questions answered",
                    "At least 3 travel styles selected",
                    "Preference quiz completed"
                ],
                "difficulty": "medium",
                "expected_duration": "3-5 minutes",
                "flow": "onboarding",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            }
        ],
        "discovery": [
            {
                "id": "disc_01",
                "name": "Find a Specific Destination",
                "description": "Search for and view details about Japan",
                "scenario": "You're planning a trip to Japan next spring. Find Japan in the app and view what activities and experiences are available there.",
                "success_criteria": [
                    "Successfully navigated to search/discovery",
                    "Found Japan destination",
                    "Viewed destination details page"
                ],
                "difficulty": "easy",
                "expected_duration": "1-2 minutes",
                "flow": "discovery",
                "metrics_to_capture": ["time_on_task", "success_rate", "error_count"]
            },
            {
                "id": "disc_02",
                "name": "Filter Destinations by Budget",
                "description": "Find budget-friendly destinations",
                "scenario": "You want to travel somewhere affordable. Filter the destinations to show only budget-friendly options under $1000.",
                "success_criteria": [
                    "Found filter controls",
                    "Successfully applied budget filter",
                    "Results updated to show filtered options"
                ],
                "difficulty": "medium",
                "expected_duration": "1-3 minutes",
                "flow": "discovery",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            },
            {
                "id": "disc_03",
                "name": "Save Destination to Wishlist",
                "description": "Save an interesting destination for later",
                "scenario": "You found a destination that looks interesting but you're not ready to plan yet. Save it to your wishlist so you can find it later.",
                "success_criteria": [
                    "Found save/wishlist button",
                    "Successfully saved destination",
                    "Can locate saved item in wishlist"
                ],
                "difficulty": "easy",
                "expected_duration": "1-2 minutes",
                "flow": "discovery",
                "metrics_to_capture": ["time_on_task", "success_rate"]
            },
            {
                "id": "disc_04",
                "name": "Read Traveler Stories",
                "description": "Find and read experiences from other travelers",
                "scenario": "Before deciding on a destination, you want to read what other travelers experienced there. Find and read traveler stories about your saved destination.",
                "success_criteria": [
                    "Located traveler stories section",
                    "Successfully opened and read a story",
                    "Understood the content format"
                ],
                "difficulty": "medium",
                "expected_duration": "2-4 minutes",
                "flow": "discovery",
                "metrics_to_capture": ["time_on_task", "success_rate", "satisfaction"]
            }
        ],
        "matching": [
            {
                "id": "match_01",
                "name": "Enter Matching Mode",
                "description": "Start looking for travel companions",
                "scenario": "You want to find people to travel with. Navigate to the matching feature and start browsing potential travel companions.",
                "success_criteria": [
                    "Found matching/companion feature",
                    "Match queue loaded successfully",
                    "Understood how to interact with matches"
                ],
                "difficulty": "easy",
                "expected_duration": "1-2 minutes",
                "flow": "matching",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            },
            {
                "id": "match_02",
                "name": "Review and Decide on Match",
                "description": "Evaluate a potential travel companion's profile",
                "scenario": "You see someone who might be a good travel companion. Review their profile and decide whether to connect with them.",
                "success_criteria": [
                    "Viewed full profile information",
                    "Understood compatibility indicators",
                    "Made a decision (like or pass)"
                ],
                "difficulty": "easy",
                "expected_duration": "2-3 minutes",
                "flow": "matching",
                "metrics_to_capture": ["time_on_task", "success_rate", "satisfaction"]
            },
            {
                "id": "match_03",
                "name": "Send First Message",
                "description": "Start a conversation with a new match",
                "scenario": "You've matched with someone! Start a conversation with them about planning a trip together.",
                "success_criteria": [
                    "Found the chat/messaging feature",
                    "Successfully sent a message",
                    "Message was delivered"
                ],
                "difficulty": "medium",
                "expected_duration": "2-4 minutes",
                "flow": "matching",
                "metrics_to_capture": ["time_on_task", "success_rate", "error_count"]
            },
            {
                "id": "match_04",
                "name": "View Match History",
                "description": "Find previous matches and conversations",
                "scenario": "You want to revisit a conversation with someone you matched with last week. Find your match history and locate that conversation.",
                "success_criteria": [
                    "Located match history/conversations list",
                    "Found the specific conversation",
                    "Could continue the conversation"
                ],
                "difficulty": "medium",
                "expected_duration": "1-3 minutes",
                "flow": "matching",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            }
        ],
        "trip_planning": [
            {
                "id": "plan_01",
                "name": "Create New Trip",
                "description": "Start planning a new trip",
                "scenario": "You and a travel companion want to plan a trip to Barcelona next month. Create a new trip plan in the app.",
                "success_criteria": [
                    "Found trip creation feature",
                    "Successfully created new trip",
                    "Basic trip details entered"
                ],
                "difficulty": "medium",
                "expected_duration": "2-4 minutes",
                "flow": "trip_planning",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            },
            {
                "id": "plan_02",
                "name": "Invite Companion to Trip",
                "description": "Add a travel companion to the trip",
                "scenario": "Invite your matched travel companion to join the Barcelona trip so you can plan together.",
                "success_criteria": [
                    "Found invite/add member feature",
                    "Successfully sent invitation",
                    "Invitation status visible"
                ],
                "difficulty": "medium",
                "expected_duration": "1-3 minutes",
                "flow": "trip_planning",
                "metrics_to_capture": ["time_on_task", "success_rate", "error_count"]
            },
            {
                "id": "plan_03",
                "name": "Add Activity to Itinerary",
                "description": "Add a specific activity to the trip",
                "scenario": "You want to visit the Sagrada Familia. Add this activity to your trip itinerary for a specific day.",
                "success_criteria": [
                    "Found itinerary/activities section",
                    "Successfully added activity",
                    "Activity shows on correct day"
                ],
                "difficulty": "medium",
                "expected_duration": "2-4 minutes",
                "flow": "trip_planning",
                "metrics_to_capture": ["time_on_task", "success_rate", "satisfaction"]
            },
            {
                "id": "plan_04",
                "name": "Set Trip Budget",
                "description": "Configure budget tracking for the trip",
                "scenario": "You want to track expenses for this trip. Set up a budget of $2,000 and add your first expected expense.",
                "success_criteria": [
                    "Found budget feature",
                    "Successfully set budget limit",
                    "Added at least one expense"
                ],
                "difficulty": "hard",
                "expected_duration": "3-5 minutes",
                "flow": "trip_planning",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            }
        ],
        "gifting": [
            {
                "id": "gift_01",
                "name": "Browse Gift Catalog",
                "description": "Explore available gift options",
                "scenario": "You want to send a thank-you gift to a travel companion. Browse the gift catalog to see what's available.",
                "success_criteria": [
                    "Found gifting/gift section",
                    "Successfully browsed gift options",
                    "Understood gift categories"
                ],
                "difficulty": "easy",
                "expected_duration": "2-3 minutes",
                "flow": "gifting",
                "metrics_to_capture": ["time_on_task", "success_rate", "satisfaction"]
            },
            {
                "id": "gift_02",
                "name": "Send a Gift",
                "description": "Complete the gift sending process",
                "scenario": "Select a gift under $30 and send it to your travel companion with a personal message.",
                "success_criteria": [
                    "Selected appropriate gift",
                    "Added personal message",
                    "Completed payment flow",
                    "Gift sent confirmation received"
                ],
                "difficulty": "medium",
                "expected_duration": "3-5 minutes",
                "flow": "gifting",
                "metrics_to_capture": ["time_on_task", "success_rate", "error_count", "satisfaction"]
            },
            {
                "id": "gift_03",
                "name": "View Gift History",
                "description": "Find past gift transactions",
                "scenario": "You want to see what gifts you've sent and received in the past. Find your gift history.",
                "success_criteria": [
                    "Found gift history section",
                    "Could see sent gifts",
                    "Could see received gifts"
                ],
                "difficulty": "easy",
                "expected_duration": "1-2 minutes",
                "flow": "gifting",
                "metrics_to_capture": ["time_on_task", "success_rate", "ease_of_use"]
            }
        ]
    }

    # Standard post-test questionnaire (System Usability Scale)
    SUS_QUESTIONS = [
        "I think that I would like to use this system frequently.",
        "I found the system unnecessarily complex.",
        "I thought the system was easy to use.",
        "I think that I would need the support of a technical person to be able to use this system.",
        "I found the various functions in this system were well integrated.",
        "I thought there was too much inconsistency in this system.",
        "I would imagine that most people would learn to use this system very quickly.",
        "I found the system very cumbersome to use.",
        "I felt very confident using the system.",
        "I needed to learn a lot of things before I could get going with this system."
    ]

    PRE_TEST_QUESTIONS = [
        {
            "question": "How often do you travel for leisure?",
            "type": "single_choice",
            "options": ["Rarely (0-1 trips/year)", "Occasionally (2-3 trips/year)", "Frequently (4+ trips/year)"]
        },
        {
            "question": "Have you used travel companion/matching apps before?",
            "type": "single_choice",
            "options": ["Never", "Once or twice", "Several times", "Regularly"]
        },
        {
            "question": "How comfortable are you with mobile apps in general?",
            "type": "scale",
            "scale_range": [1, 7],
            "labels": ["Not at all comfortable", "Very comfortable"]
        },
        {
            "question": "What do you primarily use when planning trips?",
            "type": "multi_choice",
            "options": ["Travel apps", "Travel websites", "Travel agents", "Social media", "Friends/family recommendations"]
        }
    ]

    POST_TASK_QUESTIONS = [
        {
            "question": "How easy was it to complete this task?",
            "type": "scale",
            "scale_range": [1, 7],
            "labels": ["Very difficult", "Very easy"]
        },
        {
            "question": "How satisfied are you with the time it took to complete this task?",
            "type": "scale",
            "scale_range": [1, 7],
            "labels": ["Very dissatisfied", "Very satisfied"]
        }
    ]

    def __init__(self, flow: Optional[str] = None, test_type: TestType = TestType.MODERATED):
        """Initialize with optional flow and test type."""
        self.flow = flow
        self.test_type = test_type

    def get_tasks_for_flow(self, flow: str) -> list:
        """Get test tasks for a specific flow."""
        if flow == "all":
            all_tasks = []
            for tasks in self.TASK_TEMPLATES.values():
                all_tasks.extend(tasks)
            return all_tasks
        return self.TASK_TEMPLATES.get(flow, [])

    def generate_test_plan(self, flow: str, target_participants: int = 5) -> TestPlan:
        """Generate a complete usability test plan."""
        tasks = self.get_tasks_for_flow(flow)

        if not tasks:
            raise ValueError(f"Unknown flow: {flow}. Available: {list(self.TASK_TEMPLATES.keys())}, all")

        task_objects = [
            TestTask(
                id=t["id"],
                name=t["name"],
                description=t["description"],
                scenario=t["scenario"],
                success_criteria=t["success_criteria"],
                difficulty=t["difficulty"],
                expected_duration=t["expected_duration"],
                flow=t["flow"],
                metrics_to_capture=t["metrics_to_capture"]
            )
            for t in tasks
        ]

        # Calculate estimated duration
        total_task_time = len(tasks) * 5  # Average 5 min per task
        estimated_duration = f"{total_task_time + 20} minutes"  # Add 20 for intro/outro

        flow_name = flow.replace("_", " ").title()

        return TestPlan(
            name=f"TravelMatch {flow_name} Usability Test",
            objective=f"Evaluate the usability of the {flow_name} flow and identify areas for improvement",
            test_type=self.test_type.value,
            target_participants=target_participants,
            participant_criteria={
                "age_range": "18-55",
                "travel_frequency": "At least 1 trip per year",
                "smartphone_usage": "Daily smartphone user",
                "app_familiarity": "Mix of new and returning users",
                "exclusions": ["TravelMatch employees", "UX professionals", "Direct competitors"]
            },
            tasks=[asdict(t) for t in task_objects],
            pre_test_questions=self.PRE_TEST_QUESTIONS,
            post_test_questions=[{"question": q, "type": "scale", "scale_range": [1, 5]} for q in self.SUS_QUESTIONS],
            metrics=[
                {"name": "Task Success Rate", "target": "≥80%", "calculation": "completed_tasks / total_tasks"},
                {"name": "Time on Task", "target": "Within expected duration", "calculation": "average_completion_time"},
                {"name": "Error Rate", "target": "<2 errors per task", "calculation": "total_errors / total_tasks"},
                {"name": "System Usability Score", "target": "≥70", "calculation": "SUS calculation method"},
                {"name": "Task Ease Rating", "target": "≥5.5/7", "calculation": "average_ease_rating"}
            ],
            equipment_needed=[
                "Test device (iOS and Android smartphones)",
                "Screen recording software (with participant consent)",
                "Note-taking template",
                "Timer/stopwatch",
                "Recording consent forms",
                "Participant compensation",
                "Prototype or live app build"
            ],
            estimated_duration=estimated_duration,
            methodology_notes=[
                "Use think-aloud protocol for moderated sessions",
                "Avoid leading questions or providing assistance unless asked",
                "Record observations immediately after each task",
                "Note both verbal and non-verbal cues",
                "Maintain neutral facial expressions and tone",
                "Ask follow-up questions about observed behaviors"
            ],
            metadata={
                "generated_at": datetime.now().isoformat(),
                "total_tasks": len(tasks),
                "flow": flow,
                "version": "1.0"
            }
        )

    def calculate_sus_score(self, responses: list[int]) -> float:
        """
        Calculate System Usability Scale score.
        Responses should be list of 10 values from 1-5.
        """
        if len(responses) != 10:
            raise ValueError("SUS requires exactly 10 responses")

        adjusted_scores = []
        for i, response in enumerate(responses):
            if i % 2 == 0:  # Odd items (0, 2, 4, 6, 8)
                adjusted_scores.append(response - 1)
            else:  # Even items (1, 3, 5, 7, 9)
                adjusted_scores.append(5 - response)

        return sum(adjusted_scores) * 2.5

    def analyze_results(self, results_data: dict) -> TestAnalysis:
        """Analyze completed test results."""
        participants = results_data.get("participants", [])
        task_results_raw = results_data.get("task_results", [])
        sus_responses = results_data.get("sus_responses", [])

        # Group results by task
        task_groups = {}
        for result in task_results_raw:
            task_id = result.get("task_id")
            if task_id not in task_groups:
                task_groups[task_id] = []
            task_groups[task_id].append(TestResult(
                task_id=result.get("task_id"),
                participant_id=result.get("participant_id"),
                success=result.get("success", False),
                time_taken_seconds=result.get("time_taken_seconds", 0),
                error_count=result.get("error_count", 0),
                hints_used=result.get("hints_used", 0),
                satisfaction_score=result.get("satisfaction_score"),
                ease_score=result.get("ease_score"),
                observations=result.get("observations", []),
                quotes=result.get("quotes", [])
            ))

        # Analyze each task
        task_analyses = []
        all_successes = []
        all_times = []
        all_errors = []

        for task_id, results in task_groups.items():
            successes = [r.success for r in results]
            times = [r.time_taken_seconds for r in results if r.time_taken_seconds > 0]
            errors = [r.error_count for r in results]
            ease_scores = [r.ease_score for r in results if r.ease_score]
            satisfaction_scores = [r.satisfaction_score for r in results if r.satisfaction_score]

            success_rate = sum(successes) / len(successes) * 100 if successes else 0
            avg_time = statistics.mean(times) if times else 0
            avg_errors = statistics.mean(errors) if errors else 0

            all_successes.extend(successes)
            all_times.extend(times)
            all_errors.extend(errors)

            # Collect observations and quotes
            all_observations = []
            all_quotes = []
            for r in results:
                all_observations.extend(r.observations)
                all_quotes.extend(r.quotes)

            task_analyses.append({
                "task_id": task_id,
                "success_rate": round(success_rate, 1),
                "avg_time_seconds": round(avg_time, 1),
                "avg_errors": round(avg_errors, 2),
                "avg_ease_score": round(statistics.mean(ease_scores), 2) if ease_scores else None,
                "avg_satisfaction": round(statistics.mean(satisfaction_scores), 2) if satisfaction_scores else None,
                "observations": list(set(all_observations))[:5],
                "quotes": all_quotes[:3],
                "needs_attention": success_rate < 80 or avg_errors > 2
            })

        # Calculate overall metrics
        overall_success = sum(all_successes) / len(all_successes) * 100 if all_successes else 0
        avg_task_time = statistics.mean(all_times) if all_times else 0

        # Calculate SUS if available
        sus_score = None
        if sus_responses:
            sus_scores = [self.calculate_sus_score(r) for r in sus_responses]
            sus_score = statistics.mean(sus_scores)

        # Generate key findings
        key_findings = self._generate_key_findings(task_analyses, overall_success, sus_score)

        # Generate recommendations
        recommendations = self._generate_recommendations(task_analyses, overall_success, sus_score)

        # Severity ratings for issues
        severity_ratings = self._rate_severity(task_analyses)

        return TestAnalysis(
            test_name=results_data.get("test_name", "Usability Test"),
            participants_tested=len(participants),
            overall_success_rate=round(overall_success, 1),
            average_task_time=round(avg_task_time, 1),
            system_usability_score=round(sus_score, 1) if sus_score else None,
            task_results=task_analyses,
            key_findings=key_findings,
            recommendations=recommendations,
            severity_ratings=severity_ratings,
            metadata={
                "analyzed_at": datetime.now().isoformat(),
                "total_tasks": len(task_groups),
                "total_results": len(task_results_raw)
            }
        )

    def _generate_key_findings(self, task_analyses: list, overall_success: float, sus_score: Optional[float]) -> list:
        """Generate key findings from analysis."""
        findings = []

        # Overall success finding
        if overall_success >= 90:
            findings.append(f"Excellent overall task completion rate of {overall_success:.1f}%")
        elif overall_success >= 80:
            findings.append(f"Good overall task completion rate of {overall_success:.1f}%")
        elif overall_success >= 70:
            findings.append(f"Moderate task completion rate of {overall_success:.1f}% indicates room for improvement")
        else:
            findings.append(f"Low task completion rate of {overall_success:.1f}% requires immediate attention")

        # SUS finding
        if sus_score:
            if sus_score >= 80:
                findings.append(f"SUS score of {sus_score:.1f} indicates excellent perceived usability")
            elif sus_score >= 68:
                findings.append(f"SUS score of {sus_score:.1f} is above average and acceptable")
            else:
                findings.append(f"SUS score of {sus_score:.1f} is below average and needs improvement")

        # Task-specific findings
        problem_tasks = [t for t in task_analyses if t.get("needs_attention")]
        if problem_tasks:
            task_names = [t["task_id"] for t in problem_tasks[:3]]
            findings.append(f"{len(problem_tasks)} tasks need attention: {', '.join(task_names)}")

        # Look for patterns
        high_error_tasks = [t for t in task_analyses if t.get("avg_errors", 0) > 2]
        if high_error_tasks:
            findings.append(f"{len(high_error_tasks)} tasks have high error rates, indicating confusing UI patterns")

        return findings

    def _generate_recommendations(self, task_analyses: list, overall_success: float, sus_score: Optional[float]) -> list:
        """Generate actionable recommendations."""
        recommendations = []

        # Task-specific recommendations
        for task in task_analyses:
            if task.get("needs_attention"):
                if task.get("success_rate", 100) < 70:
                    recommendations.append({
                        "priority": "High",
                        "task": task["task_id"],
                        "recommendation": f"Redesign {task['task_id']} flow - only {task['success_rate']}% success rate",
                        "type": "redesign"
                    })
                elif task.get("avg_errors", 0) > 2:
                    recommendations.append({
                        "priority": "Medium",
                        "task": task["task_id"],
                        "recommendation": f"Reduce complexity in {task['task_id']} - {task['avg_errors']:.1f} errors per attempt",
                        "type": "simplify"
                    })

        # General recommendations
        if overall_success < 80:
            recommendations.append({
                "priority": "High",
                "task": "Overall",
                "recommendation": "Conduct follow-up research to understand root causes of task failures",
                "type": "research"
            })

        if sus_score and sus_score < 68:
            recommendations.append({
                "priority": "High",
                "task": "Overall",
                "recommendation": "Review overall information architecture and navigation patterns",
                "type": "architecture"
            })

        return recommendations

    def _rate_severity(self, task_analyses: list) -> list:
        """Rate severity of identified issues."""
        severity_ratings = []

        for task in task_analyses:
            if not task.get("needs_attention"):
                continue

            success_rate = task.get("success_rate", 100)
            errors = task.get("avg_errors", 0)

            if success_rate < 50:
                severity = "Critical"
                impact = "Users cannot complete core task"
            elif success_rate < 70 or errors > 3:
                severity = "Major"
                impact = "Significant usability issues preventing task completion"
            elif success_rate < 80 or errors > 2:
                severity = "Minor"
                impact = "Users can complete task but with difficulty"
            else:
                severity = "Cosmetic"
                impact = "Minor issues that don't prevent task completion"

            severity_ratings.append({
                "task": task["task_id"],
                "severity": severity,
                "success_rate": success_rate,
                "error_rate": errors,
                "impact": impact
            })

        return sorted(severity_ratings, key=lambda x: ["Critical", "Major", "Minor", "Cosmetic"].index(x["severity"]))

    def generate_blank_template(self) -> dict:
        """Generate a blank results template for data collection."""
        return {
            "test_name": "TravelMatch Usability Test",
            "test_date": datetime.now().strftime("%Y-%m-%d"),
            "facilitator": "",
            "participants": [
                {
                    "id": "P1",
                    "age_range": "",
                    "tech_proficiency": "",
                    "travel_frequency": "",
                    "platform_familiarity": ""
                }
            ],
            "task_results": [
                {
                    "task_id": "task_01",
                    "participant_id": "P1",
                    "success": True,
                    "time_taken_seconds": 0,
                    "error_count": 0,
                    "hints_used": 0,
                    "satisfaction_score": None,
                    "ease_score": None,
                    "observations": [],
                    "quotes": []
                }
            ],
            "sus_responses": [
                [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
            ],
            "notes": ""
        }


def format_test_plan_output(plan: TestPlan) -> str:
    """Format test plan for human-readable output."""
    output = []
    output.append("=" * 80)
    output.append(f"USABILITY TEST PLAN: {plan.name}")
    output.append("=" * 80)

    output.append(f"\nObjective: {plan.objective}")
    output.append(f"Test Type: {plan.test_type.title()}")
    output.append(f"Target Participants: {plan.target_participants}")
    output.append(f"Estimated Duration: {plan.estimated_duration}")

    output.append("\n--- PARTICIPANT CRITERIA ---")
    for key, value in plan.participant_criteria.items():
        output.append(f"  {key.replace('_', ' ').title()}: {value}")

    output.append("\n--- TEST TASKS ---")
    for i, task in enumerate(plan.tasks, 1):
        output.append(f"\n{i}. {task['name']} [{task['difficulty'].upper()}]")
        output.append(f"   Scenario: {task['scenario']}")
        output.append(f"   Expected Duration: {task['expected_duration']}")
        output.append("   Success Criteria:")
        for criterion in task['success_criteria']:
            output.append(f"     - {criterion}")
        output.append(f"   Metrics: {', '.join(task['metrics_to_capture'])}")

    output.append("\n--- PRE-TEST QUESTIONS ---")
    for i, q in enumerate(plan.pre_test_questions, 1):
        output.append(f"  {i}. {q['question']} [{q['type']}]")

    output.append("\n--- TARGET METRICS ---")
    for metric in plan.metrics:
        output.append(f"  - {metric['name']}: {metric['target']}")

    output.append("\n--- EQUIPMENT NEEDED ---")
    for item in plan.equipment_needed:
        output.append(f"  - {item}")

    output.append("\n--- METHODOLOGY NOTES ---")
    for note in plan.methodology_notes:
        output.append(f"  - {note}")

    output.append("\n")
    return "\n".join(output)


def format_analysis_output(analysis: TestAnalysis) -> str:
    """Format analysis for human-readable output."""
    output = []
    output.append("=" * 80)
    output.append(f"USABILITY TEST ANALYSIS: {analysis.test_name}")
    output.append("=" * 80)

    output.append(f"\nParticipants Tested: {analysis.participants_tested}")
    output.append(f"Overall Success Rate: {analysis.overall_success_rate}%")
    output.append(f"Average Task Time: {analysis.average_task_time} seconds")
    if analysis.system_usability_score:
        output.append(f"System Usability Score: {analysis.system_usability_score}")

    output.append("\n--- KEY FINDINGS ---")
    for finding in analysis.key_findings:
        output.append(f"  - {finding}")

    output.append("\n--- TASK RESULTS ---")
    for task in analysis.task_results:
        status = "[NEEDS ATTENTION]" if task.get("needs_attention") else "[OK]"
        output.append(f"\n  {task['task_id']} {status}")
        output.append(f"    Success Rate: {task['success_rate']}%")
        output.append(f"    Avg Time: {task['avg_time_seconds']}s")
        output.append(f"    Avg Errors: {task['avg_errors']}")
        if task.get('observations'):
            output.append(f"    Key Observations: {', '.join(task['observations'][:2])}")

    output.append("\n--- SEVERITY RATINGS ---")
    for issue in analysis.severity_ratings:
        output.append(f"  [{issue['severity'].upper()}] {issue['task']}: {issue['impact']}")

    output.append("\n--- RECOMMENDATIONS ---")
    for rec in analysis.recommendations:
        output.append(f"\n  [{rec['priority']}] {rec['task']}")
        output.append(f"    {rec['recommendation']}")

    output.append("\n")
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Usability Testing Framework for TravelMatch",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python usability_testing.py --plan onboarding           # Generate onboarding test plan
  python usability_testing.py --plan matching json        # Test plan as JSON
  python usability_testing.py --analyze results.json      # Analyze results
  python usability_testing.py --template                  # Get blank template
  python usability_testing.py --list                      # List available flows

Available Flows:
  onboarding      New user registration and setup
  discovery       Finding destinations and experiences
  matching        Travel companion matching
  trip_planning   Trip planning and coordination
  gifting         Gift exchange flow
  all             All flows combined
        """
    )
    parser.add_argument("format", nargs="?", default="text",
                       choices=["text", "json"],
                       help="Output format (default: text)")
    parser.add_argument("--plan", "-p", type=str,
                       help="Generate test plan for flow")
    parser.add_argument("--analyze", "-a", type=str,
                       help="Analyze results from JSON file")
    parser.add_argument("--template", "-t", action="store_true",
                       help="Output blank results template")
    parser.add_argument("--list", "-l", action="store_true",
                       help="List available test flows")
    parser.add_argument("--participants", "-n", type=int, default=5,
                       help="Target number of participants (default: 5)")
    parser.add_argument("--type", type=str, default="moderated",
                       choices=["moderated", "unmoderated", "guerrilla", "benchmark"],
                       help="Test type (default: moderated)")

    args = parser.parse_args()

    framework = UsabilityTestingFramework(test_type=TestType(args.type))

    if args.list:
        print("\nAvailable Test Flows:")
        print("-" * 40)
        for flow in framework.TASK_TEMPLATES.keys():
            task_count = len(framework.TASK_TEMPLATES[flow])
            print(f"  {flow:<15} - {task_count} tasks")
        print(f"  {'all':<15} - All flows combined")
        print()
        return

    if args.template:
        template = framework.generate_blank_template()
        print(json.dumps(template, indent=2))
        return

    if args.analyze:
        try:
            content = read_file_safely(args.analyze)
            results_data = json.loads(content)
            analysis = framework.analyze_results(results_data)

            if args.format == "json":
                print(json.dumps(asdict(analysis), indent=2))
            else:
                print(format_analysis_output(analysis))
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"Error: File '{args.analyze}' not found", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in '{args.analyze}': {e}", file=sys.stderr)
            sys.exit(1)
        return

    if args.plan:
        try:
            plan = framework.generate_test_plan(args.plan, args.participants)

            if args.format == "json":
                print(json.dumps(asdict(plan), indent=2))
            else:
                print(format_test_plan_output(plan))
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        return

    # Default: show help
    parser.print_help()


if __name__ == "__main__":
    main()

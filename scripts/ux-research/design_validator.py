#!/usr/bin/env python3
"""
Design Validator - Design Decision Validation Tool

Validates design decisions against research findings, personas, heuristics,
and accessibility standards. Ensures designs are user-centered and meet
quality benchmarks.

Usage:
    python design_validator.py --heuristics           # Heuristic evaluation checklist
    python design_validator.py --accessibility        # WCAG accessibility checklist
    python design_validator.py --persona-check        # Validate against personas
    python design_validator.py --checklist <type>     # Generate design checklist

Validation Types:
    heuristics      - Nielsen's 10 usability heuristics
    accessibility   - WCAG 2.1 AA checklist
    personas        - Validate against defined personas
    patterns        - Common UI pattern validation
    mobile          - Mobile-specific design guidelines

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
    with open(safe_path, 'r', encoding='utf-8') as f:  # nosec B602 B603 # noqa: PTH123
        return f.read()


class SeverityLevel(Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    COSMETIC = "cosmetic"


class ValidationCategory(Enum):
    HEURISTIC = "heuristic"
    ACCESSIBILITY = "accessibility"
    PERSONA = "persona"
    PATTERN = "pattern"
    MOBILE = "mobile"
    BRAND = "brand"


@dataclass
class ValidationItem:
    """Single validation check item."""
    id: str
    category: str
    name: str
    description: str
    check_question: str
    pass_criteria: str
    fail_implications: str
    severity_if_failed: str
    resources: list = field(default_factory=list)


@dataclass
class ValidationResult:
    """Result of a validation check."""
    item_id: str
    passed: bool
    notes: str = ""
    severity: Optional[str] = None
    recommendations: list = field(default_factory=list)


@dataclass
class ValidationReport:
    """Complete validation report."""
    design_name: str
    validator: str
    validation_type: str
    date: str
    results: list
    summary: dict
    recommendations: list
    metadata: dict


class DesignValidator:
    """Main class for design validation operations."""

    # Nielsen's 10 Usability Heuristics
    HEURISTICS = [
        {
            "id": "H01",
            "name": "Visibility of System Status",
            "description": "The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.",
            "check_question": "Does the design clearly show the current system state and provide feedback for user actions?",
            "pass_criteria": "Loading states, progress indicators, success/error messages are present and clear",
            "fail_implications": "Users may feel uncertain about whether their actions were successful",
            "severity_if_failed": "major",
            "examples": [
                "Loading spinners during data fetch",
                "Progress bars for multi-step processes",
                "Toast notifications for completed actions",
                "Real-time sync status indicators"
            ],
            "travelmatch_context": [
                "Show loading state when fetching matches",
                "Display progress during trip planning steps",
                "Confirm when message is sent",
                "Indicate when gift has been delivered"
            ]
        },
        {
            "id": "H02",
            "name": "Match Between System and Real World",
            "description": "The system should speak the users' language, with words, phrases, and concepts familiar to the user.",
            "check_question": "Does the design use language and concepts that are familiar to the target users?",
            "pass_criteria": "Uses everyday language, familiar metaphors, and logical information ordering",
            "fail_implications": "Users may misunderstand features or feel alienated by jargon",
            "severity_if_failed": "major",
            "examples": [
                "Using 'Save' instead of 'Persist'",
                "Trash can icon for delete",
                "Calendar for date selection"
            ],
            "travelmatch_context": [
                "Use 'Travel Companions' not 'Match Partners'",
                "Say 'Plan a Trip' not 'Create Itinerary Object'",
                "Use travel-related icons and imagery"
            ]
        },
        {
            "id": "H03",
            "name": "User Control and Freedom",
            "description": "Users often choose system functions by mistake and need a clearly marked 'emergency exit' to leave the unwanted state.",
            "check_question": "Can users easily undo, redo, cancel, or exit from any state in the design?",
            "pass_criteria": "Undo/redo available, cancel buttons present, easy navigation back",
            "fail_implications": "Users may feel trapped or frustrated when they make mistakes",
            "severity_if_failed": "critical",
            "examples": [
                "Undo delete actions",
                "Cancel button on forms",
                "Back navigation always available",
                "Clear all/reset options"
            ],
            "travelmatch_context": [
                "Undo accidental swipe on match",
                "Cancel mid-checkout for gifts",
                "Edit or delete trip plans",
                "Unsend recent messages"
            ]
        },
        {
            "id": "H04",
            "name": "Consistency and Standards",
            "description": "Users should not have to wonder whether different words, situations, or actions mean the same thing.",
            "check_question": "Does the design follow platform conventions and maintain internal consistency?",
            "pass_criteria": "Consistent terminology, predictable behaviors, follows platform guidelines",
            "fail_implications": "Users must relearn interactions, increasing cognitive load",
            "severity_if_failed": "major",
            "examples": [
                "Same action always has same result",
                "Consistent button placement",
                "Following iOS/Android conventions"
            ],
            "travelmatch_context": [
                "Heart icon always means 'like/save'",
                "Swipe gestures consistent across screens",
                "Same terminology for 'matches' throughout"
            ]
        },
        {
            "id": "H05",
            "name": "Error Prevention",
            "description": "Even better than good error messages is a careful design which prevents a problem from occurring.",
            "check_question": "Does the design prevent errors before they happen through constraints and confirmations?",
            "pass_criteria": "Confirmation dialogs for destructive actions, input validation, smart defaults",
            "fail_implications": "Users will encounter preventable errors causing frustration",
            "severity_if_failed": "major",
            "examples": [
                "Confirmation before delete",
                "Date picker prevents invalid dates",
                "Disable submit until form valid"
            ],
            "travelmatch_context": [
                "Confirm before unmatching someone",
                "Validate travel dates are in future",
                "Prevent duplicate trip creation",
                "Confirm gift purchase amount"
            ]
        },
        {
            "id": "H06",
            "name": "Recognition Rather Than Recall",
            "description": "Minimize the user's memory load by making objects, actions, and options visible.",
            "check_question": "Does the design minimize what users need to remember by showing relevant options and information?",
            "pass_criteria": "Options visible, recently used items shown, contextual help available",
            "fail_implications": "Users must remember information between screens, increasing errors",
            "severity_if_failed": "minor",
            "examples": [
                "Showing recent searches",
                "Visible navigation labels",
                "Autocomplete suggestions"
            ],
            "travelmatch_context": [
                "Show recently viewed destinations",
                "Display recent conversations prominently",
                "Suggest previous trip companions",
                "Show past gift recipients"
            ]
        },
        {
            "id": "H07",
            "name": "Flexibility and Efficiency of Use",
            "description": "Accelerators — unseen by the novice user — may speed up interaction for the expert user.",
            "check_question": "Does the design offer shortcuts and customization for power users while remaining simple for beginners?",
            "pass_criteria": "Keyboard shortcuts, gestures, customizable settings, multiple pathways",
            "fail_implications": "Expert users become frustrated by lack of efficiency",
            "severity_if_failed": "minor",
            "examples": [
                "Swipe gestures for quick actions",
                "Quick filters and saved searches",
                "Customizable homepage"
            ],
            "travelmatch_context": [
                "Quick match from discovery view",
                "Save filter preferences",
                "Favorite destinations one-tap access",
                "Quick gift sending to recent recipients"
            ]
        },
        {
            "id": "H08",
            "name": "Aesthetic and Minimalist Design",
            "description": "Dialogues should not contain information which is irrelevant or rarely needed.",
            "check_question": "Does the design focus on essential information and avoid visual clutter?",
            "pass_criteria": "Clean layout, relevant content prioritized, progressive disclosure used",
            "fail_implications": "Important information gets lost in noise, overwhelming users",
            "severity_if_failed": "minor",
            "examples": [
                "Clean whitespace",
                "Clear visual hierarchy",
                "Hidden advanced options"
            ],
            "travelmatch_context": [
                "Match cards show only essential info",
                "Trip details expandable for more",
                "Clean messaging interface",
                "Focused checkout flow"
            ]
        },
        {
            "id": "H09",
            "name": "Help Users Recognize, Diagnose, and Recover from Errors",
            "description": "Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.",
            "check_question": "Do error messages clearly explain what went wrong and how to fix it?",
            "pass_criteria": "Plain language errors, specific problem identified, actionable solution provided",
            "fail_implications": "Users can't recover from errors without support intervention",
            "severity_if_failed": "critical",
            "examples": [
                "'Payment failed - check card details' vs 'Error 500'",
                "Inline form validation with fix suggestions",
                "Retry options for network errors"
            ],
            "travelmatch_context": [
                "Explain why match failed to send message",
                "Guide on fixing profile issues",
                "Clear payment error recovery steps",
                "Network error with retry option"
            ]
        },
        {
            "id": "H10",
            "name": "Help and Documentation",
            "description": "Even though it is better if the system can be used without documentation, it may be necessary to provide help.",
            "check_question": "Is contextual help available when users need guidance?",
            "pass_criteria": "Tooltips, onboarding tours, searchable help, easy access to support",
            "fail_implications": "Users give up when they can't figure out features",
            "severity_if_failed": "minor",
            "examples": [
                "Tooltip on hover/tap",
                "Onboarding walkthrough",
                "FAQ section",
                "In-app chat support"
            ],
            "travelmatch_context": [
                "Matching algorithm explanation tooltip",
                "First-time feature tutorials",
                "Gift FAQ section",
                "Trip planning guide"
            ]
        }
    ]

    # WCAG 2.1 AA Accessibility Checklist (key items)
    ACCESSIBILITY_CHECKLIST = [
        {
            "id": "A01",
            "name": "Text Alternatives",
            "category": "Perceivable",
            "description": "Provide text alternatives for any non-text content.",
            "check_question": "Do all images, icons, and media have appropriate alt text or labels?",
            "pass_criteria": "All meaningful images have descriptive alt text, decorative images have empty alt",
            "fail_implications": "Screen reader users cannot understand image content",
            "severity_if_failed": "critical",
            "wcag_criterion": "1.1.1 Non-text Content (Level A)"
        },
        {
            "id": "A02",
            "name": "Color Contrast",
            "category": "Perceivable",
            "description": "Ensure sufficient contrast between text and background.",
            "check_question": "Does text have at least 4.5:1 contrast ratio (3:1 for large text)?",
            "pass_criteria": "All text meets WCAG AA contrast requirements",
            "fail_implications": "Users with low vision cannot read content",
            "severity_if_failed": "critical",
            "wcag_criterion": "1.4.3 Contrast (Minimum) (Level AA)"
        },
        {
            "id": "A03",
            "name": "Color Not Sole Indicator",
            "category": "Perceivable",
            "description": "Color is not used as the only visual means of conveying information.",
            "check_question": "Is information conveyed by more than just color (icons, text, patterns)?",
            "pass_criteria": "Error states, success states, links distinguished by more than color",
            "fail_implications": "Color blind users miss important information",
            "severity_if_failed": "major",
            "wcag_criterion": "1.4.1 Use of Color (Level A)"
        },
        {
            "id": "A04",
            "name": "Keyboard Accessible",
            "category": "Operable",
            "description": "All functionality available from keyboard.",
            "check_question": "Can all interactive elements be accessed and operated with keyboard only?",
            "pass_criteria": "Tab navigation works, focus visible, all controls operable",
            "fail_implications": "Users who cannot use mouse are blocked",
            "severity_if_failed": "critical",
            "wcag_criterion": "2.1.1 Keyboard (Level A)"
        },
        {
            "id": "A05",
            "name": "Focus Visible",
            "category": "Operable",
            "description": "Keyboard focus indicator is visible.",
            "check_question": "Is there a visible focus indicator when navigating with keyboard?",
            "pass_criteria": "Clear focus ring/outline on all focusable elements",
            "fail_implications": "Keyboard users lose track of their position",
            "severity_if_failed": "major",
            "wcag_criterion": "2.4.7 Focus Visible (Level AA)"
        },
        {
            "id": "A06",
            "name": "Touch Target Size",
            "category": "Operable",
            "description": "Touch targets are large enough to tap accurately.",
            "check_question": "Are touch targets at least 44x44 CSS pixels?",
            "pass_criteria": "All buttons and interactive elements meet minimum size",
            "fail_implications": "Users with motor impairments struggle to tap targets",
            "severity_if_failed": "major",
            "wcag_criterion": "2.5.5 Target Size (Level AAA, but best practice)"
        },
        {
            "id": "A07",
            "name": "Meaningful Sequence",
            "category": "Understandable",
            "description": "Content is presented in a meaningful order.",
            "check_question": "Does the reading/navigation order make sense when linearized?",
            "pass_criteria": "Content order logical when read by screen reader",
            "fail_implications": "Screen reader users get confused by illogical order",
            "severity_if_failed": "major",
            "wcag_criterion": "1.3.2 Meaningful Sequence (Level A)"
        },
        {
            "id": "A08",
            "name": "Labels and Instructions",
            "category": "Understandable",
            "description": "Labels or instructions provided when user input required.",
            "check_question": "Do all form fields have visible labels and clear instructions?",
            "pass_criteria": "Labels associated with fields, required fields marked, format hints shown",
            "fail_implications": "Users don't know what information to enter",
            "severity_if_failed": "major",
            "wcag_criterion": "3.3.2 Labels or Instructions (Level A)"
        },
        {
            "id": "A09",
            "name": "Error Identification",
            "category": "Understandable",
            "description": "Input errors are identified and described to the user in text.",
            "check_question": "Are form errors clearly identified with text descriptions?",
            "pass_criteria": "Error messages in text near the error, not just color",
            "fail_implications": "Users don't know what they did wrong",
            "severity_if_failed": "critical",
            "wcag_criterion": "3.3.1 Error Identification (Level A)"
        },
        {
            "id": "A10",
            "name": "Motion and Animation",
            "category": "Operable",
            "description": "Motion can be disabled and doesn't cause seizures.",
            "check_question": "Can animations be paused? No flashing more than 3 times per second?",
            "pass_criteria": "Respects reduce-motion preference, no seizure-inducing content",
            "fail_implications": "May cause seizures or vestibular issues",
            "severity_if_failed": "critical",
            "wcag_criterion": "2.3.1 Three Flashes or Below Threshold (Level A)"
        }
    ]

    # Mobile Design Checklist
    MOBILE_CHECKLIST = [
        {
            "id": "M01",
            "name": "Touch-Friendly Spacing",
            "description": "Adequate spacing between interactive elements to prevent accidental taps.",
            "check_question": "Is there at least 8px spacing between touch targets?",
            "pass_criteria": "Interactive elements have sufficient spacing",
            "fail_implications": "Users accidentally tap wrong elements",
            "severity_if_failed": "major"
        },
        {
            "id": "M02",
            "name": "Thumb Zone Optimization",
            "description": "Primary actions are placed in easy-to-reach thumb zones.",
            "check_question": "Are primary actions in the bottom third of the screen?",
            "pass_criteria": "Main CTAs accessible with one-handed use",
            "fail_implications": "Users struggle to reach important actions",
            "severity_if_failed": "minor"
        },
        {
            "id": "M03",
            "name": "Loading Performance",
            "description": "Content loads quickly and progressively.",
            "check_question": "Does primary content load within 3 seconds on 3G?",
            "pass_criteria": "Fast initial load, skeleton screens for content",
            "fail_implications": "Users abandon slow-loading screens",
            "severity_if_failed": "major"
        },
        {
            "id": "M04",
            "name": "Gesture Discoverability",
            "description": "Gesture-based interactions are discoverable and have alternatives.",
            "check_question": "Are swipe/gesture actions also available via buttons?",
            "pass_criteria": "Gestures hinted at, button alternatives exist",
            "fail_implications": "Users miss hidden functionality",
            "severity_if_failed": "minor"
        },
        {
            "id": "M05",
            "name": "Form Input Optimization",
            "description": "Forms are optimized for mobile input.",
            "check_question": "Do forms use appropriate keyboard types and minimize typing?",
            "pass_criteria": "Numeric keyboard for numbers, autofill enabled, pickers used",
            "fail_implications": "Tedious data entry frustrates users",
            "severity_if_failed": "major"
        },
        {
            "id": "M06",
            "name": "Orientation Support",
            "description": "App works in both portrait and landscape orientations.",
            "check_question": "Does the design adapt to orientation changes gracefully?",
            "pass_criteria": "Content reflows appropriately, no horizontal scroll",
            "fail_implications": "Users with accessibility needs may be blocked",
            "severity_if_failed": "minor"
        },
        {
            "id": "M07",
            "name": "Offline Consideration",
            "description": "App handles offline/poor connectivity gracefully.",
            "check_question": "Does the design show helpful states for offline or slow connections?",
            "pass_criteria": "Offline message shown, cached content available",
            "fail_implications": "Users see errors without explanation",
            "severity_if_failed": "major"
        },
        {
            "id": "M08",
            "name": "Safe Area Respect",
            "description": "Content respects device safe areas (notch, home indicator).",
            "check_question": "Is content properly inset for notches and system UI?",
            "pass_criteria": "No content hidden behind system UI elements",
            "fail_implications": "Content is cut off or inaccessible",
            "severity_if_failed": "major"
        }
    ]

    # TravelMatch Persona-Based Validation
    PERSONA_CHECKS = {
        "The Explorer": {
            "needs": [
                "Easy discovery of new destinations",
                "Serendipitous content recommendations",
                "Off-the-beaten-path options visible",
                "Quick access to save interesting finds"
            ],
            "questions": [
                "Does the design surface unexpected discoveries?",
                "Can users easily browse without a specific goal?",
                "Are adventure-oriented features prominent?"
            ]
        },
        "The Connector": {
            "needs": [
                "Social features prominently displayed",
                "Easy communication with matches",
                "Gift exchange functionality accessible",
                "Group coordination tools available"
            ],
            "questions": [
                "Is initiating connection easy and obvious?",
                "Can users easily maintain relationships?",
                "Is the social value proposition clear?"
            ]
        },
        "The Planner": {
            "needs": [
                "Detailed information available",
                "Comparison and filtering capabilities",
                "Itinerary management features",
                "Booking confirmation visibility"
            ],
            "questions": [
                "Can users access detailed information easily?",
                "Are planning tools well-organized?",
                "Is there a clear sense of progress?"
            ]
        },
        "The Spontaneous": {
            "needs": [
                "Quick actions with minimal friction",
                "Last-minute options highlighted",
                "Simple decision flows",
                "Minimal required fields"
            ],
            "questions": [
                "Can users complete key actions in under 30 seconds?",
                "Are there 'quick start' options?",
                "Is the booking flow streamlined?"
            ]
        },
        "New User": {
            "needs": [
                "Clear onboarding guidance",
                "Obvious first actions",
                "Trust indicators visible",
                "Easy access to help"
            ],
            "questions": [
                "Is it immediately clear what to do first?",
                "Are trust signals prominently displayed?",
                "Is the value proposition obvious?"
            ]
        }
    }

    def __init__(self):
        """Initialize the validator."""
        self.results = []

    def generate_heuristics_checklist(self) -> list:
        """Generate heuristics evaluation checklist."""
        checklist = []
        for h in self.HEURISTICS:
            item = ValidationItem(
                id=h["id"],
                category="heuristic",
                name=h["name"],
                description=h["description"],
                check_question=h["check_question"],
                pass_criteria=h["pass_criteria"],
                fail_implications=h["fail_implications"],
                severity_if_failed=h["severity_if_failed"],
                resources=h.get("travelmatch_context", [])
            )
            checklist.append(item)
        return checklist

    def generate_accessibility_checklist(self) -> list:
        """Generate WCAG accessibility checklist."""
        checklist = []
        for a in self.ACCESSIBILITY_CHECKLIST:
            item = ValidationItem(
                id=a["id"],
                category="accessibility",
                name=a["name"],
                description=a["description"],
                check_question=a["check_question"],
                pass_criteria=a["pass_criteria"],
                fail_implications=a["fail_implications"],
                severity_if_failed=a["severity_if_failed"],
                resources=[a.get("wcag_criterion", "")]
            )
            checklist.append(item)
        return checklist

    def generate_mobile_checklist(self) -> list:
        """Generate mobile design checklist."""
        checklist = []
        for m in self.MOBILE_CHECKLIST:
            item = ValidationItem(
                id=m["id"],
                category="mobile",
                name=m["name"],
                description=m["description"],
                check_question=m["check_question"],
                pass_criteria=m["pass_criteria"],
                fail_implications=m["fail_implications"],
                severity_if_failed=m["severity_if_failed"]
            )
            checklist.append(item)
        return checklist

    def generate_persona_checklist(self, persona_name: Optional[str] = None) -> list:
        """Generate persona-based validation checklist."""
        checklist = []

        personas_to_check = {persona_name: self.PERSONA_CHECKS[persona_name]} if persona_name else self.PERSONA_CHECKS

        for persona, checks in personas_to_check.items():
            for i, question in enumerate(checks["questions"]):
                item = ValidationItem(
                    id=f"P_{persona[:3].upper()}_{i+1:02d}",
                    category="persona",
                    name=f"{persona} - Check {i+1}",
                    description=f"Validation for {persona} persona",
                    check_question=question,
                    pass_criteria=f"Design addresses: {checks['needs'][i] if i < len(checks['needs']) else 'persona needs'}",
                    fail_implications=f"{persona} users may struggle with this design",
                    severity_if_failed="major" if i == 0 else "minor",
                    resources=checks["needs"]
                )
                checklist.append(item)

        return checklist

    def validate_design(self, results: list[dict]) -> ValidationReport:
        """Generate validation report from evaluation results."""
        validation_results = []
        passed_count = 0
        failed_count = 0
        critical_issues = []
        major_issues = []

        for result in results:
            v_result = ValidationResult(
                item_id=result.get("item_id"),
                passed=result.get("passed", False),
                notes=result.get("notes", ""),
                severity=result.get("severity") if not result.get("passed") else None,
                recommendations=result.get("recommendations", [])
            )
            validation_results.append(v_result)

            if v_result.passed:
                passed_count += 1
            else:
                failed_count += 1
                if v_result.severity == "critical":
                    critical_issues.append(v_result.item_id)
                elif v_result.severity == "major":
                    major_issues.append(v_result.item_id)

        total = passed_count + failed_count
        pass_rate = (passed_count / total * 100) if total > 0 else 0

        # Generate overall recommendations
        recommendations = []
        if critical_issues:
            recommendations.append({
                "priority": "Immediate",
                "action": f"Address {len(critical_issues)} critical issues before release",
                "items": critical_issues
            })
        if major_issues:
            recommendations.append({
                "priority": "High",
                "action": f"Fix {len(major_issues)} major issues in next sprint",
                "items": major_issues
            })

        # Determine overall status
        if critical_issues:
            status = "FAIL - Critical Issues"
        elif pass_rate < 70:
            status = "NEEDS WORK"
        elif pass_rate < 90:
            status = "ACCEPTABLE"
        else:
            status = "PASS"

        return ValidationReport(
            design_name=results[0].get("design_name", "Unknown Design") if results else "Unknown",
            validator=results[0].get("validator", "Unknown") if results else "Unknown",
            validation_type="comprehensive",
            date=datetime.now().isoformat(),
            results=[asdict(r) for r in validation_results],
            summary={
                "total_checks": total,
                "passed": passed_count,
                "failed": failed_count,
                "pass_rate": round(pass_rate, 1),
                "critical_issues": len(critical_issues),
                "major_issues": len(major_issues),
                "status": status
            },
            recommendations=recommendations,
            metadata={
                "generated_at": datetime.now().isoformat(),
                "version": "1.0"
            }
        )

    def generate_blank_evaluation_form(self, checklist_type: str = "heuristics") -> dict:
        """Generate blank evaluation form for data collection."""
        checklist_generators = {
            "heuristics": self.generate_heuristics_checklist,
            "accessibility": self.generate_accessibility_checklist,
            "mobile": self.generate_mobile_checklist,
            "personas": self.generate_persona_checklist
        }

        generator = checklist_generators.get(checklist_type)
        if not generator:
            raise ValueError(f"Unknown checklist type: {checklist_type}")

        checklist = generator()

        return {
            "evaluation_form": {
                "design_name": "",
                "validator": "",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "checklist_type": checklist_type
            },
            "items": [
                {
                    "item_id": item.id,
                    "name": item.name,
                    "check_question": item.check_question,
                    "pass_criteria": item.pass_criteria,
                    "passed": None,
                    "notes": "",
                    "severity": item.severity_if_failed,
                    "recommendations": []
                }
                for item in checklist
            ]
        }


def format_checklist_output(checklist: list, title: str) -> str:
    """Format checklist for human-readable output."""
    output = []
    output.append("=" * 80)
    output.append(f"DESIGN VALIDATION CHECKLIST: {title}")
    output.append("=" * 80)

    current_category = None
    for item in checklist:
        if hasattr(item, 'category') and item.category != current_category:
            current_category = item.category
            output.append(f"\n--- {current_category.upper()} ---")

        severity_icon = {
            "critical": "[!!!]",
            "major": "[!!]",
            "minor": "[!]",
            "cosmetic": "[.]"
        }

        output.append(f"\n{item.id}. {item.name} {severity_icon.get(item.severity_if_failed, '')}")
        output.append(f"   Question: {item.check_question}")
        output.append(f"   Pass Criteria: {item.pass_criteria}")
        if item.fail_implications:
            output.append(f"   If Failed: {item.fail_implications}")
        if item.resources:
            output.append(f"   Resources: {', '.join(item.resources[:2])}")
        output.append(f"   [ ] PASS  [ ] FAIL  Notes: _____________")

    output.append("\n")
    output.append("SEVERITY KEY:")
    output.append("  [!!!] Critical - Must fix before release")
    output.append("  [!!]  Major - Should fix in current sprint")
    output.append("  [!]   Minor - Fix when possible")
    output.append("  [.]   Cosmetic - Nice to fix")
    output.append("\n")

    return "\n".join(output)


def format_report_output(report: ValidationReport) -> str:
    """Format validation report for human-readable output."""
    output = []
    output.append("=" * 80)
    output.append(f"DESIGN VALIDATION REPORT: {report.design_name}")
    output.append("=" * 80)

    output.append(f"\nValidator: {report.validator}")
    output.append(f"Date: {report.date}")
    output.append(f"Validation Type: {report.validation_type}")

    output.append("\n--- SUMMARY ---")
    output.append(f"  Status: {report.summary['status']}")
    output.append(f"  Pass Rate: {report.summary['pass_rate']}%")
    output.append(f"  Total Checks: {report.summary['total_checks']}")
    output.append(f"  Passed: {report.summary['passed']}")
    output.append(f"  Failed: {report.summary['failed']}")
    output.append(f"  Critical Issues: {report.summary['critical_issues']}")
    output.append(f"  Major Issues: {report.summary['major_issues']}")

    output.append("\n--- FAILED ITEMS ---")
    failed_items = [r for r in report.results if not r['passed']]
    for item in failed_items:
        severity_icon = {"critical": "[CRITICAL]", "major": "[MAJOR]", "minor": "[MINOR]"}
        output.append(f"  {severity_icon.get(item['severity'], '')} {item['item_id']}")
        if item['notes']:
            output.append(f"    Notes: {item['notes']}")
        if item['recommendations']:
            output.append(f"    Recommendations: {', '.join(item['recommendations'][:2])}")

    output.append("\n--- RECOMMENDATIONS ---")
    for rec in report.recommendations:
        output.append(f"\n  [{rec['priority']}] {rec['action']}")
        if 'items' in rec:
            output.append(f"    Affected: {', '.join(rec['items'][:5])}")

    output.append("\n")
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(
        description="Design Validation Tool for TravelMatch",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python design_validator.py --heuristics              # Nielsen's heuristics checklist
  python design_validator.py --accessibility           # WCAG 2.1 AA checklist
  python design_validator.py --mobile                  # Mobile design checklist
  python design_validator.py --personas                # All personas checklist
  python design_validator.py --persona "The Explorer"  # Single persona checklist
  python design_validator.py --form heuristics         # Blank evaluation form
  python design_validator.py --analyze results.json    # Analyze filled form

Checklist Types:
  heuristics      Nielsen's 10 Usability Heuristics
  accessibility   WCAG 2.1 AA Requirements
  mobile          Mobile Design Best Practices
  personas        Persona-Based Validation
        """
    )
    parser.add_argument("format", nargs="?", default="text",
                       choices=["text", "json"],
                       help="Output format (default: text)")
    parser.add_argument("--heuristics", "-H", action="store_true",
                       help="Generate heuristics evaluation checklist")
    parser.add_argument("--accessibility", "-a", action="store_true",
                       help="Generate accessibility checklist")
    parser.add_argument("--mobile", "-m", action="store_true",
                       help="Generate mobile design checklist")
    parser.add_argument("--personas", "-p", action="store_true",
                       help="Generate persona-based checklist (all personas)")
    parser.add_argument("--persona", type=str,
                       help="Generate checklist for specific persona")
    parser.add_argument("--form", "-f", type=str,
                       choices=["heuristics", "accessibility", "mobile", "personas"],
                       help="Generate blank evaluation form")
    parser.add_argument("--analyze", type=str,
                       help="Analyze completed evaluation form JSON")
    parser.add_argument("--all", action="store_true",
                       help="Generate combined checklist of all types")

    args = parser.parse_args()

    validator = DesignValidator()

    # Handle specific options
    if args.form:
        form = validator.generate_blank_evaluation_form(args.form)
        print(json.dumps(form, indent=2))
        return

    if args.analyze:
        try:
            content = read_file_safely(args.analyze)
            results_data = json.loads(content)
            report = validator.validate_design(results_data.get("items", []))
            if args.format == "json":
                print(json.dumps(asdict(report), indent=2))
            else:
                print(format_report_output(report))
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"Error: File '{args.analyze}' not found", file=sys.stderr)
            sys.exit(1)
        return

    # Generate checklists
    checklists = []
    titles = []

    if args.heuristics or args.all:
        checklists.extend(validator.generate_heuristics_checklist())
        titles.append("Nielsen's Usability Heuristics")

    if args.accessibility or args.all:
        checklists.extend(validator.generate_accessibility_checklist())
        titles.append("WCAG 2.1 AA Accessibility")

    if args.mobile or args.all:
        checklists.extend(validator.generate_mobile_checklist())
        titles.append("Mobile Design")

    if args.personas or args.all:
        checklists.extend(validator.generate_persona_checklist())
        titles.append("Persona-Based Validation")

    if args.persona:
        if args.persona in validator.PERSONA_CHECKS:
            checklists.extend(validator.generate_persona_checklist(args.persona))
            titles.append(f"Persona: {args.persona}")
        else:
            print(f"Error: Unknown persona '{args.persona}'", file=sys.stderr)
            print(f"Available: {', '.join(validator.PERSONA_CHECKS.keys())}")
            sys.exit(1)

    # Default to heuristics if nothing specified
    if not checklists:
        checklists = validator.generate_heuristics_checklist()
        titles = ["Nielsen's Usability Heuristics"]

    # Output
    if args.format == "json":
        output = {
            "checklists": [asdict(item) for item in checklists],
            "metadata": {
                "types": titles,
                "total_items": len(checklists),
                "generated_at": datetime.now().isoformat()
            }
        }
        print(json.dumps(output, indent=2))
    else:
        title = " + ".join(titles)
        print(format_checklist_output(checklists, title))


if __name__ == "__main__":
    main()

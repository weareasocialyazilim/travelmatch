#!/usr/bin/env python3
"""
Customer Journey Mapper - Visual Journey Mapping Tool

Creates comprehensive customer journey maps for TravelMatch user flows.
Analyzes touchpoints, emotions, pain points, and opportunities across
the user experience lifecycle.

Usage:
    python journey_mapper.py --journey <type> [json]    # Generate specific journey
    python journey_mapper.py --list                     # List available journeys
    python journey_mapper.py --file data.json [json]    # Custom journey from file

Journey Types:
    onboarding      - New user registration and setup
    discovery       - Finding travel matches and destinations
    matching        - Connecting with travel companions
    trip_planning   - Planning and coordinating trips
    gifting         - Gift exchange experience
    full            - Complete end-to-end journey

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
    if base_dir is None:
        base_dir = os.getcwd()
    
    abs_path = os.path.abspath(os.path.join(base_dir, filepath))
    abs_base = os.path.abspath(base_dir)
    
    if not abs_path.startswith(abs_base + os.sep) and abs_path != abs_base:
        raise ValueError(f"Path '{filepath}' would escape the base directory")
    
    return abs_path


class JourneyPhase(Enum):
    AWARENESS = "Awareness"
    CONSIDERATION = "Consideration"
    ACQUISITION = "Acquisition"
    SERVICE = "Service"
    LOYALTY = "Loyalty"


class EmotionLevel(Enum):
    DELIGHTED = 5
    HAPPY = 4
    NEUTRAL = 3
    FRUSTRATED = 2
    ANGRY = 1


class ChannelType(Enum):
    MOBILE_APP = "Mobile App"
    WEB = "Web"
    EMAIL = "Email"
    PUSH_NOTIFICATION = "Push Notification"
    SMS = "SMS"
    IN_APP_MESSAGE = "In-App Message"
    SOCIAL_MEDIA = "Social Media"


@dataclass
class Touchpoint:
    """Represents a single touchpoint in the journey."""
    id: str
    name: str
    phase: str
    description: str
    user_action: str
    system_response: str
    channel: str
    emotion: int  # 1-5 scale
    pain_points: list = field(default_factory=list)
    opportunities: list = field(default_factory=list)
    metrics: dict = field(default_factory=dict)
    duration_estimate: Optional[str] = None
    dependencies: list = field(default_factory=list)


@dataclass
class JourneyMap:
    """Complete customer journey map."""
    name: str
    persona: str
    goal: str
    phases: list
    touchpoints: list
    overall_emotion_curve: list
    key_insights: list
    recommendations: list
    metadata: dict


class JourneyMapper:
    """Main class for generating customer journey maps."""

    # Pre-defined journey templates for TravelMatch
    JOURNEY_TEMPLATES = {
        "onboarding": {
            "name": "New User Onboarding Journey",
            "persona": "New TravelMatch User",
            "goal": "Successfully create an account and set up travel preferences",
            "touchpoints": [
                {
                    "id": "ob_01",
                    "name": "App Discovery",
                    "phase": "Awareness",
                    "description": "User discovers TravelMatch through app store or referral",
                    "user_action": "Searches for travel apps or clicks referral link",
                    "system_response": "App store listing or landing page",
                    "channel": "Web/App Store",
                    "emotion": 4,
                    "pain_points": ["Hard to differentiate from other travel apps"],
                    "opportunities": ["Stronger value proposition", "Social proof"],
                    "metrics": {"conversion_rate": "15%", "bounce_rate": "45%"},
                    "duration_estimate": "30 seconds"
                },
                {
                    "id": "ob_02",
                    "name": "App Download",
                    "phase": "Acquisition",
                    "description": "User downloads and opens the app for first time",
                    "user_action": "Taps download and waits for installation",
                    "system_response": "Download progress, initial app load",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Large app size", "Slow initial load"],
                    "opportunities": ["Reduce app size", "Instant loading animation"],
                    "metrics": {"download_completion": "92%", "first_open_rate": "78%"},
                    "duration_estimate": "2 minutes"
                },
                {
                    "id": "ob_03",
                    "name": "Welcome Screen",
                    "phase": "Acquisition",
                    "description": "User sees welcome carousel and value proposition",
                    "user_action": "Swipes through intro screens",
                    "system_response": "Animated welcome experience",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Too many screens to skip", "Generic content"],
                    "opportunities": ["Personalized welcome", "Skip option"],
                    "metrics": {"completion_rate": "65%", "skip_rate": "35%"},
                    "duration_estimate": "45 seconds"
                },
                {
                    "id": "ob_04",
                    "name": "Sign Up Method Selection",
                    "phase": "Acquisition",
                    "description": "User chooses how to create account",
                    "user_action": "Selects social login or email signup",
                    "system_response": "Authentication flow begins",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Too many choices", "Privacy concerns with social"],
                    "opportunities": ["Clear privacy messaging", "Recommended option"],
                    "metrics": {"social_login_rate": "68%", "email_signup_rate": "32%"},
                    "duration_estimate": "10 seconds"
                },
                {
                    "id": "ob_05",
                    "name": "Account Creation",
                    "phase": "Acquisition",
                    "description": "User completes account registration",
                    "user_action": "Enters credentials or authenticates via social",
                    "system_response": "Account created confirmation",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Password requirements unclear", "OAuth failures"],
                    "opportunities": ["Clearer validation", "Graceful error handling"],
                    "metrics": {"signup_success_rate": "89%", "error_rate": "11%"},
                    "duration_estimate": "1 minute"
                },
                {
                    "id": "ob_06",
                    "name": "Profile Setup",
                    "phase": "Service",
                    "description": "User fills in basic profile information",
                    "user_action": "Adds name, photo, bio",
                    "system_response": "Profile progress indicator, photo upload",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Too many required fields", "Photo upload fails"],
                    "opportunities": ["Progressive profiling", "Photo editing tools"],
                    "metrics": {"completion_rate": "72%", "photo_upload_rate": "55%"},
                    "duration_estimate": "3 minutes"
                },
                {
                    "id": "ob_07",
                    "name": "Travel Preferences Quiz",
                    "phase": "Service",
                    "description": "User sets travel style and destination preferences",
                    "user_action": "Answers preference questions via swipes/taps",
                    "system_response": "Interactive quiz with visual options",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Quiz too long", "Not sure what answers mean"],
                    "opportunities": ["Gamification", "Show matching impact live"],
                    "metrics": {"completion_rate": "68%", "avg_time": "2.5 min"},
                    "duration_estimate": "2-3 minutes"
                },
                {
                    "id": "ob_08",
                    "name": "First Match Preview",
                    "phase": "Service",
                    "description": "User sees potential travel matches based on preferences",
                    "user_action": "Views match cards with excitement",
                    "system_response": "Personalized match recommendations",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Matches seem random", "Not enough matches"],
                    "opportunities": ["Explain match reasoning", "Quality over quantity"],
                    "metrics": {"engagement_rate": "82%", "match_interaction": "45%"},
                    "duration_estimate": "1 minute"
                },
                {
                    "id": "ob_09",
                    "name": "Notification Permissions",
                    "phase": "Service",
                    "description": "User decides on push notification preferences",
                    "user_action": "Accepts or declines notification prompt",
                    "system_response": "Permission dialog with value explanation",
                    "channel": "Mobile App",
                    "emotion": 2,
                    "pain_points": ["Unexpected prompt timing", "Unclear value"],
                    "opportunities": ["Contextual permission ask", "Clear benefit preview"],
                    "metrics": {"opt_in_rate": "58%", "opt_out_rate": "42%"},
                    "duration_estimate": "15 seconds"
                },
                {
                    "id": "ob_10",
                    "name": "Onboarding Complete",
                    "phase": "Service",
                    "description": "User completes setup and enters main app experience",
                    "user_action": "Views completion celebration, explores app",
                    "system_response": "Success animation, guided first actions",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Unclear what to do next", "Overwhelming features"],
                    "opportunities": ["Guided tour option", "First action prompt"],
                    "metrics": {"day_1_retention": "45%", "first_action_rate": "67%"},
                    "duration_estimate": "30 seconds"
                }
            ]
        },
        "discovery": {
            "name": "Travel Discovery Journey",
            "persona": "Active TravelMatch User",
            "goal": "Find inspiring destinations and travel experiences",
            "touchpoints": [
                {
                    "id": "disc_01",
                    "name": "Open Discovery Feed",
                    "phase": "Service",
                    "description": "User opens app to browse travel content",
                    "user_action": "Taps discover tab or opens app",
                    "system_response": "Personalized feed loads with recommendations",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Slow load times", "Repetitive content"],
                    "opportunities": ["Instant loading", "Fresh content algorithms"],
                    "metrics": {"load_time": "1.2s", "scroll_depth": "65%"},
                    "duration_estimate": "2 seconds"
                },
                {
                    "id": "disc_02",
                    "name": "Browse Destination Cards",
                    "phase": "Service",
                    "description": "User swipes through destination recommendations",
                    "user_action": "Scrolls and taps on interesting destinations",
                    "system_response": "Rich media cards with photos and details",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Small photos", "Missing key info"],
                    "opportunities": ["Full-screen preview", "Quick facts overlay"],
                    "metrics": {"cards_viewed": "12 avg", "tap_rate": "23%"},
                    "duration_estimate": "5 minutes"
                },
                {
                    "id": "disc_03",
                    "name": "View Destination Details",
                    "phase": "Service",
                    "description": "User explores detailed destination information",
                    "user_action": "Reads reviews, views photos, checks details",
                    "system_response": "Comprehensive destination page",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Information overload", "Outdated content"],
                    "opportunities": ["Structured layout", "Real-time updates"],
                    "metrics": {"time_on_page": "2.5 min", "scroll_completion": "45%"},
                    "duration_estimate": "3 minutes"
                },
                {
                    "id": "disc_04",
                    "name": "Save to Wishlist",
                    "phase": "Service",
                    "description": "User saves interesting destinations for later",
                    "user_action": "Taps heart/save button",
                    "system_response": "Haptic feedback, save confirmation",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["No organization options", "Hard to find later"],
                    "opportunities": ["Collections feature", "Save reminders"],
                    "metrics": {"save_rate": "15%", "wishlist_return_rate": "32%"},
                    "duration_estimate": "1 second"
                },
                {
                    "id": "disc_05",
                    "name": "Filter and Search",
                    "phase": "Service",
                    "description": "User narrows down options with filters",
                    "user_action": "Applies budget, date, style filters",
                    "system_response": "Filtered results update in real-time",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Complex filter UI", "Few results after filtering"],
                    "opportunities": ["Smart defaults", "Filter suggestions"],
                    "metrics": {"filter_usage": "28%", "search_refinement": "2.3 avg"},
                    "duration_estimate": "30 seconds"
                },
                {
                    "id": "disc_06",
                    "name": "View Traveler Stories",
                    "phase": "Service",
                    "description": "User reads experiences from other travelers",
                    "user_action": "Opens story content, views photos/videos",
                    "system_response": "Immersive story experience",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Fake-looking content", "Missing authenticity"],
                    "opportunities": ["Verified traveler badges", "Raw unfiltered content"],
                    "metrics": {"story_completion": "55%", "engagement_rate": "18%"},
                    "duration_estimate": "4 minutes"
                },
                {
                    "id": "disc_07",
                    "name": "Share Discovery",
                    "phase": "Loyalty",
                    "description": "User shares interesting find with friends",
                    "user_action": "Taps share, selects recipient or platform",
                    "system_response": "Share sheet with preview",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Share preview looks bad", "Too many steps"],
                    "opportunities": ["Beautiful share cards", "One-tap sharing"],
                    "metrics": {"share_rate": "8%", "viral_coefficient": "1.2"},
                    "duration_estimate": "15 seconds"
                }
            ]
        },
        "matching": {
            "name": "Travel Companion Matching Journey",
            "persona": "Social Traveler",
            "goal": "Find and connect with compatible travel companions",
            "touchpoints": [
                {
                    "id": "match_01",
                    "name": "Enter Matching Mode",
                    "phase": "Service",
                    "description": "User begins looking for travel companions",
                    "user_action": "Opens matching section or swipe mode",
                    "system_response": "Match queue loads with potential companions",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Unclear matching criteria", "Empty queue"],
                    "opportunities": ["Match quality indicators", "Queue refresh"],
                    "metrics": {"session_start_rate": "45%", "queue_size": "25 avg"},
                    "duration_estimate": "3 seconds"
                },
                {
                    "id": "match_02",
                    "name": "Review Match Profile",
                    "phase": "Service",
                    "description": "User examines potential match's profile",
                    "user_action": "Views photos, bio, travel preferences",
                    "system_response": "Full profile with compatibility indicators",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Incomplete profiles", "Unclear compatibility"],
                    "opportunities": ["Compatibility breakdown", "Common interests highlight"],
                    "metrics": {"profile_view_time": "18s", "scroll_depth": "72%"},
                    "duration_estimate": "30 seconds"
                },
                {
                    "id": "match_03",
                    "name": "Make Match Decision",
                    "phase": "Service",
                    "description": "User swipes or taps to indicate interest",
                    "user_action": "Swipes right to like, left to pass",
                    "system_response": "Smooth animation, next profile loads",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Accidental swipes", "Decision fatigue"],
                    "opportunities": ["Undo feature", "Swipe limits with breaks"],
                    "metrics": {"like_rate": "35%", "decisions_per_session": "15"},
                    "duration_estimate": "5 seconds"
                },
                {
                    "id": "match_04",
                    "name": "Match Notification",
                    "phase": "Service",
                    "description": "User learns about mutual match",
                    "user_action": "Views match celebration screen",
                    "system_response": "Celebratory animation, match revealed",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Missed notification", "Anticlimactic reveal"],
                    "opportunities": ["Memorable celebration", "Instant chat prompt"],
                    "metrics": {"celebration_completion": "95%", "immediate_message_rate": "42%"},
                    "duration_estimate": "10 seconds"
                },
                {
                    "id": "match_05",
                    "name": "Start Conversation",
                    "phase": "Service",
                    "description": "User initiates chat with new match",
                    "user_action": "Sends first message or icebreaker",
                    "system_response": "Chat opens with conversation starters",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Don't know what to say", "Fear of rejection"],
                    "opportunities": ["AI icebreakers", "Common ground suggestions"],
                    "metrics": {"first_message_rate": "58%", "avg_response_time": "4h"},
                    "duration_estimate": "2 minutes"
                },
                {
                    "id": "match_06",
                    "name": "Build Connection",
                    "phase": "Service",
                    "description": "User continues conversation and builds rapport",
                    "user_action": "Exchanges messages, shares travel ideas",
                    "system_response": "Rich messaging with travel suggestions",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Conversation dies", "Limited chat features"],
                    "opportunities": ["Conversation prompts", "Shared planning tools"],
                    "metrics": {"messages_exchanged": "12 avg", "conversation_length": "3 days"},
                    "duration_estimate": "Multiple sessions"
                },
                {
                    "id": "match_07",
                    "name": "Plan to Meet/Travel",
                    "phase": "Service",
                    "description": "Match progresses to trip planning stage",
                    "user_action": "Discusses specific trip plans",
                    "system_response": "Trip planning tools and suggestions",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["No planning tools", "Hard to coordinate"],
                    "opportunities": ["Integrated planning", "Calendar sync"],
                    "metrics": {"plan_conversion": "15%", "trip_completion": "8%"},
                    "duration_estimate": "1-2 weeks"
                }
            ]
        },
        "trip_planning": {
            "name": "Trip Planning Journey",
            "persona": "Trip Organizer",
            "goal": "Plan and coordinate a successful trip with travel companions",
            "touchpoints": [
                {
                    "id": "plan_01",
                    "name": "Create Trip",
                    "phase": "Service",
                    "description": "User starts a new trip plan",
                    "user_action": "Taps create trip, enters basic details",
                    "system_response": "Trip creation wizard",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Too many fields", "Unclear process"],
                    "opportunities": ["Quick create option", "Template trips"],
                    "metrics": {"creation_completion": "78%", "avg_time": "3 min"},
                    "duration_estimate": "3 minutes"
                },
                {
                    "id": "plan_02",
                    "name": "Invite Companions",
                    "phase": "Service",
                    "description": "User invites matches to join trip",
                    "user_action": "Selects companions from matches or contacts",
                    "system_response": "Invitation sent, status tracking",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Invitation not seen", "Unclear RSVP status"],
                    "opportunities": ["Multi-channel invites", "Real-time status"],
                    "metrics": {"invite_acceptance": "65%", "avg_response_time": "2 days"},
                    "duration_estimate": "2 minutes"
                },
                {
                    "id": "plan_03",
                    "name": "Collaborative Planning",
                    "phase": "Service",
                    "description": "Group works together on trip details",
                    "user_action": "Adds activities, votes on options",
                    "system_response": "Shared planning board with real-time sync",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Sync issues", "No voting feature"],
                    "opportunities": ["Real-time collaboration", "Voting/polling"],
                    "metrics": {"collaboration_rate": "45%", "suggestions_per_trip": "8"},
                    "duration_estimate": "Multiple sessions"
                },
                {
                    "id": "plan_04",
                    "name": "Budget Management",
                    "phase": "Service",
                    "description": "Group manages trip budget and expenses",
                    "user_action": "Sets budget, tracks costs",
                    "system_response": "Budget tracker with split calculations",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Manual entry", "Currency confusion"],
                    "opportunities": ["Auto expense tracking", "Currency conversion"],
                    "metrics": {"budget_usage": "35%", "accuracy": "82%"},
                    "duration_estimate": "Throughout trip"
                },
                {
                    "id": "plan_05",
                    "name": "Finalize Itinerary",
                    "phase": "Service",
                    "description": "Group confirms final trip schedule",
                    "user_action": "Reviews and confirms itinerary",
                    "system_response": "Final itinerary with all bookings",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Missing confirmation details", "No offline access"],
                    "opportunities": ["PDF export", "Offline mode"],
                    "metrics": {"finalization_rate": "72%", "last_minute_changes": "3 avg"},
                    "duration_estimate": "30 minutes"
                },
                {
                    "id": "plan_06",
                    "name": "Trip Reminders",
                    "phase": "Service",
                    "description": "User receives helpful trip reminders",
                    "user_action": "Views and acts on reminders",
                    "system_response": "Smart notifications for trip prep",
                    "channel": "Push Notification",
                    "emotion": 4,
                    "pain_points": ["Too many notifications", "Irrelevant reminders"],
                    "opportunities": ["Smart timing", "Customizable alerts"],
                    "metrics": {"open_rate": "55%", "action_rate": "28%"},
                    "duration_estimate": "15 seconds per notification"
                }
            ]
        },
        "gifting": {
            "name": "Gift Exchange Journey",
            "persona": "Gift Enthusiast",
            "goal": "Send meaningful travel-related gifts to connections",
            "touchpoints": [
                {
                    "id": "gift_01",
                    "name": "Browse Gift Catalog",
                    "phase": "Service",
                    "description": "User explores available gift options",
                    "user_action": "Scrolls through gift categories",
                    "system_response": "Curated gift collections by category",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Limited selection", "High prices"],
                    "opportunities": ["More variety", "Price filters"],
                    "metrics": {"browse_time": "4 min", "items_viewed": "18"},
                    "duration_estimate": "5 minutes"
                },
                {
                    "id": "gift_02",
                    "name": "Personalized Recommendations",
                    "phase": "Service",
                    "description": "User views AI-powered gift suggestions",
                    "user_action": "Reviews personalized picks for recipient",
                    "system_response": "Smart recommendations based on recipient profile",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Generic suggestions", "Doesn't know recipient well"],
                    "opportunities": ["Deeper personalization", "Occasion awareness"],
                    "metrics": {"recommendation_click_rate": "42%", "conversion": "18%"},
                    "duration_estimate": "2 minutes"
                },
                {
                    "id": "gift_03",
                    "name": "Select Gift",
                    "phase": "Service",
                    "description": "User chooses specific gift to send",
                    "user_action": "Taps on gift, views details",
                    "system_response": "Gift detail page with options",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Unclear what recipient gets", "No preview"],
                    "opportunities": ["Gift preview", "Recipient perspective view"],
                    "metrics": {"selection_rate": "35%", "cart_add_rate": "25%"},
                    "duration_estimate": "1 minute"
                },
                {
                    "id": "gift_04",
                    "name": "Add Personal Message",
                    "phase": "Service",
                    "description": "User writes personalized gift message",
                    "user_action": "Types or selects message",
                    "system_response": "Message input with templates and preview",
                    "channel": "Mobile App",
                    "emotion": 4,
                    "pain_points": ["Writer's block", "Character limits"],
                    "opportunities": ["AI message suggestions", "Voice recording"],
                    "metrics": {"message_rate": "85%", "avg_length": "42 chars"},
                    "duration_estimate": "2 minutes"
                },
                {
                    "id": "gift_05",
                    "name": "Payment",
                    "phase": "Service",
                    "description": "User completes gift purchase",
                    "user_action": "Enters payment details, confirms",
                    "system_response": "Secure checkout flow",
                    "channel": "Mobile App",
                    "emotion": 3,
                    "pain_points": ["Payment failures", "Hidden fees"],
                    "opportunities": ["Saved payment methods", "Transparent pricing"],
                    "metrics": {"checkout_completion": "72%", "abandonment": "28%"},
                    "duration_estimate": "1 minute"
                },
                {
                    "id": "gift_06",
                    "name": "Gift Sent Confirmation",
                    "phase": "Service",
                    "description": "User receives confirmation of sent gift",
                    "user_action": "Views success screen and delivery info",
                    "system_response": "Celebratory confirmation with tracking",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["No delivery tracking", "Uncertain delivery"],
                    "opportunities": ["Real-time tracking", "Delivery notifications"],
                    "metrics": {"confirmation_view": "98%", "track_check_rate": "65%"},
                    "duration_estimate": "30 seconds"
                },
                {
                    "id": "gift_07",
                    "name": "Recipient Notification",
                    "phase": "Service",
                    "description": "Recipient learns about incoming gift",
                    "user_action": "Recipient opens notification",
                    "system_response": "Surprise notification with teaser",
                    "channel": "Push Notification",
                    "emotion": 5,
                    "pain_points": ["Spoiled surprise", "Notification ignored"],
                    "opportunities": ["Perfect timing", "Intriguing preview"],
                    "metrics": {"notification_open": "78%", "immediate_view": "62%"},
                    "duration_estimate": "10 seconds"
                },
                {
                    "id": "gift_08",
                    "name": "Gift Received",
                    "phase": "Loyalty",
                    "description": "Recipient opens and enjoys the gift",
                    "user_action": "Recipient views gift and message",
                    "system_response": "Delightful unwrapping experience",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Anticlimactic reveal", "Technical issues"],
                    "opportunities": ["Beautiful animations", "Thank you prompts"],
                    "metrics": {"unwrap_completion": "95%", "thank_you_rate": "72%"},
                    "duration_estimate": "1 minute"
                },
                {
                    "id": "gift_09",
                    "name": "Thank You Exchange",
                    "phase": "Loyalty",
                    "description": "Recipient sends thanks, connection strengthened",
                    "user_action": "Recipient sends thank you message",
                    "system_response": "Easy thank you flow, sender notified",
                    "channel": "Mobile App",
                    "emotion": 5,
                    "pain_points": ["Feels obligatory", "Hard to express thanks"],
                    "opportunities": ["Thank you templates", "Photo/video option"],
                    "metrics": {"thank_you_sent": "72%", "continued_conversation": "45%"},
                    "duration_estimate": "1 minute"
                }
            ]
        }
    }

    def __init__(self, journey_data: Optional[dict] = None):
        """Initialize with optional custom journey data."""
        self.journey_data = journey_data

    @classmethod
    def from_template(cls, template_name: str) -> 'JourneyMapper':
        """Create mapper from pre-defined template."""
        if template_name not in cls.JOURNEY_TEMPLATES:
            raise ValueError(f"Unknown template: {template_name}. Available: {list(cls.JOURNEY_TEMPLATES.keys())}")
        return cls(cls.JOURNEY_TEMPLATES[template_name])

    @classmethod
    def from_json(cls, json_data: dict) -> 'JourneyMapper':
        """Create mapper from JSON data."""
        return cls(json_data)

    def get_phases(self) -> list:
        """Extract unique phases from touchpoints."""
        if not self.journey_data:
            return []

        phases = []
        seen = set()
        for tp in self.journey_data.get("touchpoints", []):
            phase = tp.get("phase")
            if phase and phase not in seen:
                phases.append(phase)
                seen.add(phase)
        return phases

    def calculate_emotion_curve(self) -> list:
        """Calculate the emotional journey across touchpoints."""
        touchpoints = self.journey_data.get("touchpoints", [])
        return [
            {
                "touchpoint": tp.get("name"),
                "emotion": tp.get("emotion", 3),
                "phase": tp.get("phase")
            }
            for tp in touchpoints
        ]

    def identify_key_insights(self) -> list:
        """Identify key insights from the journey analysis."""
        insights = []
        touchpoints = self.journey_data.get("touchpoints", [])

        if not touchpoints:
            return insights

        # Find emotional highs and lows
        emotions = [(tp["name"], tp.get("emotion", 3)) for tp in touchpoints]
        max_emotion = max(emotions, key=lambda x: x[1])
        min_emotion = min(emotions, key=lambda x: x[1])

        insights.append(f"Peak experience: '{max_emotion[0]}' with emotion score {max_emotion[1]}/5")
        insights.append(f"Friction point: '{min_emotion[0]}' with emotion score {min_emotion[1]}/5")

        # Analyze pain points frequency
        all_pain_points = []
        for tp in touchpoints:
            all_pain_points.extend(tp.get("pain_points", []))

        if all_pain_points:
            insights.append(f"Total {len(all_pain_points)} pain points identified across {len(touchpoints)} touchpoints")

        # Analyze opportunities
        all_opportunities = []
        for tp in touchpoints:
            all_opportunities.extend(tp.get("opportunities", []))

        if all_opportunities:
            insights.append(f"Total {len(all_opportunities)} improvement opportunities identified")

        # Phase analysis
        phases = self.get_phases()
        insights.append(f"Journey spans {len(phases)} phases: {', '.join(phases)}")

        return insights

    def generate_recommendations(self) -> list:
        """Generate prioritized recommendations from journey analysis."""
        recommendations = []
        touchpoints = self.journey_data.get("touchpoints", [])

        # Prioritize low-emotion touchpoints
        low_emotion_tps = [tp for tp in touchpoints if tp.get("emotion", 3) <= 3]

        for tp in low_emotion_tps[:3]:  # Top 3 priority
            pain_points = tp.get("pain_points", [])
            opportunities = tp.get("opportunities", [])

            if pain_points:
                recommendations.append({
                    "priority": "High",
                    "touchpoint": tp["name"],
                    "issue": pain_points[0],
                    "recommendation": opportunities[0] if opportunities else "Investigate and address pain point"
                })

        # Add general recommendations based on patterns
        all_pain_points = []
        for tp in touchpoints:
            all_pain_points.extend(tp.get("pain_points", []))

        pain_point_text = " ".join(all_pain_points).lower()

        if "slow" in pain_point_text or "load" in pain_point_text:
            recommendations.append({
                "priority": "High",
                "touchpoint": "Multiple",
                "issue": "Performance concerns mentioned",
                "recommendation": "Conduct performance audit and optimize load times"
            })

        if "confus" in pain_point_text or "unclear" in pain_point_text:
            recommendations.append({
                "priority": "Medium",
                "touchpoint": "Multiple",
                "issue": "Clarity issues identified",
                "recommendation": "Review and simplify UI copy and navigation"
            })

        return recommendations

    def generate_journey_map(self) -> JourneyMap:
        """Generate complete journey map."""
        if not self.journey_data:
            raise ValueError("No journey data available")

        touchpoints = [
            Touchpoint(
                id=tp.get("id", f"tp_{i}"),
                name=tp.get("name", "Unknown"),
                phase=tp.get("phase", "Unknown"),
                description=tp.get("description", ""),
                user_action=tp.get("user_action", ""),
                system_response=tp.get("system_response", ""),
                channel=tp.get("channel", "Unknown"),
                emotion=tp.get("emotion", 3),
                pain_points=tp.get("pain_points", []),
                opportunities=tp.get("opportunities", []),
                metrics=tp.get("metrics", {}),
                duration_estimate=tp.get("duration_estimate"),
                dependencies=tp.get("dependencies", [])
            )
            for i, tp in enumerate(self.journey_data.get("touchpoints", []))
        ]

        return JourneyMap(
            name=self.journey_data.get("name", "Customer Journey"),
            persona=self.journey_data.get("persona", "User"),
            goal=self.journey_data.get("goal", "Complete journey"),
            phases=self.get_phases(),
            touchpoints=[asdict(tp) for tp in touchpoints],
            overall_emotion_curve=self.calculate_emotion_curve(),
            key_insights=self.identify_key_insights(),
            recommendations=self.generate_recommendations(),
            metadata={
                "generated_at": datetime.now().isoformat(),
                "total_touchpoints": len(touchpoints),
                "avg_emotion_score": sum(tp.emotion for tp in touchpoints) / len(touchpoints) if touchpoints else 0
            }
        )


def format_journey_output(journey_map: JourneyMap) -> str:
    """Format journey map for human-readable output."""
    output = []
    output.append("=" * 80)
    output.append(f"CUSTOMER JOURNEY MAP: {journey_map.name}")
    output.append("=" * 80)
    output.append(f"\nPersona: {journey_map.persona}")
    output.append(f"Goal: {journey_map.goal}")
    output.append(f"Phases: {' → '.join(journey_map.phases)}")

    # Emotion curve visualization
    output.append("\n--- EMOTION CURVE ---")
    output.append("")
    for item in journey_map.overall_emotion_curve:
        emotion = item["emotion"]
        bar = "█" * emotion + "░" * (5 - emotion)
        output.append(f"  [{bar}] {emotion}/5  {item['touchpoint'][:35]:<35} ({item['phase']})")

    # Touchpoints detail
    output.append("\n--- TOUCHPOINTS ---")
    for i, tp in enumerate(journey_map.touchpoints, 1):
        output.append(f"\n{i}. {tp['name']} [{tp['phase']}]")
        output.append(f"   Channel: {tp['channel']}")
        output.append(f"   User Action: {tp['user_action']}")
        output.append(f"   System Response: {tp['system_response']}")
        if tp['duration_estimate']:
            output.append(f"   Duration: {tp['duration_estimate']}")
        if tp['pain_points']:
            output.append(f"   Pain Points: {', '.join(tp['pain_points'])}")
        if tp['opportunities']:
            output.append(f"   Opportunities: {', '.join(tp['opportunities'])}")
        if tp['metrics']:
            metrics_str = ", ".join([f"{k}: {v}" for k, v in tp['metrics'].items()])
            output.append(f"   Metrics: {metrics_str}")

    # Key insights
    output.append("\n--- KEY INSIGHTS ---")
    for insight in journey_map.key_insights:
        output.append(f"  • {insight}")

    # Recommendations
    output.append("\n--- RECOMMENDATIONS ---")
    for rec in journey_map.recommendations:
        output.append(f"\n  [{rec['priority']}] {rec['touchpoint']}")
        output.append(f"    Issue: {rec['issue']}")
        output.append(f"    Recommendation: {rec['recommendation']}")

    # Metadata
    output.append("\n--- METADATA ---")
    output.append(f"  Total Touchpoints: {journey_map.metadata['total_touchpoints']}")
    output.append(f"  Average Emotion Score: {journey_map.metadata['avg_emotion_score']:.1f}/5")
    output.append(f"  Generated: {journey_map.metadata['generated_at']}")

    output.append("\n")
    return "\n".join(output)


def generate_full_journey() -> JourneyMap:
    """Generate complete end-to-end journey combining all templates."""
    combined_touchpoints = []
    combined_name = "Complete TravelMatch User Journey"

    journey_order = ["onboarding", "discovery", "matching", "trip_planning", "gifting"]

    for journey_name in journey_order:
        template = JourneyMapper.JOURNEY_TEMPLATES[journey_name]
        for tp in template["touchpoints"]:
            tp_copy = tp.copy()
            tp_copy["id"] = f"{journey_name}_{tp['id']}"
            combined_touchpoints.append(tp_copy)

    combined_data = {
        "name": combined_name,
        "persona": "Complete TravelMatch User",
        "goal": "Experience the full TravelMatch platform from signup to gifting",
        "touchpoints": combined_touchpoints
    }

    mapper = JourneyMapper(combined_data)
    return mapper.generate_journey_map()


def main():
    parser = argparse.ArgumentParser(
        description="Generate customer journey maps for TravelMatch",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python journey_mapper.py --journey onboarding        # Onboarding journey
  python journey_mapper.py --journey matching json     # Matching journey as JSON
  python journey_mapper.py --list                      # List available journeys
  python journey_mapper.py --journey full              # Complete end-to-end journey
  python journey_mapper.py --file custom.json          # Custom journey from file

Available Journeys:
  onboarding      New user registration and setup
  discovery       Finding travel matches and destinations
  matching        Connecting with travel companions
  trip_planning   Planning and coordinating trips
  gifting         Gift exchange experience
  full            Complete end-to-end journey
        """
    )
    parser.add_argument("format", nargs="?", default="text",
                       choices=["text", "json"],
                       help="Output format (default: text)")
    parser.add_argument("--journey", "-j", type=str,
                       help="Journey type to generate")
    parser.add_argument("--list", "-l", action="store_true",
                       help="List available journey templates")
    parser.add_argument("--file", "-f", type=str,
                       help="Path to custom journey JSON file")

    args = parser.parse_args()

    if args.list:
        print("\nAvailable Journey Templates:")
        print("-" * 40)
        for name, template in JourneyMapper.JOURNEY_TEMPLATES.items():
            print(f"  {name:<15} - {template['name']}")
        print("\n  full            - Complete end-to-end journey")
        print()
        return

    # Generate journey map
    if args.file:
        try:
            safe_path = validate_safe_path(args.file)
            # deepcode ignore PT: Path validated via validate_safe_path() above
            with open(safe_path, 'r') as f:
                data = json.load(f)
            mapper = JourneyMapper.from_json(data)
            journey_map = mapper.generate_journey_map()
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        except FileNotFoundError:
            print(f"Error: File '{args.file}' not found", file=sys.stderr)
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in '{args.file}': {e}", file=sys.stderr)
            sys.exit(1)
    elif args.journey:
        if args.journey == "full":
            journey_map = generate_full_journey()
        else:
            try:
                mapper = JourneyMapper.from_template(args.journey)
                journey_map = mapper.generate_journey_map()
            except ValueError as e:
                print(f"Error: {e}", file=sys.stderr)
                print(f"Available journeys: {', '.join(JourneyMapper.JOURNEY_TEMPLATES.keys())}, full")
                sys.exit(1)
    else:
        # Default to onboarding
        mapper = JourneyMapper.from_template("onboarding")
        journey_map = mapper.generate_journey_map()
        if args.format == "text":
            print("No journey specified, using 'onboarding' as default.\n")

    # Output results
    if args.format == "json":
        output = asdict(journey_map)
        print(json.dumps(output, indent=2))
    else:
        print(format_journey_output(journey_map))


if __name__ == "__main__":
    main()

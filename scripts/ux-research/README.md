# UX Research & Design Toolkit

Comprehensive toolkit for user-centered research and experience design at Lovendo.

## Overview

This toolkit provides data-driven tools for:
- **Persona Generation** - Create research-backed user personas
- **Journey Mapping** - Map customer experiences across touchpoints
- **Usability Testing** - Plan, execute, and analyze usability tests
- **Research Synthesis** - Extract insights from qualitative data
- **Design Validation** - Validate designs against heuristics and accessibility standards

## Quick Start

```bash
# Run with sample data to see capabilities
python scripts/ux-research/persona_generator.py --sample
python scripts/ux-research/journey_mapper.py --journey onboarding
python scripts/ux-research/usability_testing.py --plan discovery
python scripts/ux-research/research_synthesizer.py --sample
python scripts/ux-research/design_validator.py --heuristics
```

---

## Tools

### 1. Persona Generator (`persona_generator.py`)

Creates research-backed personas from user data and interviews.

**Usage:**
```bash
# Demo with sample data
python persona_generator.py --sample

# From JSON file
python persona_generator.py --file user_data.json

# JSON output format
python persona_generator.py --sample json
```

**Features:**
- Analyzes user behavior patterns
- Identifies persona archetypes (Explorer, Connector, Planner, etc.)
- Extracts psychographics (motivations, values, emotional drivers)
- Generates usage scenarios
- Provides design implications
- Confidence scoring based on sample size

**Input Format:**
```json
[
  {
    "user_id": "user_001",
    "age": 28,
    "travel_styles": ["adventure", "cultural"],
    "goals": ["Discover hidden gems", "Connect with locals"],
    "pain_points": ["Finding authentic experiences"],
    "interview_quotes": ["I want to feel like a local"]
  }
]
```

**Output:**
```
PERSONA: Maya - The Connector
Tagline: "Travel is better when shared with the right people"
Confidence Score: 78.5% (based on 12 users)

--- PSYCHOGRAPHICS ---
  Primary Motivations: Connection, Discovery, Memory Making
  Core Values: Community & Belonging, Curiosity & Learning

--- DESIGN IMPLICATIONS ---
  * Emphasize social features and connection-building tools
  * Streamline gift-sending and receiving workflows
```

---

### 2. Journey Mapper (`journey_mapper.py`)

Creates comprehensive customer journey maps for Lovendo flows.

**Usage:**
```bash
# List available journeys
python journey_mapper.py --list

# Generate specific journey
python journey_mapper.py --journey onboarding
python journey_mapper.py --journey matching json

# Complete end-to-end journey
python journey_mapper.py --journey full
```

**Available Journeys:**
| Journey | Description |
|---------|-------------|
| `onboarding` | New user registration and setup |
| `discovery` | Finding travel matches and destinations |
| `matching` | Connecting with travel companions |
| `trip_planning` | Planning and coordinating trips |
| `gifting` | Gift exchange experience |
| `full` | Complete end-to-end journey |

**Output Includes:**
- Touchpoint details with user actions and system responses
- Emotion curve visualization
- Pain points and opportunities at each step
- Key metrics for each touchpoint
- Prioritized recommendations

**Emotion Curve Example:**
```
--- EMOTION CURVE ---

  [████░] 4/5  App Discovery                       (Awareness)
  [███░░] 3/5  App Download                        (Acquisition)
  [████░] 4/5  Welcome Screen                      (Acquisition)
  [█████] 5/5  First Match Preview                 (Service)
```

---

### 3. Usability Testing Framework (`usability_testing.py`)

Creates and manages usability testing sessions.

**Usage:**
```bash
# Generate test plan for a flow
python usability_testing.py --plan onboarding
python usability_testing.py --plan matching --participants 8

# List available test flows
python usability_testing.py --list

# Generate blank results template
python usability_testing.py --template

# Analyze completed test results
python usability_testing.py --analyze results.json
```

**Test Plan Includes:**
- Participant criteria and screening questions
- Detailed task scenarios with success criteria
- Pre-test and post-test questionnaires (SUS)
- Metrics to capture
- Equipment checklist
- Methodology notes

**Task Example:**
```
2. Set Up Profile [EASY]
   Scenario: Now that you have an account, add your profile photo
   and basic information so other travelers can learn about you.
   Expected Duration: 2-4 minutes
   Success Criteria:
     - Profile photo uploaded
     - Bio filled in
     - Profile completion above 50%
   Metrics: time_on_task, success_rate, satisfaction
```

**Analysis Features:**
- Task success rate calculation
- System Usability Scale (SUS) scoring
- Severity ratings for identified issues
- Prioritized recommendations

---

### 4. Research Synthesizer (`research_synthesizer.py`)

Synthesizes findings from multiple research sources into actionable insights.

**Usage:**
```bash
# Demo with sample data
python research_synthesizer.py --sample

# Synthesize from files
python research_synthesizer.py --files interviews.json survey.json

# Analyze interview transcript
python research_synthesizer.py --interview transcript.txt

# Different output types
python research_synthesizer.py --sample --output insights
python research_synthesizer.py --sample --output affinity
python research_synthesizer.py --sample --output quotes
```

**Supports Data Sources:**
- Interview transcripts
- Survey responses
- Usability test observations
- Analytics data
- User feedback

**Output Types:**
| Type | Description |
|------|-------------|
| `report` | Full research synthesis report |
| `insights` | Key insights extraction |
| `affinity` | Affinity diagram data structure |
| `quotes` | Notable quotes collection |

**Insight Example:**
```
--- INSIGHT 1: INS_001 ---
Title: Users struggle with trust & safety and navigation
Type: Pain Point
Evidence Count: 8
Confidence: 85%

Description: Based on 8 observations from 3 data sources,
we identified a pain point pattern related to Trust & Safety,
Navigation. This insight has strong evidence support.

Recommendations:
  - Conduct additional usability testing to quantify impact
  - Prioritize UX improvements in affected areas
```

---

### 5. Design Validator (`design_validator.py`)

Validates designs against research, heuristics, and accessibility standards.

**Usage:**
```bash
# Generate validation checklists
python design_validator.py --heuristics       # Nielsen's 10 heuristics
python design_validator.py --accessibility    # WCAG 2.1 AA
python design_validator.py --mobile           # Mobile best practices
python design_validator.py --personas         # All persona checks
python design_validator.py --all              # Combined checklist

# Specific persona validation
python design_validator.py --persona "The Explorer"

# Generate blank evaluation form
python design_validator.py --form heuristics

# Analyze completed evaluation
python design_validator.py --analyze evaluation_results.json
```

**Validation Types:**

| Type | Items | Focus |
|------|-------|-------|
| `heuristics` | 10 | Nielsen's usability heuristics |
| `accessibility` | 10 | WCAG 2.1 AA key requirements |
| `mobile` | 8 | Mobile design best practices |
| `personas` | 15+ | Persona-specific validation |

**Checklist Item Example:**
```
H03. User Control and Freedom [!!!]
   Question: Can users easily undo, redo, cancel, or exit from any state?
   Pass Criteria: Undo/redo available, cancel buttons present
   If Failed: Users may feel trapped or frustrated when they make mistakes
   Resources: Undo accidental swipe on match, Cancel mid-checkout
   [ ] PASS  [ ] FAIL  Notes: _____________
```

**Severity Levels:**
- `[!!!]` Critical - Must fix before release
- `[!!]` Major - Should fix in current sprint
- `[!]` Minor - Fix when possible
- `[.]` Cosmetic - Nice to fix

---

## Integration Examples

### Research Workflow

```bash
# 1. Synthesize interview data
python research_synthesizer.py --files interviews.json --output report

# 2. Generate personas from synthesized data
python persona_generator.py --file user_profiles.json

# 3. Map user journeys
python journey_mapper.py --journey full

# 4. Plan usability tests
python usability_testing.py --plan onboarding

# 5. Analyze test results
python usability_testing.py --analyze test_results.json

# 6. Validate designs
python design_validator.py --all
```

### CI/CD Integration

```yaml
# Example GitHub Action step
- name: Validate Design Accessibility
  run: |
    python scripts/ux-research/design_validator.py --accessibility json > validation.json
    # Process validation.json for accessibility gates
```

### JSON Output for Tools

All scripts support JSON output for integration with other tools:

```bash
python persona_generator.py --sample json | jq '.personas[0].name'
python journey_mapper.py --journey onboarding json | jq '.touchpoints | length'
python research_synthesizer.py --sample --output insights json > insights.json
```

---

## File Structure

```
scripts/ux-research/
├── README.md                  # This documentation
├── persona_generator.py       # Persona generation tool
├── journey_mapper.py          # Customer journey mapping
├── usability_testing.py       # Usability test framework
├── research_synthesizer.py    # Research synthesis tool
└── design_validator.py        # Design validation tool
```

---

## Requirements

- Python 3.9+
- No external dependencies (uses standard library only)

---

## Best Practices

### For Persona Generation
- Aim for 5+ user data points per persona for higher confidence
- Include behavioral data, not just demographics
- Capture real interview quotes for authenticity

### For Journey Mapping
- Start with the most critical user flow
- Include emotional states at each touchpoint
- Document both pain points AND opportunities

### For Usability Testing
- Test with 5 users to find 80% of issues
- Use think-aloud protocol for richer insights
- Record both successes and failures

### For Research Synthesis
- Tag data consistently across sources
- Look for patterns across multiple participants
- Prioritize insights by frequency and impact

### For Design Validation
- Validate early and often during design
- Address critical issues before major ones
- Re-validate after significant changes

---

## Contributing

To add new features or validation criteria:
1. Follow existing patterns in the codebase
2. Add appropriate sample data
3. Update this README
4. Test with `--sample` flag

---

**Last Updated:** 2025-12-22
**Maintainer:** Lovendo UX Team

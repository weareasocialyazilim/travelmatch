#!/usr/bin/env python3
"""
Accessibility Compliance Checker for TravelMatch Design System

Validates design tokens and color combinations against WCAG 2.1 guidelines.

Usage:
    python accessibility_checker.py [command] [args]

Commands:
    contrast <foreground> <background>
        Check color contrast ratio and WCAG compliance

    palette <color_file>
        Validate an entire color palette for accessibility

    text-size <font-size> [context]
        Check if text size meets accessibility guidelines

    touch-target <width> <height>
        Validate touch target size (minimum 44x44px)

    full-audit
        Run complete accessibility audit on design tokens

Examples:
    python accessibility_checker.py contrast "#FFFFFF" "#2196F3"
    python accessibility_checker.py text-size 14 body
    python accessibility_checker.py touch-target 48 48
    python accessibility_checker.py full-audit
"""

import sys
import json
from typing import Dict, Any, Tuple, List


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c*2 for c in hex_color])
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (r, g, b)


def get_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """
    Calculate relative luminance of a color.
    Based on WCAG 2.1 formula.
    """
    def adjust_channel(channel: int) -> float:
        c = channel / 255
        if c <= 0.03928:
            return c / 12.92
        return ((c + 0.055) / 1.055) ** 2.4

    r, g, b = [adjust_channel(c) for c in rgb]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def calculate_contrast_ratio(color1: str, color2: str) -> float:
    """
    Calculate contrast ratio between two colors.
    Returns ratio from 1:1 to 21:1
    """
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)

    lum1 = get_relative_luminance(rgb1)
    lum2 = get_relative_luminance(rgb2)

    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)


def check_wcag_compliance(ratio: float) -> Dict[str, Any]:
    """
    Check WCAG 2.1 compliance for a given contrast ratio.
    """
    return {
        "ratio": round(ratio, 2),
        "ratioFormatted": f"{ratio:.2f}:1",
        "wcag": {
            "AA": {
                "normalText": ratio >= 4.5,
                "largeText": ratio >= 3.0,
                "uiComponents": ratio >= 3.0,
            },
            "AAA": {
                "normalText": ratio >= 7.0,
                "largeText": ratio >= 4.5,
            }
        },
        "recommendations": get_contrast_recommendations(ratio),
    }


def get_contrast_recommendations(ratio: float) -> List[str]:
    """Get recommendations based on contrast ratio."""
    recs = []

    if ratio >= 7.0:
        recs.append("Excellent! Passes WCAG AAA for all text sizes.")
    elif ratio >= 4.5:
        recs.append("Good! Passes WCAG AA for normal text.")
        recs.append("Consider increasing contrast for AAA compliance.")
    elif ratio >= 3.0:
        recs.append("Acceptable for large text (18pt+) and UI components only.")
        recs.append("Not sufficient for normal body text.")
    else:
        recs.append("FAIL: Does not meet minimum WCAG requirements.")
        recs.append("Increase contrast by using lighter background or darker text.")

    return recs


def suggest_accessible_color(
    foreground: str,
    background: str,
    target_ratio: float = 4.5
) -> Dict[str, Any]:
    """
    Suggest accessible color alternatives.
    """
    current_ratio = calculate_contrast_ratio(foreground, background)

    if current_ratio >= target_ratio:
        return {
            "currentRatio": round(current_ratio, 2),
            "meetsTarget": True,
            "suggestions": []
        }

    suggestions = []
    fg_rgb = hex_to_rgb(foreground)
    bg_rgb = hex_to_rgb(background)

    # Try darkening foreground
    for factor in [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]:
        darker_fg = tuple(int(c * factor) for c in fg_rgb)
        darker_hex = '#{:02X}{:02X}{:02X}'.format(*darker_fg)
        new_ratio = calculate_contrast_ratio(darker_hex, background)
        if new_ratio >= target_ratio:
            suggestions.append({
                "type": "darkerForeground",
                "color": darker_hex,
                "ratio": round(new_ratio, 2)
            })
            break

    # Try lightening background
    for factor in [1.1, 1.2, 1.3, 1.4, 1.5]:
        lighter_bg = tuple(min(255, int(c * factor)) for c in bg_rgb)
        lighter_hex = '#{:02X}{:02X}{:02X}'.format(*lighter_bg)
        new_ratio = calculate_contrast_ratio(foreground, lighter_hex)
        if new_ratio >= target_ratio:
            suggestions.append({
                "type": "lighterBackground",
                "color": lighter_hex,
                "ratio": round(new_ratio, 2)
            })
            break

    return {
        "currentRatio": round(current_ratio, 2),
        "targetRatio": target_ratio,
        "meetsTarget": False,
        "suggestions": suggestions
    }


def check_text_size_accessibility(
    font_size: float,
    context: str = "body"
) -> Dict[str, Any]:
    """
    Check if text size meets accessibility guidelines.
    """
    # Minimum sizes by context (in pixels)
    min_sizes = {
        "body": 16,
        "caption": 12,
        "button": 14,
        "label": 12,
        "heading": 18,
        "link": 14,
    }

    # Recommended sizes
    recommended_sizes = {
        "body": 16,
        "caption": 14,
        "button": 16,
        "label": 14,
        "heading": 24,
        "link": 16,
    }

    min_size = min_sizes.get(context, 16)
    recommended = recommended_sizes.get(context, 16)

    is_large_text = font_size >= 18 or (font_size >= 14 and context == "heading")

    return {
        "fontSize": font_size,
        "context": context,
        "meetsMinimum": font_size >= min_size,
        "meetsRecommended": font_size >= recommended,
        "minimumSize": min_size,
        "recommendedSize": recommended,
        "isLargeText": is_large_text,
        "notes": [
            f"Large text (18px+) has relaxed contrast requirements (3:1 vs 4.5:1)"
            if is_large_text else
            "Normal text requires 4.5:1 contrast ratio for WCAG AA",
            f"Mobile: Consider 10-20% larger sizes for touch interfaces",
        ]
    }


def check_touch_target(width: float, height: float) -> Dict[str, Any]:
    """
    Validate touch target size against accessibility guidelines.
    WCAG 2.1 SC 2.5.5 (AAA): 44x44px minimum
    Apple HIG: 44x44pt
    Material Design: 48x48dp
    """
    wcag_min = 44
    material_min = 48

    meets_wcag = width >= wcag_min and height >= wcag_min
    meets_material = width >= material_min and height >= material_min

    issues = []
    if width < wcag_min:
        issues.append(f"Width ({width}px) is below minimum ({wcag_min}px)")
    if height < wcag_min:
        issues.append(f"Height ({height}px) is below minimum ({wcag_min}px)")

    return {
        "width": width,
        "height": height,
        "area": width * height,
        "meetsWCAG": meets_wcag,
        "meetsMaterial": meets_material,
        "wcagMinimum": wcag_min,
        "materialMinimum": material_min,
        "level": "AAA" if meets_material else ("AA" if meets_wcag else "FAIL"),
        "issues": issues,
        "recommendations": [
            "Minimum touch target: 44x44px (WCAG AAA)",
            "Recommended: 48x48px (Material Design)",
            "Include adequate spacing between touch targets",
            "Consider larger targets for primary actions",
        ] if issues else ["Touch target size is accessible!"]
    }


def check_focus_indicator(
    outline_width: float,
    outline_offset: float = 0,
    outline_color: str = "#000000",
    background_color: str = "#FFFFFF"
) -> Dict[str, Any]:
    """
    Validate focus indicator visibility.
    WCAG 2.1 SC 2.4.7: Focus visible
    WCAG 2.2 SC 2.4.11: Focus appearance (minimum)
    """
    # Minimum focus indicator area
    min_width = 2
    min_area = outline_width * 2 * 4  # Approximate perimeter area

    # Check contrast of focus indicator
    contrast = calculate_contrast_ratio(outline_color, background_color)

    meets_visible = outline_width >= min_width
    meets_contrast = contrast >= 3.0

    return {
        "outlineWidth": outline_width,
        "outlineOffset": outline_offset,
        "contrast": round(contrast, 2),
        "meetsVisibility": meets_visible,
        "meetsContrast": meets_contrast,
        "isAccessible": meets_visible and meets_contrast,
        "recommendations": [
            f"Outline width should be at least {min_width}px" if not meets_visible else None,
            f"Focus indicator contrast ({contrast:.1f}:1) should be at least 3:1" if not meets_contrast else None,
            "Consider using offset to avoid overlap with element border",
        ]
    }


def audit_color_palette(colors: Dict[str, Dict[str, str]]) -> Dict[str, Any]:
    """
    Audit an entire color palette for accessibility.
    """
    results = {
        "summary": {
            "total_combinations": 0,
            "passing_aa": 0,
            "passing_aaa": 0,
            "failing": 0,
        },
        "combinations": [],
        "issues": [],
        "recommendations": [],
    }

    # Test each color against white and dark backgrounds
    backgrounds = ["#FFFFFF", "#F5F5F5", "#212121", "#000000"]

    for palette_name, palette in colors.items():
        if not isinstance(palette, dict):
            continue

        for shade, color in palette.items():
            if not isinstance(color, str) or not color.startswith('#'):
                continue

            for bg in backgrounds:
                ratio = calculate_contrast_ratio(color, bg)
                compliance = check_wcag_compliance(ratio)

                results["summary"]["total_combinations"] += 1

                combo = {
                    "foreground": f"{palette_name}.{shade}",
                    "foregroundColor": color,
                    "background": bg,
                    "ratio": round(ratio, 2),
                    "passesAA": compliance["wcag"]["AA"]["normalText"],
                    "passesAAA": compliance["wcag"]["AAA"]["normalText"],
                }

                if compliance["wcag"]["AAA"]["normalText"]:
                    results["summary"]["passing_aaa"] += 1
                    results["summary"]["passing_aa"] += 1
                elif compliance["wcag"]["AA"]["normalText"]:
                    results["summary"]["passing_aa"] += 1
                else:
                    results["summary"]["failing"] += 1
                    results["issues"].append(
                        f"{palette_name}.{shade} ({color}) on {bg}: {ratio:.1f}:1 - FAILS AA"
                    )

                results["combinations"].append(combo)

    # Calculate pass rates
    total = results["summary"]["total_combinations"]
    if total > 0:
        results["summary"]["aa_pass_rate"] = f"{(results['summary']['passing_aa'] / total * 100):.1f}%"
        results["summary"]["aaa_pass_rate"] = f"{(results['summary']['passing_aaa'] / total * 100):.1f}%"

    return results


def generate_full_audit() -> Dict[str, Any]:
    """
    Run a complete accessibility audit on default design tokens.
    """
    # Default TravelMatch color palette
    colors = {
        "primary": {
            "500": "#2196F3",
            "600": "#1E88E5",
            "700": "#1976D2",
        },
        "secondary": {
            "500": "#E91E63",
            "600": "#D81B60",
        },
        "text": {
            "primary": "#212121",
            "secondary": "#757575",
            "disabled": "#BDBDBD",
        },
        "neutral": {
            "100": "#F5F5F5",
            "200": "#EEEEEE",
            "500": "#9E9E9E",
            "900": "#212121",
        }
    }

    # Text size checks
    text_sizes = [
        (12, "caption"),
        (14, "body"),
        (16, "body"),
        (18, "heading"),
        (24, "heading"),
    ]

    # Touch target checks
    touch_targets = [
        (32, 32),
        (40, 40),
        (44, 44),
        (48, 48),
    ]

    return {
        "colorAudit": audit_color_palette(colors),
        "textSizes": [
            check_text_size_accessibility(size, ctx)
            for size, ctx in text_sizes
        ],
        "touchTargets": [
            check_touch_target(w, h)
            for w, h in touch_targets
        ],
        "keyContrasts": [
            {
                "name": "Primary on White",
                **check_wcag_compliance(calculate_contrast_ratio("#2196F3", "#FFFFFF"))
            },
            {
                "name": "Text Primary on White",
                **check_wcag_compliance(calculate_contrast_ratio("#212121", "#FFFFFF"))
            },
            {
                "name": "Text Secondary on White",
                **check_wcag_compliance(calculate_contrast_ratio("#757575", "#FFFFFF"))
            },
            {
                "name": "White on Primary",
                **check_wcag_compliance(calculate_contrast_ratio("#FFFFFF", "#2196F3"))
            },
        ],
        "recommendations": [
            "Ensure all interactive elements have visible focus states",
            "Test with screen readers (VoiceOver, TalkBack, NVDA)",
            "Validate color blindness accessibility with simulators",
            "Test keyboard navigation for all interactive components",
            "Provide text alternatives for images and icons",
        ]
    }


def print_help():
    """Print usage help."""
    print(__doc__)


def main():
    if len(sys.argv) < 2:
        # Default: run full audit summary
        audit = generate_full_audit()
        print("=" * 60)
        print("ACCESSIBILITY COMPLIANCE AUDIT")
        print("=" * 60)
        print("")
        print("COLOR CONTRAST SUMMARY")
        print("-" * 40)
        summary = audit["colorAudit"]["summary"]
        print(f"  Total combinations tested: {summary['total_combinations']}")
        print(f"  Passing AA: {summary['passing_aa']} ({summary.get('aa_pass_rate', 'N/A')})")
        print(f"  Passing AAA: {summary['passing_aaa']} ({summary.get('aaa_pass_rate', 'N/A')})")
        print(f"  Failing: {summary['failing']}")
        print("")
        print("KEY CONTRASTS")
        print("-" * 40)
        for item in audit["keyContrasts"]:
            status = "PASS" if item["wcag"]["AA"]["normalText"] else "FAIL"
            print(f"  {item['name']}: {item['ratioFormatted']} [{status}]")
        print("")
        print("RECOMMENDATIONS")
        print("-" * 40)
        for rec in audit["recommendations"]:
            print(f"  - {rec}")
        return

    command = sys.argv[1]
    args = sys.argv[2:]

    try:
        if command == "help" or command == "--help" or command == "-h":
            print_help()

        elif command == "contrast":
            if len(args) < 2:
                print("Error: contrast requires foreground and background colors")
                print("Usage: contrast <foreground> <background>")
                sys.exit(1)

            fg = args[0]
            bg = args[1]
            ratio = calculate_contrast_ratio(fg, bg)
            result = check_wcag_compliance(ratio)
            result["foreground"] = fg
            result["background"] = bg

            # Add suggestions if failing
            if not result["wcag"]["AA"]["normalText"]:
                result["suggestions"] = suggest_accessible_color(fg, bg)

            print(json.dumps(result, indent=2))

        elif command == "text-size":
            if len(args) < 1:
                print("Error: text-size requires font-size")
                print("Usage: text-size <font-size> [context]")
                sys.exit(1)

            size = float(args[0])
            context = args[1] if len(args) > 1 else "body"
            result = check_text_size_accessibility(size, context)
            print(json.dumps(result, indent=2))

        elif command == "touch-target":
            if len(args) < 2:
                print("Error: touch-target requires width and height")
                print("Usage: touch-target <width> <height>")
                sys.exit(1)

            width = float(args[0])
            height = float(args[1])
            result = check_touch_target(width, height)
            print(json.dumps(result, indent=2))

        elif command == "focus":
            width = float(args[0]) if args else 2
            result = check_focus_indicator(width)
            print(json.dumps(result, indent=2))

        elif command == "suggest":
            if len(args) < 2:
                print("Error: suggest requires foreground and background")
                sys.exit(1)
            fg = args[0]
            bg = args[1]
            target = float(args[2]) if len(args) > 2 else 4.5
            result = suggest_accessible_color(fg, bg, target)
            print(json.dumps(result, indent=2))

        elif command == "full-audit":
            result = generate_full_audit()
            print(json.dumps(result, indent=2))

        else:
            print(f"Unknown command: {command}")
            print_help()
            sys.exit(1)

    except ValueError as e:
        print(f"Error: Invalid value - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

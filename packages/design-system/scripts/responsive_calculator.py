#!/usr/bin/env python3
"""
Responsive Design Calculator for TravelMatch Design System

Calculate responsive values, fluid typography, and layout dimensions
for different screen sizes and breakpoints.

Usage:
    python responsive_calculator.py [command] [args]

Commands:
    fluid-type <min-size> <max-size> [min-vw] [max-vw]
        Calculate fluid typography with CSS clamp()

    scale <base-value> <breakpoints>
        Generate scaled values across breakpoints

    grid <columns> <container-width> [gutter]
        Calculate grid column widths

    aspect-ratio <width> <ratio>
        Calculate height for aspect ratio

    container-query <min-width> <max-width>
        Generate container query breakpoints

Examples:
    python responsive_calculator.py fluid-type 16 24 320 1200
    python responsive_calculator.py scale 16 "xs,sm,md,lg,xl"
    python responsive_calculator.py grid 12 1200 24
    python responsive_calculator.py aspect-ratio 800 16:9
"""

import sys
import json
from typing import Dict, Any, List, Union


# Standard breakpoints (matching design system)
BREAKPOINTS = {
    "xs": 0,
    "sm": 640,
    "md": 768,
    "lg": 1024,
    "xl": 1280,
    "2xl": 1536,
}

# Scale factors for responsive sizing
SCALE_FACTORS = {
    "xs": 0.75,
    "sm": 0.875,
    "md": 1.0,
    "lg": 1.125,
    "xl": 1.25,
    "2xl": 1.5,
}


def fluid_typography(
    min_size: float,
    max_size: float,
    min_viewport: float = 320,
    max_viewport: float = 1200
) -> Dict[str, Any]:
    """
    Calculate fluid typography using CSS clamp().

    Returns CSS clamp() function and fallback values.
    """
    # Calculate the slope
    slope = (max_size - min_size) / (max_viewport - min_viewport)

    # Calculate the y-intercept
    y_intercept = min_size - (slope * min_viewport)

    # Convert to viewport units (vw)
    slope_vw = slope * 100

    # Build the clamp function
    preferred = f"{y_intercept:.4f}rem + {slope_vw:.4f}vw"

    return {
        "clamp": f"clamp({min_size}px, {preferred}, {max_size}px)",
        "clampRem": f"clamp({min_size/16:.4f}rem, {y_intercept/16:.4f}rem + {slope_vw:.4f}vw, {max_size/16:.4f}rem)",
        "minSize": min_size,
        "maxSize": max_size,
        "minViewport": min_viewport,
        "maxViewport": max_viewport,
        "slope": slope,
        "yIntercept": y_intercept,
        "cssCalc": f"calc({y_intercept:.2f}px + {slope_vw:.4f}vw)",
        "fallback": (min_size + max_size) / 2,
        "sizes": {
            viewport: round(y_intercept + slope * viewport, 2)
            for viewport in [320, 480, 640, 768, 1024, 1200, 1440]
        }
    }


def scale_value(
    base_value: float,
    breakpoints: Optional[List[str]] = None
) -> Dict[str, float]:
    """
    Generate scaled values across breakpoints.

    Useful for responsive spacing, font sizes, etc.
    """
    if breakpoints is None:
        breakpoints = list(BREAKPOINTS.keys())

    scaled = {}
    for bp in breakpoints:
        if bp in SCALE_FACTORS:
            scaled[bp] = round(base_value * SCALE_FACTORS[bp], 2)

    return scaled


def calculate_grid(
    columns: int,
    container_width: float,
    gutter: float = 16,
    margin: float = 16
) -> Dict[str, Any]:
    """
    Calculate CSS grid column widths and layout values.
    """
    # Total gutter space
    total_gutter = gutter * (columns - 1)

    # Total margin space
    total_margin = margin * 2

    # Available space for columns
    available = container_width - total_gutter - total_margin

    # Individual column width
    column_width = available / columns

    # Generate span widths
    spans = {}
    for span in range(1, columns + 1):
        span_width = (column_width * span) + (gutter * (span - 1))
        spans[span] = round(span_width, 2)

    return {
        "columns": columns,
        "containerWidth": container_width,
        "gutter": gutter,
        "margin": margin,
        "columnWidth": round(column_width, 2),
        "spans": spans,
        "cssGrid": f"repeat({columns}, 1fr)",
        "cssGap": f"{gutter}px",
        "cssMargin": f"0 {margin}px",
        "maxWidth": f"{container_width}px",
        "percentages": {
            span: round((spans[span] / container_width) * 100, 2)
            for span in range(1, columns + 1)
        }
    }


def aspect_ratio_height(width: float, ratio: str) -> Dict[str, Any]:
    """
    Calculate height for a given width and aspect ratio.
    """
    # Parse ratio string (e.g., "16:9" or "4/3")
    if ':' in ratio:
        ratio_parts = ratio.split(':')
    elif '/' in ratio:
        ratio_parts = ratio.split('/')
    else:
        raise ValueError(f"Invalid ratio format: {ratio}. Use '16:9' or '16/9'")

    ratio_w = float(ratio_parts[0])
    ratio_h = float(ratio_parts[1])

    height = (width / ratio_w) * ratio_h

    # Common presets
    presets = {
        "1:1": width,
        "4:3": (width / 4) * 3,
        "16:9": (width / 16) * 9,
        "21:9": (width / 21) * 9,
        "3:2": (width / 3) * 2,
        "2:3": (width / 2) * 3,
        "9:16": (width / 9) * 16,
    }

    return {
        "width": width,
        "height": round(height, 2),
        "ratio": ratio,
        "ratioDecimal": round(ratio_w / ratio_h, 4),
        "cssPadding": f"{round((ratio_h / ratio_w) * 100, 2)}%",
        "cssAspectRatio": f"{ratio_w} / {ratio_h}",
        "presets": {k: round(v, 2) for k, v in presets.items()}
    }


def container_queries(
    min_width: float,
    max_width: float,
    steps: int = 5
) -> Dict[str, Any]:
    """
    Generate container query breakpoints.
    """
    step_size = (max_width - min_width) / (steps - 1)

    breakpoints = []
    for i in range(steps):
        width = min_width + (step_size * i)
        breakpoints.append({
            "name": f"cq-{i+1}",
            "minWidth": round(width, 0),
            "css": f"@container (min-width: {round(width, 0)}px)"
        })

    return {
        "minWidth": min_width,
        "maxWidth": max_width,
        "steps": steps,
        "breakpoints": breakpoints,
        "cssContainerType": "container-type: inline-size;",
        "cssContainerName": "container-name: card;",
    }


def responsive_spacing_scale(base: float = 4) -> Dict[str, Any]:
    """
    Generate a complete responsive spacing scale.
    """
    # Base spacing tokens
    tokens = {
        "none": 0,
        "px": 1,
        "0.5": base * 0.5,
        "1": base,
        "1.5": base * 1.5,
        "2": base * 2,
        "2.5": base * 2.5,
        "3": base * 3,
        "3.5": base * 3.5,
        "4": base * 4,
        "5": base * 5,
        "6": base * 6,
        "7": base * 7,
        "8": base * 8,
        "9": base * 9,
        "10": base * 10,
        "11": base * 11,
        "12": base * 12,
        "14": base * 14,
        "16": base * 16,
        "20": base * 20,
        "24": base * 24,
        "28": base * 28,
        "32": base * 32,
        "36": base * 36,
        "40": base * 40,
        "44": base * 44,
        "48": base * 48,
        "52": base * 52,
        "56": base * 56,
        "60": base * 60,
        "64": base * 64,
        "72": base * 72,
        "80": base * 80,
        "96": base * 96,
    }

    # Responsive scales for each breakpoint
    responsive = {}
    for bp, factor in SCALE_FACTORS.items():
        responsive[bp] = {
            name: round(value * factor, 2) if value > 0 else 0
            for name, value in tokens.items()
        }

    return {
        "base": base,
        "tokens": tokens,
        "responsive": responsive,
        "semanticNames": {
            "xs": tokens["1"],
            "sm": tokens["2"],
            "md": tokens["3"],
            "lg": tokens["4"],
            "xl": tokens["5"],
            "2xl": tokens["6"],
            "3xl": tokens["8"],
            "4xl": tokens["10"],
            "5xl": tokens["12"],
            "6xl": tokens["16"],
        }
    }


def generate_responsive_report(container_width: float = 1200) -> str:
    """Generate a complete responsive design report."""
    report = []
    report.append("=" * 60)
    report.append("RESPONSIVE DESIGN CALCULATOR REPORT")
    report.append("=" * 60)
    report.append("")

    # Fluid Typography Examples
    report.append("FLUID TYPOGRAPHY")
    report.append("-" * 40)
    for name, (min_s, max_s) in [
        ("body", (14, 18)),
        ("h1", (32, 64)),
        ("h2", (24, 48)),
        ("h3", (20, 36)),
        ("caption", (11, 14)),
    ]:
        fluid = fluid_typography(min_s, max_s)
        report.append(f"  {name}: {fluid['clampRem']}")
    report.append("")

    # Grid Calculations
    report.append("GRID SYSTEM")
    report.append("-" * 40)
    grid = calculate_grid(12, container_width, 24, 24)
    report.append(f"  Container: {grid['containerWidth']}px")
    report.append(f"  Columns: {grid['columns']}")
    report.append(f"  Gutter: {grid['gutter']}px")
    report.append(f"  Column Width: {grid['columnWidth']}px")
    report.append("")
    report.append("  Column Spans:")
    for span, width in list(grid['spans'].items())[:6]:
        report.append(f"    {span} col: {width}px ({grid['percentages'][span]}%)")
    report.append("")

    # Breakpoints
    report.append("BREAKPOINTS")
    report.append("-" * 40)
    for name, value in BREAKPOINTS.items():
        report.append(f"  {name}: {value}px")
    report.append("")

    # Aspect Ratios
    report.append("ASPECT RATIOS (for 800px width)")
    report.append("-" * 40)
    ar = aspect_ratio_height(800, "16:9")
    for ratio, height in ar['presets'].items():
        report.append(f"  {ratio}: {height}px")
    report.append("")

    # Container Queries
    report.append("CONTAINER QUERY BREAKPOINTS")
    report.append("-" * 40)
    cq = container_queries(200, 600, 5)
    for bp in cq['breakpoints']:
        report.append(f"  {bp['name']}: {bp['minWidth']}px")
    report.append("")

    return "\n".join(report)


def print_help():
    """Print usage help."""
    print(__doc__)


def main():
    if len(sys.argv) < 2:
        print(generate_responsive_report())
        return

    command = sys.argv[1]
    args = sys.argv[2:]

    try:
        if command == "help" or command == "--help" or command == "-h":
            print_help()

        elif command == "fluid-type":
            if len(args) < 2:
                print("Error: fluid-type requires min-size and max-size")
                print("Usage: fluid-type <min-size> <max-size> [min-vw] [max-vw]")
                sys.exit(1)

            min_size = float(args[0])
            max_size = float(args[1])
            min_vw = float(args[2]) if len(args) > 2 else 320
            max_vw = float(args[3]) if len(args) > 3 else 1200

            result = fluid_typography(min_size, max_size, min_vw, max_vw)
            print(json.dumps(result, indent=2))

        elif command == "scale":
            if len(args) < 1:
                print("Error: scale requires base-value")
                print("Usage: scale <base-value> [breakpoints]")
                sys.exit(1)

            base = float(args[0])
            breakpoints = args[1].split(",") if len(args) > 1 else None

            result = scale_value(base, breakpoints)
            print(json.dumps(result, indent=2))

        elif command == "grid":
            if len(args) < 2:
                print("Error: grid requires columns and container-width")
                print("Usage: grid <columns> <container-width> [gutter]")
                sys.exit(1)

            columns = int(args[0])
            width = float(args[1])
            gutter = float(args[2]) if len(args) > 2 else 16

            result = calculate_grid(columns, width, gutter)
            print(json.dumps(result, indent=2))

        elif command == "aspect-ratio":
            if len(args) < 2:
                print("Error: aspect-ratio requires width and ratio")
                print("Usage: aspect-ratio <width> <ratio>")
                sys.exit(1)

            width = float(args[0])
            ratio = args[1]

            result = aspect_ratio_height(width, ratio)
            print(json.dumps(result, indent=2))

        elif command == "container-query":
            if len(args) < 2:
                print("Error: container-query requires min-width and max-width")
                print("Usage: container-query <min-width> <max-width>")
                sys.exit(1)

            min_w = float(args[0])
            max_w = float(args[1])

            result = container_queries(min_w, max_w)
            print(json.dumps(result, indent=2))

        elif command == "spacing":
            base = float(args[0]) if args else 4
            result = responsive_spacing_scale(base)
            print(json.dumps(result, indent=2))

        elif command == "report":
            width = float(args[0]) if args else 1200
            print(generate_responsive_report(width))

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

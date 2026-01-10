#!/usr/bin/env python3
"""
Design Token Generator for TravelMatch Design System

Generates complete design system tokens from brand colors including:
- Color palettes (primary, secondary, semantic)
- Typography scales
- Spacing system (8pt grid)
- Shadow tokens
- Animation tokens
- Responsive breakpoints

Usage:
    python design_token_generator.py [brand_color] [style] [format]

    brand_color: Hex color (default: #2196F3)
    style: modern | classic | playful (default: modern)
    format: json | css | scss | ts (default: ts)

Examples:
    python design_token_generator.py
    python design_token_generator.py "#FF5722" playful css
    python design_token_generator.py "#6200EE" modern scss
"""

import colorsys
import json
import sys
import re
import os
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from pathlib import Path


def validate_safe_path(filepath: str, base_dir: Optional[str] = None) -> Path:
    """
    Validate and sanitize file path to prevent path traversal attacks.
    Returns the resolved Path object if safe, raises ValueError otherwise.
    """
    if base_dir is None:
        base_dir = os.getcwd()
    
    # Reject obviously malicious patterns before any path construction
    dangerous_patterns = ['..', '\x00', '\0']
    for pattern in dangerous_patterns:
        if pattern in filepath:
            raise ValueError(f"Path contains forbidden pattern: '{pattern}'")
    
    # Reject absolute paths - only allow relative paths from base_dir
    if os.path.isabs(filepath):
        raise ValueError("Absolute paths are not allowed")
    
    # Use pathlib for safer path resolution
    base = Path(base_dir).resolve()
    
    # Sanitize: normalize slashes for cross-platform compatibility
    sanitized = filepath.replace('\\', '/')
    
    # Remove any leading slashes after sanitization
    sanitized = sanitized.lstrip('/')
    
    # Build the target path safely
    target = (base / sanitized).resolve()
    
    # Strict check: target must be within base directory
    try:
        # relative_to will raise ValueError if target is not under base
        target.relative_to(base)
    except ValueError as e:
        raise ValueError(f"Path '{filepath}' would escape the base directory") from e
    
    # Additional check using commonpath for extra safety
    common = os.path.commonpath([str(base), str(target)])
    if common != str(base):
        raise ValueError(f"Path '{filepath}' would escape the base directory")
    
    return target


def write_file_safely(filepath: str, content: str, base_dir: Optional[str] = None) -> None:
    """
    Safely write to a file after validating the path.
    This function combines path validation and file writing to ensure
    no path traversal attacks are possible.
    """
    # Security: Path traversal is prevented by validate_safe_path() which:
    # 1. Rejects dangerous patterns (.., null bytes) before path construction
    # 2. Rejects absolute paths - only relative paths allowed
    # 3. Resolves to absolute path using pathlib.Path.resolve()
    # 4. Verifies target is within base_dir using relative_to()
    # 5. Double-checks using os.path.commonpath()
    # Returns a Path object directly, eliminating string conversion risks
    validated_path = validate_safe_path(filepath, base_dir)
    
    # Write using the already-validated Path object
    validated_path.write_text(content, encoding='utf-8')


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (r, g, b)


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """Convert RGB tuple to hex color."""
    return '#{:02X}{:02X}{:02X}'.format(*[max(0, min(255, int(c))) for c in rgb])


def rgb_to_hsl(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    """Convert RGB to HSL."""
    r, g, b = [x / 255.0 for x in rgb]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return (h * 360, s * 100, l * 100)


def hsl_to_rgb(hsl: Tuple[float, float, float]) -> Tuple[int, int, int]:
    """Convert HSL to RGB."""
    h, s, l = hsl[0] / 360, hsl[1] / 100, hsl[2] / 100
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return (int(r * 255), int(g * 255), int(b * 255))


def generate_color_scale(base_color: str, name: str = "primary") -> Dict[str, str]:
    """Generate a 10-step color scale from a base color."""
    rgb = hex_to_rgb(base_color)
    hsl = rgb_to_hsl(rgb)

    # Lightness values for 50-900 scale
    lightness_map: Dict[int, float] = {
        50: 95,
        100: 90,
        200: 80,
        300: 70,
        400: 60,
        500: hsl[2],  # Original lightness
        600: max(hsl[2] - 10, 15),
        700: max(hsl[2] - 20, 10),
        800: max(hsl[2] - 30, 8),
        900: max(hsl[2] - 40, 5),
    }

    scale: Dict[str, str] = {}
    for step, lightness in lightness_map.items():
        adjusted_hsl: Tuple[float, float, float] = (hsl[0], hsl[1], lightness)
        scale[str(step)] = rgb_to_hex(hsl_to_rgb(adjusted_hsl))

    return scale


def generate_semantic_colors() -> Dict[str, Dict[str, str]]:
    """Generate semantic color palettes."""
    return {
        "success": generate_color_scale("#4CAF50", "success"),
        "warning": generate_color_scale("#FFC107", "warning"),
        "error": generate_color_scale("#F44336", "error"),
        "info": generate_color_scale("#03A9F4", "info"),
    }


def generate_neutral_scale() -> Dict[str, str]:
    """Generate neutral grayscale."""
    return {
        "0": "#FFFFFF",
        "50": "#FAFAFA",
        "100": "#F5F5F5",
        "200": "#EEEEEE",
        "300": "#E0E0E0",
        "400": "#BDBDBD",
        "500": "#9E9E9E",
        "600": "#757575",
        "700": "#616161",
        "800": "#424242",
        "900": "#212121",
        "1000": "#000000",
    }


def get_typography_config(style: str) -> Dict[str, Any]:
    """Get typography configuration based on style."""
    configs: Dict[str, Dict[str, Any]] = {
        "modern": {
            "fontFamily": {
                "primary": 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                "secondary": 'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                "mono": 'SF Mono, Menlo, Monaco, "Courier New", monospace',
            },
            "baseFontSize": 16,
            "scaleRatio": 1.25,  # Major third
        },
        "classic": {
            "fontFamily": {
                "primary": 'Georgia, "Times New Roman", serif',
                "secondary": '"Helvetica Neue", Helvetica, Arial, sans-serif',
                "mono": '"Courier New", Courier, monospace',
            },
            "baseFontSize": 16,
            "scaleRatio": 1.2,  # Minor third
        },
        "playful": {
            "fontFamily": {
                "primary": 'Poppins, "Nunito Sans", sans-serif',
                "secondary": '"Open Sans", sans-serif',
                "mono": '"Fira Code", "Source Code Pro", monospace',
            },
            "baseFontSize": 16,
            "scaleRatio": 1.333,  # Perfect fourth
        },
    }
    return configs.get(style, configs["modern"])


def generate_typography_scale(style: str = "modern") -> Dict[str, Any]:
    """Generate modular typography scale."""
    config = get_typography_config(style)
    base = config["baseFontSize"]
    ratio = config["scaleRatio"]

    # Generate font sizes using modular scale
    font_sizes = {
        "xs": round(base / (ratio ** 2)),
        "sm": round(base / ratio),
        "base": base,
        "lg": round(base * ratio),
        "xl": round(base * (ratio ** 2)),
        "2xl": round(base * (ratio ** 3)),
        "3xl": round(base * (ratio ** 4)),
        "4xl": round(base * (ratio ** 5)),
        "5xl": round(base * (ratio ** 6)),
        "6xl": round(base * (ratio ** 7)),
    }

    line_heights: Dict[str, float] = {
        "tight": 1.2,
        "normal": 1.5,
        "relaxed": 1.75,
        "loose": 2,
    }

    font_weights = {
        "light": "300",
        "regular": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700",
        "extrabold": "800",
    }

    letter_spacing: Dict[str, float] = {
        "tight": -0.5,
        "normal": 0,
        "wide": 0.5,
        "wider": 1,
    }

    # Text style presets
    styles: Dict[str, Dict[str, Any]] = {
        "h1": {
            "fontSize": font_sizes["5xl"],
            "lineHeight": line_heights["tight"],
            "fontWeight": font_weights["bold"],
            "letterSpacing": letter_spacing["tight"],
        },
        "h2": {
            "fontSize": font_sizes["4xl"],
            "lineHeight": line_heights["tight"],
            "fontWeight": font_weights["bold"],
            "letterSpacing": letter_spacing["tight"],
        },
        "h3": {
            "fontSize": font_sizes["3xl"],
            "lineHeight": 1.3,
            "fontWeight": font_weights["semibold"],
            "letterSpacing": letter_spacing["normal"],
        },
        "h4": {
            "fontSize": font_sizes["2xl"],
            "lineHeight": 1.4,
            "fontWeight": font_weights["semibold"],
            "letterSpacing": letter_spacing["normal"],
        },
        "h5": {
            "fontSize": font_sizes["xl"],
            "lineHeight": 1.4,
            "fontWeight": font_weights["semibold"],
            "letterSpacing": letter_spacing["normal"],
        },
        "h6": {
            "fontSize": font_sizes["lg"],
            "lineHeight": line_heights["normal"],
            "fontWeight": font_weights["semibold"],
            "letterSpacing": letter_spacing["normal"],
        },
        "body1": {
            "fontSize": font_sizes["base"],
            "lineHeight": line_heights["normal"],
            "fontWeight": font_weights["regular"],
            "letterSpacing": letter_spacing["normal"],
        },
        "body2": {
            "fontSize": font_sizes["sm"],
            "lineHeight": line_heights["normal"],
            "fontWeight": font_weights["regular"],
            "letterSpacing": letter_spacing["normal"],
        },
        "caption": {
            "fontSize": font_sizes["xs"],
            "lineHeight": line_heights["normal"],
            "fontWeight": font_weights["regular"],
            "letterSpacing": letter_spacing["wide"],
        },
        "button": {
            "fontSize": font_sizes["base"],
            "lineHeight": line_heights["normal"],
            "fontWeight": font_weights["semibold"],
            "letterSpacing": letter_spacing["wide"],
        },
    }

    return {
        "fontFamily": config["fontFamily"],
        "fontSize": font_sizes,
        "lineHeight": line_heights,
        "fontWeight": font_weights,
        "letterSpacing": letter_spacing,
        "styles": styles,
    }


def generate_spacing_scale() -> Dict[str, Any]:
    """Generate 8pt grid spacing system."""
    base = 4  # 4px base unit

    spacing = {
        "none": 0,
        "xs": base,         # 4px
        "sm": base * 2,     # 8px
        "md": base * 3,     # 12px
        "lg": base * 4,     # 16px
        "xl": base * 5,     # 20px
        "2xl": base * 6,    # 24px
        "3xl": base * 8,    # 32px
        "4xl": base * 10,   # 40px
        "5xl": base * 12,   # 48px
        "6xl": base * 16,   # 64px
    }

    semantic = {
        "gutter": spacing["lg"],           # 16px
        "sectionGap": spacing["3xl"],      # 32px
        "componentGap": spacing["md"],     # 12px
        "elementGap": spacing["sm"],       # 8px
    }

    return {**spacing, **semantic}


def generate_radius_scale() -> Dict[str, Any]:
    """Generate border radius scale."""
    return {
        "none": 0,
        "sm": 4,
        "md": 8,
        "lg": 12,
        "xl": 16,
        "2xl": 24,
        "full": 9999,
    }


def generate_shadows() -> Dict[str, str]:
    """Generate shadow tokens."""
    return {
        "none": "none",
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    }


def generate_animations() -> Dict[str, Any]:
    """Generate animation tokens."""
    return {
        "duration": {
            "instant": 0,
            "fast": 100,
            "normal": 200,
            "slow": 300,
            "slower": 500,
            "slowest": 1000,
        },
        "easing": {
            "linear": "linear",
            "ease": "ease",
            "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
            "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
            "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)",
            "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        },
    }


def generate_breakpoints() -> Dict[str, int]:
    """Generate responsive breakpoints."""
    return {
        "xs": 0,
        "sm": 640,
        "md": 768,
        "lg": 1024,
        "xl": 1280,
        "2xl": 1536,
    }


def generate_all_tokens(brand_color: str, style: str) -> Dict[str, Any]:
    """Generate complete design token set."""
    # Generate complementary secondary color (30 degrees hue shift)
    rgb = hex_to_rgb(brand_color)
    hsl = rgb_to_hsl(rgb)
    secondary_hsl = ((hsl[0] + 30) % 360, hsl[1], hsl[2])
    secondary_color = rgb_to_hex(hsl_to_rgb(secondary_hsl))

    # Generate accent color (complementary, 180 degrees)
    accent_hsl = ((hsl[0] + 180) % 360, min(hsl[1] + 10, 100), hsl[2])
    accent_color = rgb_to_hex(hsl_to_rgb(accent_hsl))

    return {
        "meta": {
            "name": "TravelMatch Design System",
            "version": "2.0.0",
            "generatedAt": datetime.now().isoformat(),
            "brandColor": brand_color,
            "style": style,
        },
        "colors": {
            "primary": generate_color_scale(brand_color, "primary"),
            "secondary": generate_color_scale(secondary_color, "secondary"),
            "accent": generate_color_scale(accent_color, "accent"),
            **generate_semantic_colors(),
            "neutral": generate_neutral_scale(),
            "background": {
                "primary": "#FFFFFF",
                "secondary": "#F5F5F5",
                "tertiary": "#EEEEEE",
                "dark": "#121212",
                "darkSecondary": "#1E1E1E",
            },
            "text": {
                "primary": "#212121",
                "secondary": "#757575",
                "disabled": "#BDBDBD",
                "inverse": "#FFFFFF",
            },
            "border": {
                "light": "#E0E0E0",
                "medium": "#BDBDBD",
                "dark": "#757575",
            },
            "overlay": {
                "light": "rgba(0, 0, 0, 0.1)",
                "medium": "rgba(0, 0, 0, 0.3)",
                "dark": "rgba(0, 0, 0, 0.6)",
            },
        },
        "typography": generate_typography_scale(style),
        "spacing": generate_spacing_scale(),
        "radius": generate_radius_scale(),
        "shadows": generate_shadows(),
        "animations": generate_animations(),
        "breakpoints": generate_breakpoints(),
    }


def export_json(tokens: Dict[str, Any]) -> str:
    """Export tokens as JSON."""
    return json.dumps(tokens, indent=2)


def export_css(tokens: Dict[str, Any]) -> str:
    """Export tokens as CSS custom properties."""
    lines = [
        "/**",
        " * TravelMatch Design System Tokens",
        f" * Generated: {tokens['meta']['generatedAt']}",
        f" * Brand Color: {tokens['meta']['brandColor']}",
        f" * Style: {tokens['meta']['style']}",
        " */",
        "",
        ":root {",
    ]

    # Colors
    lines.append("  /* Colors */")
    for palette_name, palette in tokens["colors"].items():
        if isinstance(palette, dict):
            for shade, value in palette.items():  # pyright: ignore[reportUnknownVariableType]
                shade_str: str = str(shade)  # pyright: ignore[reportUnknownArgumentType]
                value_str: str = str(value)  # pyright: ignore[reportUnknownArgumentType]
                lines.append(f"  --color-{palette_name}-{shade_str}: {value_str};")

    lines.append("")
    lines.append("  /* Typography */")
    for size_name, size_value in tokens["typography"]["fontSize"].items():
        lines.append(f"  --font-size-{size_name}: {size_value}px;")

    for weight_name, weight_value in tokens["typography"]["fontWeight"].items():
        lines.append(f"  --font-weight-{weight_name}: {weight_value};")

    lines.append("")
    lines.append("  /* Spacing */")
    for space_name, space_value in tokens["spacing"].items():
        lines.append(f"  --spacing-{space_name}: {space_value}px;")

    lines.append("")
    lines.append("  /* Border Radius */")
    for radius_name, radius_value in tokens["radius"].items():
        lines.append(f"  --radius-{radius_name}: {radius_value}px;")

    lines.append("")
    lines.append("  /* Shadows */")
    for shadow_name, shadow_value in tokens["shadows"].items():
        lines.append(f"  --shadow-{shadow_name}: {shadow_value};")

    lines.append("")
    lines.append("  /* Breakpoints */")
    for bp_name, bp_value in tokens["breakpoints"].items():
        lines.append(f"  --breakpoint-{bp_name}: {bp_value}px;")

    lines.append("")
    lines.append("  /* Animations */")
    for duration_name, duration_value in tokens["animations"]["duration"].items():
        lines.append(f"  --duration-{duration_name}: {duration_value}ms;")
    for easing_name, easing_value in tokens["animations"]["easing"].items():
        lines.append(f"  --easing-{easing_name}: {easing_value};")

    lines.append("}")

    return "\n".join(lines)


def export_scss(tokens: Dict[str, Any]) -> str:
    """Export tokens as SCSS variables and maps."""
    lines = [
        "//",
        "// TravelMatch Design System Tokens",
        f"// Generated: {tokens['meta']['generatedAt']}",
        f"// Brand Color: {tokens['meta']['brandColor']}",
        f"// Style: {tokens['meta']['style']}",
        "//",
        "",
    ]

    # Color maps
    lines.append("// Color Palettes")
    for palette_name, palette in tokens["colors"].items():
        if isinstance(palette, dict) and all(isinstance(v, str) for v in palette.values()):  # pyright: ignore[reportUnknownVariableType,reportUnknownMemberType]
            lines.append(f"${palette_name}-colors: (")
            for shade, value in palette.items():  # pyright: ignore[reportUnknownVariableType]
                shade_str: str = str(shade)  # pyright: ignore[reportUnknownArgumentType]
                value_str: str = str(value)  # pyright: ignore[reportUnknownArgumentType]
                lines.append(f"  '{shade_str}': {value_str},")
            lines.append(");")
            lines.append("")

    # Typography
    lines.append("// Typography")
    lines.append("$font-sizes: (")
    for size_name, size_value in tokens["typography"]["fontSize"].items():
        lines.append(f"  '{size_name}': {size_value}px,")
    lines.append(");")
    lines.append("")

    lines.append("$font-weights: (")
    for weight_name, weight_value in tokens["typography"]["fontWeight"].items():
        lines.append(f"  '{weight_name}': {weight_value},")
    lines.append(");")
    lines.append("")

    # Spacing
    lines.append("// Spacing")
    lines.append("$spacing: (")
    for space_name, space_value in tokens["spacing"].items():
        lines.append(f"  '{space_name}': {space_value}px,")
    lines.append(");")
    lines.append("")

    # Radius
    lines.append("// Border Radius")
    lines.append("$radius: (")
    for radius_name, radius_value in tokens["radius"].items():
        lines.append(f"  '{radius_name}': {radius_value}px,")
    lines.append(");")
    lines.append("")

    # Shadows
    lines.append("// Shadows")
    lines.append("$shadows: (")
    for shadow_name, shadow_value in tokens["shadows"].items():
        lines.append(f"  '{shadow_name}': {shadow_value},")
    lines.append(");")
    lines.append("")

    # Breakpoints
    lines.append("// Breakpoints")
    lines.append("$breakpoints: (")
    for bp_name, bp_value in tokens["breakpoints"].items():
        lines.append(f"  '{bp_name}': {bp_value}px,")
    lines.append(");")
    lines.append("")

    # Helper functions
    lines.append("// Helper Functions")
    lines.append("@function color($palette, $shade: '500') {")
    lines.append("  @return map-get($#{$palette}-colors, $shade);")
    lines.append("}")
    lines.append("")
    lines.append("@function spacing($key) {")
    lines.append("  @return map-get($spacing, $key);")
    lines.append("}")
    lines.append("")
    lines.append("@function font-size($key) {")
    lines.append("  @return map-get($font-sizes, $key);")
    lines.append("}")
    lines.append("")

    # Media query mixins
    lines.append("// Media Query Mixins")
    lines.append("@mixin breakpoint($size) {")
    lines.append("  @media (min-width: map-get($breakpoints, $size)) {")
    lines.append("    @content;")
    lines.append("  }")
    lines.append("}")

    return "\n".join(lines)


def export_typescript(tokens: Dict[str, Any]) -> str:
    """Export tokens as TypeScript."""
    lines = [
        "/**",
        " * TravelMatch Design System Tokens",
        f" * Generated: {tokens['meta']['generatedAt']}",
        f" * Brand Color: {tokens['meta']['brandColor']}",
        f" * Style: {tokens['meta']['style']}",
        " *",
        " * DO NOT EDIT DIRECTLY - Generated by design_token_generator.py",
        " */",
        "",
    ]

    # Colors
    lines.append("export const colors = {")
    for palette_name, palette in tokens["colors"].items():
        if isinstance(palette, dict):
            lines.append(f"  {palette_name}: {{")
            for shade, value in palette.items():  # pyright: ignore[reportUnknownVariableType]
                shade_str: str = str(shade)  # pyright: ignore[reportUnknownArgumentType]
                value_str: str = str(value)  # pyright: ignore[reportUnknownArgumentType]
                lines.append(f"    '{shade_str}': '{value_str}',")
            lines.append("  },")
    lines.append("} as const;")
    lines.append("")

    # Typography
    lines.append("export const typography = {")
    lines.append("  fontFamily: {")
    for name, value in tokens["typography"]["fontFamily"].items():
        lines.append(f"    {name}: '{value}',")
    lines.append("  },")
    lines.append("  fontSize: {")
    for name, value in tokens["typography"]["fontSize"].items():
        lines.append(f"    '{name}': {value},")
    lines.append("  },")
    lines.append("  lineHeight: {")
    for name, value in tokens["typography"]["lineHeight"].items():
        lines.append(f"    {name}: {value},")
    lines.append("  },")
    lines.append("  fontWeight: {")
    for name, value in tokens["typography"]["fontWeight"].items():
        lines.append(f"    {name}: '{value}',")
    lines.append("  },")
    lines.append("  letterSpacing: {")
    for name, value in tokens["typography"]["letterSpacing"].items():
        lines.append(f"    {name}: {value},")
    lines.append("  },")
    lines.append("  styles: {")
    for style_name, style_value in tokens["typography"]["styles"].items():
        lines.append(f"    {style_name}: {{")
        for prop, val in style_value.items():
            if isinstance(val, str):
                lines.append(f"      {prop}: '{val}',")
            else:
                lines.append(f"      {prop}: {val},")
        lines.append("    },")
    lines.append("  },")
    lines.append("} as const;")
    lines.append("")

    # Spacing
    lines.append("export const spacing = {")
    for name, value in tokens["spacing"].items():
        lines.append(f"  '{name}': {value},")
    lines.append("} as const;")
    lines.append("")

    # Radius
    lines.append("export const radius = {")
    for name, value in tokens["radius"].items():
        lines.append(f"  {name}: {value},")
    lines.append("} as const;")
    lines.append("")

    # Shadows
    lines.append("export const shadows = {")
    for name, value in tokens["shadows"].items():
        lines.append(f"  {name}: '{value}',")
    lines.append("} as const;")
    lines.append("")

    # Animations
    lines.append("export const animations = {")
    lines.append("  duration: {")
    for name, value in tokens["animations"]["duration"].items():
        lines.append(f"    {name}: {value},")
    lines.append("  },")
    lines.append("  easing: {")
    for name, value in tokens["animations"]["easing"].items():
        lines.append(f"    {name}: '{value}',")
    lines.append("  },")
    lines.append("} as const;")
    lines.append("")

    # Breakpoints
    lines.append("export const breakpoints = {")
    for name, value in tokens["breakpoints"].items():
        lines.append(f"  '{name}': {value},")
    lines.append("} as const;")
    lines.append("")

    # Types
    lines.append("// Type exports")
    lines.append("export type Colors = typeof colors;")
    lines.append("export type Typography = typeof typography;")
    lines.append("export type Spacing = typeof spacing;")
    lines.append("export type Radius = typeof radius;")
    lines.append("export type Shadows = typeof shadows;")
    lines.append("export type Animations = typeof animations;")
    lines.append("export type Breakpoints = typeof breakpoints;")
    lines.append("")

    # Theme
    lines.append("// Default theme")
    lines.append("export const defaultTheme = {")
    lines.append("  colors,")
    lines.append("  typography,")
    lines.append("  spacing,")
    lines.append("  radius,")
    lines.append("  shadows,")
    lines.append("  animations,")
    lines.append("  breakpoints,")
    lines.append("} as const;")
    lines.append("")
    lines.append("export type Theme = typeof defaultTheme;")

    return "\n".join(lines)


def validate_hex_color(color: str) -> bool:
    """Validate hex color format."""
    pattern = r'^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
    return bool(re.match(pattern, color))


def main():
    # Default values
    brand_color = "#2196F3"
    style = "modern"
    output_format = "ts"

    # Parse arguments
    args = sys.argv[1:]

    # Check for help flag
    if len(args) >= 1 and args[0] in ["--help", "-h", "help"]:
        print(__doc__)
        sys.exit(0)

    if len(args) >= 1:
        color = args[0]
        if not validate_hex_color(color):
            print(f"Error: Invalid hex color format: {color}")
            print("Use format: #RRGGBB or RRGGBB")
            sys.exit(1)
        brand_color = color if color.startswith('#') else f"#{color}"

    if len(args) >= 2:
        if args[1] not in ["modern", "classic", "playful"]:
            print(f"Error: Invalid style: {args[1]}")
            print("Available styles: modern, classic, playful")
            sys.exit(1)
        style = args[1]

    if len(args) >= 3:
        if args[2] not in ["json", "css", "scss", "ts"]:
            print(f"Error: Invalid format: {args[2]}")
            print("Available formats: json, css, scss, ts")
            sys.exit(1)
        output_format = args[2]

    # Generate tokens
    print(f"Generating design tokens...")
    print(f"  Brand Color: {brand_color}")
    print(f"  Style: {style}")
    print(f"  Format: {output_format}")
    print("")

    tokens = generate_all_tokens(brand_color, style)

    # Export
    exporters = {
        "json": export_json,
        "css": export_css,
        "scss": export_scss,
        "ts": export_typescript,
    }

    output = exporters[output_format](tokens)

    # Determine output filename
    extensions = {
        "json": "json",
        "css": "css",
        "scss": "scss",
        "ts": "ts",
    }
    filename = f"tokens.generated.{extensions[output_format]}"

    # Write to file with path validation
    # The path is validated using write_file_safely() which prevents path traversal attacks
    # by ensuring the resolved path stays within the current working directory
    try:
        write_file_safely(filename, output)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Tokens generated successfully!")
    print(f"Output file: {filename}")
    print("")
    print("Token summary:")
    print(f"  - Color palettes: {len(tokens['colors'])} palettes")
    print(f"  - Font sizes: {len(tokens['typography']['fontSize'])} sizes")
    print(f"  - Spacing values: {len(tokens['spacing'])} values")
    print(f"  - Shadows: {len(tokens['shadows'])} levels")
    print(f"  - Breakpoints: {len(tokens['breakpoints'])} breakpoints")


if __name__ == "__main__":
    main()

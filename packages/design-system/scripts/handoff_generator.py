#!/usr/bin/env python3
"""
Developer Handoff Documentation Generator for TravelMatch Design System

Generates comprehensive developer documentation from design specifications.

Usage:
    python handoff_generator.py [command] [args]

Commands:
    component <name> <type>
        Generate component specification document

    tokens [format]
        Generate design token documentation (md, html, json)

    specs <component_file>
        Generate implementation specs from component JSON

    changelog <version>
        Generate design system changelog entry

    full-docs
        Generate complete design system documentation

Examples:
    python handoff_generator.py component Button atom
    python handoff_generator.py tokens md
    python handoff_generator.py full-docs
"""

import sys
import json
from datetime import datetime
from typing import Dict, List, Optional, Any


# Design system metadata
DESIGN_SYSTEM = {
    "name": "TravelMatch Design System",
    "version": "2.0.0",
    "description": "Personalization-first component library for TravelMatch",
    "repository": "https://github.com/travelmatch/design-system",
    "storybook": "https://storybook.travelmatch.com",
}

# Component categories
COMPONENT_TYPES = ["atom", "molecule", "organism", "template", "page"]

# Standard props for different component types
STANDARD_PROPS: Dict[str, List[Dict[str, Any]]] = {
    "atom": [
        {"name": "testID", "type": "string", "required": False, "description": "Test identifier for automation"},
        {"name": "accessibilityLabel", "type": "string", "required": False, "description": "Accessibility label for screen readers"},
    ],
    "interactive": [
        {"name": "onPress", "type": "() => void", "required": False, "description": "Press handler"},
        {"name": "disabled", "type": "boolean", "required": False, "description": "Disable interaction"},
        {"name": "loading", "type": "boolean", "required": False, "description": "Show loading state"},
    ],
    "styled": [
        {"name": "variant", "type": "string", "required": False, "description": "Visual variant"},
        {"name": "size", "type": "'sm' | 'md' | 'lg'", "required": False, "description": "Size variant"},
        {"name": "style", "type": "ViewStyle", "required": False, "description": "Custom style overrides"},
    ],
}


def generate_component_spec(
    name: str,
    component_type: str,
    description: str = "",
    props: Optional[List[Dict[str, Any]]] = None,
    variants: Optional[List[str]] = None,
    examples: Optional[List[Dict[str, Any]]] = None
) -> str:
    """Generate a component specification document in Markdown."""
    now = datetime.now().strftime("%Y-%m-%d")

    # Default props based on type
    all_props: List[Dict[str, Any]] = list(STANDARD_PROPS.get("atom", []))  # pyright: ignore[reportUnknownMemberType]
    if component_type in ["atom", "molecule"]:
        all_props.extend(STANDARD_PROPS.get("interactive", []))  # pyright: ignore[reportUnknownMemberType]
        all_props.extend(STANDARD_PROPS.get("styled", []))  # pyright: ignore[reportUnknownMemberType]

    if props:
        all_props.extend(props)  # pyright: ignore[reportUnknownMemberType]

    if variants is None:
        variants = ["default", "primary", "secondary", "outline", "ghost"]

    lines = [
        f"# {name} Component Specification",
        "",
        f"> **Type:** {component_type.capitalize()}",
        f"> **Package:** @travelmatch/design-system",
        f"> **Last Updated:** {now}",
        "",
        "---",
        "",
        "## Overview",
        "",
        description or f"The {name} component provides a reusable UI element for the TravelMatch application.",
        "",
        "---",
        "",
        "## Import",
        "",
        "```tsx",
        f"import {{ {name} }} from '@travelmatch/design-system';",
        "```",
        "",
        "---",
        "",
        "## Props",
        "",
        "| Prop | Type | Required | Default | Description |",
        "|------|------|----------|---------|-------------|",
    ]

    for prop in all_props:  # pyright: ignore[reportUnknownVariableType]
        required = "Yes" if prop.get("required", False) else "No"  # pyright: ignore[reportUnknownMemberType]
        default = prop.get("default", "-")  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `{prop['name']}` | `{prop['type']}` | {required} | {default} | {prop['description']} |")

    lines.extend([
        "",
        "---",
        "",
        "## Variants",
        "",
    ])

    for variant in variants:
        lines.append(f"### {variant.capitalize()}")
        lines.append("")
        lines.append("```tsx")
        lines.append(f'<{name} variant="{variant}" />')
        lines.append("```")
        lines.append("")

    lines.extend([
        "---",
        "",
        "## Usage Examples",
        "",
        "### Basic Usage",
        "",
        "```tsx",
        f"<{name}>",
        f"  Content here",
        f"</{name}>",
        "```",
        "",
        "### With Props",
        "",
        "```tsx",
        f'<{name}',
        '  variant="primary"',
        '  size="lg"',
        '  onPress={() => console.log("Pressed!")}',
        ">",
        "  Click Me",
        f"</{name}>",
        "```",
        "",
        "---",
        "",
        "## Accessibility",
        "",
        "- Ensure `accessibilityLabel` is provided for screen readers",
        "- Touch targets are minimum 44x44px",
        "- Color contrast meets WCAG AA requirements",
        "- Focus states are clearly visible",
        "",
        "---",
        "",
        "## Design Tokens",
        "",
        "| Token | Value | Usage |",
        "|-------|-------|-------|",
        f"| `colors.primary.500` | `#2196F3` | Primary background |",
        f"| `spacing.md` | `12px` | Internal padding |",
        f"| `radius.md` | `8px` | Border radius |",
        f"| `typography.button` | `16px/600` | Text style |",
        "",
        "---",
        "",
        "## States",
        "",
        "| State | Description | Visual Changes |",
        "|-------|-------------|----------------|",
        "| Default | Normal resting state | Base styling |",
        "| Hover | Mouse over (web) | Slight opacity change |",
        "| Pressed | Active touch/click | Scale down slightly |",
        "| Disabled | Non-interactive | Reduced opacity (0.5) |",
        "| Loading | Async operation | Show spinner |",
        "| Focus | Keyboard focus | Focus ring visible |",
        "",
        "---",
        "",
        "## Related Components",
        "",
        f"- See also: [{name}Group](#{name.lower()}-group)",
        "- Parent: [Card](#card)",
        "- Sibling: [IconButton](#icon-button)",
        "",
        "---",
        "",
        "## Changelog",
        "",
        f"- **{now}**: Initial specification",
        "",
    ])

    return "\n".join(lines)


def generate_token_documentation(format: str = "md") -> str:
    """Generate design token documentation."""
    tokens: Dict[str, Any] = {
        "colors": {
            "primary": {"500": "#2196F3", "600": "#1E88E5", "700": "#1976D2"},
            "secondary": {"500": "#E91E63", "600": "#D81B60"},
            "success": {"500": "#4CAF50"},
            "warning": {"500": "#FFC107"},
            "error": {"500": "#F44336"},
            "info": {"500": "#03A9F4"},
            "neutral": {"100": "#F5F5F5", "500": "#9E9E9E", "900": "#212121"},
        },
        "typography": {
            "fontFamily": {
                "primary": "SF Pro Display, system-ui, sans-serif",
                "mono": "SF Mono, monospace",
            },
            "fontSize": {
                "xs": "12px", "sm": "14px", "base": "16px",
                "lg": "18px", "xl": "20px", "2xl": "24px",
            },
            "fontWeight": {
                "regular": "400", "medium": "500", "semibold": "600", "bold": "700",
            },
        },
        "spacing": {
            "xs": "4px", "sm": "8px", "md": "12px",
            "lg": "16px", "xl": "20px", "2xl": "24px",
        },
        "radius": {
            "sm": "4px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px",
        },
        "shadows": {
            "sm": "0 1px 2px rgba(0,0,0,0.05)",
            "md": "0 4px 6px rgba(0,0,0,0.1)",
            "lg": "0 10px 15px rgba(0,0,0,0.1)",
        },
        "breakpoints": {
            "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px",
        },
    }

    if format == "json":
        return json.dumps(tokens, indent=2)

    if format == "html":
        return generate_html_token_docs(tokens)

    # Default: Markdown
    return generate_markdown_token_docs(tokens)


def generate_markdown_token_docs(tokens: Dict[str, Any]) -> str:
    """Generate Markdown token documentation."""
    lines = [
        "# TravelMatch Design Tokens",
        "",
        f"> Version: {DESIGN_SYSTEM['version']}",
        f"> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        "---",
        "",
        "## Colors",
        "",
        "### Primary",
        "",
        "| Token | Value | Preview |",
        "|-------|-------|---------|",
    ]

    for shade, value in tokens["colors"]["primary"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `primary.{shade}` | `{value}` | ![{value}](https://via.placeholder.com/20/{value[1:]}/{value[1:]}) |")

    lines.extend([
        "",
        "### Semantic Colors",
        "",
        "| Name | Token | Value |",
        "|------|-------|-------|",
    ])

    for name in ["success", "warning", "error", "info"]:
        value = tokens["colors"][name]["500"]  # pyright: ignore[reportUnknownVariableType]
        lines.append(f"| {name.capitalize()} | `{name}.500` | `{value}` |")

    lines.extend([
        "",
        "---",
        "",
        "## Typography",
        "",
        "### Font Families",
        "",
        "| Token | Value |",
        "|-------|-------|",
    ])

    for name, value in tokens["typography"]["fontFamily"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `fontFamily.{name}` | `{value}` |")

    lines.extend([
        "",
        "### Font Sizes",
        "",
        "| Token | Value | Example |",
        "|-------|-------|---------|",
    ])

    for name, value in tokens["typography"]["fontSize"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `fontSize.{name}` | `{value}` | <span style='font-size:{value}'>Aa</span> |")

    lines.extend([
        "",
        "---",
        "",
        "## Spacing",
        "",
        "Based on 4px grid system.",
        "",
        "| Token | Value | Visual |",
        "|-------|-------|--------|",
    ])

    for name, value in tokens["spacing"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `spacing.{name}` | `{value}` | `{'█' * (int(str(value).replace('px', '')) // 4)}` |")

    lines.extend([
        "",
        "---",
        "",
        "## Border Radius",
        "",
        "| Token | Value |",
        "|-------|-------|",
    ])

    for name, value in tokens["radius"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `radius.{name}` | `{value}` |")

    lines.extend([
        "",
        "---",
        "",
        "## Shadows",
        "",
        "| Token | Value |",
        "|-------|-------|",
    ])

    for name, value in tokens["shadows"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        lines.append(f"| `shadow.{name}` | `{value}` |")

    lines.extend([
        "",
        "---",
        "",
        "## Breakpoints",
        "",
        "| Token | Min Width | Typical Devices |",
        "|-------|-----------|-----------------|",
        "| `sm` | 640px | Large phones, small tablets |",
        "| `md` | 768px | Tablets |",
        "| `lg` | 1024px | Laptops, desktops |",
        "| `xl` | 1280px | Large desktops |",
        "",
        "---",
        "",
        "## Usage in Code",
        "",
        "### React Native",
        "",
        "```tsx",
        "import { colors, spacing, typography } from '@travelmatch/design-system';",
        "",
        "const styles = StyleSheet.create({",
        "  container: {",
        "    backgroundColor: colors.primary[500],",
        "    padding: spacing.md,",
        "  },",
        "  text: {",
        "    fontSize: typography.fontSize.base,",
        "    fontWeight: typography.fontWeight.semibold,",
        "  },",
        "});",
        "```",
        "",
        "### CSS Variables",
        "",
        "```css",
        ".button {",
        "  background-color: var(--color-primary-500);",
        "  padding: var(--spacing-md);",
        "  border-radius: var(--radius-md);",
        "}",
        "```",
        "",
    ])

    return "\n".join(lines)


def generate_html_token_docs(tokens: Dict[str, Any]) -> str:
    """Generate HTML token documentation."""
    html = [
        "<!DOCTYPE html>",
        "<html lang='en'>",
        "<head>",
        "  <meta charset='UTF-8'>",
        "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        "  <title>TravelMatch Design Tokens</title>",
        "  <style>",
        "    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px; }",
        "    h1, h2, h3 { color: #212121; }",
        "    table { width: 100%; border-collapse: collapse; margin: 20px 0; }",
        "    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E0E0E0; }",
        "    th { background: #F5F5F5; }",
        "    code { background: #F5F5F5; padding: 2px 6px; border-radius: 4px; }",
        "    .swatch { width: 40px; height: 40px; border-radius: 4px; display: inline-block; }",
        "  </style>",
        "</head>",
        "<body>",
        f"  <h1>{DESIGN_SYSTEM['name']}</h1>",
        f"  <p>Version {DESIGN_SYSTEM['version']} | Generated {datetime.now().strftime('%Y-%m-%d')}</p>",
        "",
        "  <h2>Colors</h2>",
        "  <table>",
        "    <tr><th>Token</th><th>Value</th><th>Preview</th></tr>",
    ]

    for palette_name, palette in tokens["colors"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        for shade, value in palette.items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
            html.append(f"    <tr><td><code>{palette_name}.{shade}</code></td><td>{value}</td><td><div class='swatch' style='background:{value}'></div></td></tr>")

    html.extend([
        "  </table>",
        "",
        "  <h2>Spacing</h2>",
        "  <table>",
        "    <tr><th>Token</th><th>Value</th></tr>",
    ])

    for name, value in tokens["spacing"].items():  # pyright: ignore[reportUnknownMemberType,reportUnknownVariableType]
        html.append(f"    <tr><td><code>spacing.{name}</code></td><td>{value}</td></tr>")

    html.extend([
        "  </table>",
        "</body>",
        "</html>",
    ])

    return "\n".join(html)


def generate_implementation_checklist(component_name: str) -> str:
    """Generate implementation checklist for developers."""
    lines = [
        f"# {component_name} Implementation Checklist",
        "",
        "## Setup",
        "- [ ] Create component directory structure",
        "- [ ] Set up TypeScript types/interfaces",
        "- [ ] Import required design tokens",
        "",
        "## Core Implementation",
        "- [ ] Implement base component structure",
        "- [ ] Add prop handling and defaults",
        "- [ ] Implement all visual variants",
        "- [ ] Add size variants (sm, md, lg)",
        "- [ ] Implement state handling (disabled, loading)",
        "",
        "## Styling",
        "- [ ] Apply design tokens (colors, spacing, typography)",
        "- [ ] Implement responsive behavior",
        "- [ ] Add animations/transitions",
        "- [ ] Test dark mode support",
        "",
        "## Accessibility",
        "- [ ] Add accessibilityLabel prop",
        "- [ ] Ensure minimum touch target (44x44px)",
        "- [ ] Test with screen reader",
        "- [ ] Verify color contrast (WCAG AA)",
        "- [ ] Add keyboard navigation (web)",
        "- [ ] Implement visible focus states",
        "",
        "## Testing",
        "- [ ] Write unit tests",
        "- [ ] Add Storybook stories",
        "- [ ] Create interaction tests",
        "- [ ] Run accessibility audit",
        "- [ ] Test on iOS simulator",
        "- [ ] Test on Android emulator",
        "",
        "## Documentation",
        "- [ ] Add JSDoc comments",
        "- [ ] Update component README",
        "- [ ] Add usage examples to Storybook",
        "- [ ] Document props in Storybook controls",
        "",
        "## Review",
        "- [ ] Code review",
        "- [ ] Design review",
        "- [ ] Accessibility review",
        "- [ ] Performance check",
        "",
    ]

    return "\n".join(lines)


def generate_changelog_entry(version: str, changes: Optional[List[Dict[str, Any]]] = None) -> str:
    """Generate changelog entry."""
    date = datetime.now().strftime("%Y-%m-%d")

    if changes is None:
        changes = [
            {"type": "added", "description": "New component added"},
            {"type": "changed", "description": "Updated styling to match latest designs"},
            {"type": "fixed", "description": "Fixed accessibility issues"},
        ]

    lines = [
        f"## [{version}] - {date}",
        "",
    ]

    # Group changes by type
    grouped: Dict[str, List[str]] = {}
    for change in changes:  # pyright: ignore[reportUnknownVariableType]
        change_type: str = str(change["type"]).capitalize()  # pyright: ignore[reportUnknownMemberType]
        if change_type not in grouped:
            grouped[change_type] = []
        grouped[change_type].append(str(change["description"]))  # pyright: ignore[reportUnknownMemberType,reportUnknownArgumentType]

    for change_type in ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"]:
        if change_type in grouped:
            lines.append(f"### {change_type}")
            for desc in grouped[change_type]:
                lines.append(f"- {desc}")
            lines.append("")

    return "\n".join(lines)


def generate_full_documentation() -> None:
    """Generate complete design system documentation."""
    import os

    output_dir = "docs"
    os.makedirs(output_dir, exist_ok=True)

    # Token documentation
    with open(f"{output_dir}/tokens.md", "w") as f:
        f.write(generate_token_documentation("md"))
    print(f"Generated: {output_dir}/tokens.md")

    # Token documentation (HTML)
    with open(f"{output_dir}/tokens.html", "w") as f:
        f.write(generate_token_documentation("html"))
    print(f"Generated: {output_dir}/tokens.html")

    # Component specs
    components = ["Button", "Card", "Input", "Avatar", "Badge"]
    for comp in components:
        spec = generate_component_spec(comp, "atom")
        with open(f"{output_dir}/{comp.lower()}-spec.md", "w") as f:
            f.write(spec)
        print(f"Generated: {output_dir}/{comp.lower()}-spec.md")

    # Implementation checklist
    with open(f"{output_dir}/implementation-checklist.md", "w") as f:
        f.write(generate_implementation_checklist("Component"))
    print(f"Generated: {output_dir}/implementation-checklist.md")

    print("")
    print("Documentation generation complete!")
    print(f"Output directory: {output_dir}/")


def print_help():
    """Print usage help."""
    print(__doc__)


def main():
    if len(sys.argv) < 2:
        print_help()
        return

    command = sys.argv[1]
    args = sys.argv[2:]

    try:
        if command == "help" or command == "--help" or command == "-h":
            print_help()

        elif command == "component":
            if len(args) < 2:
                print("Error: component requires name and type")
                print("Usage: component <name> <type>")
                print(f"Types: {', '.join(COMPONENT_TYPES)}")
                sys.exit(1)

            name = args[0]
            comp_type = args[1]

            if comp_type not in COMPONENT_TYPES:
                print(f"Error: Invalid component type '{comp_type}'")
                print(f"Valid types: {', '.join(COMPONENT_TYPES)}")
                sys.exit(1)

            spec = generate_component_spec(name, comp_type)
            print(spec)

        elif command == "tokens":
            format = args[0] if args else "md"
            if format not in ["md", "html", "json"]:
                print(f"Error: Invalid format '{format}'")
                print("Valid formats: md, html, json")
                sys.exit(1)

            print(generate_token_documentation(format))

        elif command == "checklist":
            name = args[0] if args else "Component"
            print(generate_implementation_checklist(name))

        elif command == "changelog":
            version = args[0] if args else "1.0.0"
            print(generate_changelog_entry(version))

        elif command == "full-docs":
            generate_full_documentation()

        else:
            print(f"Unknown command: {command}")
            print_help()
            sys.exit(1)

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

#!/bin/bash

# Custom Color Literals Migration Script
# Replaces custom hex/rgba colors with COLORS constants

echo "🎨 Starting custom color literals migration..."

# Counter
TOTAL_REPLACEMENTS=0

# Function to replace and count
replace_color() {
  local pattern=$1
  local replacement=$2
  local count=$(grep -r "$pattern" src/ --include="*.tsx" --include="*.ts" | wc -l | tr -d ' ')
  
  if [ "$count" -gt 0 ]; then
    echo "  Replacing $count occurrences of $pattern → $replacement"
    find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/$pattern/$replacement/g" {} +
    TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + count))
  fi
}

echo "🔄 Replacing custom color patterns..."

# Beige shades
replace_color "'#E8D9CE'" "COLORS.beige"
replace_color "'#F4ECE7'" "COLORS.beigeLight"

# Browns
replace_color "'#9C6C49'" "COLORS.brown"

# Greens
replace_color "'#07880E'" "COLORS.greenSuccess"

# Oranges
replace_color "'#F47B25'" "COLORS.orange"

# Blues
replace_color "'#3B82F6'" "COLORS.blue"

# Reds
replace_color "'#E53E3E'" "COLORS.errorRed"
replace_color "'#FEE2E2'" "COLORS.errorRedLight"

# Teals
replace_color "'#008080'" "COLORS.teal"

# Overlays
replace_color "'rgba(20, 20, 20, 0\.4)'" "COLORS.darkOverlay"
replace_color "'rgba(0,0,0,0\.6)'" "OVERLAYS.dark60"

# Shadows
replace_color "shadowColor: '#000'" "shadowColor: COLORS.shadow"

# Transparent (special case - already in constants)
replace_color "borderColor: 'transparent'" "borderColor: COLORS.transparent"
replace_color "backgroundColor: 'transparent'" "backgroundColor: COLORS.transparent"

echo "🔍 Finding files that need COLORS import..."

# Find all files that use COLORS but don't import it
FILES_NEEDING_IMPORT=$(grep -l "COLORS\." src/ -r --include="*.tsx" --include="*.ts" | while read file; do
  if ! grep -q "import.*COLORS.*from.*constants" "$file"; then
    echo "$file"
  fi
done)

# Add COLORS import to files that need it
if [ ! -z "$FILES_NEEDING_IMPORT" ]; then
  echo "📥 Adding COLORS imports to files..."
  echo "$FILES_NEEDING_IMPORT" | while read file; do
    # Check if file already has other imports from constants
    if grep -q "from '@/constants'" "$file"; then
      # Update existing import to include COLORS
      if grep -q "import { OVERLAYS } from '@/constants';" "$file"; then
        sed -i '' "s/import { OVERLAYS } from '@\/constants';/import { COLORS, OVERLAYS } from '@\/constants';/" "$file"
        echo "  ✓ Updated import in $file"
      else
        # Add new import line
        sed -i '' "/^import.*from '@\/constants';/a\\
import { COLORS } from '@/constants';\\
" "$file"
        echo "  ✓ Added import to $file"
      fi
    else
      # Add new import after last import
      sed -i '' "/^import.*from/a\\
import { COLORS } from '@/constants';\\
" "$file"
      echo "  ✓ Added import to $file"
    fi
  done
fi

echo ""
echo "✅ Custom colors migration complete!"
echo "📊 Total replacements: $TOTAL_REPLACEMENTS"
echo ""
echo "🧪 Running linter to verify..."
npm run lint -- --quiet 2>&1 | grep -E "(problems|errors|warnings)" || echo "✓ No lint errors!"

echo ""
echo "💡 Run: npm run lint to see remaining issues"

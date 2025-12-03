#!/bin/bash

# Color Literals Migration Script
# Automatically replaces hardcoded rgba/hex colors with constants

echo "🎨 Starting color literals migration..."

# Create backup
echo "📦 Creating backup..."
tar -czf "backup-$(date +%Y%m%d-%H%M%S).tar.gz" src/

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

echo "🔄 Replacing common rgba patterns..."

# Dark overlays
replace_color "'rgba(0, 0, 0, 0\.9)'" "OVERLAYS.dark90"
replace_color "'rgba(0, 0, 0, 0\.8)'" "OVERLAYS.dark80"
replace_color "'rgba(0, 0, 0, 0\.7)'" "OVERLAYS.dark70"
replace_color "'rgba(0, 0, 0, 0\.6)'" "OVERLAYS.dark60"
replace_color "'rgba(0, 0, 0, 0\.5)'" "OVERLAYS.dark50"
replace_color "'rgba(0, 0, 0, 0\.4)'" "OVERLAYS.dark40"
replace_color "'rgba(0, 0, 0, 0\.3)'" "OVERLAYS.dark30"
replace_color "'rgba(0, 0, 0, 0\.2)'" "OVERLAYS.dark20"
replace_color "'rgba(0, 0, 0, 0\.1)'" "OVERLAYS.dark10"

# Light overlays
replace_color "'rgba(255, 255, 255, 0\.9)'" "OVERLAYS.light90"
replace_color "'rgba(255, 255, 255, 0\.8)'" "OVERLAYS.light80"
replace_color "'rgba(255, 255, 255, 0\.7)'" "OVERLAYS.light70"
replace_color "'rgba(255, 255, 255, 0\.6)'" "OVERLAYS.light60"
replace_color "'rgba(255, 255, 255, 0\.5)'" "OVERLAYS.light50"
replace_color "'rgba(255, 255, 255, 0\.4)'" "OVERLAYS.light40"
replace_color "'rgba(255, 255, 255, 0\.3)'" "OVERLAYS.light30"
replace_color "'rgba(255, 255, 255, 0\.2)'" "OVERLAYS.light20"
replace_color "'rgba(255, 255, 255, 0\.1)'" "OVERLAYS.light10"

echo "🔍 Finding files that need OVERLAYS import..."

# Find all files that use OVERLAYS but don't import it
FILES_NEEDING_IMPORT=$(grep -l "OVERLAYS\." src/ -r --include="*.tsx" --include="*.ts" | while read file; do
  if ! grep -q "import.*OVERLAYS.*from.*constants" "$file"; then
    echo "$file"
  fi
done)

# Add OVERLAYS import to files that need it
if [ ! -z "$FILES_NEEDING_IMPORT" ]; then
  echo "📥 Adding OVERLAYS imports to files..."
  echo "$FILES_NEEDING_IMPORT" | while read file; do
    # Check if file has any imports
    if grep -q "^import" "$file"; then
      # Add after the last import
      sed -i '' "/^import.*from/a\\
import { OVERLAYS } from '@/constants';\\
" "$file"
      echo "  ✓ Added import to $file"
    else
      # Add at the top
      sed -i '' "1i\\
import { OVERLAYS } from '@/constants';\\
" "$file"
      echo "  ✓ Added import to $file (at top)"
    fi
  done
fi

echo ""
echo "✅ Migration complete!"
echo "📊 Total replacements: $TOTAL_REPLACEMENTS"
echo ""
echo "🧪 Running linter to verify..."
npm run lint -- --quiet 2>&1 | grep -E "(problems|errors|warnings)" || echo "✓ No lint errors!"

echo ""
echo "💡 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Run tests: npm test"
echo "  3. Commit: git commit -am 'refactor: migrate color literals to OVERLAYS constants'"

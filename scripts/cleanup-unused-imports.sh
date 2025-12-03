#!/bin/bash

# Unused Imports Cleanup Script
# Removes unused imports from TypeScript files

echo "🧹 Starting unused imports cleanup..."

# Backup
echo "📦 Creating backup..."
tar -czf "backup-unused-vars-$(date +%Y%m%d-%H%M%S).tar.gz" src/

TOTAL_FIXES=0

# Function to remove unused import
remove_unused_import() {
  local file=$1
  local import_name=$2
  
  # Check if import exists and is unused
  if grep -q "import.*${import_name}" "$file"; then
    # Check if the import is actually used in the file (excluding the import line itself)
    if ! grep -v "^import" "$file" | grep -q "\b${import_name}\b"; then
      echo "  Removing unused '${import_name}' from $(basename $file)"
      
      # Remove from named imports
      sed -i '' "s/import { ${import_name}, /import { /g" "$file"
      sed -i '' "s/, ${import_name} }/}/g" "$file"
      sed -i '' "s/{ ${import_name} }/{ }/g" "$file"
      
      # Remove entire line if import is now empty
      sed -i '' "/import { } from/d" "$file"
      
      TOTAL_FIXES=$((TOTAL_FIXES + 1))
    fi
  fi
}

echo "🔍 Scanning for unused imports..."

# Find files with unused logger import
echo ""
echo "Removing unused 'logger' imports..."
for file in $(grep -l "import { logger }" src/screens/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "\blogger\b"; then
    remove_unused_import "$file" "logger"
  fi
done

for file in $(grep -l "import { logger }" src/components/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "\blogger\b"; then
    remove_unused_import "$file" "logger"
  fi
done

# Find files with unused MaterialCommunityIcons
echo ""
echo "Removing unused 'MaterialCommunityIcons' imports..."
for file in $(grep -l "MaterialCommunityIcons" src/**/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "MaterialCommunityIcons"; then
    sed -i '' "/import.*MaterialCommunityIcons.*from/d" "$file"
    TOTAL_FIXES=$((TOTAL_FIXES + 1))
    echo "  Removed from $(basename $file)"
  fi
done

# Find files with unused Platform
echo ""
echo "Removing unused 'Platform' imports..."
for file in $(grep -l "import.*Platform.*from 'react-native'" src/**/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "\bPlatform\b"; then
    remove_unused_import "$file" "Platform"
  fi
done

# Find files with unused Image
echo ""
echo "Removing unused 'Image' imports..."
for file in $(grep -l "import.*Image.*from 'react-native'" src/**/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "\bImage\b" || ! grep -v "^import" "$file" | grep -q "<Image"; then
    remove_unused_import "$file" "Image"
  fi
done

# Find files with unused View
echo ""
echo "Removing unused 'View' imports..."
for file in $(grep -l "import.*View.*from 'react-native'" src/**/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "\bView\b" || ! grep -v "^import" "$file" | grep -q "<View"; then
    remove_unused_import "$file" "View"
  fi
done

# Remove unused 'useNavigation' imports
echo ""
echo "Removing unused 'useNavigation' imports..."
for file in $(grep -l "import.*useNavigation" src/**/*.tsx 2>/dev/null); do
  if ! grep -v "^import" "$file" | grep -q "useNavigation("; then
    remove_unused_import "$file" "useNavigation"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo "📊 Total imports removed: $TOTAL_FIXES"
echo ""
echo "🧪 Running linter to verify..."
npm run lint -- --quiet 2>&1 | grep -E "(problems|errors|warnings)" || echo "✓ Lint check complete"

echo ""
echo "💡 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Run tests: npm test"
echo "  3. Check remaining unused vars: npm run lint | grep 'no-unused-vars'"

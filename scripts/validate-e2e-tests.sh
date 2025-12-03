#!/bin/bash

# E2E Test Validation Script
# Validates all Maestro test flows without running them

echo "🔍 Validating E2E Test Flows..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

total_tests=0
valid_tests=0
invalid_tests=0

# Check if maestro is installed
if ! command -v maestro &> /dev/null; then
    echo -e "${RED}❌ Maestro is not installed${NC}"
    echo "Install: curl -Ls 'https://get.maestro.mobile.dev' | bash"
    exit 1
fi

echo -e "${GREEN}✅ Maestro installed${NC}"
echo ""

# Validate each test flow
for file in .maestro/*.yaml; do
    if [[ -f "$file" ]] && [[ "$file" != *.maestro/README.md ]]; then
        total_tests=$((total_tests + 1))
        filename=$(basename "$file")
        
        echo "📋 Validating: $filename"
        
        # Check YAML syntax
        if maestro test --dry-run "$file" &> /dev/null; then
            echo -e "${GREEN}  ✅ Valid YAML syntax${NC}"
            valid_tests=$((valid_tests + 1))
        else
            echo -e "${RED}  ❌ Invalid YAML syntax${NC}"
            invalid_tests=$((invalid_tests + 1))
        fi
        echo ""
    fi
done

# Summary
echo "════════════════════════════════════"
echo "📊 Summary:"
echo "   Total Tests: $total_tests"
echo -e "   ${GREEN}Valid: $valid_tests${NC}"
if [ $invalid_tests -gt 0 ]; then
    echo -e "   ${RED}Invalid: $invalid_tests${NC}"
fi
echo "════════════════════════════════════"

if [ $invalid_tests -eq 0 ]; then
    echo -e "${GREEN}✅ All E2E tests are valid!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests have errors${NC}"
    exit 1
fi

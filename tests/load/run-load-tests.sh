#!/bin/bash

# Load Testing Runner Script
# Runs all load tests and generates reports

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f tests/load/.env.load-test ]; then
  export $(cat tests/load/.env.load-test | xargs)
else
  echo -e "${YELLOW}⚠️  Warning: .env.load-test not found. Using defaults.${NC}"
fi

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
  echo -e "${RED}❌ k6 is not installed${NC}"
  echo "Install with: brew install k6"
  echo "Or visit: https://k6.io/docs/getting-started/installation/"
  exit 1
fi

echo "🚀 Lovendo Load Testing Suite"
echo "=================================="
echo ""

# Function to run a test
run_test() {
  local test_name=$1
  local test_file=$2
  local description=$3
  
  echo -e "${YELLOW}Running: ${test_name}${NC}"
  echo "Description: ${description}"
  echo ""
  
  if k6 run "$test_file"; then
    echo -e "${GREEN}✅ ${test_name} PASSED${NC}"
  else
    echo -e "${RED}❌ ${test_name} FAILED${NC}"
    return 1
  fi
  echo ""
  echo "---"
  echo ""
}

# Parse command line arguments
TEST_TYPE=${1:-all}

case $TEST_TYPE in
  quick)
    echo "Running quick load test (1 minute, 100 VUs)..."
    k6 run --vus 100 --duration 1m tests/load/api-load-test.js
    ;;
    
  standard)
    echo "Running standard load test (5 minutes, 1000 VUs)..."
    k6 run --vus 1000 --duration 5m tests/load/api-load-test.js
    ;;
    
  spike)
    echo "Running spike test..."
    run_test "Spike Test" "tests/load/spike-test.js" "Tests sudden traffic spikes"
    ;;
    
  stress)
    echo "Running stress test..."
    run_test "Stress Test" "tests/load/stress-test.js" "Finds system breaking point"
    ;;
    
  soak)
    echo "Running soak test (2 hours)..."
    echo -e "${YELLOW}⚠️  This will take 2+ hours to complete${NC}"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      run_test "Soak Test" "tests/load/soak-test.js" "Tests long-term stability"
    fi
    ;;
    
  all)
    echo "Running all load tests..."
    echo ""
    
    run_test "Quick Load Test" "tests/load/api-load-test.js --vus 100 --duration 1m" "Quick smoke test"
    run_test "Standard Load Test" "tests/load/api-load-test.js" "Standard 5-minute test"
    run_test "Spike Test" "tests/load/spike-test.js" "Traffic spike test"
    run_test "Stress Test" "tests/load/stress-test.js" "Breaking point test"
    
    echo -e "${YELLOW}Note: Soak test skipped (takes 2+ hours). Run separately with: ./run-load-tests.sh soak${NC}"
    ;;
    
  *)
    echo "Usage: ./run-load-tests.sh [quick|standard|spike|stress|soak|all]"
    echo ""
    echo "Test Types:"
    echo "  quick    - Quick 1-minute test with 100 VUs"
    echo "  standard - Standard 5-minute test with 1000 VUs"
    echo "  spike    - Sudden traffic spike test"
    echo "  stress   - Find breaking point test"
    echo "  soak     - 2-hour stability test"
    echo "  all      - Run all tests except soak"
    exit 1
    ;;
esac

echo ""
echo "=================================="
echo -e "${GREEN}✅ Load testing complete!${NC}"
echo ""
echo "Results saved to:"
echo "  - summary.json"
echo "  - stress-test-results.json (if run)"
echo "  - soak-test-results.json (if run)"
echo ""
echo "Next steps:"
echo "  1. Review results above"
echo "  2. Check Grafana dashboards (if configured)"
echo "  3. Analyze bottlenecks"
echo "  4. Optimize and re-test"

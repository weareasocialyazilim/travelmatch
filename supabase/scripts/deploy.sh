#!/bin/bash

#===============================================================================
# Supabase Edge Functions Deployment Script
#
# Usage:
#   ./deploy.sh               # Deploy all functions
#   ./deploy.sh function-name # Deploy specific function
#   ./deploy.sh --list        # List all functions
#   ./deploy.sh --verify      # Verify deployment
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="${SUPABASE_PROJECT_REF:-bjikxgtbptrvawkguypv}"
FUNCTIONS_DIR="./functions"

# Function list (excluding _shared)
FUNCTIONS=(
  "apple-webhook"
  "calculate-route"
  "cleanup-expired-data"
  "cloudflare-images"
  "create-checkout-session"
  "create-escrow"
  "create-moment"
  "get-moments"
  "google-webhook"
  "health-check"
  "payment-webhook"
  "process-scheduled-releases"
  "refund-payment"
  "release-escrow"
  "send-push-notification"
  "send-verification"
  "paytr-connect"
  "paytr-webhook"
  "subscription-webhook"
  "verify-phone"
)

#===============================================================================
# Helper Functions
#===============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
  echo "Usage: $0 [options] [function-name]"
  echo ""
  echo "Options:"
  echo "  --list     List all available functions"
  echo "  --verify   Verify deployed functions"
  echo "  --help     Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0                      # Deploy all functions"
  echo "  $0 health-check         # Deploy specific function"
  echo "  $0 --list               # List all functions"
}

list_functions() {
  echo ""
  log_info "Available Edge Functions (${#FUNCTIONS[@]} total):"
  echo ""
  for func in "${FUNCTIONS[@]}"; do
    echo "  - $func"
  done
  echo ""
}

verify_deployment() {
  log_info "Verifying deployed functions..."
  echo ""
  
  local success_count=0
  local failed_count=0
  
  for func in "${FUNCTIONS[@]}"; do
    local status=$(supabase functions list --project-ref "$PROJECT_REF" 2>/dev/null | grep "$func" | awk '{print $3}')
    
    if [ "$status" = "ACTIVE" ]; then
      echo -e "  ${GREEN}✓${NC} $func - ACTIVE"
      ((success_count++))
    else
      echo -e "  ${RED}✗${NC} $func - ${status:-NOT FOUND}"
      ((failed_count++))
    fi
  done
  
  echo ""
  log_info "Verification complete: $success_count active, $failed_count failed/missing"
}

deploy_function() {
  local func_name=$1
  
  if [ ! -d "$FUNCTIONS_DIR/$func_name" ]; then
    log_error "Function directory not found: $FUNCTIONS_DIR/$func_name"
    return 1
  fi
  
  log_info "Deploying $func_name..."
  
  if supabase functions deploy "$func_name" --project-ref "$PROJECT_REF" --no-verify-jwt; then
    log_success "$func_name deployed successfully"
    return 0
  else
    log_error "Failed to deploy $func_name"
    return 1
  fi
}

deploy_all() {
  log_info "Deploying all ${#FUNCTIONS[@]} Edge Functions..."
  echo ""
  
  local success_count=0
  local failed_count=0
  local failed_functions=()
  
  for func in "${FUNCTIONS[@]}"; do
    if deploy_function "$func"; then
      ((success_count++))
    else
      ((failed_count++))
      failed_functions+=("$func")
    fi
    echo ""
  done
  
  echo "========================================"
  log_info "Deployment Summary:"
  echo "  - Successful: $success_count"
  echo "  - Failed: $failed_count"
  
  if [ $failed_count -gt 0 ]; then
    echo ""
    log_warning "Failed functions:"
    for func in "${failed_functions[@]}"; do
      echo "    - $func"
    done
    return 1
  fi
  
  echo ""
  log_success "All functions deployed successfully!"
  return 0
}

#===============================================================================
# Main Script
#===============================================================================

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  log_error "Supabase CLI not found. Please install it first:"
  echo "  npm install -g supabase"
  exit 1
fi

# Parse arguments
case "${1:-}" in
  --help|-h)
    show_usage
    exit 0
    ;;
  --list)
    list_functions
    exit 0
    ;;
  --verify)
    verify_deployment
    exit 0
    ;;
  "")
    # No argument - deploy all
    deploy_all
    ;;
  *)
    # Specific function name
    if [[ " ${FUNCTIONS[*]} " =~ " $1 " ]]; then
      deploy_function "$1"
    else
      log_error "Unknown function: $1"
      echo ""
      show_usage
      exit 1
    fi
    ;;
esac

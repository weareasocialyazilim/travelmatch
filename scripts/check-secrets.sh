#!/bin/bash
# ============================================
# 🔐 Secret Scanner - Pre-commit/Pre-push Hook
# ============================================
# This script scans for potential secrets before commits
# Usage: ./scripts/check-secrets.sh [files...]
# 
# Add to .git/hooks/pre-commit or use with husky

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Scanning for secrets...${NC}"

# Patterns to detect
PATTERNS=(
    # === TWILIO ===
    'AC[a-f0-9]{32}'                     # Twilio Account SID
    'SK[a-f0-9]{32}'                     # Twilio API Key SID
    'VA[a-f0-9]{32}'                     # Twilio Verify Service SID
    
    # === SENDGRID ===
    'SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}'  # SendGrid API Key
    
    # === PAYTR ===
    'paytr.*merchant.*[0-9]{6,}'         # PayTR Merchant ID pattern
    
    # === AWS ===
    'AKIA[0-9A-Z]{16}'                   # AWS Access Key ID
    'aws_secret_access_key'              # AWS Secret Key variable
    
    # === GITHUB ===
    'ghp_[a-zA-Z0-9]{36}'                # GitHub Personal Access Token
    'gho_[a-zA-Z0-9]{36}'                # GitHub OAuth Token
    'ghu_[a-zA-Z0-9]{36}'                # GitHub User Token
    'ghs_[a-zA-Z0-9]{36}'                # GitHub Server Token
    'ghr_[a-zA-Z0-9]{36}'                # GitHub Refresh Token
    
    # === SLACK ===
    'xox[baprs]-[0-9a-zA-Z]{10,48}'      # Slack tokens
    'hooks\.slack\.com/services/T[A-Z0-9]+/B[A-Z0-9]+/[a-zA-Z0-9]+'  # Slack webhook
    
    # === SENTRY ===
    'https://[a-f0-9]+@[a-z0-9]+\.ingest\.(de\.)?sentry\.io/[0-9]+'  # Sentry DSN with real values
    
    # === SUPABASE/JWT ===
    'eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}'  # JWT tokens (real ones, not truncated)
    'sbp_[a-zA-Z0-9]{40,}'               # Supabase service tokens
    
    # === INFISICAL ===
    'st\.[a-zA-Z0-9]{24,}'               # Infisical service tokens
    
    # === CLOUDFLARE ===
    'cf_[a-zA-Z0-9]{37}'                 # Cloudflare API tokens
    
    # === OPENAI / ANTHROPIC ===
    'sk-[a-zA-Z0-9]{48}'                 # OpenAI API Key
    'sk-ant-[a-zA-Z0-9-]{40,}'           # Anthropic API Key
    
    # === MAPBOX ===
    'pk\.[a-zA-Z0-9]{60,}'               # Mapbox public token (if real, not placeholder)
    'sk\.[a-zA-Z0-9]{60,}'               # Mapbox secret token
    
    # === EXPO ===
    'expo_[a-zA-Z0-9]{40,}'              # Expo access token
    
    # === VERCEL / TURBO ===
    'vercel_[a-zA-Z0-9]{24,}'            # Vercel tokens
    
    # === SNYK ===
    'SNYK_TOKEN\s*[:=]\s*["\x27][0-9a-f-]{36}["\x27]'  # Snyk token (only when assigned)
    
    # === PRIVATE KEYS ===
    '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'
    '-----BEGIN PGP PRIVATE KEY BLOCK-----'
    
    # === ADMIN PASSWORDS ===
    'ADMIN_PASSWORD\s*[:=]\s*["\x27][^"\x27]{6,}["\x27]'       # Admin password assignment
    'SUPER_ADMIN_PASSWORD\s*[:=]\s*["\x27][^"\x27]{6,}["\x27]' # Super admin password
    'GRAFANA_ADMIN_PASSWORD\s*[:=]\s*["\x27][^"\x27]{6,}["\x27]' # Grafana password
    
    # === GENERIC PATTERNS ===
    'password\s*[:=]\s*["\x27][^"\x27$]{8,}["\x27]'  # Hardcoded passwords (not env vars)
    'api[_-]?key\s*[:=]\s*["\x27][a-zA-Z0-9]{20,}["\x27]'  # API keys
    'secret\s*[:=]\s*["\x27][a-zA-Z0-9]{20,}["\x27]'  # Generic secrets
    'auth[_-]?token\s*[:=]\s*["\x27][a-zA-Z0-9]{20,}["\x27]'  # Auth tokens
)

# Files to check (staged files or all if no args)
if [ "$#" -gt 0 ]; then
    FILES="$@"
else
    FILES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || git ls-files)
fi

FOUND_SECRETS=0

for file in $FILES; do
    # Skip binary files, lock files, and examples
    if [[ "$file" =~ \.(jpg|jpeg|png|gif|ico|woff|woff2|ttf|eot|lock|lockb)$ ]]; then
        continue
    fi
    if [[ "$file" =~ \.example$ ]] || [[ "$file" =~ example\.env$ ]]; then
        continue
    fi
    if [[ "$file" =~ node_modules|\.git|dist|build|coverage ]]; then
        continue
    fi
    if [[ ! -f "$file" ]]; then
        continue
    fi
    
    for pattern in "${PATTERNS[@]}"; do
        if grep -qE "$pattern" "$file" 2>/dev/null; then
            echo -e "${RED}⚠️  Potential secret found in: $file${NC}"
            echo -e "   Pattern: $pattern"
            grep -nE "$pattern" "$file" | head -3 | while read -r line; do
                echo -e "   ${YELLOW}$line${NC}"
            done
            FOUND_SECRETS=1
        fi
    done
done

if [ $FOUND_SECRETS -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Secrets detected! Please remove them before committing.${NC}"
    echo -e "${YELLOW}Tips:${NC}"
    echo "  1. Use environment variables: process.env.SECRET_KEY"
    echo "  2. Store secrets in Infisical: infisical secrets set"
    echo "  3. Add test values to .env.example (not real secrets)"
    echo ""
    echo -e "To bypass (use with caution): git commit --no-verify"
    exit 1
else
    echo -e "${GREEN}✅ No secrets detected${NC}"
fi

#!/bin/bash
# Start VS Code with Minimax API configuration from Infisical
# This allows Claude Code extension to use MiniMax M2.1 without storing keys in the repo

set -e

cd "$(dirname "$0")/.."

echo "🔐 Configuring MiniMax environment..."

# We inject all necessary configuration via environment variables
# This ensures the extension sees a complete configuration set
infisical run --env=dev -- bash -c '
  export ANTHROPIC_BASE_URL="https://api.minimax.io/anthropic"
  export ANTHROPIC_AUTH_TOKEN="$MINIMAX_API_KEY"
  export ANTHROPIC_MODEL="MiniMax-M2.1"
  export ANTHROPIC_SMALL_FAST_MODEL="MiniMax-M2.1"
  export ANTHROPIC_DEFAULT_SONNET_MODEL="MiniMax-M2.1"
  export API_TIMEOUT_MS="3000000"
  export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"
  
  echo "🚀 Starting VS Code..."
  code .
'

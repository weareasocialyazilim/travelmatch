#!/bin/bash
# Run Claude Code CLI using MiniMax M2.1 via Infisical-managed secrets.
# Usage: ./scripts/claude-minimax.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# Ensure no stale Anthropic env vars conflict with MiniMax configuration
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_BASE_URL

# Run Claude Code with Infisical secrets injected
infisical run --env=dev -- bash -c '
  export ANTHROPIC_BASE_URL="https://api.minimax.io/anthropic";
  export ANTHROPIC_AUTH_TOKEN="$MINIMAX_API_KEY";
  export API_TIMEOUT_MS="3000000";
  export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1";
  export ANTHROPIC_MODEL="MiniMax-M2.1";
  export ANTHROPIC_SMALL_FAST_MODEL="MiniMax-M2.1";
  export ANTHROPIC_DEFAULT_SONNET_MODEL="MiniMax-M2.1";
  export ANTHROPIC_DEFAULT_OPUS_MODEL="MiniMax-M2.1";
  export ANTHROPIC_DEFAULT_HAIKU_MODEL="MiniMax-M2.1";
  claude
'
#!/bin/bash

# EAS Build Pre-Install Hook
# 1. Pulls secrets from Infisical
# 2. Sets up Mapbox credentials for CocoaPods

set -e

echo "🔐 Setting up secrets from Infisical..."

# Install Infisical CLI if not present
if ! command -v infisical &> /dev/null; then
  echo "📦 Installing Infisical CLI..."
  curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
  sudo apt-get update && sudo apt-get install -y infisical || {
    # Fallback for macOS
    brew install infisical/get-cli/infisical 2>/dev/null || echo "⚠️ Could not install Infisical CLI"
  }
fi

# Export secrets from Infisical using Machine Identity
if [ -n "$INFISICAL_CLIENT_ID" ] && [ -n "$INFISICAL_CLIENT_SECRET" ]; then
  echo "🔑 Authenticating with Infisical..."
  
  # Determine environment based on APP_ENV
  INFISICAL_ENV="${APP_ENV:-production}"
  if [ "$INFISICAL_ENV" = "development" ]; then
    INFISICAL_ENV="dev"
  elif [ "$INFISICAL_ENV" = "production" ]; then
    INFISICAL_ENV="prod"
  fi
  
  # Export secrets to environment
  eval "$(infisical export --env=$INFISICAL_ENV --format=dotenv-export \
    --client-id=$INFISICAL_CLIENT_ID \
    --client-secret=$INFISICAL_CLIENT_SECRET \
    --projectId=${INFISICAL_PROJECT_ID:-cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9} 2>/dev/null)" || {
    echo "⚠️ Could not fetch secrets from Infisical, using EAS Secrets"
  }
  echo "✅ Secrets loaded from Infisical"
else
  echo "⚠️ INFISICAL_CLIENT_ID/SECRET not set, using EAS Secrets"
fi

echo "🗺️ Setting up Mapbox credentials..."

# Check for new format first, then fallback to old format
MAPBOX_TOKEN="${RNMAPBOX_MAPS_DOWNLOAD_TOKEN:-$MAPBOX_DOWNLOAD_TOKEN}"

if [ -n "$MAPBOX_TOKEN" ]; then
  echo "machine api.mapbox.com" >> ~/.netrc
  echo "login mapbox" >> ~/.netrc
  echo "password $MAPBOX_TOKEN" >> ~/.netrc
  chmod 600 ~/.netrc
  echo "✅ Mapbox credentials configured in ~/.netrc"
  cat ~/.netrc | head -3
else
  echo "⚠️ RNMAPBOX_MAPS_DOWNLOAD_TOKEN not set, skipping Mapbox setup"
  echo "Available env vars:"
  env | grep -i mapbox || echo "No MAPBOX env vars found"
fi

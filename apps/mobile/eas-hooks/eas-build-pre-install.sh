#!/bin/bash

# EAS Build Pre-Install Hook
# Sets up Mapbox credentials for CocoaPods

set -e

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

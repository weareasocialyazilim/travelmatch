#!/bin/bash

# ====================================================================
# Type Synchronization Script
# Wraps generate-db-types.sh and distributes types to all apps
# ====================================================================

set -e

# Run the original generation script (which targets Mobile)
./scripts/generate-db-types.sh "$@"

SOURCE_FILE="apps/mobile/src/types/database.types.ts"
ADMIN_DEST="apps/admin/src/types/database.ts"
WEB_DEST="apps/web/src/types/database.types.ts"

if [ -f "$SOURCE_FILE" ]; then
    echo ""
    echo -e "\033[0;34m🔄 Syncing types to other applications...\033[0m"
    
    # Sync to Admin
    mkdir -p $(dirname "$ADMIN_DEST")
    cp "$SOURCE_FILE" "$ADMIN_DEST"
    echo -e "   ✅ Synced to Admin: $ADMIN_DEST"
    
    # Sync to Web
    mkdir -p $(dirname "$WEB_DEST")
    cp "$SOURCE_FILE" "$WEB_DEST"
    echo -e "   ✅ Synced to Web: $WEB_DEST"
    
    echo ""
    echo -e "\033[0;32m🎉 All applications are now effectively using the same database contract.\033[0m"
else
    echo -e "\033[0;31m❌ Source file generated failed. Sync aborted.\033[0m"
    exit 1
fi

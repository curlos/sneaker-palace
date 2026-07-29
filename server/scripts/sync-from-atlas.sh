#!/bin/bash

# Sync Atlas → Local MongoDB
# Exports Atlas data and imports to local (overwrites local data)

set -e  # Exit on error

echo "🔄 Syncing Atlas → Local MongoDB"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables from .env (for Atlas URI)
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}✗${NC} .env file not found"
    exit 1
fi

# Check if ATLAS_URI is set
if [ -z "$ATLAS_URI" ]; then
    echo -e "${RED}✗${NC} ATLAS_URI not found in .env"
    exit 1
fi

# Confirm action
echo -e "${YELLOW}⚠${NC}  WARNING: This will OVERWRITE all data in your local MongoDB"
echo "   Source: $ATLAS_URI"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

# Create backup directory
BACKUP_DIR="./mongo-backups/sync-from-atlas-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "📥 Exporting from Atlas..."

# Export from Atlas
if mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Data exported from Atlas"
else
    echo -e "${RED}✗${NC} Failed to export from Atlas"
    echo "   Check your ATLAS_URI in .env file"
    exit 1
fi

echo ""
echo "📤 Importing to Local MongoDB..."

# Import to local MongoDB (with --drop to overwrite)
if mongorestore --uri="mongodb://localhost:27017/shoe-shop" --drop "$BACKUP_DIR/shoe-shop" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Data imported to local MongoDB"
else
    echo -e "${RED}✗${NC} Failed to import to local MongoDB"
    echo "   Is MongoDB running? Check: brew services list"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Sync Complete!${NC}"
echo ""
echo "Atlas → Local MongoDB sync successful"
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "Your local MongoDB now matches your Atlas data"

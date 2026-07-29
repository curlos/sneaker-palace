#!/bin/bash

# Setup Local MongoDB for Development
# This script installs MongoDB, starts the service, and imports data from Atlas

set -e  # Exit on error

echo "🚀 Setting up Local MongoDB for Development"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB is already installed"
else
    echo -e "${YELLOW}⚠${NC}  MongoDB not found. Installing via Homebrew..."

    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo -e "${RED}✗${NC} Homebrew is not installed. Please install it first:"
        echo "   Visit: https://brew.sh"
        exit 1
    fi

    # Install MongoDB
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    echo -e "${GREEN}✓${NC} MongoDB installed successfully"
fi

# Start MongoDB service
echo ""
echo "📦 Starting MongoDB service..."
brew services start mongodb-community@7.0

# Wait for MongoDB to start
sleep 2

# Check if MongoDB is running
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB is running on mongodb://localhost:27017"
else
    echo -e "${RED}✗${NC} Failed to start MongoDB"
    exit 1
fi

# Load environment variables from .env
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

echo ""
echo "📥 Downloading data from Atlas..."
echo "   Source: $ATLAS_URI"

# Create backup directory
BACKUP_DIR="./mongo-backups/initial-import-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Export from Atlas
if mongodump --uri="$ATLAS_URI" --out="$BACKUP_DIR" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Data exported from Atlas"
else
    echo -e "${RED}✗${NC} Failed to export data from Atlas"
    echo "   Check your ATLAS_URI in .env file"
    exit 1
fi

echo ""
echo "📤 Importing data to Local MongoDB..."

# Import to local MongoDB
if mongorestore --uri="mongodb://localhost:27017/shoe-shop" "$BACKUP_DIR/shoe-shop" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Data imported to local MongoDB"
else
    echo -e "${RED}✗${NC} Failed to import data to local MongoDB"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create server/.env.local with:"
echo "   ATLAS_URI=mongodb://localhost:27017/shoe-shop"
echo "2. Run: npm run devStart:local    (uses local MongoDB)"
echo "3. Or:  npm run devStart          (uses Atlas)"
echo ""
echo "To sync data later:"
echo "  • Local → Atlas: npm run sync:to-atlas"
echo "  • Atlas → Local: npm run sync:from-atlas"
echo ""
echo "Backup saved to: $BACKUP_DIR"

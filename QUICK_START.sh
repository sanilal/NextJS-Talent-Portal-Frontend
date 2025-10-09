#!/bin/bash

# 🚀 Talents You Need - Quick Start Script
# This script helps you set up and run the Next.js frontend

echo "=================================="
echo "Talents You Need - Quick Start"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo "${YELLOW}⚠️  npm not found. Please install npm${NC}"
    exit 1
fi

echo "${GREEN}✅ Node.js $(node --version)${NC}"
echo "${GREEN}✅ npm $(npm --version)${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "${YELLOW}⚠️  package.json not found. Are you in the frontend directory?${NC}"
    exit 1
fi

# Install dependencies
echo "${BLUE}Installing dependencies...${NC}"
npm install

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Talents You Need
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "${GREEN}✅ Created .env.local${NC}"
fi

echo ""
echo "${GREEN}=================================="
echo "Setup Complete! 🎉"
echo "==================================${NC}"
echo ""
echo "To start the development server:"
echo "${BLUE}npm run dev${NC}"
echo ""
echo "The app will be available at:"
echo "${GREEN}http://localhost:3000${NC}"
echo ""
echo "Before starting, make sure your backend is running:"
echo "  1. Laravel API (Terminal 1): ${YELLOW}php artisan serve${NC}"
echo "  2. Embeddings (Terminal 2): ${YELLOW}python app.py${NC}"
echo "  3. Queue Worker (Terminal 3): ${YELLOW}php artisan queue:work --queue=embeddings${NC}"

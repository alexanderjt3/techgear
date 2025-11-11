#!/bin/bash

# TechGear Setup Script
# This script helps you get started quickly

set -e  # Exit on error

echo "🚀 TechGear Setup Script"
echo "========================"
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ required. You have Node.js $NODE_VERSION"
    echo "   Please install Node.js 20 or higher from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Step 1: Build headphones widget
echo "📦 Step 1/2: Building headphones widget..."
cd packages/widgets/headphones-widget
npm install
npm run build
echo "✅ Widget built successfully"
echo ""

# Step 2: Install MCP server
echo "📦 Step 2/2: Installing MCP server..."
cd ../../mcp
npm install
echo "✅ MCP server dependencies installed"
echo ""

# Done
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the MCP server:"
echo "   cd packages/mcp"
echo "   npm run dev"
echo ""
echo "2. In a new terminal, start the inspector:"
echo "   cd packages/playground"
echo "   npm run inspector"
echo ""
echo "3. Visit http://localhost:3000 to see the server"
echo "4. Visit http://localhost:3000/widgets/headphones to preview the widget"
echo ""
echo "📖 For detailed instructions, see GETTING_STARTED.md"
echo ""


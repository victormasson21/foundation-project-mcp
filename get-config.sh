#!/bin/bash

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "Add this to your Claude Desktop MCP configuration:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"gmail\": {"
echo "      \"command\": \"node\","
echo "      \"args\": ["
echo "        \"${PROJECT_DIR}/dist/emailServer.js\""
echo "      ]"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "Configuration file location:"
echo "  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "  Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
echo ""

#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./gmail/server.js";
import { getUnreadEmailsTool } from "./tools/getUnreadEmails.js";
import { createDraftReplyTool } from "./tools/createDraftReply.js";
import { getStyleGuideTool } from "./tools/getStyleGuide.js";

// Register tools
server.registerTool(
  getUnreadEmailsTool.name,
  getUnreadEmailsTool.config,
  getUnreadEmailsTool.handler
);

server.registerTool(
  createDraftReplyTool.name,
  createDraftReplyTool.config,
  createDraftReplyTool.handler
);

server.registerTool(
  getStyleGuideTool.name,
  getStyleGuideTool.config,
  getStyleGuideTool.handler
);

// Set up server lifecycle
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Gmail MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

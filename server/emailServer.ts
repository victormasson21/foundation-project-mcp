#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "..", ".env.local");
dotenv.config({ path: envPath });

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI =
  process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/oauth2callback";
const GMAIL_ACCESS_TOKEN = process.env.GMAIL_ACCESS_TOKEN;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

// Set up OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

// Set credentials (access token and refresh token)
oauth2Client.setCredentials({
  access_token: GMAIL_ACCESS_TOKEN,
  refresh_token: GMAIL_REFRESH_TOKEN,
});

// Automatically refresh the access token when it expires
oauth2Client.on("tokens", (tokens) => {
  if (tokens.refresh_token) {
    console.error("New refresh token received");
  }
  console.error("Access token refreshed");
});

// Create Gmail API client
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

async function getMessageDetails(messageId: string) {
  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: ["From", "Subject"],
    });

    const headers = response.data.payload?.headers || [];
    const sender = headers.find((h) => h.name === "From")?.value;
    const subject = headers.find((h) => h.name === "Subject")?.value;
    const snippet = response.data.snippet;
    const threadId = response.data.threadId;

    return {
      sender,
      subject,
      snippet,
      threadId,
      id: messageId,
    };
  } catch (error) {
    console.error("Error getting message details:", error);
    throw error;
  }
}

// Create MCP Server
const server = new McpServer({
  name: "gmail-server",
  version: "1.0.0",
});

// Register get_unread_emails tool
server.registerTool(
  "get_unread_emails",
  {
    description:
      "Retrieves unread emails from Gmail inbox with sender, subject, snippet, and thread information",
    inputSchema: {
      maxResults: z
        .number()
        .optional()
        .describe(
          "Maximum number of emails to retrieve (default: 10, max: 50)"
        ),
    },
  },
  async ({ maxResults }) => {
    try {
      const limit = Math.min(maxResults || 10, 50);

      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: limit,
        q: "is:unread",
      });

      const messages = response.data.messages;

      if (!messages || messages.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  emails: [],
                  count: 0,
                  message: "No unread emails found",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // Fetch details for all messages in parallel
      const messagesWithDetails = await Promise.all(
        messages.map((msg) => getMessageDetails(msg.id!))
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                emails: messagesWithDetails,
                count: messagesWithDetails.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Failed to retrieve unread emails",
                details: errorMessage,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
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

import { google, gmail_v1, Auth } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "..", "..", ".env.local");
dotenv.config({ path: envPath });

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI =
  process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/oauth2callback";
const GMAIL_ACCESS_TOKEN = process.env.GMAIL_ACCESS_TOKEN;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

// Set up OAuth2 client
const _oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

// Set credentials (access token and refresh token)
_oauth2Client.setCredentials({
  access_token: GMAIL_ACCESS_TOKEN,
  refresh_token: GMAIL_REFRESH_TOKEN,
});

// Automatically refresh the access token when it expires
_oauth2Client.on("tokens", (tokens: any) => {
  if (tokens.refresh_token) {
    console.error("New refresh token received");
  }
  console.error("Access token refreshed");
});

export const oauth2Client: Auth.OAuth2Client = _oauth2Client;

// Create Gmail API client
const _gmail = google.gmail({ version: "v1", auth: oauth2Client });
export const gmail: gmail_v1.Gmail = _gmail;

// Create MCP Server
export const server = new McpServer({
  name: "gmail-server",
  version: "1.0.0",
});

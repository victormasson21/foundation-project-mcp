# Gmail MCP Server

An MCP (Model Context Protocol) server that allows AI assistants to read unread emails from a Gmail account.

## Features

- **OAuth 2.0 Authentication**: Secure access to Gmail with user consent
- **Read Unread Emails**: Fetch unread emails with sender, subject, snippet, and thread information
- **Create Draft Replies**: Compose draft responses to emails while maintaining thread continuity

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build the server
pnpm build

# 3. Set up OAuth - follow the prompts (once)
pnpm setup:gmail

# 4. Get your MCP configuration (once)
./get-config.sh

# 5. Run the MCP server
pnpm start
```

Then add the configuration to Claude Desktop and restart the app!

## MCP Configuration

Run `./get-config.sh` to get your configuration, then add it to your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Configuration format:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": [
        "/absolute/path/to/foundation-project-mcp/dist/emailServer.js"
      ]
    }
  }
}
```

## Available Tools

### `get_unread_emails`

Retrieves unread emails from the Gmail inbox.

**Parameters:**
- `maxResults` (optional): Maximum number of emails to retrieve (default: 10, max: 50)

**Example prompts:** "Show me my unread emails" • "What unread emails do I have?" • "Get my recent unread messages"

### `create_draft_reply`

Creates a draft reply to an email in a thread.

**Parameters:**
- `messageId` (required): The messageId of the original email
- `threadId` (required): The threadId of the original email
- `sender` (required): The sender of the original email
- `subject` (required): The subject of the original email
- `replyBody` (required): The draft reply content

**Example prompts:** "Create a draft reply to this email saying..." • "Draft a response to the email from [sender]"

## Example prompts

- "Show me my unread emails"
- "What unread emails do I have?"
- "Get my recent unread messages"
- "Create a draft reply to this email saying..."
- "Draft a response to the email from [sender]"
- "Draft a response to important unread emails"

## Screenshots

To be added.

## Security Notes

- Never commit `.env.local` (contains sensitive credentials)
- Uses `gmail.readonly` and `gmail.compose` OAuth scopes
- Access tokens auto-refresh when expired
- Email headers are sanitised to prevent injection attacks

## Troubleshooting

- **Invalid credentials / Token errors**: Re-run `pnpm setup:gmail`
- **No emails returned**: Check you have unread emails and Gmail API is enabled in Google Cloud Console

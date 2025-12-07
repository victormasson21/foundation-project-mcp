# Gmail MCP Server

An MCP (Model Context Protocol) server that allows AI assistants to read unread emails from a Gmail account.

## Features

- **OAuth 2.0 Authentication**: Secure access to Gmail with user consent
- **Read Unread Emails**: Fetch unread emails with sender, subject, snippet, and thread information
- **Create Draft Replies**: Compose draft responses to emails while maintaining thread continuity
- **Style Guide Integration**: Pull email writing guidelines from Notion to ensure consistent, professional communication

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

# 5. (Optional) Set up Notion integration for style guides
# Add to .env.local:
# NOTION_API_KEY=your_notion_api_key
# NOTION_STYLE_GUIDE_PAGE_ID=your_page_id

# 6. Run the MCP server
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

### `get_style_guide`

Retrieves the email writing style guide from Notion (if configured).

**Parameters:** None

**Returns:** Email writing guidelines and best practices from your Notion page

**Example prompts:** "Get the email style guide" • "What are our email writing standards?" • "Show me the style guide before I draft a reply"

## Example prompts

- "Show me my unread emails"
- "What unread emails do I have?"
- "Get my recent unread messages"
- "Get the email style guide and then draft a response to my latest unread email"
- "Create a draft reply to this email saying..."
- "Draft a response to the email from [sender]"
- "Draft a response to important unread emails following our style guide"

## Screenshots

To be added.

## Notion Setup (Optional)

To enable the style guide feature:

1. **Create a Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Give it a name (e.g., "Gmail MCP Server")
   - Copy the "Internal Integration Token"

2. **Create a Style Guide Page:**
   - Create a new page in Notion with your email writing guidelines
   - Click "Share" and invite your integration
   - Copy the page ID from the URL (the part after the page name and before the `?`)
     - Example: `https://notion.so/Email-Style-Guide-abc123def456` → Page ID is `abc123def456`

3. **Update `.env.local`:**
   ```bash
   NOTION_API_KEY=secret_abc123...
   NOTION_STYLE_GUIDE_PAGE_ID=abc123def456
   ```

4. **Rebuild and restart:**
   ```bash
   pnpm build
   # Restart Claude Desktop
   ```

## Security Notes

- Never commit `.env.local` (contains sensitive credentials)
- Uses `gmail.readonly` and `gmail.compose` OAuth scopes
- Access tokens auto-refresh when expired
- Email headers are sanitised to prevent injection attacks
- Notion integration token should be kept secure and never shared

## Troubleshooting

- **Invalid credentials / Token errors**: Re-run `pnpm setup:gmail`
- **No emails returned**: Check you have unread emails and Gmail API is enabled in Google Cloud Console

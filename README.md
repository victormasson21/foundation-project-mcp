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

### `get_style_guide`

Retrieves the email writing style guide from Notion (if configured).

**Parameters:** None

**Returns:** Email writing guidelines and best practices from your Notion page

## Example prompts

- "Show me my unread emails"
- "What unread emails do I have?"
- "Get my recent unread messages"
- "Get the email style guide and then draft a response to my latest unread email"
- "Create a draft reply to this email saying..."
- "Draft a response to the email from [sender]"
- "Draft a response to important unread emails following our style guide"

**Scroll down for screenshots of some of these prompts in action.**

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

## Demo

<details>
<summary>"Show me my unread emails"</summary>

<img width="791" height="630" alt="Screenshot 2025-12-07 at 16 19 49" src="https://github.com/user-attachments/assets/f8d507f8-6582-41ab-8881-44e1cfcfa161" />
<img width="759" height="662" alt="Screenshot 2025-12-07 at 16 23 11" src="https://github.com/user-attachments/assets/c21d9e6b-9984-44c0-8575-16aec1fbff01" />
<img width="762" height="409" alt="Screenshot 2025-12-07 at 16 23 23" src="https://github.com/user-attachments/assets/138ede87-5358-4303-89e8-3e5325679771" />


</details>

<details>
<summary>"Draft replies to my unread emails"</summary>
  
<img width="763" height="620" alt="Screenshot 2025-12-07 at 16 34 49" src="https://github.com/user-attachments/assets/b8803487-de21-42c8-b89a-49167d50e0fc" />
<img width="765" height="570" alt="Screenshot 2025-12-07 at 16 35 03" src="https://github.com/user-attachments/assets/050c3bf7-a298-45f1-9978-94499c13a1e1" />
<img width="749" height="204" alt="Screenshot 2025-12-07 at 16 35 12" src="https://github.com/user-attachments/assets/19f2b496-99d3-413d-bec1-ea3068a961e9" />

</details>

<details>
<summary>"Did i receive any good newsletters today?"</summary>

<img width="775" height="764" alt="Screenshot 2025-12-07 at 16 38 46" src="https://github.com/user-attachments/assets/6e09662d-fd13-46a6-a380-acade13e5af3" />

</details>

<details>
<summary>Gmail and Notion screenshots</summary>

<img width="963" height="307" alt="Screenshot 2025-12-07 at 16 51 41" src="https://github.com/user-attachments/assets/3e9942a3-b8c8-4042-aff1-14688524bbe5" />
<img width="674" height="271" alt="Screenshot 2025-12-07 at 16 51 52" src="https://github.com/user-attachments/assets/8d25943f-ce1d-44d2-94de-810b17c51e80" />
<img width="927" height="461" alt="Screenshot 2025-12-07 at 16 52 20" src="https://github.com/user-attachments/assets/07309756-e950-4166-b0d1-26a6759b5754" />


</details>

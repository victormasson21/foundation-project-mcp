# Gmail MCP Server

An MCP (Model Context Protocol) server that allows AI assistants to read unread emails from a Gmail account.

## Features

- **OAuth 2.0 Authentication**: Secure access to Gmail with user consent
- **Read Unread Emails**: Fetch unread emails with sender, subject, snippet, and thread information
- **Configurable Results**: Control how many emails to retrieve (up to 50)
- **Compose-Ready Scope**: Pre-configured with compose permissions for future email sending capabilities

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Build the server
pnpm build

# 3. Set up OAuth (follow the prompts)
pnpm setup:gmail

# 4. Get your MCP configuration
./get-config.sh
```

Then add the configuration to Claude Desktop and restart the app!

---

## Detailed Setup

### 1. Install Dependencies

```bash
pnpm install
```

(You can also use `npm install` or `yarn install`)

### 2. Configure Google Cloud OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Desktop app type)
5. Download the credentials

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:3000/oauth2callback
```

### 4. Authorize Access

Run the OAuth flow to get access tokens:

```bash
pnpm setup:gmail
```

This will:
- Open your browser for Google authorization
- Save the access and refresh tokens to `.env.local`
- Display confirmation when complete

Note: You can also use `npm run setup:gmail` or `yarn setup:gmail`

### 5. Build the Server

```bash
pnpm build
```

This compiles the TypeScript to JavaScript in the `dist/` folder.

### 6. Run the Server

```bash
pnpm start
```

The server runs on stdio and is ready to accept MCP client connections.

## MCP Configuration

To use this server with an MCP client (like Claude Desktop), add it to your MCP settings.

### Easy Setup

Run this command to get your configuration:

```bash
./get-config.sh
```

This will output the exact configuration with your absolute path already filled in.

### Manual Configuration

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration (replace the path with your actual project path):

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

**Alternative** (requires building first):

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": [
        "-y",
        "gmail-mcp-server"
      ],
      "cwd": "/absolute/path/to/foundation-project-mcp"
    }
  }
}
```

## Available Tools

### `get_unread_emails`

Retrieves unread emails from the Gmail inbox.

**Parameters:**
- `maxResults` (optional): Maximum number of emails to retrieve (default: 10, max: 50)

**Returns:**
```json
{
  "emails": [
    {
      "sender": "sender@example.com",
      "subject": "Email subject",
      "snippet": "Preview of email content...",
      "threadId": "thread_id",
      "id": "message_id"
    }
  ],
  "count": 5
}
```

**Example Usage:**
```
get_unread_emails({ maxResults: 20 })
```

**Example Prompts in Claude Code:**
- "Show me my unread emails"
- "What unread emails do I have?"
- "Get my recent unread messages"
- "List my unread Gmail messages"

## Security Notes

- **Never commit `.env.local`**: This file contains sensitive credentials and tokens
- **OAuth Scopes**: The server uses `gmail.readonly` and `gmail.compose` scopes (compose is for future features)
- **Token refresh**: Access tokens are automatically refreshed when expired
- **Refresh token persistence**: Refresh tokens are stored in `.env.local` and last indefinitely until revoked
- **File permissions**: The setup script automatically sets `.env.local` to 600 (owner read/write only)

## Troubleshooting

### "Invalid credentials" error
- Re-run `pnpm setup:gmail` to regenerate tokens
- Ensure `.env.local` contains all required variables

### "Token expired" error
- The OAuth2 client automatically refreshes expired tokens
- If refresh fails, re-run the setup process

### No emails returned
- Check that you have unread emails in your inbox
- Verify the Gmail API is enabled in Google Cloud Console
- Check for quota limits in Google Cloud Console

## Development

### Project Structure

```
foundation-project-mcp/
├── server/
│   ├── emailServer.ts      # Main MCP server
│   └── generateTokens.ts   # OAuth token generation
├── .env.local              # Environment variables (git-ignored)
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

### Adding New Features

The server currently supports read-only operations. The `gmail.compose` scope is already configured for future expansion. To add draft creation or email sending:

1. OAuth scope is already configured with `gmail.compose` in `generateTokens.ts`
2. If you've already run setup, your tokens should have compose permissions
3. Implement new tool handlers in `emailServer.ts`
4. Register new tools using `server.registerTool()`

To add additional Gmail API scopes:
1. Update the `SCOPES` array in `generateTokens.ts`
2. Re-run `pnpm setup:gmail` to get new tokens with updated permissions

## License

MIT

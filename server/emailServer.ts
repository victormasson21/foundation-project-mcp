import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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
    console.log("New refresh token:", tokens.refresh_token);
  }
  console.log("New access token:", tokens.access_token);
});

// Create Gmail API client
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

// Example: List messages
async function listMessages() {
  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      q: "is:unread",
    });

    console.log("Messages:", response.data.messages);
    return response.data.messages;
  } catch (error) {
    console.error("Error listing messages:", error);
    throw error;
  }
}

/**

get_unread_emails tool {
  return 
    sender
    subject
    body/snippet
    email/thread ID
}

analyse content and assess nees for a reply
list emails that require one
prompt user asking "should i draft reply for these?"

create_draft_reply tool {
  accepts the original email/thread ID and reply body
  create a correctly threaded draft
}

*/

async function getMessageDetails(messageId: string) {
  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "metadata",
      metadataHeaders: ["From", "Subject"],
    });

    console.log(response.data);

    const headers = response.data.payload?.headers || [];
    const from = headers.find((h) => h.name === "From")?.value;
    const subject = headers.find((h) => h.name === "Subject")?.value;
    const snippet = response.data.snippet;
    const threadId = response.data.threadId;

    return {
      sender: from,
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

async function listMessagesDetails() {
  try {
    const messages = await listMessages();

    if (!messages || messages.length === 0) {
      console.log("No messages found.");
      return [];
    }

    const messagesWithDetails = await Promise.all(
      messages.map((msg) => getMessageDetails(msg.id!))
    );

    console.dir(messagesWithDetails);
    return messagesWithDetails;
  } catch (error) {
    console.error("Error listing messages with senders:", error);
    throw error;
  }
}

listMessagesDetails();

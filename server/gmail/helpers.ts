import { gmail } from "./server.js";

// Helper function to sanitise email headers and prevent header injection
export function sanitise(str: string): string {
  return str.replace(/[\r\n]/g, '');
}

export async function getMessageDetails(messageId: string) {
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

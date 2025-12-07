import { z } from "zod";
import { gmail } from "../gmail/server.js";
import { sanitise } from "../gmail/helpers.js";

export const createDraftReplyTool = {
  name: "create_draft_reply",
  config: {
    description: "Create draft reply to an email in thread",
    inputSchema: {
      messageId: z
        .string()
        .describe("The messageId of the original email"),
      threadId: z
        .string()
        .describe("The threadId of the original email"),
      sender: z
        .string()
        .describe("The sender of the original email"),
      subject: z
        .string()
        .describe("The subject of the original email"),
      replyBody: z.string().describe("The draft reply"),
    },
  },
  handler: async ({
    messageId,
    threadId,
    sender,
    subject,
    replyBody,
  }: {
    messageId: string;
    threadId: string;
    sender: string;
    subject: string;
    replyBody: string;
  }) => {
    try {
      const message = [
        `To: ${sanitise(sender)}`,
        `Subject: ${sanitise(subject)}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        replyBody,
      ].join("\n");

      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            threadId,
            raw: encodedMessage,
          },
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              message: "Draft successfully created",
              draft: response.data,
            }),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: "Failed to create draft reply",
              details: errorMessage,
              context: { messageId, threadId },
            }),
          },
        ],
        isError: true,
      };
    }
  },
};

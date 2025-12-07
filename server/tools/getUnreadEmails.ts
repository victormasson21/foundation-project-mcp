import { z } from "zod";
import { gmail } from "../gmail/server.js";
import { getMessageDetails } from "../gmail/helpers.js";

export const getUnreadEmailsTool = {
  name: "get_unread_emails",
  config: {
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
  handler: async ({ maxResults }: { maxResults?: number }) => {
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
              type: "text" as const,
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
            type: "text" as const,
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
            type: "text" as const,
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
  },
};

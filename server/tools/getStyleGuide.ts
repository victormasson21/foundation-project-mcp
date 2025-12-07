import { getPageContent } from "../notion/helpers.js";

export const getStyleGuideTool = {
  name: "get_style_guide",
  config: {
    description: "Retrieves the email writing style guide from Notion",
    inputSchema: {},
  },
  handler: async () => {
    try {
      const pageId = process.env.NOTION_STYLE_GUIDE_PAGE_ID;

      if (!pageId) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "Style guide not configured",
                  details:
                    "NOTION_STYLE_GUIDE_PAGE_ID environment variable is not set",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      const styleGuideContent = await getPageContent(pageId);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                styleGuide: styleGuideContent,
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
                error: "Failed to retrieve style guide",
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

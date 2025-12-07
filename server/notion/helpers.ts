import { notion } from "./client.js";
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.js";

type Block = BlockObjectResponse | PartialBlockObjectResponse;

/**
 * Fetches a Notion page and converts its content to formatted text
 */
export async function getPageContent(pageId: string): Promise<string> {
  const blocks = await notion.blocks.children.list({
    block_id: pageId,
  });

  let content = "";

  for (const block of blocks.results) {
    content += await blockToText(block);
  }

  return content.trim();
}

/**
 * Converts a Notion block to plain text with basic formatting
 */
async function blockToText(block: Block): Promise<string> {
  if (!("type" in block)) return "";

  const type = block.type;
  let richText: any[] = [];

  // Extract rich_text based on block type
  switch (type) {
    case "paragraph":
      richText = block.paragraph.rich_text;
      break;
    case "heading_1":
      richText = block.heading_1.rich_text;
      break;
    case "heading_2":
      richText = block.heading_2.rich_text;
      break;
    case "heading_3":
      richText = block.heading_3.rich_text;
      break;
    case "bulleted_list_item":
      richText = block.bulleted_list_item.rich_text;
      break;
    case "numbered_list_item":
      richText = block.numbered_list_item.rich_text;
      break;
    case "to_do":
      richText = block.to_do.rich_text;
      break;
    case "toggle":
      richText = block.toggle.rich_text;
      break;
    case "quote":
      richText = block.quote.rich_text;
      break;
    case "callout":
      richText = block.callout.rich_text;
      break;
    default:
      return "";
  }

  const plain = richTextToPlain(richText);

  // Apply formatting
  const formats: Record<string, (s: string) => string> = {
    heading_1: (s) => `# ${s}\n\n`,
    heading_2: (s) => `## ${s}\n\n`,
    heading_3: (s) => `### ${s}\n\n`,
    bulleted_list_item: (s) => `- ${s}\n`,
    numbered_list_item: (s) => `1. ${s}\n`,
    quote: (s) => `> ${s}\n\n`,
  };

  return formats[type] ? formats[type](plain) : plain + "\n\n";
}

/**
 * Converts Notion rich text array to plain text string
 */
function richTextToPlain(
  richText: Array<{
    plain_text: string;
  }>
): string {
  return richText.map((text) => text.plain_text).join("");
}

import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "..", "..", ".env.local");
dotenv.config({ path: envPath });

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

import { google } from "googleapis";
import * as http from "http";
import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || "http://localhost:3000/oauth2callback";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error("Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env.local");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI);

async function generateTokens() {
  return new Promise<void>((resolve, reject) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    console.log(`Open this URL in your browser to generate auth tokens:\n\n${authUrl}\n\nStarting local server on port 3000...`);

    const server = http.createServer(async (req, res) => {
      try {
        if (req.url?.startsWith("/oauth2callback")) {
          const queryParams = url.parse(req.url, true).query;
          const code = queryParams.code as string;

          if (!code) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end("<h1>Error: No authorization code received</h1>");
            reject(new Error("No authorization code received"));
            return;
          }

          console.log("✓ Authorization code received\n✓ Exchanging code for tokens...");

          const { tokens } = await oauth2Client.getToken(code);
          if (!tokens.access_token || !tokens.refresh_token) throw new Error("Failed to receive tokens");

          console.log("✓ Tokens received successfully!");

          await saveTokensToEnvFile(tokens.access_token, tokens.refresh_token);

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Auth complete. Return to the terminal.");

          server.close();
          resolve();
        }
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>Error during authorization</h1>");
        reject(error);
      }
    });

    server.listen(3000);
    server.on("error", reject);
  });
}

async function saveTokensToEnvFile(accessToken: string, refreshToken: string) {
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

  const updateOrAppend = (key: string, value: string) => {
    const line = `${key}="${value}"`;
    envContent = envContent.includes(`${key}=`)
      ? envContent.replace(new RegExp(`${key}=.*`), line)
      : envContent + `\n${line}`;
  };

  updateOrAppend("GMAIL_ACCESS_TOKEN", accessToken);
  updateOrAppend("GMAIL_REFRESH_TOKEN", refreshToken);

  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log("✓ Tokens saved to .env.local\n✓ Auth complete. You can now run your email server.");
}

generateTokens().catch((error) => {
  console.error("Failed to generate tokens:", error);
  process.exit(1);
});

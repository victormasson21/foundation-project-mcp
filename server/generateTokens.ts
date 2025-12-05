import { google } from "googleapis";
import * as http from "http";
import * as url from "url";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env;
const OAUTH_PORT = 3000;
const GMAIL_REDIRECT_URI =
  process.env.GMAIL_REDIRECT_URI || `http://localhost:${OAUTH_PORT}/oauth2callback`;

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
];

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.error(
    "Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in .env.local"
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

async function generateTokens() {
  return new Promise<void>((resolve, reject) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });

    console.log(
      `Open this URL in your browser to generate auth tokens:\n\n${authUrl}\n\nStarting local server on port ${OAUTH_PORT}...`
    );

    let callbackProcessed = false;

    const server = http.createServer(async (req, res) => {
      try {
        if (req.url?.startsWith("/oauth2callback")) {
          if (callbackProcessed) {
            res.writeHead(409, { "Content-Type": "text/plain" });
            res.end("Callback already processed");
            return;
          }
          callbackProcessed = true;

          const queryParams = url.parse(req.url, true).query;
          const code = queryParams.code as string;

          if (!code) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end("<h1>Error: No authorization code received</h1>");
            server.close();
            reject(new Error("No authorization code received"));
            return;
          }

          console.log(
            "✓ Authorization code received\n✓ Exchanging code for tokens..."
          );

          const { tokens } = await oauth2Client.getToken(code);
          if (!tokens?.access_token || !tokens?.refresh_token) {
            throw new Error("Failed to receive valid tokens from Google API");
          }

          console.log("✓ Tokens received successfully!");

          await saveTokensToEnvFile(tokens.access_token, tokens.refresh_token);

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Auth complete. Return to the terminal.");

          clearTimeout(timeout);
          server.close();
          resolve();
        } else {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found - waiting for OAuth callback");
        }
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>Error during authorization</h1>");
        clearTimeout(timeout);
        server.close();
        reject(error);
      }
    });

    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("OAuth timeout: No authorization received within 5 minutes"));
    }, 5 * 60 * 1000);

    server.listen(OAUTH_PORT);
    server.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function saveTokensToEnvFile(accessToken: string, refreshToken: string) {
  const envPath = path.join(process.cwd(), ".env.local");
  let envContent = "";
  try {
    envContent = fs.readFileSync(envPath, "utf-8");
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }

  const updateEnvVar = (key: string, value: string) => {
    const line = `${key}=${value}`;
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (envContent.includes(`${key}=`)) {
      envContent = envContent.replace(new RegExp(`${escapedKey}=.*`), line);
    } else {
      envContent = envContent ? `${envContent}\n${line}` : line;
    }
  };

  updateEnvVar("GMAIL_ACCESS_TOKEN", accessToken);
  updateEnvVar("GMAIL_REFRESH_TOKEN", refreshToken);

  const finalContent = envContent.trim();
  fs.writeFileSync(envPath, finalContent ? `${finalContent}\n` : "");
  fs.chmodSync(envPath, 0o600);
  console.log(
    "✓ Tokens saved to .env.local\n✓ Auth complete. You can now run your email server."
  );
}

generateTokens().catch((error) => {
  console.error("Failed to generate tokens:", error);
  process.exit(1);
});

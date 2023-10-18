import { OAuth2Client } from "google-auth-library";
const { senderEmail, senderName, pass, client_id, client_secret } = process.env;
async function main() {
  const oAuth2Client = new OAuth2Client(
    client_id,
    client_secret,
    "http://localhost:3000" // Your redirect URL
  );

  // Generate a URL and visit it to start the OAuth2 process
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });
  console.log(`Visit this URL: ${authUrl}`);

  // After user returns to the app, you'll get a code as a query parameter
  // You can directly hardcode it here for simplicity
  const code = "ENTER CODE";

  // Now we can get the tokens
  const { tokens } = await oAuth2Client.getToken(code);
  console.log("Here are your tokens: ", tokens);
}

main().catch(console.error);

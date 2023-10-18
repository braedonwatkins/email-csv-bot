import express from "express";
const app = express();
const port = 3000;
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const { senderEmail, senderName, pass, client_id, client_secret } = process.env;

console.log(client_id, client_secret);
app.get("/", async (req, res) => {
  console.log("hello, world");
  const authCode = req.query.code;
  console.log(`Received auth code: ${authCode}`);
  await getTokens(authCode);
  res.send("Received the code!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function getTokens(authCode) {
  const params = new URLSearchParams();
  params.append("client_id", client_id);
  params.append("client_secret", client_secret);
  params.append("redirect_uri", "http://localhost:3000");
  params.append("code", authCode);
  params.append("grant_type", "authorization_code");

  try {
    const res = await axios.post(
      "https://oauth2.googleapis.com/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const { access_token, refresh_token } = res.data;
    console.log(`Access Token: ${access_token}`);
    console.log(`Refresh Token: ${refresh_token}`);
    return { access_token, refresh_token };
  } catch (error) {
    console.error(`Failed to get tokens: ${error}`);
    console.error(
      `Failed to get tokens: ${error.response.data.error_description}`
    );
  }
}

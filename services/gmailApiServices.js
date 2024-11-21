require('dotenv').config(); // Load environment variables

const { google } = require("googleapis");
const authorize = require("../services/googleApiAuthService");

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }
  console.log("Labels:");
  labels.forEach((label) => {
    console.log(`${label.name}`);
  });

  return labels;
}

/**
 * Fetches and prints received messages.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listMessages(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,  // Adjust the number of messages you want
  });

  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    console.log("No messages found.");
    return;
  }

  console.log("Received Messages:");
  for (let message of messages) {
    const messageDetail = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    // Extracting email parts
    const parts = messageDetail.data.payload.parts || [];
    let emailBody = '';

    // Loop through each part and extract only text/plain content
    parts.forEach((part) => {
      if (part.mimeType === "text/plain" && part.body.data) {
        emailBody = Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    });

    // If no body is found, provide a default message
    if (!emailBody) {
      emailBody = "No readable body content found.";
    }

    // Formatting the message output nicely
    console.log("From: " + messageDetail.data.payload.headers.find(header => header.name === "From").value);
    console.log("Subject: " + messageDetail.data.payload.headers.find(header => header.name === "Subject").value);
    console.log("Date: " + messageDetail.data.payload.headers.find(header => header.name === "Date").value);
    console.log("Body:");
    console.log(emailBody);  // Display the plain text body content
    console.log("===========================================");
  }
}

/**
 * Sends an email.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} content The email content.
 */
async function sendEmail(auth, content) {
  const gmail = google.gmail({ version: "v1", auth });
  const encodedMessage = Buffer.from(content)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
  console.log(res.data);
  return res.data;
}

module.exports = {
  listLabels,  // Expose listLabels
  listMessages,  // Expose listMessages
  sendEmail,  // Expose sendEmail if needed
};

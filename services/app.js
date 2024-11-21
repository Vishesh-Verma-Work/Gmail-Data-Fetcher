require('dotenv').config(); // Load environment variables
const authorize = require('../services/googleApiAuthService'); // Correct relative path
const { listMessages, sendEmail } = require('../services/gmailApiServices'); // Use the updated service

async function main() {
  // Use the authorize function to get OAuth2 client
  const authClient = await authorize();

  // Fetch and display the latest 10 emails
  await listMessages(authClient);

  // Example: If you want to send an email (optional)
  // await sendEmail(authClient, 'TO: example@gmail.com\nSubject: Test\n\nHello!');
}

main();

// config/brevoEmail.js
const axios = require('axios');

async function sendVerificationEmailBrevo(toEmail, verificationLink) {
  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL, // must be a verified sender
    },
    to: [{ email: toEmail }],
    subject: 'Email Verification - Atherton Shop',
    htmlContent: `
      <html>
        <body>
          <p>Welcome to Atherton shop :)</p>
          <p>
            Click <a href="${verificationLink}">here</a> to verify your email.
          </p>
        </body>
      </html>
    `,
  };

  const response = await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    payload,
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    }
  );

  return response.data;
}

module.exports = { sendVerificationEmailBrevo };

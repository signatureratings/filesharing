if (process.env.USERNAME == "balus") {
  require("dotenv").config({ path: "../.env" });
}
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendmail(sendermail, recieveremail, sub, html) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        type: "oAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const options = {
      from: `<${sendermail}>`,
      to: recieveremail,
      subject: sub || "Download link for the file",
      text: `${sendermail} shared a file with you`,
      html: html || "<h1>Hello from Sairambalu</h1>",
    };

    const result = await transport.sendMail(options);
    return result;
  } catch (err) {
    return err;
  }
}

module.exports = sendmail;

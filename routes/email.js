const app = require("express");
const emailrouter = app.Router();
const sendmail = require("../config/mailServices");
const File = require("../models/file");

emailrouter.post("/send", async (req, res) => {
  console.log("email is called");
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if (!uuid || !emailTo || !emailFrom) {
    return res
      .status(422)
      .send({ error: "All fields are required except expiry." });
  }
  // Get data from db
  try {
    let file = await File.findOne({ uuid: uuid });
    if (!file) {
      return res.status(400).json({ error: "Error in email sending." });
    }
    if (Date.now() - file.createdAt < 1000 * 60 * 60 * 24) {
      await sendmail({
        sendermail: emailFrom,
        receiveremail: emailTo,
        sub: "file download",
        html: require("../config/emailTemplate")({
          emailFrom,
          downloadLink: `${process.env.DOMAIN}/api/file/download/${file.uuid}?source=email`,
          size: parseInt(file.size / 1000) + " KB",
          expires: "24 hours",
        }),
      })
        .then((data) => {
          console.log(data);
          return res.json({ success: true });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: "Error in email sending." });
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Something went wrong." });
  }
});

module.exports = emailrouter;

const app = require("express");
const downloadrouter = app.Router();
const File = require("../models/file");
const fs = require("fs");

downloadrouter.get("/download/:uuid", async (req, res) => {
  try {
    let file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.render("download", { error: "Link has been expired. 🤷‍♂️" });
    }
    if (Date.now() - file.createdAt < 1000 * 60 * 60 * 24) {
      let downloads = file.downloads;
      file.downloads = downloads + 1;
      await file.save();
      console.log(file.createdAt, Date.now());
      let filepath = `${__dirname}/../${file.path}`;
      fs.access(filepath, fs.F_OK, (err) => {
        if (err) {
          console.log("File is not available");
          return res.render("download", { error: "File is missing 🥺" });
        }
      });
      return res.download(filepath);
    } else {
      return res.render("download", { error: "Link has been expired. 🤷‍♂️" });
    }
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ message: "Error occured while getting the data. 😴" });
  }
});

downloadrouter.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    // Link expired
    if (!file) {
      return res.render("download", { error: "Link has been expired." });
    }
    return res.render("download", {
      uuid: file.uuid,
      fileName: file.filename,
      fileSize: file.size,
      downloadLink: `${process.env.DOMAIN}/api/file/download/${file.uuid}`,
    });
  } catch (err) {
    return res.render("download", { error: "Something went wrong." });
  }
});

module.exports = downloadrouter;

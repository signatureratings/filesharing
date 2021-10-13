const app = require("express");
const uploadrouter = app.Router();
const path = require("path");
const File = require("../models/file");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 * 50 },
}).single("Files");

uploadrouter.post("/", async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
      createdAt: Date.now(),
    });
    try {
      const response = await file.save();
      return res.status(200).json({
        file: `${process.env.DOMAIN}/api/file/${response.uuid}`,
        message: "File is successfully installed",
      });
    } catch (err) {
      return res.status(501).json({ message: err.message });
    }
  });
});

module.exports = uploadrouter;

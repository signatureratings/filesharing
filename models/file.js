const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
  filename: { type: "String", required: true },
  path: { type: "String", required: true },
  size: { type: "Number", required: true },
  uuid: { type: "String", required: true, unique: true },
  createdAt: { type: "Number", required: true },
  downloads: { type: "Number", default: 0 },
});

module.exports = mongoose.model("File", fileSchema);

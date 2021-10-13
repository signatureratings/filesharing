const File = require("../models/file");
const fs = require("fs");

async function fetchAndDelete() {
  let files = await File.find({
    createdAt: { $lt: Date.now() - 24 * 60 * 60 * 1000 },
  });
  if (files.length) {
    for (let file in files) {
      try {
        fs.unlinkSync(file.path);
        await file.remove();
        console.log("Successfully deleted the file: " + file.path);
      } catch (err) {
        console.log("Error while deleting the files");
      }
    }
  }
  console.log("Job done...");
}

fetchAndDelete().then(process.exit);

require("dotenv").config();
const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(process.env.MONGODB_CONNECT_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", (error) => console.error("small error occured", error));
  db.once("open", () => console.log("Connected to Mongoose"));
}

module.exports = connectDB;

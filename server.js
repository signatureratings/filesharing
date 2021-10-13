require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const Origin = process.env.DOMAIN || `http://localhost:${port}`;
const connectDB = require("./database");

//database connection
connectDB();

//middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(
  cors({
    origin: Origin,
    methods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
  })
);

//routes
app.use("/api/upload", require("./routes/upload"));
app.use("/api/file", require("./routes/download"));
app.use("/api/email", require("./routes/email"));

//listen
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

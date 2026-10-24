require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("Missing MONGO_URI or JWT_SECRET environment variable");
  process.exit(1);
}
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/trainings", require("./routes/trainings"));

// In production the built React app is served by this same server
const dist = path.join(__dirname, "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res, next) => (req.path.startsWith("/api") ? next() : res.sendFile(path.join(dist, "index.html"))));
}

app.use(notFound);
app.use(errorHandler);

connectDB().then(() =>
  app.listen(process.env.PORT || 5000, () => console.log(`API running on port ${process.env.PORT || 5000}`))
);

const express = require("express");
const app = express();
const request_router = require("./API/routes/request.js");
const file_router = require("./API/routes/files.js");
const cors = require("cors");
const morgan = require("morgan");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1", request_router, file_router);
app.get("/", (req, res) => {
  res.status(200).json({ host: process.env.HOST });
});
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ресурс не найден" });
});

app.use((err, req, res, next) => {
  console.error("Ошибка сервера:", err.message);
  res.status(500).json({ success: false, message: "Ошибка сервера" });
});
module.exports = app;

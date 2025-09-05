const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const router = Router();

const storagePath = path.join(__dirname, "..", "..", "storage");

router.get("/file", (req, res) => {
  const fileName = req.query.id;
  if (!fileName) {
    return res
      .status(400)
      .json({ success: false, message: "Имя файла не указано." });
  }

  const filePath = path.join(storagePath, fileName);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res
        .status(404)
        .json({ success: false, message: "Файл не найден." });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Ошибка при загрузке файла:", err);
        res
          .status(500)
          .json({ success: false, message: "Ошибка при скачивании файла." });
      }
    });
  });
});

module.exports = router;

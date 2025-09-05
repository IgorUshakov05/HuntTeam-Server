const { Router } = require("express");
const path = require("path");
const router = Router();
router.get("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Некорректный ID" });
    }

    return res
      .status(200)
      .sendFile(path.join(__dirname, "../", "../", "storage", id));
  } catch (error) {
    console.error(`Ошибка при получении кейса с ID ${id}:`, error.message);
    return res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

module.exports = router;

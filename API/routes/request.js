const { Router } = require("express");
const {
  create_application,
  add_chats_id,
} = require("../../database/Request/Application");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const storagePath = path.join(__dirname, "../../storage");
const router = Router();

// Конфигурация multer
const upload = multer({
  dest: storagePath,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
      "application/pdf",
      "application/x-cdr",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Недопустимый формат файла."));
    }
  },
});

const bot = require("../../bot/bot");
const sendApplication = require("../../bot/handlers/sendApplication");

router.post(
  "/request",
  upload.single("file"),
  [
    body("client_name")
      .exists({ checkFalsy: true })
      .withMessage("Имя клиента обязательно.")
      .isString()
      .withMessage("Имя должно быть строкой.")
      .isLength({ max: 100 })
      .withMessage("Имя не должно превышать 100 символов."),
    body("link")
      .exists({ checkFalsy: true })
      .withMessage("Ссылка на связь обязательна")
      .isLength({ max: 100, min: 5 })
      .withMessage("Ссылка не > 100 и не < 5"),
    body("message")
      .optional()
      .isString()
      .withMessage("Сообщение должно быть строкой.")
      .isLength({ max: 1000 })
      .withMessage("Сообщение не должно превышать 1000 символов."),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(path.join(storagePath, req.file.filename), () => {});
      }

      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => err.msg),
      });
    }

    try {
      const { client_name, message, link } = req.body;
      console.log(link)
      let savedFilename = null;

      if (req.file) {
        const fileExt = path.extname(req.file.originalname);
        const newFileName = `${uuidv4()}${fileExt}`;
        const newPath = path.join(storagePath, newFileName);

        fs.renameSync(req.file.path, newPath);

        savedFilename = newFileName;
      }

      const newRequest = await create_application({
        client_name,
        link,
        message,
        file: savedFilename,
      });
      if (!newRequest.success)
        return res
          .json(500)
          .json({ success: false, error: "Ошибка сервера" });
      let telegram = await sendApplication(bot, {
        id: newRequest.id,
        client_name,
        link: newRequest.link,
        message,
        file: savedFilename,
      });
      console.log(telegram);
      await add_chats_id(newRequest.id, telegram.messageIDs);
      return res.status(201).json(newRequest);
    } catch (error) {
      console.error(error);

      if (req.file) {
        fs.unlink(path.join(storagePath, req.file.filename), () => {});
      }

      res.status(500).json({ success: false, message: "Ошибка сервера!" });
    }
  }
);

module.exports = router;

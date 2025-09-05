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
      .isLength({ max: 20 })
      .withMessage("Имя не должно превышать 20 символов."),

    body("phone")
      .exists({ checkFalsy: true })
      .withMessage("Телефон обязателен.")
      .isString()
      .withMessage("Телефон должен быть строкой.")
      .isLength({ max: 18 })
      .withMessage("Телефон не должен превышать 18 символов.")
      .matches(/^\+?[0-9\s\-()]+$/)
      .withMessage("Некорректный формат номера телефона."),

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
      const { client_name, phone, message } = req.body;

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
        phone,
        message,
        file: savedFilename,
      });
      if (!newRequest.success)
        return res
          .json(500)
          .json({ success: false, errors: ["Ошибка сервера"] });
      let telegram = await sendApplication(bot, {
        id: newRequest.id,
        client_name,
        phone,
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

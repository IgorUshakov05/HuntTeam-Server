require("dotenv").config();
const mongoose = require("mongoose");
const appServer = require("./server");
const bot = require("./bot/bot.js");
const startApp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB подключен: ${process.env.MONGO_URI}`);
    console.log("👉 Запускаем Telegram-бот и HTTP-сервер...");

    await appServer.listen(process.env.PORT, () => {
      console.log(`🚀 Сервер запущен на порту: ${process.env.PORT}`);
    });

    await bot.launch();
    await console.log("🤖 Telegram-бот запущен!");

    process.once("SIGINT", () => {
      console.log("🛑 SIGINT получен. Завершаем работу...");
      bot.stop("SIGINT");
    });
    process.once("SIGTERM", () => {
      console.log("🛑 SIGTERM получен. Завершаем работу...");
      bot.stop("SIGTERM");
    });
  } catch (err) {
    console.error("❌ Ошибка при запуске приложения:", err);
    process.exit(1);
  }
};

startApp();

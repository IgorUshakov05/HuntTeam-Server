const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function downloadFile(fileId) {
  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

    const fileInfoRes = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile`,
      {
        params: { file_id: fileId },
      }
    );

    const filePath = fileInfoRes.data.result?.file_path;
    if (!filePath) throw new Error("file_path не найден в ответе Telegram");

    const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
    const filename = path.basename(filePath);
    const saveDir = path.resolve(__dirname, "../../../storage");
    const savePath = path.join(saveDir, `${fileId}_${filename}`);

    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    const response = await axios({
      method: "GET",
      url: downloadUrl,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log(`✅ Файл сохранён: ${fileId}_${filename}`);
    return `${fileId}_${filename}`;
  } catch (error) {
    console.error(`❌ Ошибка при загрузке файла: ${error.message}`);
    throw error;
  }
}

module.exports = { downloadFile };

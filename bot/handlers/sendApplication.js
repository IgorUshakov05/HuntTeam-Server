const { get_chat_id_director } = require("../../database/Request/Director");
const { get_menagers } = require("../../database/Request/User");

module.exports = async (bot, data) => {
  console.log(data)
  try {
    if (!data.client_name || !data.link) {
      throw new Error("Missing required fields: client_name or link");
    }

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL is not defined in environment variables");
    }

    const messageIDs = [];

    const escapeHtml = (str) =>
      str
        ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")
        : "";

    const fileUrl = data.file
      ? `<a href="${process.env.BASE_URL}/api/v1/file?id=${data.file}">${process.env.BASE_URL}/api/v1/file?id=${data.file}</a>`
      : "Отсутствует";

    let message = `
📌 Новый заказ

👤 Имя: ${escapeHtml(data.client_name)}
📞 Телефон: <code>${escapeHtml(data.phone)}</code>
✉️ Сообщение: 
<code>${data.message ? escapeHtml(data.message) : "Отсутствует"}</code>
📎 Файл: ${fileUrl}`;

    const managers = await get_menagers();

    const sendMessageWithDelay = (user, delay) =>
      new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const sentMessage = await bot.telegram.sendMessage(
              user.chat_id,
              message,
              {
                parse_mode: "HTML",
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "В работу!",
                        callback_data: `take_to_work_${data.id}`,
                      },
                    ],
                  ],
                },
              }
            );
            messageIDs.push({
              chat_id: user.chat_id,
              message_id: sentMessage.message_id,
            });
            resolve();
          } catch (err) {
            console.error(`Ошибка отправки сообщения ${user.chat_id}:`, err);
            resolve();
          }
        }, delay);
      });

    await Promise.all(
      managers.map((user, index) => sendMessageWithDelay(user, index * 1000))
    );
    return {
      success: true,
      messageIDs,
    };
  } catch (e) {
    let chatIDdirector = await get_chat_id_director()
    console.log(chatIDdirector)
    await bot.telegram.sendMessage(
      chatIDdirector.chat_id,
      `❌ Ошибка:\n\`\`\`js\n${e.message}\n\`\`\``,
      { parse_mode: "MarkdownV2" }
    );
    return { success: false, message: "Ошибка при отправке" };
  }
};

const {
  get_application_on_id,
} = require("../../../../database/Request/Application");
const { find_user } = require("../../../../database/Request/User");
module.exports = async function toWork(ctx) {
  try {
    const callbackData = ctx.callbackQuery.data;
    const user = ctx.from;
    const chatId = ctx.callbackQuery.message.chat.id;
    let manager = await find_user(chatId);
    const applicationId = callbackData.split("_")[3];
    let app = await get_application_on_id(applicationId);
    if (!app.success) return ctx.reply("Заявка не найдена!");
    if (!app.application.client_name || !app.application.phone) {
      throw new Error("Missing required fields: client_name or phone");
    }

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL is not defined in environment variables");
    }

    const escapeHtml = (str) =>
      str
        ? str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")
        : "";
    const fileUrl = app.application.file
      ? `<a href="${process.env.BASE_URL}/api/v1/file?id=${app.application.file}">${process.env.BASE_URL}/api/v1/file?id=${app.application.file}</a>`
      : "Отсутствует";

    const updatedMessage = `
✅ Заявка взята в работу
👷 Менеджер: ${escapeHtml(manager.user.fullname)}

👤 Имя: ${escapeHtml(app.application.client_name)}
📞 Телефон: <code>${escapeHtml(app.application.phone)}</code>
✉️ Сообщение: 
${
  app.application.message
    ? `<code>
${escapeHtml(app.application.message)}
</code>`
    : "Отсутствует"
}
📎 Файл: ${fileUrl}
`;

    const sendMessageWithDelay = (chatInfo, delay) =>
      new Promise((resolve) => {
        setTimeout(async () => {
          try {
            await ctx.telegram.editMessageText(
              chatInfo.chat_id,
              chatInfo.message_id,
              0,
              updatedMessage,

              {
                parse_mode: "HTML",
              }
            );
            resolve();
          } catch (err) {
            console.error(`Ошибка отправки сообщения ${user.chat_id}:`, err);
            resolve();
          }
        }, delay);
      });
    await ctx.answerCbQuery();
    await Promise.all(
      app.application.messageIDs.map((chatInfo, index) =>
        sendMessageWithDelay(chatInfo, index * 1000)
      )
    );
    return { success: true };
  } catch (e) {
    const errorMessage = e.message.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
    await ctx.reply(`Отправьте ошибку:\n\`\`\`js\n${errorMessage}\n\`\`\``, {
      parse_mode: "MarkdownV2",
    });
    console.log(e);
  }
};

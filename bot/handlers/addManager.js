const { create_manager_code } = require("../../database/Request/Code");

module.exports = (bot) => {
  bot.hears("➕ Добавить менеджера", async (ctx) => {
    try {
      if (ctx.from.username !== process.env.DIRECTOR) {
        await ctx.reply(
          "🚫 У вас недостаточно прав для выполнения этого действия. Нажмите /start"
        );
        return ctx.scene.leave();
      }
      const new_code = await create_manager_code("manager");

      if (!new_code.success) {
        throw new Error(new_code.message);
      }
      const payload = Buffer.from(
        `code=${new_code.code}&role=manager`
      ).toString("base64");

      return await ctx.reply(
        `🔐 *Ссылка для регистрации менеджера*\n\n` +
          `📩 *Перешлите это сообщение тому, кого хотите назначить менеджером.*\n\n` +
          `📌 *Инструкция для менеджера:*\n` +
          `1️⃣ Перейдите по [ссылке](https://t.me/${process.env.BOT_TITLE}?start=${payload}).\n` +
          `2️⃣ Следуйте инструкциям бота и завершите регистрацию.\n\n` +
          ``,
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      const errorMessage = e.message.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");

      await ctx.reply(`Отправьте ошибку:\n\`\`\`js\n${errorMessage}\n\`\`\``, {
        parse_mode: "MarkdownV2",
      });
    }
  });
};

const inWork = require("./events/inWork");
const remove = require("./events/removeEmploye");

module.exports = (bot) => {
  bot.on("callback_query", async (ctx) => {
    try {
      const callbackData = ctx.callbackQuery.data;
      if (callbackData.startsWith("take_to_work_")) {
        await inWork(ctx);
      }
      if (callbackData.startsWith("delete_user_")) {
        await remove(ctx);
      }
    } catch (e) {
      console.log(e);
      const errorMessage = e.message.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
      await ctx.reply(`Отправьте ошибку:\n\`\`\`js\n${errorMessage}\n\`\`\``, {
        parse_mode: "MarkdownV2",
      });

      ctx.session.step = null;
      ctx.session.code = null;
      ctx.session.role = null;
    }
  });
};

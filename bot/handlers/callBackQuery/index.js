const { get_chat_id_director } = require("../../../database/Request/Director");
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
      let chatIDdirector = await get_chat_id_director();
      console.log(chatIDdirector);
      await bot.telegram.sendMessage(
        chatIDdirector.chat_id,
        `❌ Ошибка:\n\`\`\`js\n${e.message}\n\`\`\``,
        { parse_mode: "MarkdownV2" }
      );
      await ctx.reply(`Отправьте! Подождите с вами свяжутся`);

      ctx.session.step = null;
      ctx.session.code = null;
      ctx.session.role = null;
    }
  });
};

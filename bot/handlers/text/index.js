const { setFullName } = require("./session/getFullName");

module.exports = (bot) => {
  bot.on("text", async (ctx) => {
    try {
      if (ctx.session.step === "waiting_fullname") {
        await setFullName(ctx);
      }
    } catch (e) {
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

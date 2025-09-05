const { Markup } = require("telegraf");
const { create_user } = require("../../../../database/Request/User");
const {
  get_chat_id_director,
} = require("../../../../database/Request/Director");

async function setFullName(ctx) {
  const { code, role } = ctx.session;
  const userId = ctx.from.username;

  const fullName = ctx.message.text;
  const chatId = ctx.chat.id;
  if (userId === process.env.DIRECTOR) {
    return ctx.reply("Доступно только менеджерам и админам");
  }
  const newUser = await create_user(role, fullName, code, chatId);
  if (!newUser.success)
    return await ctx.reply(`\`\`\`Ошибка\n${newUser.message}\n\`\`\``, {
      parse_mode: "MarkdownV2",
    });

  if (role === "admin") {
    await ctx.reply(
      `✅ Вы успешно зарегистрированы как ${role}. Добро пожаловать, ${fullName}!`,
      Markup.keyboard([["➕ Добавить кейс"], ["➖ Удалить кейс"]])
        .resize()
        .oneTime(),
      { parse_mode: "Markdown" }
    );
  } else {
    await ctx.reply(
      `✅ Вы успешно зарегистрированы как *${role}*. Добро пожаловать, *${fullName}*!`,
      { parse_mode: "Markdown" }
    );
  }

  const directorChatID = await get_chat_id_director();
  if (!directorChatID.success)
    return await ctx.reply(`\`\`\`Ошибка\n${directorChatID.message}\n\`\`\``, {
      parse_mode: "MarkdownV2",
    });

  await notifyDirector(ctx, fullName, role, directorChatID.chat_id);

  ctx.session.step = null;
  ctx.session.code = null;
  ctx.session.role = null;
}
module.exports = { setFullName };

async function notifyDirector(ctx, fullName, role, directorChatId) {
  try {
    const username = ctx.from.username
      ? `[@${ctx.from.username}](https://t.me/${ctx.from.username})`
      : "не указан";

    const message =
      `👤 *Новый сотрудник зарегистрирован*\n\n` +
      `*ФИ:* ${fullName}\n` +
      `*Роль:* ${role}\n` +
      `*Username:* ${username}`;

    await ctx.telegram.sendMessage(directorChatId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.log(error);
    const errorMessage = error.message.replace(
      /[_*[\]()~`>#+=|{}.!-]/g,
      "\\$&"
    );
    await ctx.reply(`Отправьте ошибку:\n\`\`\`js\n${errorMessage}\n\`\`\``, {
      parse_mode: "MarkdownV2",
    });
  }
}

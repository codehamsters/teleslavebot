import { GROUP_ID } from "../config.js";

export function setupWelcome(bot) {
  bot.on("new_chat_members", async (ctx) => {
    const user = ctx.message.new_chat_members[0];

    const funkyGreetings = [
      `🌼 Welcome [${user.first_name}](tg://user?id=${user.id})! So glad you’re here in *TeensChat*. Come as you are, stay as long as you like 💬💖`,
    ];

    const msg =
      funkyGreetings[Math.floor(Math.random() * funkyGreetings.length)];

    ctx.replyWithMarkdown(msg);
  });
}

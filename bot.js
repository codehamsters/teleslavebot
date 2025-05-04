import { Telegraf } from "telegraf";
import { BOT_TOKEN } from "./config.js";
import { setupWelcome } from "./modules/welcome.js";
import { setupModeration } from "./modules/moderation.js";
import { setupRanking } from "./modules/ranking.js";
import { setupLogger } from "./modules/logger.js";
import { setupCommands } from "./modules/commands.js";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(`👋 Welcome to the bot! Use /help to see available commands.`);
});
bot.help((ctx) => {
  ctx.reply(
    `🆘 Available commands:\n\n` +
      `/rank - Check your rank\n` +
      `/leaderboard - View the leaderboard\n` +
      `/help - Show this help message`
  );
});
setupCommands(bot);
setupWelcome(bot);
setupModeration(bot);
setupRanking(bot);
setupLogger(bot);

bot.launch();

import { connectDB } from "../db/mongodb.js";

function getProgressBar(current, max, length = 20) {
  const progress = Math.floor((current / max) * length);
  return "▰".repeat(progress) + "▱".repeat(length - progress);
}

// XP level calculation helper
function getRequiredXpForLevel(level) {
  let requiredXP = 50;
  for (let i = 1; i < level; i++) {
    requiredXP = Math.floor(requiredXP * 1.5);
  }
  return requiredXP;
}

export function setupCommands(bot) {
  // /rank command
  bot.command("rank", async (ctx) => {
    if (ctx.chat.type !== "group" && ctx.chat.type !== "supergroup") {
      return ctx.reply("📛 Ranking only works in groups!");
    }

    const db = await connectDB();
    const users = db.collection("users");
    const userId = ctx.from.id.toString();

    const user = await users.findOne({ id: userId });

    if (!user) {
      return ctx.reply("You're not ranked yet!");
    }

    const xp = user.xp || 0;
    let level = 1;
    let xpRemaining = xp;
    let xpForNext = 50;

    while (xpRemaining >= xpForNext) {
      xpRemaining -= xpForNext;
      xpForNext = Math.floor(xpForNext * 1.5);
      level++;
    }

    const progressBar = getProgressBar(xpRemaining, xpForNext);

    const response = `
📊 *Your Rank Info*:
👤 User: [${ctx.from.first_name}](tg://user?id=${ctx.from.id})
⭐ Level: ${level}
⚡ XP: ${xpRemaining}/${xpForNext}
${progressBar}
    `;

    return ctx.replyWithMarkdown(response);
  });

  // /leaderboard command
  bot.command("leaderboard", async (ctx) => {
    if (ctx.chat.type !== "group" && ctx.chat.type !== "supergroup") {
      return ctx.reply("Sorry, the leaderboard only works in groups.");
    }

    const db = await connectDB();
    const users = db.collection("users");

    const topUsers = await users.find({}).sort({ xp: -1 }).limit(5).toArray();

    if (!topUsers.length) {
      return ctx.reply("No leaderboard yet!");
    }

    const top = topUsers
      .map((u, i) => `${i + 1}. ${u.name} – ${u.xp} XP (LVL ${u.level || "?"})`)
      .join("\n");

    ctx.reply(`🏆 Top Users:\n\n${top}`);
  });

  // /purge command
  bot.command("purge", async (ctx) => {
    try {
      if (ctx.chat.type !== "group" && ctx.chat.type !== "supergroup") {
        return ctx.reply("❌ This command only works in group chats.");
      }

      const admins = await ctx.getChatAdministrators();
      const isAdmin = admins.some((admin) => admin.user.id === ctx.from.id);
      if (!isAdmin) {
        return ctx.reply("🚫 You must be an admin to use this command.");
      }

      if (!ctx.message.reply_to_message) {
        return ctx.reply("⚠️ Reply to a message to start purging from.");
      }

      const fromId = ctx.message.reply_to_message.message_id;
      const toId = ctx.message.message_id;

      for (let id = fromId; id <= toId; id++) {
        try {
          await ctx.deleteMessage(id);
        } catch (e) {
          // Message might be too old or can't be deleted
        }
      }

      console.log(`Purged messages from ID ${fromId} to ${toId}`);
      ctx.reply(`🗑️ Purge complete.`);
    } catch (err) {
      console.error("❌ Error in purge command:", err);
    }
  });
}

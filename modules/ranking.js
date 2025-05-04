import { connectDB } from "../db/mongodb.js";

// Calculates how much XP is required for a given level
function getRequiredXpForLevel(level) {
  let requiredXP = 50;
  for (let i = 1; i < level; i++) {
    requiredXP = Math.floor(requiredXP * 1.5);
  }
  return requiredXP;
}

export function setupRanking(bot) {
  bot.on("message", async (ctx) => {
    if (ctx.chat.type === "private") return;

    const userId = ctx.from.id.toString();
    const name = ctx.from.first_name;

    const db = await connectDB();
    const users = db.collection("users");
    const stats = db.collection("stats");

    // Update total messages
    await stats.updateOne(
      { name: "totalMessages" },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    let user = await users.findOne({ id: userId });

    if (!user) {
      user = {
        id: userId,
        name,
        xp: 1,
        level: 1,
      };
      await users.insertOne(user);
      return;
    }

    user.xp += 1;

    let xpForNextLevel = getRequiredXpForLevel(user.level);
    let leveledUp = false;

    while (user.xp >= xpForNextLevel) {
      user.xp -= xpForNextLevel;
      user.level++;
      leveledUp = true;
      xpForNextLevel = getRequiredXpForLevel(user.level);
    }

    await users.updateOne({ id: userId }, { $set: user });

    if (leveledUp) {
      ctx.reply(
        `🎉 Congrats ${user.name}, you leveled up to LVL ${user.level}!`
      );
    }
  });
}

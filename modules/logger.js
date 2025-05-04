import cron from "node-cron";
import { connectDB } from "../db/mongodb.js";
import { GROUP_ID } from "../config.js";

export function setupLogger(bot) {
  cron.schedule("0 0 * * *", async () => {
    const db = await connectDB();
    const stats = db.collection("stats");

    const stat = await stats.findOne({ name: "totalMessages" });
    const total = stat?.count || 0;

    await bot.telegram.sendMessage(
      GROUP_ID,
      `📊 Daily Log: ${total} messages sent today!`
    );

    // Reset the message count
    await stats.updateOne(
      { name: "totalMessages" },
      { $set: { count: 0 } },
      { upsert: true }
    );
  });
}

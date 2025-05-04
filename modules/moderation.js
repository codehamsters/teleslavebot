export function setupModeration(bot) {
  bot.on("message", async (ctx, next) => {
    if (ctx.chat.type !== "private") {
      // Allow processing of private messages (no need for admin checks)
      const msg = ctx.message;
      const userId = ctx.from.id;

      // Fetch admins of the group
      const admins = await ctx.getChatAdministrators();

      // Check if the user is an admin
      const isAdmin = admins.some((admin) => admin.user.id === userId);

      // If user is an admin, skip moderation
      if (isAdmin) return next();

      const text = msg.text || "";
      const isSpam = text.length > 300;
      const hasLink = /https?:\/\/|t\.me\/|@/.test(text);
      const isNSFW = /(sex|porn|nude|xxx)/i.test(text);
      const media = msg.photo || msg.video || msg.document;

      // Apply moderation checks if user is not an admin
      if (isSpam || hasLink || isNSFW) {
        await ctx.deleteMessage();
        return ctx.reply(
          `🛑 Message from ${ctx.from.first_name} removed (spam/link/NSFW)`
        );
      }

      if (media && msg.caption && /(sex|porn|nude|xxx)/i.test(msg.caption)) {
        await ctx.deleteMessage();
        return ctx.reply(`📛 Media removed due to NSFW content`);
      }

      return next();
    }
  });
}

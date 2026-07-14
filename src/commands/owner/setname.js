/**
 * .setname — change the bot's display name (owner only).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'setname',
  aliases: ['setbotname'],
  category: 'owner',
  owner: true,
  description: 'Change the bot display name',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Pass the new name.`);
      return;
    }
    try {
      await ctx.sock.updateProfileName(text);
      await reply(ctx.sock, ctx, `${S.check} Profile name updated.`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};

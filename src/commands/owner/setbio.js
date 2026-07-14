/**
 * .setbio — change the bot's profile "About" status (owner only).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'setbio',
  aliases: ['setabout', 'setstatus'],
  category: 'owner',
  owner: true,
  description: 'Change the bot profile status',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Pass the new status text.`);
      return;
    }
    try {
      await ctx.sock.updateProfileStatus(text);
      await reply(ctx.sock, ctx, `${S.check} Profile status updated.`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};

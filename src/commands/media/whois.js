/**
 * .whois â€” fetch the profile picture of a user or group.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { sanitizeJid } = require('../../helpers/jid');

module.exports = {
  name: 'whois',
  aliases: ['profile', 'pp'],
  category: 'media',
  description: 'Show a user or group profile picture',
  execute: async (ctx) => {
    const target = sanitizeJid(ctx.args[0]) || (ctx.isGroup ? ctx.participant : ctx.from);
    if (!target) {
      await reply(ctx.sock, ctx, `${S.warn}  Pass a number or use in a group.`);
      return;
    }
    try {
      const url = await ctx.sock.profilePictureUrl(target, 'image').catch(() => null);
      if (!url) {
        await reply(ctx.sock, ctx, `${S.warn}  No profile picture or hidden by privacy.`);
        return;
      }
      await sendImage(ctx.sock, ctx.from, {
        image: { url },
        caption: `${S.brandLine}\n${S.sub}  Profile  ${S.arr}  ${target.split('@')[0]}\n${S.brandLine}`,
      }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



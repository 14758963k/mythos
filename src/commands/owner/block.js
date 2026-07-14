/**
 * .block â€” block a user.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { sanitizeJid } = require('../../helpers/jid');

module.exports = {
  name: 'block',
  aliases: ['blk'],
  category: 'owner',
  owner: true,
  description: 'Block a user',
  execute: async (ctx) => {
    const target = sanitizeJid(ctx.args[0] || (ctx.quoted?.key?.participant));
    if (!target) return reply(ctx.sock, ctx, `${S.warn}  Pass a number or quote a user.`);
    try {
      await ctx.sock.updateBlockStatus(target, 'block');
      await reply(ctx.sock, ctx, `${S.check} Blocked ${target.split('@')[0]}.`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



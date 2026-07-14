/**
 * .promote â€” promote a user to admin.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { sanitizeJid } = require('../../helpers/jid');

module.exports = {
  name: 'promote',
  aliases: ['admin', '^'],
  category: 'group',
  description: 'Promote a user to admin. Owner only.',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
    const target = sanitizeJid(ctx.args[0] || (ctx.quoted?.key?.participant));
    if (!target) return reply(ctx.sock, ctx, `${S.warn}  Pass a number or quote a user.`);
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'promote');
      await reply(ctx.sock, ctx, `${S.check} Promoted ${target.split('@')[0]}.`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Promote failed: ${e.message}`);
    }
  },
};



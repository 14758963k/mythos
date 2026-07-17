/**
 * .kick — remove a user (admin only).
 */

const { reply } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const { sanitizeJid } = require('../../helpers/jid');

module.exports = {
  name: 'kick',
  aliases: ['remove', '-'],
  category: 'group',
  description: 'Remove a user from the group. Admins only.',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
    const target = sanitizeJid(ctx.args[0] || (ctx.quoted?.key?.participant));
    if (!target) return reply(ctx.sock, ctx, `${S.warn} Pass a number or quote a user.`);
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');
      await reply(ctx.sock, ctx,
        `${header('Remove Member')}\n\n` +
        `${row('Status', `${S.check} Removed`)}\n` +
        `${row('User', `@${target.split('@')[0]}`)}\n\n` +
        `${footer()}`,
        { mentions: [target] }
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Remove failed: ${e.message}`);
    }
  },
};



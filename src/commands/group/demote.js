/**
 * .demote â€” demote an admin back to member.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { sanitizeJid } = require('../../helpers/jid');

module.exports = {
  name: 'demote',
  aliases: ['unadmin', 'v'],
  category: 'group',
  description: 'Demote an admin back to member. Owner only.',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
    const target = sanitizeJid(ctx.args[0] || (ctx.quoted?.key?.participant));
    if (!target) return reply(ctx.sock, ctx, `${S.warn}  Pass a number or quote a user.`);
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'demote');
      await reply(ctx.sock, ctx, `${S.check} Demoted ${target.split('@')[0]}.`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Demote failed: ${e.message}`);
    }
  },
};



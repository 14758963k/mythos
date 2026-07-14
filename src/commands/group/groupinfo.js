/**
 * .groupinfo â€” show group metadata.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'groupinfo',
  aliases: ['ginfo', 'gstat'],
  category: 'group',
  description: 'Show metadata for the current group',
  execute: async (ctx) => {
    if (!ctx.isGroup) {
      await reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
      return;
    }
    const meta = await ctx.sock.groupMetadata(ctx.from).catch(() => null);
    if (!meta) {
      await reply(ctx.sock, ctx, `${S.cross} Could not read metadata.`);
      return;
    }
    const admins = meta.participants.filter((p) => p.admin).length;
    const createdAt = meta.creation ? new Date(meta.creation * 1000).toISOString().slice(0, 10) : 'unknown';
    await reply(
      ctx.sock,
      ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Group Info\n${S.heavyBar}\n` +
        `  ${S.sqr} Name        ${S.arr}  ${meta.subject}\n` +
        `  ${S.sqr} ID          ${S.arr}  ${meta.id}\n` +
        `  ${S.sqr} Members     ${S.arr}  ${meta.participants.length}\n` +
        `  ${S.sqr} Admins      ${S.arr}  ${admins}\n` +
        `  ${S.sqr} Owner       ${S.arr}  ${meta.owner?.split('@')[0] || 'â€”'}\n` +
        `  ${S.sqr} Created     ${S.arr}  ${createdAt}\n` +
        `  ${S.sqr} Announce    ${S.arr}  ${meta.announce ? 'on' : 'off'}\n` +
        `  ${S.sqr} Locked      ${S.arr}  ${meta.restrict ? 'on' : 'off'}\n` +
        `  ${S.sqr} Ephemeral   ${S.arr}  ${meta.ephemeralDuration || 0}s\n${S.brandLine}`
    );
  },
};



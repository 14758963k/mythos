/**
 * .admins â€” list group admins.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'admins',
  aliases: ['admlist', 'staff'],
  category: 'group',
  description: 'List the admins of the current group',
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
    const admins = meta.participants.filter((p) => p.admin);
    const body = admins.length
      ? admins.map((p, i) => `  ${i + 1}. @${p.id.split('@')[0]}  ${S.arr}  ${p.admin}`).join('\n')
      : `  ${S.warn} No admins.`;
    await ctx.sock.sendMessage(
      ctx.from,
      {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Group Admins  ${S.arr}  ${meta.subject}\n${S.heavyBar}\n${body}\n${S.brandLine}`,
        mentions: admins.map((p) => p.id),
      },
      { quoted: ctx.msg }
    );
  },
};



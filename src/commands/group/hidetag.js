/**
 * .hidetag â€” hidden tag (mentions but no visible @ text).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'hidetag',
  aliases: ['htag', 'silenttag'],
  category: 'group',
  description: 'Mention everyone without showing the @ text',
  execute: async (ctx) => {
    if (!ctx.isGroup) {
      await reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
      return;
    }
    const meta = await ctx.sock.groupMetadata(ctx.from).catch(() => null);
    if (!meta) {
      await reply(ctx.sock, ctx, `${S.cross} Could not read group metadata.`);
      return;
    }
    const text = ctx.args.join(' ') || (ctx.quoted?.message?.conversation || 'Hidden ping');
    const participants = meta.participants.map((p) => p.id);
    await ctx.sock.sendMessage(ctx.from, { text, mentions: participants }, { quoted: ctx.msg });
  },
};



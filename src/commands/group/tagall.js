const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'tagall',
  aliases: ['tag', 'mention'],
  category: 'group',
  description: 'Mention every member of the group',
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
    const text = ctx.args.join(' ') || 'Attention, everyone.';
    const participants = meta.participants.map((p) => p.id);
    const body = `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${text}\n${S.heavyBar}\n${S.dot} ${participants
      .map((j) => `@${j.split('@')[0]}`)
      .join(' ')}\n${S.brandLine}`;
    await ctx.sock.sendMessage(ctx.from, {
      text: body,
    }, { quoted: ctx.msg });
  },
};

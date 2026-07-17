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
    const text = ctx.args.join(' ') || 'Attention, everyone.';
    const body = `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${text}\n${S.heavyBar}\n${S.dot} @all\n${S.brandLine}`;
    await ctx.sock.sendMessage(ctx.from, {
      text: body,
      mentionAll: true,
    }, { quoted: ctx.msg });
  },
};

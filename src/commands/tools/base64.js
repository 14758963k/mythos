/**
 * .base64 â€” encode or decode base64.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'base64',
  aliases: ['b64'],
  category: 'tools',
  description: 'Encode or decode base64. Use "e <text>" or "d <text>"',
  execute: async (ctx) => {
    const mode = (ctx.args[0] || 'e').toLowerCase();
    const input = ctx.args.slice(1).join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!input) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}base64 e hello* or *${ctx.prefix}base64 d aGVsbG8=*`);
      return;
    }
    try {
      const out = mode === 'd' ? Buffer.from(input, 'base64').toString('utf-8') : Buffer.from(input, 'utf-8').toString('base64');
      await sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Base64  ${S.arr}  ${mode === 'd' ? 'Decode' : 'Encode'}\n${S.heavyBar}\n` +
          `  ${S.dot} ${out}\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}base64 ${mode === 'd' ? 'e' : 'd'} ${out}`, text: 'â‡„ Reverse' },
        ],
      }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



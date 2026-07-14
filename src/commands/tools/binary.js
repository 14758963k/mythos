/**
 * .binary â€” convert text to binary (or vice versa).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const toBinary = (s) => Buffer.from(s, 'utf-8').toString('binary');
const fromBinary = (s) => Buffer.from(s.replace(/\s+/g, ''), 'binary').toString('utf-8');

module.exports = {
  name: 'binary',
  aliases: ['bin'],
  category: 'tools',
  description: 'Convert text to/from binary',
  execute: async (ctx) => {
    const mode = (ctx.args[0] || 'e').toLowerCase();
    const text = ctx.args.slice(1).join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}binary e hi* or *${ctx.prefix}binary d 01101000 01101001*`);
      return;
    }
    try {
      const out = mode === 'd' ? fromBinary(text) : toBinary(text);
      await sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Binary  ${S.arr}  ${mode === 'd' ? 'Decode' : 'Encode'}\n${S.heavyBar}\n` +
          `  ${S.dot} ${out}\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}binary ${mode === 'd' ? 'e' : 'd'} ${out}`, text: 'â‡„ Reverse' },
        ],
      }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



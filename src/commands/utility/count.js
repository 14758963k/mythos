/**
 * .count â€” count characters, words, lines and bytes.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'count',
  aliases: ['wc', 'words'],
  category: 'utility',
  description: 'Count characters, words, lines and bytes of given text',
  execute: async (ctx) => {
    const text = ctx.args.join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Provide text or quote a message. Example: *${ctx.prefix}count hello world*`);
      return;
    }
    const chars = [...text].length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const lines = text.split('\n').length;
    const bytes = Buffer.byteLength(text, 'utf-8');
    const sentences = text.split(/[.!?]+\s/).filter(Boolean).length;
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Text Counter\n${S.heavyBar}\n` +
        `  ${S.sqr} Characters  ${S.arr}  ${chars}\n` +
        `  ${S.sqr} Words       ${S.arr}  ${words}\n` +
        `  ${S.sqr} Sentences   ${S.arr}  ${sentences}\n` +
        `  ${S.sqr} Lines       ${S.arr}  ${lines}\n` +
        `  ${S.sqr} Bytes (UTF8)${S.arr}  ${bytes}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}case upper ${text}`, text: 'Aâ†’A' },
        { id: `${ctx.prefix}case lower ${text}`, text: 'aâ†’a' },
      ],
    }, ctx.msg);
  },
};



/**
 * .readmore — generate read-more (truncated) text.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'readmore',
  aliases: ['rm', 'more'],
  category: 'utility',
  description: 'Generate read-more text from quoted or provided text',
  execute: async (ctx) => {
    const text = ctx.args.join(' ') || (ctx.quoted?.message?.conversation || ctx.quoted?.message?.extendedTextMessage?.text || '');
    if (!text) return reply(ctx.sock, ctx, `${S.warn}  Provide text or quote a message.\n  ${S.sub}  ${ctx.prefix}readmore Hello + This is hidden`);
    const parts = text.split('+');
    if (parts.length < 2) return reply(ctx.sock, ctx, `${S.warn}  Use + to separate visible and hidden text.\n  ${S.sub}  ${ctx.prefix}readmore Hello + Hidden content`);
    const visible = parts[0].trim();
    const hidden = parts.slice(1).join('+').trim();
    const readMore = String.fromCharCode(8206).repeat(4001);
    await reply(ctx.sock, ctx, `${visible}${readMore}${hidden}`);
  },
};

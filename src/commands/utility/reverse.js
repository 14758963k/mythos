/**
 * .reverse â€” reverse text characters.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'reverse',
  aliases: ['rev'],
  category: 'utility',
  description: 'Reverse the characters in a string',
  execute: async (ctx) => {
    const text = ctx.args.join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Provide text or quote a message.`);
      return;
    }
    const out = [...text].reverse().join('');
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Reverse\n${S.heavyBar}\n` +
        `  ${S.sqr} In   ${S.arr}  ${text}\n` +
        `  ${S.sqr} Out  ${S.arr}  ${out}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}base64 e ${out}`, text: 'â–¸ Base64' },
        { id: `${ctx.prefix}count ${out}`, text: 'â–¸ Count' },
      ],
    }, ctx.msg);
  },
};



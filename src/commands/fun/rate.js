/**
 * .rate â€” rate anything out of 10.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'rate',
  aliases: ['score'],
  category: 'fun',
  description: 'Rate something out of 10',
  execute: async (ctx) => {
    if (!ctx.args.length) {
      await reply(ctx.sock, ctx, `${S.warn} Tell me what to rate. Example: *${ctx.prefix}rate memes*`);
      return;
    }
    const subject = ctx.args.join(' ');
    const value = 1 + Math.floor(Math.random() * 10);
    const filled = S.star.repeat(value);
    const empty = S.outStar.repeat(10 - value);
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Rating\n${S.heavyBar}\n` +
        `  ${S.dot} ${subject}\n  ${S.arr}  ${filled}${empty}  ${value}/10\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}rate ${subject}`, text: 'â†» Re-roll' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



/**
 * .flip â€” coin flip.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'flip',
  aliases: ['coin', 'coinflip'],
  category: 'fun',
  description: 'Flip a coin',
  execute: async (ctx) => {
    const side = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const mark = side === 'Heads' ? S.star : S.diamond;
    await sendQuickReply(ctx.sock, ctx.from, {
      text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Coin Flip\n${S.heavyBar}\n  ${S.dot} ${mark} ${side}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}flip`, text: 'â†» Flip again' },
        { id: `${ctx.prefix}roll 1d6`, text: 'â–¸ Roll d6' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



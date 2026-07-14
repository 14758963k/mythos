/**
 * .roll â€” roll dice. Default d6, supports NdM (e.g. 3d20).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'roll',
  aliases: ['dice'],
  category: 'fun',
  description: 'Roll a dice. Optional: NdM like 3d20',
  execute: async (ctx) => {
    const arg = ctx.args[0] || '1d6';
    const m = arg.toLowerCase().match(/^(\d{1,3})d(\d{1,4})$/);
    if (!m) {
      await reply(ctx.sock, ctx, `${S.warn} Bad format. Use *1d6*, *3d20*, *1d100*.`);
      return;
    }
    const n = Math.min(20, parseInt(m[1], 10));
    const sides = Math.min(1000, parseInt(m[2], 10));
    const rolls = [];
    let total = 0;
    for (let i = 0; i < n; i++) {
      const r = 1 + Math.floor(Math.random() * sides);
      rolls.push(r);
      total += r;
    }
    const detail = n > 1 ? `\n  ${S.sub} Rolls ${S.arr} ${rolls.join(' ' + S.dot + ' ')}` : '';
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Dice Roll  ${S.arr}  ${n}d${sides}\n${S.heavyBar}\n` +
        `  ${S.dot} Total ${S.arr} ${total}${detail}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}roll ${n}d${sides}`, text: 'â†» Again' },
        { id: `${ctx.prefix}flip`, text: 'â‡„ Flip' },
      ],
    }, ctx.msg);
  },
};



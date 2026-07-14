/**
 * .date â€” today's date in multiple formats.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'date',
  aliases: ['today', 'day'],
  category: 'utility',
  description: "Show today's date",
  execute: async (ctx) => {
    const d = new Date();
    const iso = d.toISOString().slice(0, 10);
    const human = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const unix = Math.floor(d.getTime() / 1000);
    const dayOfYear = Math.ceil((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Today\n${S.heavyBar}\n` +
        `  ${S.sqr} ISO     ${S.arr}  ${iso}\n` +
        `  ${S.sqr} Human   ${S.arr}  ${human}\n` +
        `  ${S.sqr} Unix    ${S.arr}  ${unix}\n` +
        `  ${S.sqr} Day #   ${S.arr}  ${dayOfYear} of 365\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}date`, text: 'â†» Refresh' },
        { id: `${ctx.prefix}time`, text: 'â± Time' },
      ],
    }, ctx.msg);
  },
};



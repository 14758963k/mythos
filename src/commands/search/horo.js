/**
 * .horo — horoscope lookup for a zodiac sign.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

module.exports = {
  name: 'horo',
  aliases: ['horoscope', 'zodiac'],
  category: 'search',
  description: 'Look up today\'s horoscope for a zodiac sign',
  execute: async (ctx) => {
    const sign = (ctx.args[0] || '').toLowerCase();
    if (!sign || !SIGNS.includes(sign)) {
      return reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Horoscope  ${S.arr}  Select Your Sign\n${S.heavyBar}\n` +
        `  ${S.dot} ${SIGNS.join(', ')}\n${S.divider}\n` +
        `  ${S.sub}  ${ctx.prefix}horo libra\n${S.brandLine}`
      );
    }
    try {
      const { data } = await axios.post(`https://aztro.sameerkumar.website/?sign=${sign}&day=today`);
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Horoscope  ${S.arr}  ${sign.toUpperCase()}\n${S.heavyBar}\n` +
        `  ${S.sqr} Date        ${S.arr}  ${data.current_date}\n` +
        `  ${S.sqr} Lucky Time  ${S.arr}  ${data.lucky_time}\n` +
        `  ${S.sqr} Lucky Num   ${S.arr}  ${data.lucky_number}\n` +
        `  ${S.sqr} Lucky Color ${S.arr}  ${data.color}\n` +
        `  ${S.sqr} Mood        ${S.arr}  ${data.mood}\n` +
        `  ${S.sqr} Compatible  ${S.arr}  ${data.compatibility}\n` +
        `${S.divider}\n` +
        `  ${S.dot} ${data.description}\n` +
        `${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Horoscope lookup failed: ${e.message}`);
    }
  },
};

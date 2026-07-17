/**
 * .leaderboard — show top 10 richest users.
 */

const { reply } = require('../../helpers/messages');
const { S, header, footer } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'rich'],
  category: 'economy',
  description: 'Show the top 10 richest users',
  execute: async (ctx) => {
    const eco = store.get('economy') || {};
    const sorted = Object.entries(eco)
      .map(([id, data]) => ({ id, total: (data.wallet || 0) + (data.bank || 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    if (sorted.length === 0) return reply(ctx.sock, ctx, `${S.info} No economy data yet.`);

    const medals = [S.star, S.star8, S.star4];
    const text =
      `${header('Top 10 Richest')}\n\n` +
      sorted.map((entry, i) => {
        const rank = i < 3 ? medals[i] : S.sqr;
        const medal = i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th';
        return `  ${rank} ${i + 1}${medal} ${S.arr} @${entry.id.split('@')[0]} ${S.tri} *${entry.total.toLocaleString()}* coins`;
      }).join('\n') +
      `\n\n${footer(`${ctx.prefix}wallet  ${S.dot}  ${ctx.prefix}daily`)}`;

    await reply(ctx.sock, ctx, text, { mentions: sorted.map(e => e.id) });
  },
};

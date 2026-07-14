/**
 * .leaderboard — show top 10 richest users.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
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
    if (sorted.length === 0) return reply(ctx.sock, ctx, `${S.info}  No economy data yet.`);
    let text = `${S.brand}  *Top 10 Richest Users*\n`;
    sorted.forEach((entry, i) => {
      const medal = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`;
      text += `\n  ${S.sub}  ${medal}. @${entry.id.split('@')[0]} — ${entry.total.toLocaleString()} coins`;
    });
    await reply(ctx.sock, ctx, text, sorted.map(e => e.id));
  },
};

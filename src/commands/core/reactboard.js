/**
 * Reaction leaderboard — who reacts the most.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const events = require('../../core/events');

module.exports = {
  name: 'reactboard',
  aliases: ['reactlb', 'reactions'],
  category: 'core',
  description: 'Show reaction leaderboard for this chat',
  execute: async (ctx) => {
    const entries = events.getReactionLeaderboard(ctx.from, 10);
    if (!entries.length) return reply(ctx.sock, ctx, `${S.sqr} No reactions tracked yet.`);
    const lines = entries.map((e, i) =>
      `  ${S.tri} ${i + 1}. ${e.emoji} x${e.count} ${S.sub} by @${e.user.split('@')[0]}`
    );
    const mentions = entries.map(e => e.user);
    await reply(ctx.sock, ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Reaction Leaderboard\n${S.heavyBar}\n` +
      lines.join('\n') + `\n${S.brandLine}`,
      { mentions }
    );
  },
};

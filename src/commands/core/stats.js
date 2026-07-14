/**
 * .stats â€” user and global usage stats.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'stats',
  aliases: ['statistics'],
  category: 'core',
  description: 'View your usage statistics and global counters',
  execute: async (ctx) => {
    const me = store.get('users')[ctx.participant] || { messages: 0, name: ctx.pushName };
    const all = store.get('users');
    const top = Object.entries(all)
      .sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0))
      .slice(0, 5)
      .map(([jid, u], i) => `  ${i + 1}. ${u.name || jid.split('@')[0]} ${S.arr} ${u.messages || 0}`)
      .join('\n');
    const total = Object.values(all).reduce((s, u) => s + (u.messages || 0), 0);
    await reply(
      ctx.sock,
      ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Usage Statistics\n${S.heavyBar}\n` +
        `  ${S.sqr} Your messages   ${S.arr}  ${me.messages}\n` +
        `  ${S.sqr} Global messages ${S.arr}  ${total}\n` +
        `  ${S.sqr} Registered users${S.arr}  ${Object.keys(all).length}\n` +
        `${S.divider}\n  ${S.dot} Top contributors\n${top || `  ${S.warn} no data yet`}\n${S.brandLine}`
    );
  },
};



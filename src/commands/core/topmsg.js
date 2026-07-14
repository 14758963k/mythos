/**
 * .topmsg — top 10 most active users by message count.
 * (Was previously .leaderboard; renamed so the economy leaderboard
 * (richest) can own the .leaderboard name.)
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'topmsg',
  aliases: ['topmsg', 'topchatters', 'chatterboard'],
  category: 'core',
  description: 'Top 10 most active users by messages sent',
  execute: async (ctx) => {
    const all = store.get('users');
    const ranked = Object.entries(all)
      .filter(([jid]) => jid.endsWith('@s.whatsapp.net'))
      .sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0))
      .slice(0, 10);
    if (!ranked.length) {
      await reply(ctx.sock, ctx, `${S.warn}  No data yet.`);
      return;
    }
    const medals = ['★', '◆', '◇', '◈', '◦', '◦', '◦', '◦', '◦', '◦'];
    const body = ranked
      .map(([jid, u], i) => `  ${medals[i]} ${(u.name || jid.split('@')[0]).padEnd(18, ' ')} ${S.arr}  ${u.messages || 0}`)
      .join('\n');
    const total = ranked.reduce((s, [, u]) => s + (u.messages || 0), 0);
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Top 10 Messengers\n${S.heavyBar}\n${body}\n${S.divider}\n  ${S.sqr} Combined  ${S.arr}  ${total} messages\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}leaderboard`, text: '▸ Rich List' },
        { id: `${ctx.prefix}stats`, text: '▸ My Stats' },
      ],
    }, ctx.msg);
  },
};

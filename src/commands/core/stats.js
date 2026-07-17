/**
 * .stats — user and global usage stats.
 */

const { reply, sendTable } = require('../../helpers/messages');
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
    const sorted = Object.entries(all)
      .sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0))
      .slice(0, 5);
    const total = Object.values(all).reduce((s, u) => s + (u.messages || 0), 0);
    const table = [
      ['Stat', 'Value'],
      ['Your Messages', String(me.messages)],
      ['Global Messages', String(total)],
      ['Registered Users', String(Object.keys(all).length)],
      ...sorted.map(([jid, u], i) => [
        `${i + 1}. ${u.name || jid.split('@')[0]}`,
        String(u.messages || 0),
      ]),
    ];
    await sendTable(ctx.sock, ctx.from, {
      headerText: '## Usage Statistics',
      title: 'Top Contributors',
      table,
      footerText: `${S.brand} Mythos ⟁ Ascendant`,
      quoted: ctx.msg,
    });
  },
};



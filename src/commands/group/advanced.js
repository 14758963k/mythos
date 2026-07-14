const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = [
  {
    name: 'antipromote',
    category: 'group',
    description: 'Auto-demote anyone who promotes others',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only command.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};

      if (!arg) {
        const on = g.antiPromote === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  Anti-Promote ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Auto-demotes anyone who promotes others\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}antipromote on`, text: '▸ On' },
            { id: `${ctx.prefix}antipromote off`, text: '▸ Off' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        groups[ctx.from] = { ...g, antiPromote: true };
        store.set('groups', groups);
        return reply(ctx.sock, ctx, `${S.check} Anti-promote enabled.`);
      }
      if (arg === 'off') {
        groups[ctx.from] = { ...g, antiPromote: false };
        store.set('groups', groups);
        return reply(ctx.sock, ctx, `${S.check} Anti-promote disabled.`);
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on or off.`);
    },
  },
  {
    name: 'antidemote',
    category: 'group',
    description: 'Auto-re-promote anyone who demotes others',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only command.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};

      if (!arg) {
        const on = g.antiDemote === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  Anti-Demote ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Auto-re-promotes anyone who gets demoted\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}antidemote on`, text: '▸ On' },
            { id: `${ctx.prefix}antidemote off`, text: '▸ Off' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        groups[ctx.from] = { ...g, antiDemote: true };
        store.set('groups', groups);
        return reply(ctx.sock, ctx, `${S.check} Anti-demote enabled.`);
      }
      if (arg === 'off') {
        groups[ctx.from] = { ...g, antiDemote: false };
        store.set('groups', groups);
        return reply(ctx.sock, ctx, `${S.check} Anti-demote disabled.`);
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on or off.`);
    },
  },
  {
    name: 'rank',
    aliases: ['level', 'xp'],
    category: 'group',
    description: 'Check your rank and XP',
    execute: async (ctx) => {
      const users = store.get('users') || {};
      const user = users[ctx.sender] || {};
      const xp = user.xp || 0;
      const level = Math.floor(xp / 100);
      const nextLevel = (level + 1) * 100;
      const progress = ((xp % 100) / 100) * 20;
      const bar = '█'.repeat(Math.floor(progress)) + '░'.repeat(20 - Math.floor(progress));

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Rank\n${S.heavyBar}\n` +
        `  ${S.tri} User ${S.arr} @${ctx.sender.split('@')[0]}\n` +
        `  ${S.tri} Level ${S.arr} *${level}*\n` +
        `  ${S.tri} XP ${S.arr} *${xp}/${nextLevel}*\n` +
        `  ${S.tri} Progress ${S.arr} [${bar}]\n` +
        `  ${S.tri} Messages ${S.arr} ${user.messages || 0}\n${S.brandLine}`,
        { mentions: [ctx.sender] }
      );
    },
  },
  {
    name: 'top',
    aliases: ['topusers', 'mylevel'],
    category: 'group',
    description: 'Show top users by XP',
    execute: async (ctx) => {
      const users = store.get('users') || {};
      const sorted = Object.entries(users)
        .map(([jid, u]) => ({ jid, xp: u.xp || 0, level: Math.floor((u.xp || 0) / 100) }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);

      if (!sorted.length) return reply(ctx.sock, ctx, `${S.warn} No user data yet.`);

      const text =
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Top 10 Users\n${S.heavyBar}\n\n` +
        sorted.map((u, i) =>
          `  ${S.sqr} #${i + 1} ${S.arr} @${u.jid.split('@')[0]} ${S.tri} Lv.${u.level} ${S.tri} ${u.xp} XP`
        ).join('\n') +
        `\n${S.brandLine}`;

      await reply(ctx.sock, ctx, text, {
        mentions: sorted.map(u => u.jid),
      });
    },
  },
];

/**
 * .broadcast — send a message to all known private chats or groups with throttle.
 * .broadcastgroups — broadcast to all groups only.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = [
  {
    name: 'broadcast',
    aliases: ['bc', 'announce'],
    category: 'owner',
    owner: true,
    description: 'Broadcast a message to all known private chats',
    execute: async (ctx) => {
      const text = ctx.args.join(' ');
      if (!text) {
        return reply(ctx.sock, ctx,
          `${S.warn} Provide a message.\n` +
          `  ${S.sub} ${ctx.prefix}bc <message> ${S.arr} all DMs\n` +
          `  ${S.sub} ${ctx.prefix}bc groups <message> ${S.arr} all groups\n` +
          `  ${S.sub} ${ctx.prefix}bc all <message> ${S.arr} everything`
        );
      }

      const lower = text.toLowerCase();
      let target = 'dms';
      let message = text;
      if (lower.startsWith('groups ') || lower.startsWith('group ')) {
        target = 'groups';
        message = text.replace(/^group[s]?\s+/i, '');
      } else if (lower.startsWith('all ')) {
        target = 'all';
        message = text.replace(/^all\s+/i, '');
      }

      if (!message.trim()) return reply(ctx.sock, ctx, `${S.warn} Provide a message after the target.`);

      let targets = [];
      if (target === 'dms' || target === 'all') {
        const users = Object.keys(store.get('users')).filter(j => j.endsWith('@s.whatsapp.net'));
        targets.push(...users);
      }
      if (target === 'groups' || target === 'all') {
        const groups = store.get('groups');
        targets.push(...Object.keys(groups).filter(j => j.endsWith('@g.us')));
      }

      if (!targets.length) return reply(ctx.sock, ctx, `${S.warn} No targets found.`);

      await reply(ctx.sock, ctx, `${S.info} Broadcasting to ${targets.length} ${target}...`);

      let ok = 0, fail = 0;
      for (const jid of targets) {
        try {
          await ctx.sock.sendMessage(jid, { text: message });
          ok++;
          // throttle: 1 message per 2 seconds to avoid rate limits
          await new Promise(r => setTimeout(r, 2000));
        } catch {
          fail++;
        }
      }

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Broadcast Complete\n${S.heavyBar}\n` +
        `  ${S.check} Sent ${S.arr} ${ok}\n` +
        `  ${S.cross} Failed ${S.arr} ${fail}\n` +
        `  ${S.sub} Target ${S.arr} ${target}\n${S.brandLine}`
      );
    },
  },
  {
    name: 'broadcastgroups',
    aliases: ['bcg', 'bcgroup'],
    category: 'owner',
    owner: true,
    description: 'Broadcast a message to all groups',
    execute: async (ctx) => {
      const text = ctx.args.join(' ');
      if (!text) return reply(ctx.sock, ctx, `${S.warn} Provide a message: *${ctx.prefix}bcg <message>*`);

      const groups = store.get('groups');
      const targets = Object.keys(groups).filter(j => j.endsWith('@g.us'));
      if (!targets.length) return reply(ctx.sock, ctx, `${S.warn} No groups found.`);

      await reply(ctx.sock, ctx, `${S.info} Broadcasting to ${targets.length} groups...`);

      let ok = 0, fail = 0;
      for (const jid of targets) {
        try {
          await ctx.sock.sendMessage(jid, { text });
          ok++;
          await new Promise(r => setTimeout(r, 2000));
        } catch {
          fail++;
        }
      }

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Group Broadcast Complete\n${S.heavyBar}\n` +
        `  ${S.check} Sent ${S.arr} ${ok}\n  ${S.cross} Failed ${S.arr} ${fail}\n${S.brandLine}`
      );
    },
  },
];

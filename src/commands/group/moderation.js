/**
 * Group moderation commands — warn, unwarn, warnings, setwarn, antispam, antibadword.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const store = require('../../core/store');

const getWarnings = (groupJid) => {
  const groups = store.get('groups');
  const g = groups[groupJid] || {};
  if (!g.warnings) g.warnings = {};
  return g.warnings;
};

const saveWarnings = (groupJid, warnings) => {
  const groups = store.get('groups');
  const g = groups[groupJid] || {};
  g.warnings = warnings;
  groups[groupJid] = g;
  store.set('groups', groups);
};

const WARN_ICONS = ['◇', '◆', '◈', '▣', '■'];

module.exports = [
  {
    name: 'warn',
    category: 'group',
    description: 'Warn a user (auto-kick after threshold)',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only.`);
      const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (ctx.quoted?.sender);
      if (!target) return reply(ctx.sock, ctx, `${S.warn} Tag or quote a user to warn.`);

      const groups = store.get('groups');
      const g = groups[ctx.from] || {};
      const threshold = g.warnThreshold || 3;
      const warnings = getWarnings(ctx.from);
      if (!warnings[target]) warnings[target] = 0;
      warnings[target]++;

      const count = warnings[target];
      const bar = Array.from({ length: threshold }, (_, i) => i < count ? WARN_ICONS[Math.min(i, WARN_ICONS.length - 1)] : '·').join(' ');

      if (count >= threshold) {
        // auto-kick
        try {
          await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove');
          await reply(ctx.sock, ctx,
            `${S.brandLine}\n${S.sub}  User Kicked\n${S.heavyBar}\n` +
            `  ${S.dot} @${target.split('@')[0]} reached ${threshold} warnings\n${S.brandLine}`,
            { mentions: [target] }
          );
        } catch (e) {
          await reply(ctx.sock, ctx, `${S.cross} Kick failed: ${e.message}`);
        }
        delete warnings[target];
      } else {
        await reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Warning ${count}/${threshold}\n${S.heavyBar}\n` +
          `  ${S.dot} @${target.split('@')[0]}\n` +
          `  ${S.dot} ${bar}\n` +
          `  ${S.sub} ${threshold - count} more and they're out\n${S.brandLine}`,
          { mentions: [target] }
        );
      }
      saveWarnings(ctx.from, warnings);
    },
  },
  {
    name: 'unwarn',
    category: 'group',
    description: 'Remove a warning from a user',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only.`);
      const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (ctx.quoted?.sender);
      if (!target) return reply(ctx.sock, ctx, `${S.warn} Tag or quote a user.`);

      const warnings = getWarnings(ctx.from);
      if (!warnings[target] || warnings[target] <= 0) {
        return reply(ctx.sock, ctx, `${S.info} That user has no warnings.`);
      }
      warnings[target]--;
      saveWarnings(ctx.from, warnings);
      const groups2 = store.get('groups');
      const g2 = groups2[ctx.from] || {};
      const threshold2 = g2.warnThreshold || 3;
      const count2 = warnings[target];
      const bar2 = Array.from({ length: threshold2 }, (_, i) => i < count2 ? WARN_ICONS[Math.min(i, WARN_ICONS.length - 1)] : '·').join(' ');
      await reply(ctx.sock, ctx,
        `${header('Warning Removed')}\n\n` +
        `${row('User', `@${target.split('@')[0]}`)}\n` +
        `${row('Warnings', `${count2}/${threshold2}`)}\n` +
        `  ${S.sqr} ${bar2}\n\n` +
        `${footer()}`,
        { mentions: [target] }
      );
    },
  },
  {
    name: 'warnings',
    aliases: ['warns'],
    category: 'group',
    description: 'Check warnings for a user or list all warned users',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only.`);
      const warnings = getWarnings(ctx.from);
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};
      const threshold = g.warnThreshold || 3;

      const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        || (ctx.quoted?.sender);

      if (target) {
        const count = warnings[target] || 0;
        const bar = Array.from({ length: threshold }, (_, i) => i < count ? WARN_ICONS[Math.min(i, WARN_ICONS.length - 1)] : '·').join(' ');
        return reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Warnings\n${S.heavyBar}\n` +
          `  ${S.dot} @${target.split('@')[0]} ${S.arr} ${count}/${threshold}\n` +
          `  ${S.dot} ${bar}\n${S.brandLine}`,
          { mentions: [target] }
        );
      }

      const entries = Object.entries(warnings).filter(([, c]) => c > 0);
      if (!entries.length) return reply(ctx.sock, ctx, `${S.info} No warnings in this group.`);

      const body = entries
        .sort((a, b) => b[1] - a[1])
        .map(([jid, count]) => `  ${S.dot} @${jid.split('@')[0]} ${S.arr} ${count}/${threshold}`)
        .join('\n');

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  All Warnings\n${S.heavyBar}\n${body}\n${S.brandLine}`,
        { mentions: entries.map(([jid]) => jid) }
      );
    },
  },
  {
    name: 'setwarn',
    category: 'group',
    description: 'Set warning threshold (default: 3)',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only.`);
      const num = parseInt(ctx.args[0]);
      if (isNaN(num) || num < 1 || num > 10) {
        return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}setwarn <1-10>*`);
      }
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};
      g.warnThreshold = num;
      groups[ctx.from] = g;
      store.set('groups', groups);
      await reply(ctx.sock, ctx,
        `${header('Warning Threshold')}\n\n` +
        `${row('Threshold', `${num} warnings`)}\n` +
        `${row('Action', 'Auto-kick')}\n\n` +
        `${footer()}`
      );
    },
  },
  {
    name: 'antispam',
    category: 'group',
    description: 'Anti-spam: auto-warn users who send too many messages quickly',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};

      if (!arg) {
        const on = g.antiSpam === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  Anti-Spam ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Auto-warns users sending ${g.spamLimit || 5}+ msgs in ${g.spamWindow || 10}s\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}antispam on`, text: '▸ On' },
            { id: `${ctx.prefix}antispam off`, text: '▸ Off' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        g.antiSpam = true;
        if (!g.spamLimit) g.spamLimit = 5;
        if (!g.spamWindow) g.spamWindow = 10;
        groups[ctx.from] = g;
        store.set('groups', groups);
        return reply(ctx.sock, ctx,
          `${header('Anti-Spam')}\n\n` +
          `${row('Status', `${S.check} Enabled`)}\n` +
          `${row('Rule', `${g.spamLimit}+ msgs in ${g.spamWindow}s`)}\n` +
          `${row('Action', 'Auto-warn')}\n\n` +
          `${footer()}`
        );
      }
      if (arg === 'off') {
        g.antiSpam = false;
        groups[ctx.from] = g;
        store.set('groups', groups);
        return reply(ctx.sock, ctx,
          `${header('Anti-Spam')}\n\n` +
          `${row('Status', `${S.cross} Disabled`)}\n\n` +
          `${footer()}`
        );
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on or off.`);
    },
  },
  {
    name: 'antibadword',
    category: 'group',
    description: 'Auto-delete messages containing bad words',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only.`);
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};

      if (arg === 'add') {
        const word = ctx.args[1]?.toLowerCase();
        if (!word) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}antibadword add <word>*`);
        if (!g.badwords) g.badwords = [];
        if (!g.badwords.includes(word)) g.badwords.push(word);
        groups[ctx.from] = g;
        store.set('groups', groups);
        return reply(ctx.sock, ctx,
          `${header('Anti-Badword')}\n\n` +
          `${row('Added', `*${word}*`)}\n` +
          `${row('Total', `${g.badwords.length} word(s)`)}\n\n` +
          `${footer()}`
        );
      }

      if (arg === 'remove' || arg === 'del') {
        const word = ctx.args[1]?.toLowerCase();
        if (!word) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}antibadword remove <word>*`);
        if (g.badwords) g.badwords = g.badwords.filter(w => w !== word);
        groups[ctx.from] = g;
        store.set('groups', groups);
        return reply(ctx.sock, ctx,
          `${header('Anti-Badword')}\n\n` +
          `${row('Removed', `*${word}*`)}\n` +
          `${row('Total', `${(g.badwords || []).length} word(s)`)}\n\n` +
          `${footer()}`
        );
      }

      if (!arg) {
        const on = g.antiBadword === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  Anti-Badword ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Words: ${(g.badwords || []).join(', ') || '(none)'}\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}antibadword on`, text: '▸ On' },
            { id: `${ctx.prefix}antibadword off`, text: '▸ Off' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        g.antiBadword = true;
        groups[ctx.from] = g;
        store.set('groups', groups);
        return reply(ctx.sock, ctx,
          `${header('Anti-Badword')}\n\n` +
          `${row('Status', `${S.check} Enabled`)}\n` +
          `${row('Words', (g.badwords || []).join(', ') || '(none)')}\n\n` +
          `${footer()}`
        );
      }
      if (arg === 'off') {
        g.antiBadword = false;
        groups[ctx.from] = g;
        store.set('groups', groups);
        return reply(ctx.sock, ctx,
          `${header('Anti-Badword')}\n\n` +
          `${row('Status', `${S.cross} Disabled`)}\n\n` +
          `${footer()}`
        );
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on, off, add <word>, or remove <word>.`);
    },
  },
];

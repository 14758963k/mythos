const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = [
  {
    name: 'autotyping',
    aliases: ['typing', 'autotype'],
    category: 'owner',
    description: 'Toggle auto-typing indicator',
    execute: async (ctx) => {
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only command.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const bot = store.get('bot');

      if (!arg) {
        const on = bot.autoTyping === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  Auto-Typing ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Shows typing indicator periodically\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}autotyping on`, text: '▸ On' },
            { id: `${ctx.prefix}autotyping off`, text: '▸ Off' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        bot.autoTyping = true;
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} Auto-typing enabled.`);
      }
      if (arg === 'off') {
        bot.autoTyping = false;
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} Auto-typing disabled.`);
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on or off.`);
    },
  },
  {
    name: 'autorecording',
    aliases: ['recording', 'autorecord'],
    category: 'owner',
    description: 'Toggle auto-recording indicator',
    execute: async (ctx) => {
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only command.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const bot = store.get('bot');

      if (!arg) {
        const on = bot.autoRecording === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  Auto-Recording ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Shows recording indicator periodically\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}autorecording on`, text: '▸ On' },
            { id: `${ctx.prefix}autorecording off`, text: '▸ Off' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        bot.autoRecording = true;
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} Auto-recording enabled.`);
      }
      if (arg === 'off') {
        bot.autoRecording = false;
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} Auto-recording disabled.`);
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on or off.`);
    },
  },
  {
    name: 'pmpermit',
    aliases: ['pmguard'],
    category: 'owner',
    description: 'PM anti-spam protection',
    execute: async (ctx) => {
      if (!ctx.isOwner) return reply(ctx.sock, ctx, `${S.warn} Owner-only command.`);
      const arg = (ctx.args[0] || '').toLowerCase();
      const bot = store.get('bot');

      if (!arg) {
        const on = bot.pmPermit === true;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.sub}  PM Permit ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
            `  ${S.sub} Auto-blocks spammers in DM\n` +
            `  ${S.sub} After ${bot.pmLimit || 5} messages\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}pmpermit on`, text: '▸ On' },
            { id: `${ctx.prefix}pmpermit off`, text: '▸ Off' },
            { id: `${ctx.prefix}pmpermit limit 10`, text: '▸ Set limit' },
          ],
        }, ctx.msg);
      }

      if (arg === 'on') {
        bot.pmPermit = true;
        if (!bot.pmLimit) bot.pmLimit = 5;
        if (!bot.pmTracker) bot.pmTracker = {};
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} PM Permit enabled. Users exceeding ${bot.pmLimit} messages will be blocked.`);
      }
      if (arg === 'off') {
        bot.pmPermit = false;
        bot.pmTracker = {};
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} PM Permit disabled.`);
      }
      if (arg === 'limit') {
        const limit = parseInt(ctx.args[1]);
        if (isNaN(limit) || limit < 1 || limit > 50) {
          return reply(ctx.sock, ctx, `${S.warn} Provide a number between 1 and 50.`);
        }
        bot.pmLimit = limit;
        store.set('bot', bot);
        return reply(ctx.sock, ctx, `${S.check} PM limit set to ${limit} messages.`);
      }
      return reply(ctx.sock, ctx, `${S.warn} Use on, off, or limit <number>.`);
    },
  },
];

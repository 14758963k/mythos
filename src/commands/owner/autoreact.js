/**
 * .autoreact — toggle auto-reacting to commands.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'autoreact',
  aliases: ['autolike'],
  category: 'owner',
  owner: true,
  description: 'Toggle auto-react with random symbol to commands',
  execute: async (ctx) => {
    const arg = (ctx.args[0] || '').toLowerCase();
    if (!arg) {
      const bot = store.get('bot');
      const on = !!bot.autoReact;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Auto React  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
          `  ${S.dot} Reacts with a random symbol to every command invocation.\n` +
          `${S.divider}\n` +
          `  ${S.sub}  ${ctx.prefix}autoreact on\n  ${S.sub}  ${ctx.prefix}autoreact off\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}autoreact on`, text: '▸ On' },
          { id: `${ctx.prefix}autoreact off`, text: '▸ Off' },
        ],
      }, ctx.msg);
    }
    if (arg === 'on') {
      store.update('bot', (b) => { b.autoReact = true; });
      return reply(ctx.sock, ctx, `${S.check}  Auto React activated.`);
    }
    if (arg === 'off') {
      store.update('bot', (b) => { b.autoReact = false; });
      return reply(ctx.sock, ctx, `${S.check}  Auto React deactivated.`);
    }
    return reply(ctx.sock, ctx, `${S.warn}  Use on or off.`);
  },
};

/**
 * .autobio — toggle auto-updating the bot's WhatsApp bio with uptime.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'autobio',
  aliases: ['bioupdate'],
  category: 'owner',
  owner: true,
  description: 'Toggle auto-updating bot bio with uptime info',
  execute: async (ctx) => {
    const arg = (ctx.args[0] || '').toLowerCase();
    if (!arg) {
      const bot = store.get('bot');
      const on = !!bot.autoBio;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Auto Bio  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
          `  ${S.dot} Updates bot WhatsApp bio every 5 minutes with uptime.\n` +
          `${S.divider}\n` +
          `  ${S.sub}  ${ctx.prefix}autobio on\n  ${S.sub}  ${ctx.prefix}autobio off\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}autobio on`, text: '▸ On' },
          { id: `${ctx.prefix}autobio off`, text: '▸ Off' },
        ],
      }, ctx.msg);
    }
    if (arg === 'on') {
      store.update('bot', (b) => { b.autoBio = true; });
      return reply(ctx.sock, ctx, `${S.check}  Auto Bio activated.`);
    }
    if (arg === 'off') {
      store.update('bot', (b) => { b.autoBio = false; });
      return reply(ctx.sock, ctx, `${S.check}  Auto Bio deactivated.`);
    }
    return reply(ctx.sock, ctx, `${S.warn}  Use on or off.`);
  },
};

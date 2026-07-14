/**
 * .readstatus — toggle auto-reading of WhatsApp statuses.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'readstatus',
  aliases: ['readstories'],
  category: 'owner',
  owner: true,
  description: 'Toggle auto-reading of WhatsApp status updates',
  execute: async (ctx) => {
    const arg = (ctx.args[0] || '').toLowerCase();
    if (!arg) {
      const bot = store.get('bot');
      const on = !!bot.readStatus;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Read Status  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
          `  ${S.dot} Automatically reads all status/stories from contacts.\n` +
          `${S.divider}\n` +
          `  ${S.sub}  ${ctx.prefix}readstatus on\n  ${S.sub}  ${ctx.prefix}readstatus off\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}readstatus on`, text: '▸ On' },
          { id: `${ctx.prefix}readstatus off`, text: '▸ Off' },
        ],
      }, ctx.msg);
    }
    if (arg === 'on') {
      store.update('bot', (b) => { b.readStatus = true; });
      return reply(ctx.sock, ctx, `${S.check}  Read Status activated.`);
    }
    if (arg === 'off') {
      store.update('bot', (b) => { b.readStatus = false; });
      return reply(ctx.sock, ctx, `${S.check}  Read Status deactivated.`);
    }
    return reply(ctx.sock, ctx, `${S.warn}  Use on or off.`);
  },
};

/**
 * .autostatusview — auto-view all contacts' status/stories.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'autostatusview',
  aliases: ['astatusview', 'viewstatus'],
  category: 'owner',
  owner: true,
  description: 'Auto-view all contacts status/stories',
  execute: async (ctx) => {
    const arg = (ctx.args[0] || '').toLowerCase();
    const bot = store.get('bot');

    if (!arg) {
      const on = bot.autoStatusView === true;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.sub}  Auto Status View ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
          `  ${S.sub} Automatically views all contacts' status updates\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}autostatusview on`, text: '▸ On' },
          { id: `${ctx.prefix}autostatusview off`, text: '▸ Off' },
        ],
      }, ctx.msg);
    }

    if (arg === 'on') {
      bot.autoStatusView = true;
      store.set('bot', bot);
      return reply(ctx.sock, ctx, `${S.check} Auto status view enabled.`);
    }
    if (arg === 'off') {
      bot.autoStatusView = false;
      store.set('bot', bot);
      return reply(ctx.sock, ctx, `${S.check} Auto status view disabled.`);
    }
    return reply(ctx.sock, ctx, `${S.warn} Use on or off.`);
  },
};

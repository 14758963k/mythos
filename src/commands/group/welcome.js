/**
 * .welcome — view or set the welcome message for a group.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'welcome',
  aliases: ['setwelcome'],
  category: 'group',
  description: 'View or set the welcome message (admin only). Use <text> to set, off to disable.',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
    const groups = store.get('groups');
    const g = groups[ctx.from] || {};
    const arg = ctx.args.join(' ').trim();

    if (!arg) {
      const cur = g.welcome || '(default greeting)';
      const on = g.welcomeOn !== false;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Welcome  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status   ${S.arr}  ${on ? S.check : S.cross}\n  ${S.sqr} Current  ${S.arr}  ${cur}\n` +
          `${S.divider}\n  ${S.sub}  ${ctx.prefix}welcome <text>  to set\n  ${S.sub}  ${ctx.prefix}welcome off  to disable\n  ${S.sub}  Variables: @user, @mention\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}welcome off`, text: '⏸ Turn off' },
          { id: `${ctx.prefix}welcome Welcome @user to Mythos`, text: '↺ Default' },
        ],
      }, ctx.msg);
    }

    if (arg.toLowerCase() === 'off') {
      groups[ctx.from] = { ...g, welcomeOn: false };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Welcome messages disabled.`);
    }
    if (arg.toLowerCase() === 'on') {
      groups[ctx.from] = { ...g, welcomeOn: true };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Welcome messages enabled.`);
    }

    groups[ctx.from] = { ...g, welcome: arg, welcomeOn: true };
    store.set('groups', groups);
    await reply(ctx.sock, ctx, `${S.check} Welcome message updated.`);
  },
};

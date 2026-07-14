/**
 * .goodbye — view or set the goodbye message for a group.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'goodbye',
  aliases: ['setgoodbye'],
  category: 'group',
  description: 'View or set the goodbye message (admin only). Use <text> to set, off to disable.',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
    const groups = store.get('groups');
    const g = groups[ctx.from] || {};
    const arg = ctx.args.join(' ').trim();

    if (!arg) {
      const cur = g.goodbye || '(default farewell)';
      const on = !!g.goodbyeOn;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Goodbye  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status   ${S.arr}  ${on ? S.check : S.cross}\n  ${S.sqr} Current  ${S.arr}  ${cur}\n` +
          `${S.divider}\n  ${S.sub}  ${ctx.prefix}goodbye on  to enable\n  ${S.sub}  ${ctx.prefix}goodbye off  to disable\n  ${S.sub}  ${ctx.prefix}goodbye <text>  to set\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}goodbye off`, text: '⏸ Turn off' },
          { id: `${ctx.prefix}goodbye Goodbye @user. We continue.`, text: '↺ Default' },
        ],
      }, ctx.msg);
    }

    if (arg.toLowerCase() === 'off') {
      groups[ctx.from] = { ...g, goodbyeOn: false };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Goodbye messages disabled.`);
    }
    if (arg.toLowerCase() === 'on') {
      groups[ctx.from] = { ...g, goodbyeOn: true };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Goodbye messages enabled.`);
    }

    groups[ctx.from] = { ...g, goodbye: arg, goodbyeOn: true };
    store.set('groups', groups);
    await reply(ctx.sock, ctx, `${S.check} Goodbye message updated.`);
  },
};

/**
 * .antilink — toggle the antilink auto-delete feature.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'antilink',
  aliases: ['nolinks'],
  category: 'group',
  description: 'Toggle antilink. Usage: .antilink on|off|warn|kick',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Group-only command.`);
    const groups = store.get('groups');
    const g = groups[ctx.from] || {};
    const arg = (ctx.args[0] || '').toLowerCase();

    if (!arg) {
      const on = !!g.antilink;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Antilink  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n  ${S.sqr} Mode   ${S.arr}  ${g.antilinkMode || 'delete'}\n` +
          `${S.divider}\n  ${S.sub}  ${ctx.prefix}antilink on  enable + delete\n  ${S.sub}  ${ctx.prefix}antilink warn  enable + warn\n  ${S.sub}  ${ctx.prefix}antilink off  disable\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}antilink on`, text: '✓ On' },
          { id: `${ctx.prefix}antilink warn`, text: '⚠ Warn' },
          { id: `${ctx.prefix}antilink off`, text: '⏸ Off' },
        ],
      }, ctx.msg);
    }

    if (arg === 'on') {
      groups[ctx.from] = { ...g, antilink: true, antilinkMode: 'delete' };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Antilink ON  ${S.arr}  links will be deleted.`);
    }
    if (arg === 'warn') {
      groups[ctx.from] = { ...g, antilink: true, antilinkMode: 'warn' };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Antilink ON  ${S.arr}  warn + delete.`);
    }
    if (arg === 'off') {
      groups[ctx.from] = { ...g, antilink: false };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check} Antilink disabled.`);
    }
    return reply(ctx.sock, ctx, `${S.warn} Use on, warn, or off.`);
  },
};

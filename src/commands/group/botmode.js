/**
 * .bot — enable or disable the bot in the current group.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'bot',
  aliases: ['botmode', 'boton'],
  category: 'group',
  description: 'Enable or disable Mythos in this group',
  execute: async (ctx) => {
    if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn}  Group-only command.`);
    const arg = (ctx.args[0] || '').toLowerCase();
    const groups = store.get('groups');
    const g = groups[ctx.from] || {};

    if (!arg) {
      const on = g.botEnabled !== false;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Bot Mode  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
          `  ${S.sqr} Group  ${S.arr}  ${g.name || ctx.from}\n` +
          `${S.divider}\n` +
          `  ${S.sub}  ${ctx.prefix}bot on\n  ${S.sub}  ${ctx.prefix}bot off\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}bot on`, text: '▸ On' },
          { id: `${ctx.prefix}bot off`, text: '▸ Off' },
        ],
      }, ctx.msg);
    }
    if (arg === 'on') {
      groups[ctx.from] = { ...g, botEnabled: true };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check}  Mythos enabled in this group.`);
    }
    if (arg === 'off') {
      groups[ctx.from] = { ...g, botEnabled: false };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check}  Mythos disabled in this group.`);
    }
    return reply(ctx.sock, ctx, `${S.warn}  Use on or off.`);
  },
};

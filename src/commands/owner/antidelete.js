/**
 * .antidelete — toggle anti-delete message recovery.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'antidelete',
  aliases: ['recover'],
  category: 'owner',
  owner: true,
  description: 'Toggle anti-delete: recover and forward deleted messages',
  execute: async (ctx) => {
    if (!ctx.isGroup) {
      const arg = (ctx.args[0] || '').toLowerCase();
      if (!arg) {
        const bot = store.get('bot');
        const on = !!bot.antiDelete;
        return sendQuickReply(ctx.sock, ctx.from, {
          text:
            `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Anti-Delete  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
            `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
            `  ${S.dot} When someone deletes a message, Mythos notifies the group.\n` +
            `  ${S.dot} Enable per-group: ${ctx.prefix}antidelete on  (in the group)\n` +
            `  ${S.dot} Enable globally: ${ctx.prefix}antidelete global on\n` +
            `${S.divider}\n` +
            `  ${S.sub}  ${ctx.prefix}antidelete on\n  ${S.sub}  ${ctx.prefix}antidelete off\n  ${S.sub}  ${ctx.prefix}antidelete global on\n${S.brandLine}`,
          buttons: [
            { id: `${ctx.prefix}antidelete on`, text: '▸ On' },
            { id: `${ctx.prefix}antidelete off`, text: '▸ Off' },
            { id: `${ctx.prefix}antidelete global on`, text: '▸ Global On' },
          ],
        }, ctx.msg);
      }
      if (arg === 'global' && (ctx.args[1] || '').toLowerCase() === 'on') {
        store.update('bot', (b) => { b.antiDelete = true; });
        return reply(ctx.sock, ctx, `${S.check}  Anti-Delete enabled globally.`);
      }
      if (arg === 'global' && (ctx.args[1] || '').toLowerCase() === 'off') {
        store.update('bot', (b) => { b.antiDelete = false; });
        return reply(ctx.sock, ctx, `${S.check}  Anti-Delete disabled globally.`);
      }
      return reply(ctx.sock, ctx, `${S.warn}  Use on, off, or global on/off.`);
    }

    const arg = (ctx.args[0] || '').toLowerCase();
    if (!arg) {
      const groups = store.get('groups');
      const g = groups[ctx.from] || {};
      const on = !!g.antiDelete;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Anti-Delete  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
          `  ${S.sqr} Group   ${S.arr}  ${g.name || ctx.from}\n` +
          `${S.divider}\n` +
          `  ${S.sub}  ${ctx.prefix}antidelete on\n  ${S.sub}  ${ctx.prefix}antidelete off\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}antidelete on`, text: '▸ On' },
          { id: `${ctx.prefix}antidelete off`, text: '▸ Off' },
        ],
      }, ctx.msg);
    }
    const groups = store.get('groups');
    const g = groups[ctx.from] || {};
    if (arg === 'on') {
      groups[ctx.from] = { ...g, antiDelete: true };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check}  Anti-Delete enabled in this group.`);
    }
    if (arg === 'off') {
      groups[ctx.from] = { ...g, antiDelete: false };
      store.set('groups', groups);
      return reply(ctx.sock, ctx, `${S.check}  Anti-Delete disabled in this group.`);
    }
    return reply(ctx.sock, ctx, `${S.warn}  Use on or off.`);
  },
};

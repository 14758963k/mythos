/**
 * .reminders — list all pending reminders in the current chat.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const events = require('../../core/events');

const fmtDelay = (ms) => {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s) parts.push(`${s}s`);
  return parts.join(' ');
};

module.exports = {
  name: 'reminders',
  aliases: ['rmds', 'rmdlist'],
  category: 'utility',
  description: 'List pending reminders in this chat',
  execute: async (ctx) => {
    const list = events.listReminders(ctx.from);
    if (!list.length) {
      await reply(ctx.sock, ctx, `${S.warn}  No pending reminders. Use *${ctx.prefix}remind 5m take a break*.`);
      return;
    }
    const body = list
      .map((r, i) => `  ${i + 1}. ${r.message}\n     ${S.sub}  ${S.arr}  in ${fmtDelay(r.fireAt - Date.now())}  ${S.sqr}  ${r.id}`)
      .join('\n');
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Pending Reminders  ${S.arr}  ${list.length}\n${S.heavyBar}\n${body}\n${S.brandLine}`,
      buttons: list.slice(0, 3).map((r) => ({ id: `${ctx.prefix}delreminder ${r.id}`, text: `✗ ${r.message.slice(0, 18)}` })),
    }, ctx.msg);
  },
};

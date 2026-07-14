/**
 * .remind — set a reminder. Usage: .remind <duration> <text...>
 * Duration formats: 30s, 5m, 2h, 1d (or combinations like 1h30m).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const events = require('../../core/events');

const UNITS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const parse = (s) => {
  if (!s) return null;
  const re = /(\d+)\s*([smhd])/g;
  let m;
  let total = 0;
  let matched = 0;
  while ((m = re.exec(s)) !== null) {
    matched++;
    total += parseInt(m[1], 10) * UNITS[m[2]];
  }
  if (!matched) return null;
  return total;
};

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
  name: 'remind',
  aliases: ['reminder', 'rmd'],
  category: 'utility',
  description: 'Set a reminder. Usage: .remind <duration> <text>',
  execute: async (ctx) => {
    if (ctx.args.length < 2) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}remind 1h walk the dog* or *${ctx.prefix}remind 30m stretch*`);
      return;
    }
    const delay = parse(ctx.args[0]);
    if (!delay || delay < 1000 || delay > 30 * 24 * 60 * 60 * 1000) {
      await reply(ctx.sock, ctx, `${S.warn}  Bad duration. Use 30s, 5m, 2h, 1d (max 30d).`);
      return;
    }
    const text = ctx.args.slice(1).join(' ');
    const id = 'r_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const fireAt = Date.now() + delay;
    events.addReminder({ id, jid: ctx.from, user: ctx.participant, message: text, fireAt, createdAt: Date.now() });
    const stamp = new Date(fireAt).toISOString().slice(0, 16).replace('T', ' ');
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Reminder Set\n${S.heavyBar}\n` +
        `  ${S.sqr} Fires in   ${S.arr}  ${fmtDelay(delay)}\n  ${S.sqr} At         ${S.arr}  ${stamp} UTC\n  ${S.sqr} Message    ${S.arr}  ${text}\n  ${S.sqr} ID         ${S.arr}  ${id}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}reminders`, text: '▸ List' },
        { id: `${ctx.prefix}delreminder ${id}`, text: '✗ Cancel' },
      ],
    }, ctx.msg);
  },
};

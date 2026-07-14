/**
 * .time â€” current time with timezone selection.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const format = (tz) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());

const COMMON = [
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: 'New York' },
  { id: 'America/Los_Angeles', label: 'Los Angeles' },
  { id: 'Europe/London', label: 'London' },
  { id: 'Europe/Berlin', label: 'Berlin' },
  { id: 'Asia/Dubai', label: 'Dubai' },
  { id: 'Asia/Kolkata', label: 'Mumbai' },
  { id: 'Asia/Tokyo', label: 'Tokyo' },
  { id: 'Africa/Nairobi', label: 'Nairobi' },
  { id: 'Australia/Sydney', label: 'Sydney' },
];

module.exports = {
  name: 'time',
  aliases: ['clock'],
  category: 'utility',
  description: 'Show the current time in major cities',
  execute: async (ctx) => {
    const now = new Date();
    const utc = format('UTC');
    const local =
      Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
    const lines = COMMON.map((c) => `  ${S.sqr} ${c.label.padEnd(12, ' ')} ${S.arr}  ${format(c.id)}`).join('\n');
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  World Clock\n${S.heavyBar}\n` +
        `  ${S.dot} Local ${S.arr}  ${local}\n  ${S.dot} UTC   ${S.arr}  ${utc}\n${S.divider}\n${lines}\n${S.brandLine}`,
      buttons: COMMON.slice(0, 3).map((c) => ({ id: `${ctx.prefix}time ${c.id}`, text: `â–¸ ${c.label}` })),
    }, ctx.msg);
  },
};



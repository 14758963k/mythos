/**
 * .password â€” generate a strong random password.
 */

const crypto = require('crypto');
const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digit: '0123456789',
  sym: '!@#$%^&*()-_=+[]{};:,.<>?',
};

const gen = (len, sets) => {
  const all = sets.map((k) => SETS[k] || '').join('');
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += all[bytes[i] % all.length];
  return out;
};

module.exports = {
  name: 'password',
  aliases: ['pass', 'pwgen'],
  category: 'tools',
  description: 'Generate a password. Length optional. Default 16.',
  execute: async (ctx) => {
    const len = Math.min(128, Math.max(6, parseInt(ctx.args[0], 10) || 16));
    const pw = gen(len, ['lower', 'upper', 'digit', 'sym']);
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Password  ${S.arr}  ${len} chars\n${S.heavyBar}\n` +
        `  ${S.dot} ${pw}\n${S.divider}\n  ${S.warn}  Treat as secret. Sent in a quoted message so it does not scroll.\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}password ${len}`, text: 'â†» New' },
        { id: `${ctx.prefix}password 24`, text: 'â–¸ 24 chars' },
        { id: `${ctx.prefix}password 32`, text: 'â–¸ 32 chars' },
      ],
    }, ctx.msg);
  },
};



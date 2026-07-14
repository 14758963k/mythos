/**
 * .diag — full diagnostic dump. Owner only.
 * Shows connection state, effective prefix, owner status, last few users
 * and commands. The first command to run when "the bot doesn't reply".
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const config = require('../../config');
const store = require('../../core/store');
const loader = require('../../core/loader');
const log = require('../../core/logger');

module.exports = {
  name: 'diag',
  aliases: ['diagnostic', 'status2', 'health'],
  category: 'owner',
  owner: true,
  description: 'Full diagnostic dump. Run this if the bot seems unresponsive.',
  execute: async (ctx) => {
    const data = store.get('bot');
    const users = store.get('users');
    const groups = store.get('groups');
    const top = Object.entries(users)
      .sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0))
      .slice(0, 5)
      .map(([jid, u], i) => `  ${i + 1}. ${u.name || jid.split('@')[0]}  ${S.arr}  ${u.messages || 0}`)
      .join('\n') || `  ${S.warn}  no users yet`;

    const totalCmds = loader.all().length;
    const upMs = Date.now() - (data.startedAt || Date.now());
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date(upMs);
    const up = `${d.getUTCHours()}h ${pad(d.getUTCMinutes())}m ${pad(d.getUTCSeconds())}s`;

    let sockInfo = 'unknown';
    try {
      const me = ctx.sock.user || ctx.sock.authState?.creds?.me;
      sockInfo = me?.id || 'not connected';
    } catch (e) {
      sockInfo = 'err: ' + e.message;
    }

    const body =
      `  ${S.sqr} Connected     ${S.arr}  ${sockInfo}\n` +
      `  ${S.sqr} Prefix       ${S.arr}  ${data.prefix || config.bot.prefix}\n` +
      `  ${S.sqr} Owner JIDs   ${S.arr}  ${config.owner.jids.join(', ') || 'unset'}\n` +
      `  ${S.sqr} This chat    ${S.arr}  ${ctx.from}\n` +
      `  ${S.sqr} This user    ${S.arr}  ${ctx.participant}  (${ctx.isOwner ? 'is owner' : 'not owner'})\n` +
      `  ${S.sqr} Group chat   ${S.arr}  ${ctx.isGroup ? 'yes' : 'no'}\n` +
      `  ${S.sqr} Uptime       ${S.arr}  ${up}\n` +
      `  ${S.sqr} Commands     ${S.arr}  ${totalCmds} loaded, ${data.totalCommands || 0} run total\n` +
      `  ${S.sqr} Users seen   ${S.arr}  ${Object.keys(users).length}\n` +
      `  ${S.sqr} Groups seen  ${S.arr}  ${Object.keys(groups).length}\n` +
      `  ${S.sqr} Log file     ${S.arr}  ${log.file || '(disabled)'}\n` +
      `${S.divider}\n  ${S.dot} Top users\n${top}`;

    await reply(
      ctx.sock,
      ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Diagnostic  ${S.arr}  Mythos\n${S.heavyBar}\n${body}\n${S.brandLine}`
    );
  },
};

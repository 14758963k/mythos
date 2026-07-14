/**
 * .logs — tail the mythos.log file. Owner only.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const fs = require('fs');
const log = require('../../core/logger');

module.exports = {
  name: 'logs',
  aliases: ['log', 'tail'],
  category: 'owner',
  owner: true,
  description: 'Tail the last 20 lines of mythos.log',
  execute: async (ctx) => {
    const n = Math.min(50, parseInt(ctx.args[0], 10) || 20);
    if (!log.file) {
      await reply(ctx.sock, ctx, `${S.warn}  File logging is disabled. Set LOG_FILE in .env.`);
      return;
    }
    if (!fs.existsSync(log.file)) {
      await reply(ctx.sock, ctx, `${S.warn}  No log file yet at *${log.file}*.`);
      return;
    }
    try {
      const raw = fs.readFileSync(log.file, 'utf-8');
      const lines = raw.split('\n').filter(Boolean);
      const tail = lines.slice(-n).join('\n');
      const head = `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Last ${lines.length > n ? n : lines.length} log lines  ${S.arr}  ${log.file}\n${S.heavyBar}\n`;
      // WhatsApp has a 4096 char limit; trim if needed
      const max = 3500;
      const body = tail.length > max ? tail.slice(-max) + `\n  ${S.warn} (truncated)` : tail;
      await reply(ctx.sock, ctx, head + body + `\n${S.brandLine}`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};

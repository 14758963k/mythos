/**
 * .reload — hot-reload commands without restarting the bot (owner only).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const path = require('path');
const loader = require('../../core/loader');
const log = require('../../core/logger');

module.exports = {
  name: 'reload',
  aliases: ['rld'],
  category: 'owner',
  owner: true,
  description: 'Hot-reload all commands',
  execute: async (ctx) => {
    try {
      const before = loader.all().length;
      const count = loader.register(path.join(__dirname, '..', '..', 'commands'));
      const after = loader.all().length;
      log.info('commands reloaded', { before, after });
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Hot Reload\n${S.heavyBar}\n` +
          `  ${S.sqr} Before ${S.arr}  ${before}\n  ${S.sqr} After  ${S.arr}  ${count}\n` +
          `  ${S.sqr} Diff   ${S.arr}  ${after >= before ? '+' : ''}${after - before}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Reload failed: ${e.message}`);
    }
  },
};

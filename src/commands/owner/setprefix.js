/**
 * .setprefix â€” change the bot prefix at runtime.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');
const config = require('../../config');

module.exports = {
  name: 'setprefix',
  aliases: ['prefix'],
  category: 'owner',
  owner: true,
  description: 'Change the bot command prefix',
  execute: async (ctx) => {
    const p = (ctx.args[0] || '').trim();
    if (!p || p.length > 3) {
      await reply(ctx.sock, ctx, `${S.warn}  Pass exactly one character. Example: *${ctx.prefix}setprefix !*`);
      return;
    }
    store.update('bot', (b) => {
      b.prefix = p;
    });
    config.bot.prefix = p;
    await reply(ctx.sock, ctx, `${S.check} Prefix updated to *${p}* for this session.`);
  },
};



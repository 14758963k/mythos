/**
 * .about â€” short intro to Mythos.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const config = require('../../config');

module.exports = {
  name: 'about',
  aliases: ['info', 'intro'],
  category: 'core',
  description: 'Short introduction to Mythos',
  execute: async (ctx) => {
    await reply(
      ctx.sock,
      ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${S.brandSub}\n${S.heavyBar}\n` +
        `  ${S.dot} ${S.brand} Mythos âŸ Ascendant is a WhatsApp bot built on\n` +
        `    ${S.arr} ${S.bolt} @itsliaaa/baileys\n` +
        `  ${S.dot} Version ${S.brand} ${config.bot.version}\n` +
        `  ${S.dot} ${S.heart} Made for expressive menus, lists, and buttons.\n` +
        `${S.divider}\n  ${S.sparkle} Reply *${ctx.prefix}menu* to begin.\n${S.brandLine}`
    );
  },
};


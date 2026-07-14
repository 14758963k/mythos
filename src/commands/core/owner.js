/**
 * .owner â€” send the owner's contact card.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const config = require('../../config');

module.exports = {
  name: 'owner',
  aliases: ['creator', 'author'],
  category: 'core',
  description: 'Show the owner contact',
  execute: async (ctx) => {
    if (!config.owner.jids.length) {
      await reply(ctx.sock, ctx, `${S.warn}  No owner configured. Set OWNER_JIDS in .env.`);
      return;
    }
    const ownerJid = config.owner.jids[0];
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${S.brand} Mythos Owner\n` +
      `ORG:Mythos âŸ Ascendant\n` +
      `TEL;type=CELL;type=VOICE;waid=${config.owner.number || ''}:${config.owner.number || ''}\n` +
      'END:VCARD';
    await ctx.sock.sendMessage(
      ctx.from,
      { contacts: { displayName: 'Mythos Owner', contacts: [{ vcard }] } },
      { quoted: ctx.msg }
    );
  },
};



/**
 * .start — pure startup card, no picker. Useful for first contact / wake.
 */

const { sendText } = require('../../helpers/messages');
const { startupCard } = require('../../helpers/interactive');
const store = require('../../core/store');
const loader = require('../../core/loader');

module.exports = {
  name: 'start',
  aliases: ['hello', 'hi', 'welcome'],
  category: 'core',
  description: 'Show the startup card (USER INFO + BOT STATUS)',
  execute: async (ctx) => {
    const total = loader.all().length;
    const card = startupCard({
      pushName: ctx.pushName,
      participant: ctx.participant,
      isOwner: ctx.isOwner,
      totalCommands: total,
      startedAt: store.get('bot').startedAt || Date.now(),
      phone: ctx.phone,
    });
    await sendText(ctx.sock, ctx.from, card.text, { mentions: card.mentions });
  },
};

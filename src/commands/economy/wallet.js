/**
 * .wallet — check your coin balance.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy } = require('../../helpers/economy');

module.exports = {
  name: 'wallet',
  aliases: ['balance', 'money', 'coins'],
  category: 'economy',
  description: 'Check your coin balance',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const eco = getEconomy(userId);
    await reply(ctx.sock, ctx, `${S.brand}  *${ctx.pushName || 'User'}*'s wallet:\n  ${S.sub}  Wallet: ${eco.wallet.toLocaleString()} coins\n  ${S.sub}  Bank: ${eco.bank.toLocaleString()} / ${eco.capacity.toLocaleString()} coins`);
  },
};

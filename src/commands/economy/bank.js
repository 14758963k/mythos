/**
 * .bank — check your bank balance.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy } = require('../../helpers/economy');

module.exports = {
  name: 'bank',
  aliases: ['bankinfo', 'bankbalance'],
  category: 'economy',
  description: 'Check your bank balance and capacity',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const eco = getEconomy(userId);
    await reply(ctx.sock, ctx, `${S.brand}  *${ctx.pushName || 'User'}*'s bank:\n  ${S.sub}  Bank: ${eco.bank.toLocaleString()} / ${eco.capacity.toLocaleString()} coins\n  ${S.sub}  Capacity upgrades: ${eco.level - 1}`);
  },
};

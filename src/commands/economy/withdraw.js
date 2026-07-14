/**
 * .withdraw — withdraw coins from bank to wallet.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, withdrawCoins } = require('../../helpers/economy');

module.exports = {
  name: 'withdraw',
  aliases: ['wd'],
  category: 'economy',
  description: 'Withdraw coins from bank to wallet',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn}  Provide an amount.\n  ${S.sub}  ${ctx.prefix}withdraw 500`);
    const eco = getEconomy(userId);
    if (eco.bank < amount) return reply(ctx.sock, ctx, `${S.cross}  Insufficient bank balance. You have ${eco.bank.toLocaleString()} coins in bank.`);
    const result = withdrawCoins(userId, amount);
    if (!result) return reply(ctx.sock, ctx, `${S.cross}  Withdraw failed.`);
    await reply(ctx.sock, ctx, `${S.brand}  Withdrew ${amount.toLocaleString()} coins!\n  ${S.sub}  Wallet: ${result.wallet.toLocaleString()}\n  ${S.sub}  Bank: ${result.bank.toLocaleString()} / ${result.capacity.toLocaleString()}`);
  },
};

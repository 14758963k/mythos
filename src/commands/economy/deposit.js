/**
 * .deposit — deposit coins from wallet to bank.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, depositCoins } = require('../../helpers/economy');

module.exports = {
  name: 'deposit',
  aliases: ['dep'],
  category: 'economy',
  description: 'Deposit coins from wallet to bank',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn}  Provide an amount.\n  ${S.sub}  ${ctx.prefix}deposit 500`);
    const eco = getEconomy(userId);
    if (eco.wallet < amount) return reply(ctx.sock, ctx, `${S.cross}  Insufficient wallet balance. You have ${eco.wallet.toLocaleString()} coins.`);
    if (eco.bank + amount > eco.capacity) {
      return reply(ctx.sock, ctx, `${S.cross}  Bank full! Capacity: ${eco.capacity.toLocaleString()} coins. Use *${ctx.prefix}capacity* to upgrade.`);
    }
    const result = depositCoins(userId, amount);
    if (!result) return reply(ctx.sock, ctx, `${S.cross}  Deposit failed.`);
    await reply(ctx.sock, ctx, `${S.brand}  Deposited ${amount.toLocaleString()} coins!\n  ${S.sub}  Wallet: ${result.wallet.toLocaleString()}\n  ${S.sub}  Bank: ${result.bank.toLocaleString()} / ${result.capacity.toLocaleString()}`);
  },
};

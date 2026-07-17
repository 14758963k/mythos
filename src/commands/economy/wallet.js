/**
 * .wallet — check your coin balance.
 */

const { reply } = require('../../helpers/messages');
const { S, header, row, footer, progress } = require('../../helpers/formatter');
const { getEconomy } = require('../../helpers/economy');

module.exports = {
  name: 'wallet',
  aliases: ['balance', 'money', 'coins'],
  category: 'economy',
  description: 'Check your coin balance',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const eco = getEconomy(userId);
    const netWorth = eco.wallet + eco.bank;
    const bankPct = eco.capacity > 0 ? eco.bank / eco.capacity : 0;
    const bar = progress(bankPct, 12);
    const text =
      `${header(`Wallet ${S.arr} ${ctx.pushName || 'User'}`)}\n\n` +
      `${row('Wallet', `${eco.wallet.toLocaleString()} coins`)}\n` +
      `${row('Bank', `${eco.bank.toLocaleString()} / ${eco.capacity.toLocaleString()}`)}\n` +
      `  ${S.sqr} Usage  ${S.arr} ${bar} ${Math.round(bankPct * 100)}%\n` +
      `${row('Net Worth', `*${netWorth.toLocaleString()}* coins`)}\n\n` +
      `${footer(`${ctx.prefix}daily  ${S.dot}  ${ctx.prefix}deposit  ${S.dot}  ${ctx.prefix}withdraw`)}`;
    await reply(ctx.sock, ctx, text);
  },
};

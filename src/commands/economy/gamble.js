/**
 * .gamble — gamble coins (50/50 chance to double or lose).
 */

const { reply } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const { getEconomy, removeCoins, addCoins } = require('../../helpers/economy');

module.exports = {
  name: 'gamble',
  aliases: ['bet'],
  category: 'economy',
  description: 'Gamble your coins (50/50 to double or lose)',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn} Provide an amount to gamble.\n${S.sub} ${ctx.prefix}gamble 100`);
    const eco = getEconomy(userId);
    if (eco.wallet < amount) return reply(ctx.sock, ctx, `${S.cross} Insufficient wallet balance. You have ${eco.wallet.toLocaleString()} coins.`);

    const won = Math.random() < 0.5;
    if (won) {
      addCoins(userId, amount);
      const newEco = getEconomy(userId);
      await reply(ctx.sock, ctx,
        `${header('Gamble')}\n\n` +
        `${S.sqr} ${S.check} *You won!*\n` +
        `${row('Won', `+${amount.toLocaleString()} coins`)}\n` +
        `${row('Wallet', `${newEco.wallet.toLocaleString()} coins`)}\n\n` +
        `${footer()}`
      );
    } else {
      removeCoins(userId, amount);
      const newEco = getEconomy(userId);
      await reply(ctx.sock, ctx,
        `${header('Gamble')}\n\n` +
        `${S.sqr} ${S.cross} *You lost!*\n` +
        `${row('Lost', `−${amount.toLocaleString()} coins`)}\n` +
        `${row('Wallet', `${newEco.wallet.toLocaleString()} coins`)}\n\n` +
        `${footer()}`
      );
    }
  },
};

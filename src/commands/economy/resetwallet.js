/**
 * .resetwallet — reset your economy (dangerous!).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, saveEconomy } = require('../../helpers/economy');

module.exports = {
  name: 'resetwallet',
  aliases: ['reseteco', 'resetbalance'],
  category: 'economy',
  description: 'Reset your economy balance (dangerous!)',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const eco = getEconomy(userId);
    if (eco.wallet === 0 && eco.bank === 0) {
      return reply(ctx.sock, ctx, `${S.info}  Your wallet is already empty.`);
    }
    saveEconomy(userId, { wallet: 0, bank: 0, capacity: 1000, level: 1 });
    await reply(ctx.sock, ctx, `${S.brand}  Economy reset. All coins lost.`);
  },
};

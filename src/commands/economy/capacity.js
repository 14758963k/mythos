/**
 * .capacity — upgrade your bank capacity.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, saveEconomy } = require('../../helpers/economy');

const CAPACITY_COST = 1000;
const CAPACITY_GAIN = 500;

module.exports = {
  name: 'capacity',
  aliases: ['bankupgrade', 'upgrade'],
  category: 'economy',
  description: 'Upgrade your bank storage capacity',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const eco = getEconomy(userId);
    if (eco.wallet < CAPACITY_COST) {
      return reply(ctx.sock, ctx, `${S.cross}  Not enough coins. Need ${CAPACITY_COST.toLocaleString()} coins to upgrade.`);
    }
    eco.wallet -= CAPACITY_COST;
    eco.capacity += CAPACITY_GAIN;
    eco.level += 1;
    saveEconomy(userId, eco);
    await reply(ctx.sock, ctx, `${S.brand}  Bank upgraded!\n  ${S.sub}  Capacity: ${eco.capacity.toLocaleString()} coins\n  ${S.sub}  Cost: ${CAPACITY_COST.toLocaleString()} coins\n  ${S.sub}  Level: ${eco.level}`);
  },
};

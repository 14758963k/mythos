/**
 * .daily — claim daily reward.
 */

const { reply } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const store = require('../../core/store');

const DAILY_AMOUNT = 500;

module.exports = {
  name: 'daily',
  aliases: ['claim', 'dailyreward'],
  category: 'economy',
  description: 'Claim your daily coin reward',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const lastDaily = store.get('lastDaily') || {};
    const now = Date.now();
    const last = lastDaily[userId] || 0;
    if (now - last < 24 * 60 * 60 * 1000) {
      const remaining = 24 * 60 * 60 * 1000 - (now - last);
      const hours = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      return reply(ctx.sock, ctx,
        `${header('Daily Reward')}\n\n` +
        `${S.sqr} Already claimed\n` +
        `${S.sub} Next in ${hours}h ${mins}m\n\n` +
        `${footer()}`
      );
    }
    const { addCoins } = require('../../helpers/economy');
    const eco = addCoins(userId, DAILY_AMOUNT);
    lastDaily[userId] = now;
    store.set('lastDaily', lastDaily);
    await reply(ctx.sock, ctx,
      `${header('Daily Reward')}\n\n` +
      `${row('Claimed', `+${DAILY_AMOUNT} coins`)}\n` +
      `${row('Wallet', `${eco.wallet.toLocaleString()} coins`)}\n\n` +
      `${footer()}`
    );
  },
};

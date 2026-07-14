/**
 * .slot — slot machine minigame.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, removeCoins, addCoins } = require('../../helpers/economy');

const SLOTS = [' cherries', ' lemons', ' oranges', ' grapes', ' watermelons', ' diamonds', ' sevens'];

module.exports = {
  name: 'slot',
  aliases: ['slots', 'slotmachine'],
  category: 'economy',
  description: 'Play the slot machine',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn}  Provide a bet amount.\n  ${S.sub}  ${ctx.prefix}slot 100`);
    const eco = getEconomy(userId);
    if (eco.wallet < amount) return reply(ctx.sock, ctx, `${S.cross}  Insufficient wallet balance. You have ${eco.wallet.toLocaleString()} coins.`);
    const s1 = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const s2 = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const s3 = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    let win = false;
    let multiplier = 0;
    if (s1 === s2 && s2 === s3) {
      win = true;
      multiplier = s1 === ' sevens' ? 10 : s1 === ' diamonds' ? 5 : 3;
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      win = true;
      multiplier = 2;
    }
    if (win) {
      const winAmount = amount * multiplier;
      addCoins(userId, winAmount);
      const newEco = getEconomy(userId);
      await reply(ctx.sock, ctx, `${S.brand}  [ ${s1} | ${s2} | ${s3} ]\n  ${S.sub}  You won ${winAmount.toLocaleString()} coins (x${multiplier})!\n  ${S.sub}  Wallet: ${newEco.wallet.toLocaleString()} coins`);
    } else {
      removeCoins(userId, amount);
      const newEco = getEconomy(userId);
      await reply(ctx.sock, ctx, `${S.cross}  [ ${s1} | ${s2} | ${s3} ]\n  ${S.sub}  You lost ${amount.toLocaleString()} coins.\n  ${S.sub}  Wallet: ${newEco.wallet.toLocaleString()} coins`);
    }
  },
};

/**
 * .slot — slot machine minigame.
 */

const { reply } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const { getEconomy, removeCoins, addCoins } = require('../../helpers/economy');

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🍉', '💎', '7️⃣'];
const NAMES = { '🍒': 'Cherries', '🍋': 'Lemons', '🍊': 'Oranges', '🍇': 'Grapes', '🍉': 'Watermelon', '💎': 'Diamonds', '7️⃣': 'Sevens' };

module.exports = {
  name: 'slot',
  aliases: ['slots', 'slotmachine'],
  category: 'economy',
  description: 'Play the slot machine',
  execute: async (ctx) => {
    const userId = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn} Provide an amount to bet.\n${S.sub} ${ctx.prefix}slot 100`);
    const eco = getEconomy(userId);
    if (eco.wallet < amount) return reply(ctx.sock, ctx, `${S.cross} Insufficient wallet balance. You have ${eco.wallet.toLocaleString()} coins.`);

    const r1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const r2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const r3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    let win = false;
    let multiplier = 0;
    if (r1 === r2 && r2 === r3) {
      win = true;
      multiplier = r1 === '7️⃣' ? 10 : r1 === '💎' ? 5 : 3;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      win = true;
      multiplier = 2;
    }

    if (win) {
      const winAmount = amount * multiplier;
      addCoins(userId, winAmount);
      const newEco = getEconomy(userId);
      await reply(ctx.sock, ctx,
        `${header('Slot Machine')}\n\n` +
        `    ${r1} │ ${r2} │ ${r3}\n` +
        `${S.heavyBar}\n` +
        `${row('Result', `*${multiplier === 3 ? 'Three match' : 'Two match'}!*`)}\n` +
        `${row('Won', `+${winAmount.toLocaleString()} coins (x${multiplier})`)}\n` +
        `${row('Wallet', `${newEco.wallet.toLocaleString()} coins`)}\n\n` +
        `${footer()}`
      );
    } else {
      removeCoins(userId, amount);
      const newEco = getEconomy(userId);
      await reply(ctx.sock, ctx,
        `${header('Slot Machine')}\n\n` +
        `    ${r1} │ ${r2} │ ${r3}\n` +
        `${S.heavyBar}\n` +
        `${row('Result', '*No match*')}\n` +
        `${row('Lost', `−${amount.toLocaleString()} coins`)}\n` +
        `${row('Wallet', `${newEco.wallet.toLocaleString()} coins`)}\n\n` +
        `${footer()}`
      );
    }
  },
};

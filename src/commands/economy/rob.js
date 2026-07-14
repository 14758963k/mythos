/**
 * .rob — attempt to rob another user.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, removeCoins, addCoins } = require('../../helpers/economy');

module.exports = {
  name: 'rob',
  aliases: ['steal'],
  category: 'economy',
  description: 'Attempt to rob another user (risky!)',
  execute: async (ctx) => {
    const sender = ctx.sender;
    const target = ctx.mentionedJid?.[0] || (ctx.quoted?.sender);
    if (!target) return reply(ctx.sock, ctx, `${S.warn}  Mention a user to rob.\n  ${S.sub}  ${ctx.prefix}rob @user`);
    if (target === sender) return reply(ctx.sock, ctx, `${S.cross}  You cannot rob yourself.`);
    const robChance = Math.random();
    const senderEco = getEconomy(sender);
    const targetEco = getEconomy(target);
    if (targetEco.wallet < 100) return reply(ctx.sock, ctx, `${S.cross}  Target is too poor to rob (min 100 coins).`);
    if (robChance < 0.4) {
      const stolen = Math.floor(Math.random() * Math.min(targetEco.wallet, 500)) + 50;
      removeCoins(target, stolen);
      addCoins(sender, stolen);
      await reply(ctx.sock, ctx, `${S.brand}  Robbery successful!\n  ${S.sub}  Stolen: ${stolen.toLocaleString()} coins from @${target.split('@')[0]}`, [target]);
    } else {
      const fine = Math.floor(Math.random() * Math.min(senderEco.wallet, 300)) + 50;
      removeCoins(sender, fine);
      addCoins(target, fine);
      await reply(ctx.sock, ctx, `${S.cross}  Robbery failed! You were caught.\n  ${S.sub}  Fine: ${fine.toLocaleString()} coins paid to @${target.split('@')[0]}`, [target]);
    }
  },
};

/**
 * .give — give coins to another user from wallet.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { getEconomy, removeCoins, addCoins } = require('../../helpers/economy');

module.exports = {
  name: 'give',
  aliases: ['share'],
  category: 'economy',
  description: 'Give coins to another user',
  execute: async (ctx) => {
    const sender = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    const recipient = ctx.mentionedJid?.[0] || (ctx.quoted?.sender);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn}  Provide an amount and mention a user.\n  ${S.sub}  ${ctx.prefix}give 500 @user`);
    if (!recipient) return reply(ctx.sock, ctx, `${S.warn}  Mention a user to give to.\n  ${S.sub}  ${ctx.prefix}give 500 @user`);
    if (recipient === sender) return reply(ctx.sock, ctx, `${S.cross}  You cannot give to yourself.`);
    const eco = getEconomy(sender);
    if (eco.wallet < amount) return reply(ctx.sock, ctx, `${S.cross}  Insufficient wallet balance. You have ${eco.wallet.toLocaleString()} coins.`);
    removeCoins(sender, amount);
    addCoins(recipient, amount);
    await reply(ctx.sock, ctx, `${S.brand}  Gave ${amount.toLocaleString()} coins to @${recipient.split('@')[0]}!\n  ${S.sub}  Your wallet: ${eco.wallet.toLocaleString()} coins`, [recipient]);
  },
};

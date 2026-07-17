/**
 * .transfer — transfer coins to another user.
 */

const { reply } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const { getEconomy, removeCoins, addCoins } = require('../../helpers/economy');

module.exports = {
  name: 'transfer',
  aliases: ['pay', 'givecoins'],
  category: 'economy',
  description: 'Transfer coins to another user',
  execute: async (ctx) => {
    const sender = ctx.sender;
    const amount = parseInt(ctx.args[0], 10);
    const recipient = ctx.mentionedJid?.[0] || (ctx.quoted?.sender);
    if (!amount || amount <= 0) return reply(ctx.sock, ctx, `${S.warn} Provide an amount and mention a user.\n${S.sub} ${ctx.prefix}transfer 500 @user`);
    if (!recipient) return reply(ctx.sock, ctx, `${S.warn} Mention a user to transfer to.\n${S.sub} ${ctx.prefix}transfer 500 @user`);
    if (recipient === sender) return reply(ctx.sock, ctx, `${S.cross} You cannot transfer to yourself.`);
    const eco = getEconomy(sender);
    if (eco.wallet < amount) return reply(ctx.sock, ctx, `${S.cross} Insufficient wallet balance. You have ${eco.wallet.toLocaleString()} coins.`);
    removeCoins(sender, amount);
    addCoins(recipient, amount);
    const newEco = getEconomy(sender);
    await reply(ctx.sock, ctx,
      `${header('Transfer')}\n\n` +
      `${row('Sent', `−${amount.toLocaleString()} coins`)}\n` +
      `${row('To', `@${recipient.split('@')[0]}`)}\n` +
      `${row('Your Wallet', `${newEco.wallet.toLocaleString()} coins`)}\n\n` +
      `${footer()}`,
      { mentions: [recipient] }
    );
  },
};

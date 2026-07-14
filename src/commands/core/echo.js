/**
 * .echo — reply with whatever the user sends. Useful for confirming the
 * bot is receiving messages in a private chat. Also useful as a "no-prefix"
 * bridge: type ".echo hello" anywhere and the bot replies "hello".
 *
 * Open to everyone (not owner-only) so it doubles as a connectivity test.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'echo',
  aliases: ['say', 'repeat'],
  category: 'core',
  description: 'Reply with whatever you send. Use to confirm the bot is alive.',
  execute: async (ctx) => {
    const text = ctx.args.join(' ').trim() || (ctx.quoted?.message?.conversation || '');
    await reply(
      ctx.sock,
      ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Echo\n${S.heavyBar}\n  ${S.sqr} From   ${S.arr}  ${ctx.pushName}\n  ${S.sqr} Said   ${S.arr}  ${text || '(empty)'}\n  ${S.sqr} In     ${S.arr}  ${ctx.isGroup ? 'group' : 'private'}\n${S.divider}\n  ${S.heart}  Yes, the bot is alive.\n${S.brandLine}`
    );
  },
};

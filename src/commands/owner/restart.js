/**
 * .restart â€” restart the bot process. Owner only.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'restart',
  aliases: ['reboot', 'rs'],
  category: 'owner',
  owner: true,
  description: 'Restart the bot process',
  execute: async (ctx) => {
    await reply(ctx.sock, ctx, `${S.spin} Restarting Mythosâ€¦`);
    setTimeout(() => process.exit(0), 500);
  },
};



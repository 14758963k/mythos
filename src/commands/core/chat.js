/**
 * .chat — enter chat mode with Mythos AI.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'chat',
  aliases: ['chatmode', 'ask'],
  category: 'core',
  description: 'Start chatting with Mythos AI',
  execute: async (ctx) => {
    await reply(ctx.sock, ctx,
      `${S.brandLine}\n${S.ultraBar}\n` +
      `  Chat mode active.\n` +
      `  Just type anything and I will respond.\n` +
      `  Say "exit" or send a command to stop.\n` +
      `${S.brandLine}`
    );
  },
};

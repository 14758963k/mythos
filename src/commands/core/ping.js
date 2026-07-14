const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'ping',
  aliases: ['p'],
  category: 'core',
  description: 'Response time check',
  execute: async (ctx) => {
    const t0 = Date.now();
    const sent = await reply(ctx.sock, ctx, `${S.sub} Pinging\u2026`);
    const ms = Date.now() - t0;
    await reply(ctx.sock, ctx,
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Pong ${S.check} ${ms} ms\n${S.heavyBar}\n${S.divider}\n  ${S.dot} Socket round-trip measured in real-time.\n${S.brandLine}`
    );
  },
};



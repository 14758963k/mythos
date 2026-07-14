/**
 * .broadcast â€” send a message to all known private chats.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = {
  name: 'broadcast',
  aliases: ['bc', 'announce'],
  category: 'owner',
  owner: true,
  description: 'Broadcast a message to all known private chats',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Provide a message.`);
      return;
    }
    const users = Object.keys(store.get('users')).filter((j) => j.endsWith('@s.whatsapp.net'));
    if (!users.length) {
      await reply(ctx.sock, ctx, `${S.warn}  No known private chats yet.`);
      return;
    }
    let ok = 0;
    let fail = 0;
    for (const j of users) {
      try {
        await ctx.sock.sendMessage(j, { text });
        ok += 1;
      } catch {
        fail += 1;
      }
    }
    await reply(ctx.sock, ctx, `${S.brandLine}\n${S.sub}  Broadcast complete\n${S.heavyBar}\n  ${S.check} Sent ${ok}\n  ${S.cross} Failed ${fail}\n${S.brandLine}`);
  },
};



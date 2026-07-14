/**
 * .profile â€” view your own or the current chat profile picture at full size.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'profile',
  aliases: ['mypp', 'av'],
  category: 'media',
  description: 'Show your own profile picture',
  execute: async (ctx) => {
    const target = ctx.isGroup ? ctx.participant : ctx.from;
    try {
      const url = await ctx.sock.profilePictureUrl(target, 'image').catch(() => null);
      if (!url) {
        await reply(ctx.sock, ctx, `${S.warn}  No profile picture or hidden by privacy.`);
        return;
      }
      await sendImage(ctx.sock, ctx.from, {
        image: { url },
        caption: `${S.brandLine}\n${S.sub}  Your profile picture\n${S.brandLine}`,
      }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



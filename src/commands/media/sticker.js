/**
 * .sticker â€” convert a quoted image to a WebP sticker.
 */

const { reply, sendSticker, downloadQuotedMedia } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  category: 'media',
  description: 'Convert a quoted image to a sticker',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.imageMessage) {
      await reply(ctx.sock, ctx, `${S.warn}  Quote an image, then run *${ctx.prefix}sticker*.`);
      return;
    }
    try {
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) throw new Error('Could not download media');
      await sendSticker(ctx.sock, ctx.from, buf, ctx.msg, { pack: 'Mythos âŸ Ascendant', author: 'Mythos' });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



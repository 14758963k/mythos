/**
 * .toimg â€” convert a quoted sticker back to image.
 */

const { reply, sendImage, downloadQuotedMedia } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'toimg',
  aliases: ['toimage', 'unsticker'],
  category: 'media',
  description: 'Convert a quoted sticker to image',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.stickerMessage) {
      await reply(ctx.sock, ctx, `${S.warn}  Quote a sticker, then run *${ctx.prefix}toimg*.`);
      return;
    }
    try {
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) throw new Error('Could not download sticker');
      await sendImage(ctx.sock, ctx.from, {
        image: buf,
        caption: `${S.brandLine}\n${S.sub}  Sticker converted to image\n${S.brandLine}`,
      }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



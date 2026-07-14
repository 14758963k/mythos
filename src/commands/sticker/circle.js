/**
 * .circle — make a circle-cropped sticker from quoted image.
 */

const { reply, downloadQuotedMedia, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'circle',
  aliases: ['circlesticker', 'cs'],
  category: 'sticker',
  description: 'Make a circle-cropped sticker from a quoted image',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.imageMessage) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote an image, then run *${ctx.prefix}circle*.`);
    }
    try {
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the image.`);
      const { Sticker, StickerTypes } = require('wa-sticker-formatter');
      const sticker = new Sticker(buf, {
        pack: 'Mythos', author: 'Circle',
        type: StickerTypes.CIRCLE,
        categories: [' circle'], quality: 75,
      });
      const out = await sticker.toBuffer();
      await ctx.sock.sendMessage(ctx.from, { sticker: out }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Failed: ${e.message}`);
    }
  },
};

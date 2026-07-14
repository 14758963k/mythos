/**
 * .steal — steal a sticker with custom pack/author name.
 */

const { reply, downloadQuotedMedia, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'steal',
  aliases: ['take', 'stickerto'],
  category: 'sticker',
  description: 'Steal/rebrand a sticker with custom pack|author',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.stickerMessage) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote a sticker, then run *${ctx.prefix}steal pack|author*.`);
    }
    try {
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the sticker.`);
      const parts = (ctx.args.join(' ') || 'Mythos|Steal').split('|');
      const pack = parts[0] || 'Mythos';
      const author = parts[1] || 'Steal';
      const { Sticker, StickerTypes } = require('wa-sticker-formatter');
      const sticker = new Sticker(buf, {
        pack, author,
        type: StickerTypes.FULL,
        categories: [' steal'], quality: 75,
      });
      const out = await sticker.toBuffer();
      await ctx.sock.sendMessage(ctx.from, { sticker: out }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Failed: ${e.message}`);
    }
  },
};

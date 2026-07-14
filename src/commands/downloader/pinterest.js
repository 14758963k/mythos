/**
 * .pinterest — download images from Pinterest.
 */

const { reply, sendImage, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'pinterest',
  aliases: ['pin', 'pint'],
  category: 'downloader',
  description: 'Search and download images from Pinterest',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a search term.\n  ${S.sub}  ${ctx.prefix}pinterest cats`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Searching Pinterest: *${query}*...`);
      const { data } = await axios.get(`https://api.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&access_token=undefined`);
      if (!data || !data.data || data.data.length === 0) {
        return reply(ctx.sock, ctx, `${S.cross}  No images found.`);
      }
      const pin = data.data[0];
      const imageUrl = pin.image?.original?.url || pin.images?.orig?.url;
      if (!imageUrl) return reply(ctx.sock, ctx, `${S.cross}  Could not get image URL.`);
      const { data: imgBuf } = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      await sendImage(ctx.sock, ctx.from, { image: Buffer.from(imgBuf), caption: `${S.brand}  *${query}*` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Pinterest failed: ${e.message}`);
    }
  },
};

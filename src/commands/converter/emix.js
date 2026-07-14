/**
 * .emix — mix two emojis into a combined sticker.
 */

const { reply, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'emix',
  aliases: ['emojimix'],
  category: 'converter',
  description: 'Mix two emojis into a combined sticker',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text || !text.includes(',')) {
      return reply(ctx.sock, ctx, `${S.warn}  Provide two emojis separated by comma.\n  ${S.sub}  ${ctx.prefix}emix 😅,🤔`);
    }
    const [emoji1, emoji2] = text.split(',').map((e) => e.trim());
    if (!emoji1 || !emoji2) return reply(ctx.sock, ctx, `${S.warn}  Provide two valid emojis.`);
    try {
      const { data } = await axios.get(
        `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`
      );
      if (!data.results || !data.results.length) return reply(ctx.sock, ctx, `${S.cross}  Could not mix those emojis.`);
      const imgUrl = data.results[0].url;
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      await sendSticker(ctx.sock, ctx.from, Buffer.from(response.data), ctx.msg, { pack: 'Mythos', author: 'Emoji Mix' });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Emoji mix failed: ${e.message}`);
    }
  },
};

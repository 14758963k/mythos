/**
 * Sticker metadata commands — info, emojimix improvements.
 */

const { reply, downloadQuotedMedia, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = [
  {
    name: 'stickerinfo',
    aliases: ['stinfo', 'stickerdata'],
    category: 'sticker',
    description: 'Get sticker metadata',
    execute: async (ctx) => {
      if (!ctx.quoted || !ctx.quoted.message?.stickerMessage) {
        return reply(ctx.sock, ctx, `${S.warn} Quote a sticker to get its info.`);
      }
      const sticker = ctx.quoted.message.stickerMessage;
      const info = [];
      if (sticker.pack) info.push(`Pack: ${sticker.pack}`);
      if (sticker.author) info.push(`Author: ${sticker.author}`);
      if (sticker.fileSha256) info.push(`SHA256: ${Buffer.from(sticker.fileSha256).toString('hex').slice(0, 16)}...`);
      if (sticker.fileLength) info.push(`Size: ${(parseInt(sticker.fileLength) / 1024).toFixed(1)} KB`);
      if (sticker.height) info.push(`Dimensions: ${sticker.width}x${sticker.height}`);
      if (sticker.mimetype) info.push(`Type: ${sticker.mimetype}`);
      if (sticker.isAnimated) info.push(`Animated: Yes`);

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Sticker Info\n${S.heavyBar}\n` +
        info.map(i => `  ${S.dot} ${i}`).join('\n') +
        `\n${S.brandLine}`
      );
    },
  },
  {
    name: 'emojimix2',
    aliases: ['mix2', 'emojimixup'],
    category: 'sticker',
    description: 'Mix two emoji into a sticker',
    execute: async (ctx) => {
      const emojis = ctx.args.join(' ').split(/[+\s]/).filter(Boolean);
      if (emojis.length < 2) {
        return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}emojimix2 😀+😍*`);
      }
      try {
        await reply(ctx.sock, ctx, `${S.info} Mixing emojis...`);
        const e1 = encodeURIComponent(emojis[0]);
        const e2 = encodeURIComponent(emojis[1]);
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${e1}_${e2}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        const results = data.results;
        if (!results || !results.length) {
          return reply(ctx.sock, ctx, `${S.cross} Could not mix those emojis.`);
        }
        const imgUrl = results[0]?.media_formats?.png_transparent?.url;
        if (!imgUrl) return reply(ctx.sock, ctx, `${S.cross} No mix found for those emojis.`);

        const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        await sendSticker(ctx.sock, ctx.from, Buffer.from(imgRes.data), ctx.msg, { pack: 'Mythos', author: 'Emoji Mix' });
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Emoji mix failed: ${e.message}`);
      }
    },
  },
];

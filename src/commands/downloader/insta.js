/**
 * .insta — download Instagram post/reel/story.
 */

const { reply, sendVideo, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'insta',
  aliases: ['ig', 'igdl'],
  category: 'downloader',
  description: 'Download an Instagram post, reel, or story',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide an Instagram URL.\n  ${S.sub}  ${ctx.prefix}insta https://instagram.com/p/...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Fetching Instagram content...`);
      const { data } = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=hematpintar&url=${encodeURIComponent(url)}`);
      if (!data || !data.result || data.result.length === 0) {
        return reply(ctx.sock, ctx, `${S.cross}  Could not fetch the content.`);
      }
      const media = data.result[0];
      if (media.type === 'video') {
        const { data: videoBuf } = await axios.get(media.url, { responseType: 'arraybuffer' });
        await sendVideo(ctx.sock, ctx.from, { video: Buffer.from(videoBuf), caption: `${S.brand}  Instagram video` }, { quoted: ctx.msg });
      } else {
        const { data: imgBuf } = await axios.get(media.url, { responseType: 'arraybuffer' });
        await sendImage(ctx.sock, ctx.from, { image: Buffer.from(imgBuf), caption: `${S.brand}  Instagram image` }, { quoted: ctx.msg });
      }
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Instagram failed: ${e.message}`);
    }
  },
};

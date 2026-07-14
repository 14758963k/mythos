/**
 * .fb — download from Facebook link.
 */

const { reply, sendVideo } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'fb',
  aliases: ['facebook', 'fbdl'],
  category: 'downloader',
  description: 'Download a video from Facebook',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a Facebook URL.\n  ${S.sub}  ${ctx.prefix}fb https://facebook.com/...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Fetching Facebook video...`);
      const { data } = await axios.get(`https://api.lolhuman.xyz/api/facebook?apikey=hematpintar&url=${encodeURIComponent(url)}`);
      if (!data || !data.result) {
        return reply(ctx.sock, ctx, `${S.cross}  Could not fetch the video.`);
      }
      const { data: videoBuf } = await axios.get(data.result, { responseType: 'arraybuffer' });
      await sendVideo(ctx.sock, ctx.from, { video: Buffer.from(videoBuf), caption: `${S.brand}  Facebook video` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Facebook failed: ${e.message}`);
    }
  },
};

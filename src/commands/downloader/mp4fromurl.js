/**
 * .mp4fromurl — download a direct MP4 link.
 */

const { reply, sendVideo, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'mp4fromurl',
  aliases: ['getvid', 'dlurl'],
  category: 'downloader',
  description: 'Download a video from a direct MP4 URL',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a direct video URL.\n  ${S.sub}  ${ctx.prefix}mp4fromurl https://example.com/video.mp4`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Downloading video...`);
      const { headers } = await axios.head(url);
      const contentType = headers['content-type'] || '';
      const contentLength = parseInt(headers['content-length'] || '0', 10);
      if (contentLength > 100 * 1024 * 1024) {
        return reply(ctx.sock, ctx, `${S.warn}  File too large (max 100 MB).`);
      }
      const { data: videoBuf } = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000 });
      const isVideo = contentType.startsWith('video/');
      if (isVideo) {
        await sendVideo(ctx.sock, ctx.from, { video: Buffer.from(videoBuf), caption: `${S.brand}  Video from URL` }, { quoted: ctx.msg });
      } else {
        await sendDocument(ctx.sock, ctx.from, { document: Buffer.from(videoBuf), fileName: url.split('/').pop() || 'download', mimetype: contentType || 'application/octet-stream', caption: `${S.brand}  File from URL` }, { quoted: ctx.msg });
      }
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Download failed: ${e.message}`);
    }
  },
};

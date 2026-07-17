/**
 * .ytmp4 — download YouTube video as MP4.
 */

const { reply, sendVideo } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ytmp4',
  aliases: ['ytvideo'],
  category: 'downloader',
  description: 'Download a YouTube video as MP4',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a YouTube URL.\n  ${S.sub}  ${ctx.prefix}ytmp4 https://youtube.com/watch?v=...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Downloading MP4...`);
      const tmpOut = path.join(process.env.TEMP || '/tmp', `ytmp4_${Date.now()}.mp4`);
      execSync(`yt-dlp -f "best[ext=mp4]" -o "${tmpOut}" "${url}"`, { timeout: 120000 });
      const buf = fs.readFileSync(tmpOut);
      fs.unlinkSync(tmpOut);
      await sendVideo(ctx.sock, ctx.from, { video: buf, caption: `${S.brand}  *YouTube MP4*\n${S.sub}  Format: MP4` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  YTMP4 failed: ${e.message}`);
    }
  },
};

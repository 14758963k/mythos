/**
 * .video — download video from a YouTube link.
 */

const { reply, sendVideo, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'video',
  aliases: ['ytv', 'ytdl'],
  category: 'downloader',
  description: 'Download video from a YouTube link',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a YouTube URL.\n  ${S.sub}  ${ctx.prefix}video https://youtube.com/watch?v=...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Downloading video...`);
      const tmpOut = path.join(process.env.TEMP || '/tmp', `vid_${Date.now()}.mp4`);
      execSync(`yt-dlp -f "best[ext=mp4]" -o "${tmpOut}" "${url}"`, { timeout: 120000 });
      const buf = fs.readFileSync(tmpOut);
      fs.unlinkSync(tmpOut);
      await sendVideo(ctx.sock, ctx.from, { video: buf, caption: `${S.brand}  *Video Downloaded*\n${S.sub}  Format: MP4` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Video failed: ${e.message}`);
    }
  },
};

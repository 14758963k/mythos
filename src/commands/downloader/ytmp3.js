/**
 * .ytmp3 — convert YouTube video to MP3.
 */

const { reply, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ytmp3',
  aliases: ['ytaudio'],
  category: 'downloader',
  description: 'Convert a YouTube video URL to MP3',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a YouTube URL.\n  ${S.sub}  ${ctx.prefix}ytmp3 https://youtube.com/watch?v=...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Converting to MP3...`);
      const tmpOut = path.join(process.env.TEMP || '/tmp', `ytmp3_${Date.now()}.mp3`);
      execSync(`yt-dlp -x --audio-format mp3 -o "${tmpOut}" "${url}"`, { timeout: 120000 });
      const buf = fs.readFileSync(tmpOut);
      fs.unlinkSync(tmpOut);
      await sendDocument(ctx.sock, ctx.from, { document: buf, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: `${S.brand}  YouTube to MP3 converted` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  YTMP3 failed: ${e.message}`);
    }
  },
};

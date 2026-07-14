/**
 * .song — download audio from a YouTube link.
 */

const { reply, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'song',
  aliases: ['ytsong', 'yta'],
  category: 'downloader',
  description: 'Download audio from a YouTube link',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a YouTube URL.\n  ${S.sub}  ${ctx.prefix}song https://youtube.com/watch?v=...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Downloading audio...`);
      const tmpOut = path.join(process.env.TEMP || '/tmp', `song_${Date.now()}.mp3`);
      execSync(`ffmpeg -y -i "$(yt-dlp -f "bestaudio" -g "${url}")" -acodec libmp3lame "${tmpOut}"`, { timeout: 60000 });
      const buf = fs.readFileSync(tmpOut);
      fs.unlinkSync(tmpOut);
      await sendDocument(ctx.sock, ctx.from, { document: buf, fileName: 'audio.mp3', mimetype: 'audio/mpeg', caption: `${S.brand}  Audio downloaded` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Song failed: ${e.message}`);
    }
  },
};

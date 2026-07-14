/**
 * .toaudio — convert a quoted video to audio.
 */

const { reply, downloadQuotedMedia, sendAudio } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  name: 'toaudio',
  aliases: ['mp3', 'tomp3', 'toaudio'],
  category: 'converter',
  description: 'Convert a quoted video to audio (MP3)',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.videoMessage) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote a video, then run *${ctx.prefix}toaudio*.`);
    }
    try {
      await reply(ctx.sock, ctx, `${S.info}  Converting...`);
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the video.`);
      const inPath = `./tmp/in_${Date.now()}.mp4`;
      const outPath = `./tmp/out_${Date.now()}.mp3`;
      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
      fs.writeFileSync(inPath, buf);
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inPath} -vn -ar 44100 -ac 2 -b:a 128k ${outPath}`, (err) => {
          if (err) reject(err); else resolve();
        });
      });
      const audioBuf = fs.readFileSync(outPath);
      await sendAudio(ctx.sock, ctx.from, { audio: audioBuf, ptt: false }, { quoted: ctx.msg });
      fs.unlinkSync(inPath);
      fs.unlinkSync(outPath);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Conversion failed: ${e.message}`);
    }
  },
};

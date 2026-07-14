/**
 * .tomp4 — convert a quoted animated sticker or GIF to MP4.
 */

const { reply, downloadQuotedMedia, sendVideo } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  name: 'tomp4',
  aliases: ['mp4', 'tovideo', 'tovid'],
  category: 'converter',
  description: 'Convert animated sticker or GIF to MP4',
  execute: async (ctx) => {
    if (!ctx.quoted) return reply(ctx.sock, ctx, `${S.warn}  Quote an animated sticker or GIF.`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Converting...`);
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download media.`);
      const inPath = `./tmp/in_${Date.now()}.webp`;
      const outPath = `./tmp/out_${Date.now()}.mp4`;
      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
      fs.writeFileSync(inPath, buf);
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inPath} -movflags faststart -pix_fmt yuv420p ${outPath}`, (err) => {
          if (err) reject(err); else resolve();
        });
      });
      const videoBuf = fs.readFileSync(outPath);
      await sendVideo(ctx.sock, ctx.from, { video: videoBuf, caption: `${S.brand}  Converted to MP4` }, { quoted: ctx.msg });
      fs.unlinkSync(inPath);
      fs.unlinkSync(outPath);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Conversion failed: ${e.message}`);
    }
  },
};

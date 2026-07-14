/**
 * .photo — convert a quoted sticker to a photo (PNG).
 */

const { reply, downloadQuotedMedia, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  name: 'photo',
  aliases: ['stickertoimg', 'stimg'],
  category: 'converter',
  description: 'Convert a quoted sticker to a PNG image',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.stickerMessage) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote a sticker, then run *${ctx.prefix}photo*.`);
    }
    try {
      await reply(ctx.sock, ctx, `${S.info}  Converting...`);
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the sticker.`);
      const inPath = `./tmp/stk_${Date.now()}.webp`;
      const outPath = `./tmp/out_${Date.now()}.png`;
      if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp', { recursive: true });
      fs.writeFileSync(inPath, buf);
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${inPath} ${outPath}`, (err) => {
          if (err) reject(err); else resolve();
        });
      });
      const imgBuf = fs.readFileSync(outPath);
      await sendImage(ctx.sock, ctx.from, { image: imgBuf, caption: `${S.brand}  Sticker converted` }, { quoted: ctx.msg });
      fs.unlinkSync(inPath);
      fs.unlinkSync(outPath);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Conversion failed: ${e.message}`);
    }
  },
};

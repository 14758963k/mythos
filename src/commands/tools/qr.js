/**
 * .qr â€” generate a QR code image from text.
 */

const QRCode = require('qrcode');
const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'qr',
  aliases: ['qrcode'],
  category: 'tools',
  description: 'Generate a QR code for any text or URL',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}qr https://example.com*`);
      return;
    }
    try {
      const buf = await QRCode.toBuffer(text, { errorCorrectionLevel: 'M', type: 'png', margin: 1, width: 512 });
      await sendImage(ctx.sock, ctx.from, {
        image: buf,
        caption: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  QR Code\n${S.heavyBar}\n  ${S.dot} ${text}\n${S.brandLine}`,
      }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Failed to render QR: ${e.message}`);
    }
  },
};



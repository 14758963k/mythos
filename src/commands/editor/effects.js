/**
 * Image editor helper — applies effects via the popcat API.
 */

const { reply, sendImage, downloadQuotedMedia } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { TelegraPh } = require('../../helpers/scraper');
const axios = require('axios');

const createEditor = (effect) => ({
  name: effect,
  aliases: [],
  category: 'editor',
  description: `Apply ${effect} effect to a quoted image`,
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.imageMessage) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote an image, then run *${ctx.prefix}${effect}*.`);
    }
    try {
      await reply(ctx.sock, ctx, `${S.info}  Processing ${effect}...`);
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the image.`);
      const url = await TelegraPh(buf);
      const { data } = await axios.get(`https://api.popcat.xyz/${effect}?image=${url}`, { responseType: 'arraybuffer' });
      await sendImage(ctx.sock, ctx.from, { image: Buffer.from(data), caption: `${S.brand}  ${effect} effect applied` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  ${effect} failed: ${e.message}`);
    }
  },
});

module.exports = [
  createEditor('jail'),
  createEditor('clown'),
  createEditor('wanted'),
  createEditor('uncover'),
  createEditor('drip'),
  createEditor('greyscale'),
  createEditor('invert'),
  createEditor('blur'),
  createEditor('gun'),
  createEditor('colorify'),
  createEditor('pet'),
  createEditor('trash'),
  createEditor('rip'),
  createEditor('gay'),
  createEditor('beautiful'),
  createEditor('bobross'),
  createEditor('delete'),
  createEditor('facepalm'),
];

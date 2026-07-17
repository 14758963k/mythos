/**
 * .ad — apply "ad" overlay to a quoted image.
 */

const { reply, sendImage, downloadQuotedMedia } = require('../../helpers/messages');
const { S, header, row, footer } = require('../../helpers/formatter');
const { TelegraPh } = require('../../helpers/scraper');
const axios = require('axios');

const createOverlay = (effect, label) => ({
  name: effect,
  aliases: [],
  category: 'editor',
  description: `Apply ${label || effect} overlay to a quoted image`,
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.imageMessage) {
      return reply(ctx.sock, ctx, `${S.warn} Quote an image, then run *${ctx.prefix}${effect}*.`);
    }
    try {
      await reply(ctx.sock, ctx, `${S.info} Applying ${label || effect}...`);
      const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross} Could not download the image.`);
      const url = await TelegraPh(buf);
      const { data } = await axios.get(`https://api.popcat.xyz/${effect}?image=${url}`, { responseType: 'arraybuffer' });
      await sendImage(ctx.sock, ctx.from, { image: Buffer.from(data),
        caption: `${header(label || effect)}\n\n${row('Status', 'Applied')}\n${row('Overlay', label || effect)}\n\n${footer()}`
      }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
    }
  },
});

module.exports = [
  createOverlay('ad', 'AD overlay'),
  createOverlay('mnm', 'MNM overlay'),
  createOverlay('puppet', 'Puppet overlay'),
  createOverlay('sparkles', 'Sparkles overlay'),
  createOverlay('affect', 'Affect overlay'),
  createOverlay('challenge', 'Challenge overlay'),
  createOverlay('delete', 'Delete overlay'),
  createOverlay('facepalm', 'Facepalm overlay'),
  createOverlay('mission', 'Mission overlay'),
  createOverlay('not-stonks', 'Not Stonks overlay'),
  createOverlay('phone', 'Phone overlay'),
  createOverlay('podium', 'Podium overlay'),
  createOverlay('stonks', 'Stonks overlay'),
  createOverlay('tweet', 'Tweet overlay'),
];

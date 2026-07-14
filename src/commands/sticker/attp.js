/**
 * .attp — animated text-to-sticker.
 */

const { reply, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'attp',
  aliases: ['animtext'],
  category: 'sticker',
  description: 'Create an animated glowing text sticker',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text) return reply(ctx.sock, ctx, `${S.warn}  Provide text.\n  ${S.sub}  ${ctx.prefix}attp Hello World`);
    try {
      const { data } = await axios.get(`https://api.lolhuman.xyz/api/attp?apikey=hematpintar&text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
      await sendSticker(ctx.sock, ctx.from, Buffer.from(data), ctx.msg, { pack: 'Mythos', author: 'ATTP' });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  ATTP failed: ${e.message}`);
    }
  },
};

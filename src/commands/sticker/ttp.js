/**
 * .ttp — static text-to-sticker.
 */

const { reply, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'ttp',
  aliases: ['textpic'],
  category: 'sticker',
  description: 'Create a static text sticker',
  execute: async (ctx) => {
    const text = ctx.args.join(' ');
    if (!text) return reply(ctx.sock, ctx, `${S.warn}  Provide text.\n  ${S.sub}  ${ctx.prefix}ttp Hello World`);
    try {
      const { data } = await axios.get(`https://api.lolhuman.xyz/api/ttp?apikey=hematpintar&text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
      await sendSticker(ctx.sock, ctx.from, Buffer.from(data), ctx.msg, { pack: 'Mythos', author: 'TTP' });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  TTP failed: ${e.message}`);
    }
  },
};

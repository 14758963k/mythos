/**
 * .couplepp — send random couple profile pictures.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'couplepp',
  aliases: ['couple', 'copel'],
  category: 'search',
  description: 'Send a random couple profile picture pair',
  execute: async (ctx) => {
    try {
      const { data } = await axios.get('https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json');
      const random = data[Math.floor(Math.random() * data.length)];
      await sendImage(ctx.sock, ctx.from, { image: { url: random.male }, caption: `${S.brand}  His profile` }, { quoted: ctx.msg });
      await sendImage(ctx.sock, ctx.from, { image: { url: random.female }, caption: `${S.brand}  Hers profile` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Failed to fetch couple pics: ${e.message}`);
    }
  },
};

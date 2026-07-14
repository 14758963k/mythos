/**
 * .image — search Google Images for a query.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'image',
  aliases: ['img', 'pics'],
  category: 'search',
  description: 'Search Google Images and send results',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a search query.\n  ${S.sub}  ${ctx.prefix}image sunset over mountains`);
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      const cx = process.env.GOOGLE_CX;
      if (!apiKey || !cx) return reply(ctx.sock, ctx, `${S.cross}  Google API not configured. Set GOOGLE_API_KEY and GOOGLE_CX in .env`);
      const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=3`);
      if (!data.items || !data.items.length) return reply(ctx.sock, ctx, `${S.cross}  No images for *${query}*.`);
      for (const item of data.items.slice(0, 3)) {
        await sendImage(ctx.sock, ctx.from, {
          image: { url: item.link },
          caption: `${S.brand} ${item.title}\n  ${S.sub} ${item.displayLink}`,
        }, { quoted: ctx.msg });
      }
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Image search failed: ${e.message}`);
    }
  },
};

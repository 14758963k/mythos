/**
 * .google — search Google for a query.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'google',
  aliases: ['gsearch', 'search'],
  category: 'search',
  description: 'Search Google for a query',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a search query.\n  ${S.sub}  ${ctx.prefix}google What is quantum computing`);
    try {
      const apiKey = process.env.GOOGLE_API_KEY;
      const cx = process.env.GOOGLE_CX;
      if (!apiKey || !cx) return reply(ctx.sock, ctx, `${S.cross}  Google API not configured. Set GOOGLE_API_KEY and GOOGLE_CX in .env`);
      const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`);
      if (!data.items || !data.items.length) return reply(ctx.sock, ctx, `${S.cross}  No results for *${query}*.`);
      const results = data.items.map((item, i) =>
        `  ${S.sqr} ${i + 1}. ${item.title}\n  ${S.sub} ${item.snippet}\n  ${S.sub} ${item.link}\n`
      ).join('\n');
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Google Search  ${S.arr}  ${query}\n${S.heavyBar}\n` +
        `${results}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Search failed: ${e.message}`);
    }
  },
};

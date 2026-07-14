/**
 * .npm — search NPM packages.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'npm',
  aliases: ['npmsearch', 'package'],
  category: 'search',
  description: 'Search NPM packages by name',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a package name.\n  ${S.sub}  ${ctx.prefix}npm express`);
    try {
      const { data } = await axios.get(`https://api.npms.io/v2/search?q=${encodeURIComponent(query)}&size=5`);
      if (!data.results || !data.results.length) return reply(ctx.sock, ctx, `${S.cross}  No packages found for *${query}*.`);
      const results = data.results.map((r) => {
        const pkg = r.package;
        return `  ${S.sqr} ${pkg.name} (v${pkg.version})\n  ${S.sub} ${pkg.description || 'No description'}\n  ${S.sub} ${pkg.links.npm}\n`;
      }).join('\n');
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  NPM Search  ${S.arr}  ${query}\n${S.heavyBar}\n` +
        `${results}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  NPM search failed: ${e.message}`);
    }
  },
};

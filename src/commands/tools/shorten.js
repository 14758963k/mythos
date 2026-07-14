/**
 * .shorten â€” URL shortener. Uses is.gd (no key, no signup).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const isUrl = (s) => /^https?:\/\/[^\s]+$/i.test(s);

module.exports = {
  name: 'shorten',
  aliases: ['shorturl', 'tiny'],
  category: 'tools',
  description: 'Shorten a URL using is.gd',
  execute: async (ctx) => {
    const url = ctx.args[0];
    if (!url || !isUrl(url)) {
      await reply(ctx.sock, ctx, `${S.warn}  Pass a full URL. Example: *${ctx.prefix}shorten https://example.com/very/long*`);
      return;
    }
    try {
      const res = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
      const text = await res.text();
      if (!/^https:\/\//.test(text)) throw new Error(text || 'Service refused');
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  URL Shortened\n${S.heavyBar}\n  ${S.dot} From  ${S.arr}  ${url}\n  ${S.dot} To    ${S.arr}  ${text}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Shorten failed: ${e.message}`);
    }
  },
};



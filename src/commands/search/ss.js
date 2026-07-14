/**
 * .ss — take a screenshot of a website.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'ss',
  aliases: ['screenshot', 'webss'],
  category: 'search',
  description: 'Take a screenshot of a website URL',
  execute: async (ctx) => {
    const url = ctx.args[0] || '';
    if (!url || !url.startsWith('http')) {
      return reply(ctx.sock, ctx, `${S.warn}  Provide a valid URL.\n  ${S.sub}  ${ctx.prefix}ss https://example.com`);
    }
    try {
      const ssUrl = `https://image.thum.io/get/width/1280/crop/720/${url}`;
      await sendImage(ctx.sock, ctx.from, { image: { url: ssUrl }, caption: `${S.brand}  Screenshot of ${url}` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Screenshot failed: ${e.message}`);
    }
  },
};

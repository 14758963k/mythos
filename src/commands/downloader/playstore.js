/**
 * .playstore — search and download APKs from the Play Store.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');
const fs = require('fs');

module.exports = {
  name: 'playstore',
  aliases: ['apk', 'downapk'],
  category: 'downloader',
  description: 'Search and download an APK from Play Store',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide an app name.\n  ${S.sub}  ${ctx.prefix}playstore WhatsApp`);
    try {
      const searchRes = await axios.get(`https://api.lolhuman.xyz/api/playstore?apikey=hematpintar&query=${encodeURIComponent(query)}`);
      const apps = searchRes.data?.result;
      if (!apps || !apps.length) return reply(ctx.sock, ctx, `${S.cross}  No apps found for *${query}*.`);
      const app = apps[0];
      const info =
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Play Store  ${S.arr}  ${app.name}\n${S.heavyBar}\n` +
        `  ${S.sqr} Name       ${S.arr}  ${app.name}\n` +
        `  ${S.sqr} Developer  ${S.arr}  ${app.developer}\n` +
        `  ${S.sqr} Score      ${S.arr}  ${app.score || 'N/A'}\n` +
        `  ${S.sqr} Size       ${S.arr}  ${app.size || 'N/A'}\n` +
        `  ${S.sqr} Updated    ${S.arr}  ${app.updated || 'N/A'}\n` +
        `  ${S.sqr} Version    ${S.arr}  ${app.version || 'N/A'}\n` +
        `${S.divider}\n` +
        `  ${S.dot} ${app.description ? app.description.slice(0, 300) : 'No description'}\n` +
        `${S.brandLine}`;
      if (app.icon) {
        await sendImage(ctx.sock, ctx.from, { image: { url: app.icon }, caption: info }, { quoted: ctx.msg });
      } else {
        await reply(ctx.sock, ctx, info);
      }
      if (app.url) {
        await reply(ctx.sock, ctx, `${S.sub}  Download: ${app.url}`);
      }
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Play Store search failed: ${e.message}`);
    }
  },
};

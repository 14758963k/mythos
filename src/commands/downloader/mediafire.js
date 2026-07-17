/**
 * .mediafire — download from MediaFire link.
 */

const { reply, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'mediafire',
  aliases: ['mf'],
  category: 'downloader',
  description: 'Download a file from MediaFire link',
  execute: async (ctx) => {
    const url = ctx.args.find(a => a.startsWith('http'));
    if (!url) return reply(ctx.sock, ctx, `${S.warn}  Provide a MediaFire URL.\n  ${S.sub}  ${ctx.prefix}mediafire https://mediafire.com/...`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Fetching file from MediaFire...`);
      const { data } = await axios.get(`https://api.lolhuman.xyz/api/mediafire?apikey=hematpintar&url=${encodeURIComponent(url)}`);
      if (!data || !data.result || !data.result.url) {
        return reply(ctx.sock, ctx, `${S.cross}  Could not fetch the file.`);
      }
      const fileBuf = (await axios.get(data.result.url, { responseType: 'arraybuffer' })).data;
      await sendDocument(ctx.sock, ctx.from, { document: Buffer.from(fileBuf), fileName: data.result.name || 'download', mimetype: data.result.mime || 'application/octet-stream', caption: `${S.brand}  *${data.result.name || 'File'}*\n${S.sub}  Source: MediaFire` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  MediaFire failed: ${e.message}`);
    }
  },
};

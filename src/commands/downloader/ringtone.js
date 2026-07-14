/**
 * .ringtone — search and download ringtones.
 */

const { reply, sendAudio, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'ringtone',
  aliases: ['ringtone'],
  category: 'downloader',
  description: 'Search and download a ringtone',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a ringtone name.\n  ${S.sub}  ${ctx.prefix}ringtone iphone`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Searching ringtones: *${query}*...`);
      const { data } = await axios.get(`https://www.vevioz.com/api/ringtone/search/${encodeURIComponent(query)}`);
      if (!data || !data.results || data.results.length === 0) {
        return reply(ctx.sock, ctx, `${S.cross}  No ringtones found.`);
      }
      const ring = data.results[0];
      const { data: audioBuf } = await axios.get(ring.download, { responseType: 'arraybuffer' });
      await sendDocument(ctx.sock, ctx.from, { document: Buffer.from(audioBuf), fileName: `${query}.mp3`, mimetype: 'audio/mpeg', caption: `${S.brand}  *${ring.title}*` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Ringtone failed: ${e.message}`);
    }
  },
};

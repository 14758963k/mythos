/**
 * .play — search and download audio from YouTube.
 */

const { reply, sendAudio, sendImage, sendDocument } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'play',
  aliases: ['ytplay', 'songplay'],
  category: 'downloader',
  description: 'Search and download audio from YouTube',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a search query.\n  ${S.sub}  ${ctx.prefix}play shape of you`);
    try {
      await reply(ctx.sock, ctx, `${S.info}  Searching: *${query}*...`);
      const { data: search } = await axios.get(`https://api.vevioz.com/api/button/mp3/${encodeURIComponent(query)}`);
      const match = search.match(/href="(https:\/\/[^"]+\.mp3[^"]*)"/);
      if (!match) return reply(ctx.sock, ctx, `${S.cross}  No results found.`);
      const url = match[1];
      const { data: audioBuf } = await axios.get(url, { responseType: 'arraybuffer' });
      await sendDocument(ctx.sock, ctx.from, { document: Buffer.from(audioBuf), fileName: `${query}.mp3`, mimetype: 'audio/mpeg', caption: `${S.brand}  *${query}*\n${S.sub}  Format: MP3` }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Play failed: ${e.message}`);
    }
  },
};

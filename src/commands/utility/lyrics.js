/**
 * .lyrics — find song lyrics via lyrics.ovh API.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'lyrics',
  aliases: ['lyric', 'songtext'],
  category: 'utility',
  description: 'Find lyrics for a song',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}lyrics <song name>*`);

    try {
      await ctx.sock.sendPresenceUpdate('composing', ctx.from).catch(() => {});
      const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`, { timeout: 15000 });
      const lyrics = (data.lyrics || 'No lyrics found.').slice(0, 3000);
      const title = data.title || query;
      const artist = data.artist || 'Unknown';

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Lyrics ${S.arr} ${title}\n${S.heavyBar}\n` +
        `  ${S.dot} Artist ${S.arr} ${artist}\n${S.divider}\n\n` +
        `${lyrics}\n\n${S.brandLine}`
      );
    } catch {
      await reply(ctx.sock, ctx, `${S.cross} No lyrics found for "*${query}*".`);
    }
  },
};

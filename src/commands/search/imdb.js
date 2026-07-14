/**
 * .imdb — look up a movie or series on OMDb.
 */

const { reply, sendImage } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'imdb',
  aliases: ['movie', 'film'],
  category: 'search',
  description: 'Look up a movie or series on IMDB',
  execute: async (ctx) => {
    const query = ctx.args.join(' ');
    if (!query) return reply(ctx.sock, ctx, `${S.warn}  Provide a movie or series name.\n  ${S.sub}  ${ctx.prefix}imdb Inception`);
    try {
      const { data } = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(query)}&plot=full`);
      if (data.Response === 'False') return reply(ctx.sock, ctx, `${S.cross}  No results for *${query}*.`);
      const info =
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  IMDB Lookup  ${S.arr}  ${data.Title}\n${S.heavyBar}\n` +
        `  ${S.sqr} Title      ${S.arr}  ${data.Title}\n` +
        `  ${S.sqr} Year       ${S.arr}  ${data.Year}\n` +
        `  ${S.sqr} Rated      ${S.arr}  ${data.Rated}\n` +
        `  ${S.sqr} Released   ${S.arr}  ${data.Released}\n` +
        `  ${S.sqr} Runtime    ${S.arr}  ${data.Runtime}\n` +
        `  ${S.sqr} Genre      ${S.arr}  ${data.Genre}\n` +
        `  ${S.sqr} Director   ${S.arr}  ${data.Director}\n` +
        `  ${S.sqr} Writer     ${S.arr}  ${data.Writer}\n` +
        `  ${S.sqr} Actors     ${S.arr}  ${data.Actors}\n` +
        `${S.divider}\n` +
        `  ${S.dot} ${data.Plot}\n` +
        `${S.divider}\n` +
        `  ${S.sqr} Language   ${S.arr}  ${data.Language}\n` +
        `  ${S.sqr} Country    ${S.arr}  ${data.Country}\n` +
        `  ${S.sqr} Awards     ${S.arr}  ${data.Awards}\n` +
        `  ${S.sqr} BoxOffice  ${S.arr}  ${data.BoxOffice}\n` +
        `  ${S.sqr} IMDB       ${S.arr}  ${data.imdbRating}/10 (${data.imdbVotes} votes)\n` +
        `${S.brandLine}`;
      if (data.Poster && data.Poster !== 'N/A') {
        await sendImage(ctx.sock, ctx.from, { image: { url: data.Poster }, caption: info }, { quoted: ctx.msg });
      } else {
        await reply(ctx.sock, ctx, info);
      }
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Lookup failed: ${e.message}`);
    }
  },
};

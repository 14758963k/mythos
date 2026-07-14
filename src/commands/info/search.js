const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = [
  {
    name: 'wikipedia',
    aliases: ['wiki'],
    category: 'info',
    description: 'Search Wikipedia',
    execute: async (ctx) => {
      const query = ctx.args.join(' ');
      if (!query) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}wiki <query>*`);
      try {
        const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (data.type === 'disambiguation') {
          return reply(ctx.sock, ctx, `${S.info} That\'s a disambiguation page. Try a more specific term.`);
        }
        const text =
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Wikipedia ${S.arr} ${data.title}\n${S.heavyBar}\n\n` +
          `  ${data.extract}\n\n` +
          `${S.divider}\n  ${S.tri} Read more ${S.arr} ${data.content_urls?.desktop?.page || 'N/A'}\n${S.brandLine}`;
        await reply(ctx.sock, ctx, text);
      } catch {
        await reply(ctx.sock, ctx, `${S.cross} No Wikipedia article found for "*${query}*".`);
      }
    },
  },
  {
    name: 'reddit',
    aliases: ['subreddit'],
    category: 'info',
    description: 'Get a random post from a subreddit',
    execute: async (ctx) => {
      const sub = (ctx.args[0] || '').replace(/^r\//, '');
      if (!sub) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}reddit <subreddit>*`);
      try {
        const { data } = await axios.get(`https://www.reddit.com/r/${sub}/random.json`, {
          headers: { 'User-Agent': 'MythosBot/1.0' },
        });
        const post = data[0]?.data?.children[0]?.data;
        if (!post) return reply(ctx.sock, ctx, `${S.cross} No posts found from r/${sub}.`);
        const text =
          `${S.brandLine}\n${S.sub}  Reddit ${S.arr} r/${post.subreddit}\n${S.heavyBar}\n\n` +
          `  ${S.tri} Title ${S.arr} ${post.title}\n` +
          `  ${S.tri} Author ${S.arr} u/${post.author}\n` +
          `  ${S.tri} Score ${S.arr} ${post.score} ${S.tri} Comments ${S.arr} ${post.num_comments}\n` +
          (post.selftext ? `\n${S.divider}\n  ${post.selftext.slice(0, 500)}${post.selftext.length > 500 ? '...' : ''}\n` : '') +
          `${S.divider}\n  ${S.tri} Link ${S.arr} https://reddit.com${post.permalink}\n${S.brandLine}`;
        await reply(ctx.sock, ctx, text);
      } catch {
        await reply(ctx.sock, ctx, `${S.cross} Could not fetch from r/${sub}. Subreddit may not exist.`);
      }
    },
  },
  {
    name: 'covid',
    aliases: ['covid19', 'corona'],
    category: 'info',
    description: 'Get COVID-19 stats',
    execute: async (ctx) => {
      try {
        const { data } = await axios.get('https://disease.sh/v3/covid-19/all');
        const fmt = (n) => n?.toLocaleString() || 'N/A';
        const text =
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  COVID-19 Global Stats\n${S.heavyBar}\n\n` +
          `  ${S.tri} Cases ${S.arr} *${fmt(data.cases)}*\n` +
          `  ${S.tri} Today ${S.arr} *${fmt(data.todayCases)}*\n` +
          `  ${S.tri} Deaths ${S.arr} *${fmt(data.deaths)}*\n` +
          `  ${S.tri} Recovered ${S.arr} *${fmt(data.recovered)}*\n` +
          `  ${S.tri} Active ${S.arr} *${fmt(data.active)}*\n` +
          `  ${S.tri} Critical ${S.arr} *${fmt(data.critical)}*\n` +
          `${S.divider}\n  ${S.tri} Updated ${S.arr} ${new Date(data.updated).toLocaleDateString()}\n${S.brandLine}`;
        await reply(ctx.sock, ctx, text);
      } catch {
        await reply(ctx.sock, ctx, `${S.cross} Could not fetch COVID-19 data.`);
      }
    },
  },
];

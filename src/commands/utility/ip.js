/**
 * .ip — IP address lookup.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'ip',
  aliases: ['iplookup', 'whoisip'],
  category: 'utility',
  description: 'Look up an IP address',
  execute: async (ctx) => {
    const ip = ctx.args[0];
    if (!ip) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}ip <address>*`);

    try {
      const { data } = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,lat,lon,timezone,isp,org,as,query`, { timeout: 10000 });
      if (data.status === 'fail') return reply(ctx.sock, ctx, `${S.cross} ${data.message || 'Invalid IP'}`);

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  IP Lookup ${S.arr} ${data.query}\n${S.heavyBar}\n` +
        `  ${S.dot} Country ${S.arr} ${data.country}\n` +
        `  ${S.dot} Region ${S.arr} ${data.regionName}\n` +
        `  ${S.dot} City ${S.arr} ${data.city}\n` +
        `  ${S.dot} Coordinates ${S.arr} ${data.lat}, ${data.lon}\n` +
        `  ${S.dot} Timezone ${S.arr} ${data.timezone}\n` +
        `  ${S.dot} ISP ${S.arr} ${data.isp}\n` +
        `  ${S.dot} Org ${S.arr} ${data.org}\n` +
        `  ${S.dot} ASN ${S.arr} ${data.as}\n${S.brandLine}`
      );
    } catch {
      await reply(ctx.sock, ctx, `${S.cross} Could not look up IP.`);
    }
  },
};

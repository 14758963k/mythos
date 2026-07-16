/**
 * .weather — get weather info for any city via wttr.in (no API key needed).
 * Falls back to open-meteo for built-in cities.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

const codeMap = (c) => ({
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle',
  55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Rain showers',
  81: 'Heavy showers', 95: 'Thunderstorm',
}[c] || `Code ${c}`);

module.exports = {
  name: 'weather',
  aliases: ['w', 'forecast'],
  category: 'utility',
  description: 'Get weather for any city',
  execute: async (ctx) => {
    const city = ctx.args.join(' ') || 'Nairobi';
    try {
      await ctx.sock.sendPresenceUpdate('composing', ctx.from).catch(() => {});
      const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 15000 });
      const cur = data.current_condition?.[0];
      if (!cur) return reply(ctx.sock, ctx, `${S.cross} Could not find weather for "*${city}*".`);

      const area = data.nearest_area?.[0]?.areaName?.[0]?.value || city;
      const country = data.nearest_area?.[0]?.country?.[0]?.value || '';

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Weather ${S.arr} ${area}${country ? ', ' + country : ''}\n${S.heavyBar}\n` +
        `  ${S.dot} Condition ${S.arr} ${cur.weatherDesc?.[0]?.value || 'N/A'}\n` +
        `  ${S.dot} Temperature ${S.arr} *${cur.temp_C}°C* (${cur.temp_F}°F)\n` +
        `  ${S.dot} Feels Like ${S.arr} ${cur.FeelsLikeC}°C\n` +
        `  ${S.dot} Humidity ${S.arr} ${cur.humidity}%\n` +
        `  ${S.dot} Wind ${S.arr} ${cur.windspeedKmph} km/h ${cur.winddir16Point}\n` +
        `  ${S.dot} Visibility ${S.arr} ${cur.visibility} km\n` +
        `  ${S.dot} UV Index ${S.arr} ${cur.uvIndex}\n${S.brandLine}`
      );
    } catch {
      await reply(ctx.sock, ctx, `${S.cross} Could not fetch weather for "*${city}*".`);
    }
  },
};

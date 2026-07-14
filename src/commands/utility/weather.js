/**
 * .weather â€” open-meteo, no API key needed.
 * Usage: .weather <city>   (uses a built-in city list for geocoding)
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const CITIES = {
  nairobi: { lat: -1.2921, lon: 36.8219, name: 'Nairobi' },
  london: { lat: 51.5072, lon: -0.1276, name: 'London' },
  tokyo: { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
  berlin: { lat: 52.52, lon: 13.405, name: 'Berlin' },
  paris: { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  mumbai: { lat: 19.076, lon: 72.8777, name: 'Mumbai' },
  'new york': { lat: 40.7128, lon: -74.006, name: 'New York' },
  'san francisco': { lat: 37.7749, lon: -122.4194, name: 'San Francisco' },
  sydney: { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
  dubai: { lat: 25.2048, lon: 55.2708, name: 'Dubai' },
  lagos: { lat: 6.5244, lon: 3.3792, name: 'Lagos' },
  johannesburg: { lat: -26.2041, lon: 28.0473, name: 'Johannesburg' },
  cairo: { lat: 30.0444, lon: 31.2357, name: 'Cairo' },
  'hong kong': { lat: 22.3193, lon: 114.1694, name: 'Hong Kong' },
  singapore: { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
};

module.exports = {
  name: 'weather',
  aliases: ['w'],
  category: 'utility',
  description: 'Current weather for a known city (no key required)',
  execute: async (ctx) => {
    const key = (ctx.args[0] || 'nairobi').toLowerCase();
    const c = CITIES[key];
    if (!c) {
      const list = Object.keys(CITIES).slice(0, 8).join(', ');
      await reply(ctx.sock, ctx, `${S.warn}  Unknown city. Try one of: ${list}\nAdd more in src/commands/utility/weather.js`);
      return;
    }
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,wind_speed_10m,weather_code&timezone=auto`;
      const res = await fetch(url);
      const j = await res.json();
      const cur = j.current || {};
      const code = cur.weather_code || 0;
      const cond = codeMap(code);
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Weather  ${S.arr}  ${c.name}\n${S.heavyBar}\n` +
          `  ${S.sqr} Condition    ${S.arr}  ${cond}\n` +
          `  ${S.sqr} Temperature  ${S.arr}  ${cur.temperature_2m}${S.degree}C\n` +
          `  ${S.sqr} Feels like   ${S.arr}  ${cur.apparent_temperature}${S.degree}C\n` +
          `  ${S.sqr} Humidity     ${S.arr}  ${cur.relative_humidity_2m}%\n` +
          `  ${S.sqr} Wind         ${S.arr}  ${cur.wind_speed_10m} km/h\n` +
          `  ${S.sqr} Precipitation${S.arr}  ${cur.precipitation} mm\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Weather service failed: ${e.message}`);
    }
  },
};

const codeMap = (c) => {
  const map = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Heavy showers',
    95: 'Thunderstorm',
  };
  return map[c] || `Code ${c}`;
};



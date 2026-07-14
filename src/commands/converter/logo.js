const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

const LOGO_STYLES = [
  { name: 'neon', desc: 'Neon glow text', api: 'https://en.ephoto360.com/create-green-neon-light-effect-text-online-879.html' },
  { name: 'glitch', desc: 'Glitch effect text', api: 'https://en.ephoto360.com/create-text-glitch-effect-online-889.html' },
  { name: 'thunder', desc: 'Thunder text effect', api: 'https://en.ephoto360.com/create-thunder-text-effect-online-903.html' },
  { name: 'gradient', desc: 'Gradient text', api: 'https://en.ephoto360.com/create-beautiful-gradient-text-effect-online-881.html' },
  { name: 'matrix', desc: 'Matrix code text', api: 'https://en.ephoto360.com/create-green-matrix-text-effect-online-906.html' },
  { name: 'banner', desc: 'Text on banner', api: 'https://en.ephoto360.com/create-a-banner-text-online-909.html' },
  { name: 'avatar', desc: 'Avatar with text', api: 'https://en.ephoto360.com/create-an-avatar-text-online-910.html' },
  { name: 'gold', desc: 'Gold metallic text', api: 'https://en.ephoto360.com/create-shiny-gold-3d-text-effect-online-904.html' },
];

module.exports = [
  {
    name: 'logo',
    aliases: ['textlogo', 'textart'],
    category: 'converter',
    description: 'Generate styled text logos',
    execute: async (ctx) => {
      const arg = (ctx.args[0] || '').toLowerCase();
      const text = ctx.args.slice(1).join(' ') || 'Mythos';

      if (arg === 'list' || (!LOGO_STYLES.find(s => s.name === arg) && !text)) {
        return reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Logo Styles\n${S.heavyBar}\n` +
          LOGO_STYLES.map(s => `  ${S.sqr} ${s.name} ${S.arr} ${s.desc}`).join('\n') +
          `\n${S.divider}\n  ${S.tri} Usage ${S.arr} ${ctx.prefix}logo <style> <text>\n${S.brandLine}`
        );
      }

      const style = LOGO_STYLES.find(s => s.name === arg);
      if (!style) {
        return reply(ctx.sock, ctx, `${S.warn} Style not found. Use *${ctx.prefix}logo list* to see available styles.`);
      }

      await reply(ctx.sock, ctx, `${S.info} Generating *${style.name}* logo for "${text}"...`);

      try {
        const apiUrl = `https://api.lolhuman.xyz/api/textpro/${style.name}?apikey=freekey&text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000 });
        await ctx.sock.sendMessage(ctx.from, {
          image: Buffer.from(response.data),
          caption: `${S.brandLine}\n${S.sub}  Logo ${S.arr} ${style.name}\n${S.heavyBar}\n  ${S.tri} Text ${S.arr} ${text}\n${S.brandLine}`,
        }, { quoted: ctx.msg });
      } catch {
        try {
          const apiUrl2 = `https://api.xteam.xyz/textpro/${style.name}?text=${encodeURIComponent(text)}`;
          const response2 = await axios.get(apiUrl2, { responseType: 'arraybuffer', timeout: 30000 });
          await ctx.sock.sendMessage(ctx.from, {
            image: Buffer.from(response2.data),
            caption: `${S.brandLine}\n${S.sub}  Logo ${S.arr} ${style.name}\n${S.heavyBar}\n  ${S.tri} Text ${S.arr} ${text}\n${S.brandLine}`,
          }, { quoted: ctx.msg });
        } catch {
          await reply(ctx.sock, ctx, `${S.cross} Logo generation service is currently unavailable. Try again later.`);
        }
      }
    },
  },
  {
    name: 'font',
    aliases: ['textfont', 'fancytext'],
    category: 'converter',
    description: 'Convert text to fancy Unicode fonts',
    execute: async (ctx) => {
      const text = ctx.args.join(' ');
      if (!text) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}font <text>*`);

      const fonts = [
        { name: 'Normal', convert: (t) => t },
        { name: 'Bold', convert: (t) => t.split('').map(c => { const i = c.charCodeAt(0); return i >= 97 && i <= 122 ? String.fromCharCode(i - 32 + 0x1D400 - 65) : i >= 65 && i <= 90 ? String.fromCharCode(i + 0x1D400 - 65) : c; }).join('') },
        { name: 'Italic', convert: (t) => t.split('').map(c => { const i = c.charCodeAt(0); return i >= 97 && i <= 122 ? String.fromCharCode(i - 97 + 0x1D456) : i >= 65 && i <= 90 ? String.fromCharCode(i - 65 + 0x1D434) : c; }).join('') },
        { name: 'Double', convert: (t) => t.split('').map(c => { const i = c.charCodeAt(0); return i >= 65 && i <= 90 ? String.fromCharCode(i - 65 + 0x1D538) : i >= 97 && i <= 122 ? String.fromCharCode(i - 97 + 0x1D552) : c; }).join('') },
        { name: 'Circle', convert: (t) => t.split('').map(c => { const i = c.charCodeAt(0); return i >= 65 && i <= 90 ? String.fromCharCode(i - 65 + 0x24B6) : i >= 97 && i <= 122 ? String.fromCharCode(i - 97 + 0x24D0) : c; }).join('') },
        { name: 'Monospace', convert: (t) => t.split('').map(c => { const i = c.charCodeAt(0); return i >= 33 && i <= 126 ? String.fromCharCode(i - 33 + 0x1D7F0) : c; }).join('') },
        { name: 'Strikethrough', convert: (t) => t.split('').map(c => c + '\u0336').join('') },
        { name: 'Underline', convert: (t) => t.split('').map(c => c + '\u0332').join('') },
      ];

      const results = fonts.map(f => `${S.sqr} ${f.name}\n  ${f.convert(text)}`).join('\n\n');
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Fancy Fonts\n${S.heavyBar}\n\n${results}\n\n${S.brandLine}`
      );
    },
  },
];

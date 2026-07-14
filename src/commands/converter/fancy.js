/**
 * .fancy — generate stylized/fancy text in various fonts.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const STYLES = [
  { name: 'Normal', fn: (t) => t },
  { name: 'Bold', fn: (t) => t.replace(/[a-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 8272)).replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 8197)) },
  { name: 'Italic', fn: (t) => t.replace(/[a-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 8256)).replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 8181)) },
  { name: 'Monospace', fn: (t) => t.replace(/[a-zA-Z0-9]/g, (c) => { const code = c.charCodeAt(0); return code >= 65 && code <= 90 ? String.fromCharCode(code + 120737) : code >= 97 && code <= 122 ? String.fromCharCode(code + 120753) : String.fromCharCode(code + 8272); }) },
  { name: 'Strikethrough', fn: (t) => t.replace(/[a-zA-Z0-9]/g, (c) => c + '\u0336') },
  { name: 'Underline', fn: (t) => t.replace(/[a-zA-Z0-9]/g, (c) => c + '\u0332') },
  { name: 'Tiny', fn: (t) => t.split('').map((c) => { const map = { a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ' }; return map[c.toLowerCase()] || c; }).join('') },
  { name: 'Bubble', fn: (t) => t.split('').map((c) => { const code = c.toLowerCase().charCodeAt(0); if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x24D0); return c; }).join('') },
  { name: 'Square', fn: (t) => t.toUpperCase().split('').map((c) => { const code = c.charCodeAt(0); if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1F130); return c; }).join('') },
  { name: ' regional', fn: (t) => t.toUpperCase().split('').map((c) => { const code = c.charCodeAt(0); if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1F1A0); return c; }).join('') },
  { name: 'Upside', fn: (t) => { const map = { a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ı', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ', n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z', ' ': ' ' }; return t.split('').reverse().map((c) => map[c.toLowerCase()] || c).join(''); } },
  { name: 'Gothic', fn: (t) => t.replace(/[a-zA-Z]/g, (c) => { const code = c.charCodeAt(0); if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D504); if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D51E); return c; }) },
];

module.exports = {
  name: 'fancy',
  aliases: ['style', 'font'],
  category: 'converter',
  description: 'Generate stylized/fancy text in 12+ fonts',
  execute: async (ctx) => {
    const text = ctx.args.slice(1).join(' ');
    const num = parseInt(ctx.args[0]);
    if (!text && !num) {
      const list = STYLES.map((s, i) => `  ${S.sqr} ${(i + 1).toString().padStart(2)}  ${s.name}`).join('\n');
      return reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Fancy Text Generator\n${S.heavyBar}\n` +
        `${list}\n${S.divider}\n` +
        `  ${S.sub}  ${ctx.prefix}fancy 3 Hello World\n  ${S.sub}  ${ctx.prefix}fancy all Hello\n${S.brandLine}`
      );
    }
    if (!text && num) return reply(ctx.sock, ctx, `${S.warn}  Provide text after the number.`);
    if (num && !isNaN(num) && num >= 1 && num <= STYLES.length) {
      const styled = STYLES[num - 1].fn(text || ctx.args.slice(1).join(' '));
      return reply(ctx.sock, ctx, `${S.sqr} ${STYLES[num - 1].name}:\n\n${styled}`);
    }
    // "all" mode
    const all = STYLES.map((s, i) => `${S.dot} ${s.name}:\n${s.fn(text)}`).join('\n\n');
    await reply(ctx.sock, ctx, all.slice(0, 3000));
  },
};

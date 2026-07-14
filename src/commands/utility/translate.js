/**
 * .translate â€” translate text via Google Translate free endpoint.
 * Usage: .translate <lang> <text...>   e.g. .translate es good morning
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const LANG = {
  ar: 'Arabic', de: 'German', en: 'English', es: 'Spanish', fr: 'French',
  hi: 'Hindi', id: 'Indonesian', it: 'Italian', ja: 'Japanese', ko: 'Korean',
  nl: 'Dutch', pl: 'Polish', pt: 'Portuguese', ru: 'Russian', sw: 'Swahili',
  tr: 'Turkish', vi: 'Vietnamese', zh: 'Chinese',
};

module.exports = {
  name: 'translate',
  aliases: ['tr'],
  category: 'utility',
  description: 'Translate text. Usage: .translate <lang> <text>',
  execute: async (ctx) => {
    const target = (ctx.args[0] || 'en').toLowerCase();
    const text = ctx.args.slice(1).join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}translate es good morning*`);
      return;
    }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const j = await res.json();
      const out = (j[0] || []).map((x) => x[0]).join('');
      const detected = (j[2] || '').toLowerCase();
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Translate\n${S.heavyBar}\n` +
          `  ${S.sqr} From    ${S.arr}  ${LANG[detected] || detected || 'auto'}\n` +
          `  ${S.sqr} To      ${S.arr}  ${LANG[target] || target}\n` +
          `  ${S.sqr} Source  ${S.arr}  ${text}\n` +
          `  ${S.sqr} Result  ${S.arr}  ${out}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



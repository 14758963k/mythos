/**
 * .tts â€” text-to-speech using Google translate TTS.
 */

const { reply, sendAudio } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const LANG = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT',
  pt: 'pt-BR', ru: 'ru-RU', ja: 'ja-JP', ko: 'ko-KR', zh: 'zh-CN',
  ar: 'ar-XA', hi: 'hi-IN', sw: 'sw-KE',
};

module.exports = {
  name: 'tts',
  aliases: ['speak'],
  category: 'media',
  description: 'Read text aloud. Usage: .tts <lang> <text>',
  execute: async (ctx) => {
    const lang = LANG[(ctx.args[0] || 'en').toLowerCase()] ? (ctx.args[0] || 'en').toLowerCase() : 'en';
    const text = ctx.args.slice(LANG[lang] ? 1 : 0).join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}tts en hello world*`);
      return;
    }
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      await sendAudio(ctx.sock, ctx.from, { audio: buf, ptt: true }, ctx.msg);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



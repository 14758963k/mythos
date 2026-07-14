/**
 * .define â€” quick dictionary lookup using dictionaryapi.dev (no key).
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'define',
  aliases: ['dict', 'meaning'],
  category: 'utility',
  description: 'Look up a word definition',
  execute: async (ctx) => {
    const word = (ctx.args[0] || '').trim();
    if (!word) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}define serendipity*`);
      return;
    }
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error(`Not found (${res.status})`);
      const j = await res.json();
      const entry = Array.isArray(j) ? j[0] : j;
      const meanings = (entry.meanings || []).slice(0, 3).map((m) => {
        const defs = (m.definitions || []).slice(0, 2).map((d, i) => `  ${i + 1}. ${d.definition}`).join('\n');
        return `  ${S.tri} ${m.partOfSpeech || '?'}\n${defs}`;
      }).join('\n\n');
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Define  ${S.arr}  ${entry.word || word}\n${S.heavyBar}\n${meanings || 'No definitions'}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};



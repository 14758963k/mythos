/**
 * .meme â€” random meme caption + image search link (no API key needed).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const MEMES = [
  'When the code works on the first run.',
  'Me, explaining to the PM why we need a sprint to fix the bug.',
  'Stack Overflow copying itself, 2026 edition.',
  'Production: 1. Dev: 0. Surprise: -1.',
  'It is not a bug, it is an undocumented feature.',
  'I am not lazy, I am on energy-saving mode.',
  'There is no place like 127.0.0.1.',
  'Wi-Fi password shared, suddenly a fan in the office.',
  'When the deadline is tomorrow and the spec was finalized yesterday.',
  '404: Motivation not found.',
];

module.exports = {
  name: 'meme',
  aliases: ['memes'],
  category: 'fun',
  description: 'Random meme caption',
  execute: async (ctx) => {
    const pick = MEMES[Math.floor(Math.random() * MEMES.length)];
    await sendQuickReply(ctx.sock, ctx.from, {
      text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Meme of the moment\n${S.heavyBar}\n  ${S.dot} "${pick}"\n${S.divider}\n  ${S.sub} Tap a button to keep going.\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}meme`, text: 'â†» Another' },
        { id: `${ctx.prefix}joke`, text: 'â— Joke' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



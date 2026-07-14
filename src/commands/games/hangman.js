const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const WORDS = [
  { word: 'algorithm', hint: 'Step-by-step problem solving' },
  { word: 'elephant', hint: 'Largest land animal' },
  { word: 'javascript', hint: 'Programming language of the web' },
  { word: 'telescope', hint: 'See the stars up close' },
  { word: 'pyramid', hint: 'Ancient Egyptian structure' },
  { word: 'chocolate', hint: 'Sweet treat from cacao' },
  { word: 'butterfly', hint: 'Colorful winged insect' },
  { word: 'moonlight', hint: 'Glow from above at night' },
  { word: 'keyboard', hint: 'You type on this' },
  { word: 'umbrella', hint: 'Rain protection' },
  { word: 'volcano', hint: 'Mountain that erupts' },
  { word: 'dinosaur', hint: 'Prehistoric giant' },
  { word: 'treasure', hint: 'Hidden valuable' },
  { word: 'midnight', hint: 'Middle of the night' },
  { word: 'whisper', hint: 'Speak very softly' },
  { word: 'skeleton', hint: 'Bones inside you' },
  { word: 'thunder', hint: 'Sound after lightning' },
  { word: 'lantern', hint: 'Portable light source' },
  { word: 'crystal', hint: 'Clear sparkling mineral' },
  { word: 'phantom', hint: 'Ghost or specter' },
];

const MAX_WRONG = 6;

const sessions = new Map();

const renderHangman = (wrong) => {
  const stages = [
    `  \n  \n  \n  \n═══`,
    `  ${S.tri}  \n  \n  \n  \n═══`,
    `  ${S.tri}  \n  O\n  \n  \n═══`,
    `  ${S.tri}  \n  O\n  │\n  \n═══`,
    `  ${S.tri}  \n  O\n /│\n  \n═══`,
    `  ${S.tri}  \n  O\n /│\\\n  \n═══`,
    `  ${S.tri}  \n  O\n /│\\\n / \n═══`,
  ];
  return stages[wrong] || stages[0];
};

module.exports = {
  name: 'hangman',
  aliases: ['hm'],
  category: 'games',
  description: 'Guess the word letter by letter',
  execute: async (ctx) => {
    const chatId = ctx.from;
    const arg = (ctx.args[0] || '').toLowerCase();

    if (arg === 'end' || arg === 'quit') {
      const s = sessions.get(chatId);
      if (!s) return reply(ctx.sock, ctx, `${S.warn} No active game.`);
      const text =
        `${S.brandLine}\n${S.sub}  Hangman ${S.arr} Game Over\n${S.heavyBar}\n` +
        `  ${S.dot} Word ${S.arr} *${s.word}*\n${S.brandLine}`;
      sessions.delete(chatId);
      return reply(ctx.sock, ctx, text);
    }

    const s = sessions.get(chatId);
    if (!s || s.ended) {
      const entry = WORDS[Math.floor(Math.random() * WORDS.length)];
      const newSession = {
        word: entry.word.toLowerCase(),
        hint: entry.hint,
        guessed: new Set(),
        wrong: 0,
        ended: false,
      };
      sessions.set(chatId, newSession);

      const display = newSession.word.split('').map(() => '_').join(' ');
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Hangman\n${S.heavyBar}\n` +
          renderHangman(0) + '\n\n' +
          `  ${S.tri} Word ${S.arr} ${display}\n` +
          `  ${S.tri} Hint ${S.arr} ${newSession.hint}\n` +
          `  ${S.tri} Guesses left ${S.arr} ${MAX_WRONG}\n` +
          `${S.divider}\n  Reply with a letter or word\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}hangman end`, text: '▸ Give Up' },
        ],
      }, ctx.msg);
    }

    if (arg === 'hint') {
      return reply(ctx.sock, ctx, `${S.info} Hint: *${s.hint}*`);
    }

    const guess = arg.replace(/[^a-z]/g, '');
    if (!guess) {
      return reply(ctx.sock, ctx, `${S.warn} Reply with a letter or guess the full word.`);
    }

    if (guess.length === 1) {
      if (s.guessed.has(guess)) {
        return reply(ctx.sock, ctx, `${S.warn} Already guessed: *${guess}*`);
      }
      s.guessed.add(guess);
      if (!s.word.includes(guess)) s.wrong++;
    } else {
      if (guess === s.word) {
        const display = s.word.split('').map(l => s.guessed.has(l) || l === guess ? l : '_').join(' ');
        const text =
          `${S.brandLine}\n${S.sub}  Hangman ${S.arr} You Win!\n${S.heavyBar}\n` +
          renderHangman(s.wrong) + '\n\n' +
          `  ${S.tri} Word ${S.arr} *${s.word}*\n` +
          `  ${S.tri} Wrong ${S.arr} ${s.wrong}/${MAX_WRONG}\n${S.brandLine}`;
        sessions.delete(chatId);
        return reply(ctx.sock, ctx, text);
      } else {
        s.wrong++;
      }
    }

    if (s.wrong >= MAX_WRONG) {
      const text =
        `${S.brandLine}\n${S.sub}  Hangman ${S.arr} Game Over!\n${S.heavyBar}\n` +
        renderHangman(MAX_WRONG) + '\n\n' +
        `  ${S.cross} The word was: *${s.word}*\n${S.brandLine}`;
      sessions.delete(chatId);
      return reply(ctx.sock, ctx, text);
    }

    const display = s.word.split('').map(l => s.guessed.has(l) ? l : '_').join(' ');
    const wrongLetters = [...s.guessed].filter(l => !s.word.includes(l)).join(', ');
    const remaining = MAX_WRONG - s.wrong;
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.sub}  Hangman\n${S.heavyBar}\n` +
        renderHangman(s.wrong) + '\n\n' +
        `  ${S.tri} Word ${S.arr} ${display}\n` +
        `  ${S.tri} Wrong ${S.arr} ${s.wrong}/${MAX_WRONG}\n` +
        (wrongLetters ? `  ${S.tri} Tried ${S.arr} ${wrongLetters}\n` : '') +
        `${S.divider}\n  Reply with a letter or word\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}hangman hint`, text: '▸ Hint' },
        { id: `${ctx.prefix}hangman end`, text: '▸ Give Up' },
      ],
    }, ctx.msg);
  },
};

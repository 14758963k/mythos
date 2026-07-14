const { reply, sendText } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const TRIVIA_QUESTIONS = [
  { q: 'What is the capital of Romania?', o: ['A. London', 'B. Berlin', 'C. Bucharest'], a: 'C' },
  { q: 'Which planet is known as the Red Planet?', o: ['A. Earth', 'B. Mars', 'C. Venus'], a: 'B' },
  { q: 'Capital of Iceland?', o: ['A. Ice City', 'B. Reykjavik', 'C. Wales'], a: 'B' },
  { q: 'What is the capital of Hungary?', o: ['A. Budapest', 'B. Huncity', 'C. Hungury'], a: 'A' },
  { q: 'Which anime/manga is Goku from?', o: ['A. Dragon Ball', 'B. Naruto', 'C. JJK'], a: 'A' },
  { q: 'Group of organs are called?', o: ['A. System', 'B. Cells', 'C. Organ'], a: 'A' },
  { q: 'Capital of Germany?', o: ['A. London', 'B. Berlin', 'C. Paris'], a: 'B' },
  { q: "What's the largest ocean on Earth?", o: ['A. Atlantic', 'B. Indian', 'C. Pacific'], a: 'C' },
  { q: "Who wrote 'To Kill a Mockingbird'?", o: ['A. J.K. Rowling', 'B. Harper Lee', 'C. Stephen King'], a: 'B' },
  { q: 'What is the chemical symbol for water?', o: ['A. Wo', 'B. Wa', 'C. H2O'], a: 'C' },
  { q: "What's the tallest mammal?", o: ['A. Elephant', 'B. Giraffe', 'C. Rhino'], a: 'B' },
  { q: 'Which country is the Land of the Rising Sun?', o: ['A. China', 'B. Japan', 'C. South Korea'], a: 'B' },
  { q: 'Who painted the Mona Lisa?', o: ['A. Van Gogh', 'B. Picasso', 'C. Leonardo da Vinci'], a: 'C' },
  { q: "What's the chemical symbol for gold?", o: ['A. Au', 'B. Ag', 'C. Fe'], a: 'A' },
  { q: 'Which mammal can fly?', o: ['A. Bat', 'B. Mouse', 'C. Rabbit'], a: 'A' },
  { q: "What's the largest organ in the human body?", o: ['A. Liver', 'B. Brain', 'C. Skin'], a: 'C' },
  { q: 'Who invented the telephone?', o: ['A. Edison', 'B. Bell', 'C. Tesla'], a: 'B' },
  { q: "What's the currency of Japan?", o: ['A. Yen', 'B. Dollar', 'C. Euro'], a: 'A' },
  { q: "Who wrote 'Romeo and Juliet'?", o: ['A. Shakespeare', 'B. Dickens', 'C. Austen'], a: 'A' },
  { q: 'What is the speed of light?', o: ['A. 300k km/s', 'B. 150k km/s', 'C. 500k km/s'], a: 'A' },
  { q: 'How many bones are in the human body?', o: ['A. 106', 'B. 206', 'C. 306'], a: 'B' },
  { q: 'What is the smallest prime number?', o: ['A. 0', 'B. 1', 'C. 2'], a: 'C' },
  { q: 'Which element has atomic number 1?', o: ['A. Helium', 'B. Hydrogen', 'C. Oxygen'], a: 'B' },
  { q: 'What year did WW2 end?', o: ['A. 1943', 'B. 1945', 'C. 1947'], a: 'B' },
  { q: 'What is the largest planet in our solar system?', o: ['A. Saturn', 'B. Neptune', 'C. Jupiter'], a: 'C' },
];

const sessions = new Map();

module.exports = [
  {
    name: 'trivia',
    aliases: ['quiz'],
    category: 'fun',
    description: 'Answer trivia questions',
    execute: async (ctx) => {
      const chatId = ctx.from;
      const answer = (ctx.args[0] || '').toUpperCase();
      const session = sessions.get(chatId);

      if (answer && session) {
        if (['A', 'B', 'C'].includes(answer)) {
          if (answer === session.current.a) {
            session.score++;
            session.correct++;
          } else {
            session.wrong++;
            session.missed.push(`${session.current.q} → ${session.current.a}`);
          }
          session.index++;
        }
      }

      if (!session || !session.active) {
        const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
        const s = { active: true, questions: shuffled, index: 0, score: 0, correct: 0, wrong: 0, missed: [] };
        s.current = s.questions[0];
        sessions.set(chatId, s);
        const text =
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Trivia Game\n${S.heavyBar}\n` +
          `  ${S.tri} 10 questions\n  ${S.tri} Reply A, B, or C\n${S.divider}\n` +
          `  *Q1:* ${s.current.q}\n` +
          s.current.o.map((o) => `  ${S.sqr} ${o}`).join('\n') +
          `\n${S.brandLine}`;
        await reply(ctx.sock, ctx, text);
        return;
      }

      if (session.index >= session.questions.length) {
        session.active = false;
        const text =
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Trivia Complete\n${S.heavyBar}\n` +
          `  ${S.dot} Score: *${session.score}/${session.questions.length}*\n` +
          `  ${S.dot} Correct: ${session.correct}\n` +
          `  ${S.dot} Wrong: ${session.wrong}\n` +
          (session.missed.length ? `\n  ${S.warn} Missed:\n${session.missed.map((m) => `    ${S.sqr} ${m}`).join('\n')}` : '') +
          `\n${S.divider}\n  ${S.sub} Run .trivia to play again\n${S.brandLine}`;
        sessions.delete(chatId);
        await reply(ctx.sock, ctx, text);
        return;
      }

      session.current = session.questions[session.index];
      const text =
        `*Q${session.index + 1}:* ${session.current.q}\n` +
        session.current.o.map((o) => `${S.sqr} ${o}`).join('\n') +
        `\n${S.divider} Score: ${session.score}/${session.index}`;
      await reply(ctx.sock, ctx, text);
    },
  },
  {
    name: 'truth',
    category: 'fun',
    description: 'Get a truth question',
    execute: async (ctx) => {
      const { truth } = require('../../data/truth-dare');
      await reply(ctx.sock, ctx, `${S.brandLine}\n${S.sub}  Truth\n${S.heavyBar}\n  ${truth()}\n${S.brandLine}`);
    },
  },
  {
    name: 'dare',
    category: 'fun',
    description: 'Get a dare challenge',
    execute: async (ctx) => {
      const { dare } = require('../../data/truth-dare');
      await reply(ctx.sock, ctx, `${S.brandLine}\n${S.sub}  Dare\n${S.heavyBar}\n  ${dare()}\n${S.brandLine}`);
    },
  },
  {
    name: 'question',
    category: 'fun',
    description: 'Get a random question',
    execute: async (ctx) => {
      const { randomQuestion } = require('../../data/truth-dare');
      await reply(ctx.sock, ctx, `${S.brandLine}\n${S.sub}  Random Question\n${S.heavyBar}\n  ${randomQuestion()}\n${S.brandLine}`);
    },
  },
];

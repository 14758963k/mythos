/**
 * .quote â€” random inspirational quote (built-in list).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const QUOTES = [
  { q: 'A program is poetry that compiles.', a: 'Anonymous' },
  { q: 'Simplicity is the soul of efficiency.', a: 'Austin Freeman' },
  { q: 'Make it work, make it right, make it fast.', a: 'Kent Beck' },
  { q: 'First, solve the problem. Then, write the code.', a: 'John Johnson' },
  { q: 'The best error message is the one that never shows up.', a: 'Thomas Fuchs' },
  { q: 'Code is read more often than it is written.', a: 'Guido van Rossum' },
  { q: 'Any sufficiently advanced bug is indistinguishable from a feature.', a: 'A. K. Dewdney' },
  { q: 'There are two hard things in computer science: cache invalidation and naming things.', a: 'Phil Karlton' },
  { q: 'Walking on water and developing software from a specification are easy if both are frozen.', a: 'Edward V. Berard' },
  { q: 'It works on my machine.', a: 'Every developer, ever' },
  { q: 'Weeks of coding can save you hours of planning.', a: 'Anonymous' },
  { q: 'The most damaging phrase in the language is: we have always done it this way.', a: 'Grace Hopper' },
  { q: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.', a: 'Antoine de Saint-ExupÃ©ry' },
  { q: 'Software is a gas; it expands to fill its container.', a: 'Nathan Myhrvold' },
  { q: 'If debugging is the process of removing bugs, then programming must be the process of putting them in.', a: 'Edsger Dijkstra' },
];

module.exports = {
  name: 'quote',
  aliases: ['wisdom', 'inspiration'],
  category: 'fun',
  description: 'Pull a random inspirational quote',
  execute: async (ctx) => {
    const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Quote of the moment\n${S.heavyBar}\n` +
        `  ${S.dot} "${pick.q}"\n  ${S.sub} ${S.arr} ${pick.a}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}quote`, text: 'â†» Another' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



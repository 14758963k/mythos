/**
 * .joke â€” random joke from a built-in list.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const JOKES = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'How many programmers does it take to change a light bulb? None, that is a hardware problem.',
  'A SQL query walks into a bar, sees two tables, and asks: "Can I JOIN you?"',
  'There are only 10 kinds of people in the world: those who understand binary and those who do not.',
  'I would tell you a UDP joke, but you might not get it.',
  'Why did the developer go broke? Because he used up all his cache.',
  'A Boolean walks into a bar. The bartender asks "What would you like?" The Boolean replies: "Yes."',
  'I tried to write a joke about recursion, but I would need to first understand the joke about recursion.',
  'Why was the function sad? Because it did not get called.',
  'There are two ways to write error-free programs; only the third one works.',
];

module.exports = {
  name: 'joke',
  aliases: ['lol', 'jk'],
  category: 'fun',
  description: 'Tell a random joke',
  execute: async (ctx) => {
    const pick = JOKES[Math.floor(Math.random() * JOKES.length)];
    await sendQuickReply(ctx.sock, ctx.from, {
      text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Joke  ${S.arr}  Incoming\n${S.heavyBar}\n  ${S.dot} ${pick}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}joke`, text: 'â†» Another' },
        { id: `${ctx.prefix}meme`, text: 'â— Meme' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



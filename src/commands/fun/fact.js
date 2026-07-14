/**
 * .fact â€” random science / tech fact.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const FACTS = [
  'The first computer bug was an actual moth, found in 1947 in the Harvard Mark II.',
  'A modern smartphone has more computing power than the computers that guided Apollo 11.',
  'Email is older than the World Wide Web by nearly two decades.',
  'The original name for Windows was "Interface Manager".',
  'Python was named after Monty Python, not the snake.',
  'The @ symbol is called "commercial at" or "at sign".',
  'Wi-Fi does not actually stand for "wireless fidelity".',
  'About 90 percent of the world\u2019s currency is digital, not physical.',
  'The first domain name ever registered was symbolics.com, on March 15, 1985.',
  'A group of flamingos is called a "flamboyance".',
  'Honey never spoils. Edible honey has been found in ancient Egyptian tombs.',
  'The Eiffel Tower can grow more than 6 inches taller in summer due to thermal expansion.',
];

module.exports = {
  name: 'fact',
  aliases: ['facts', 'trivia'],
  category: 'fun',
  description: 'A random fact',
  execute: async (ctx) => {
    const pick = FACTS[Math.floor(Math.random() * FACTS.length)];
    await sendQuickReply(ctx.sock, ctx.from, {
      text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Did you know\n${S.heavyBar}\n  ${S.dot} ${pick}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}fact`, text: 'â†» Another' },
        { id: `${ctx.prefix}quote`, text: 'âœŽ Quote' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



/**
 * .8ball â€” magic 8 ball answer.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const ANSWERS = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes, definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don\u2019t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.',
];

module.exports = {
  name: '8ball',
  aliases: ['eight', '8b'],
  category: 'fun',
  description: 'Magic 8 ball â€” ask a yes/no question',
  execute: async (ctx) => {
    if (!ctx.args.length) {
      await reply(ctx.sock, ctx, `${S.warn} Ask a question. Example: *${ctx.prefix}8ball Will it rain today?*`);
      return;
    }
    const a = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    const q = ctx.args.join(' ');
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Magic 8 Ball\n${S.heavyBar}\n` +
        `  ${S.dot} Q ${S.arr}  ${q}\n  ${S.dot} A ${S.arr}  ${a}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}8ball ${q}`, text: 'â†» Ask again' },
        { id: `${ctx.prefix}menu`, text: 'âŒ‚ Menu' },
      ],
    }, ctx.msg);
  },
};



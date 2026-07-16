/**
 * Fun social commands — ship, wouldyourather,compatibility, roast, compliment.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const WYR = [
  'Be able to fly or be invisible?',
  'Live without music or live without movies?',
  'Have unlimited money or unlimited time?',
  'Be famous or be rich?',
  'Read minds or see the future?',
  'Be strong or be fast?',
  'Live in the past or live in the future?',
  'Have a rewind button or a pause button for life?',
  'Be the funniest or the smartest person in the room?',
  'Always be 10 minutes late or always be 20 minutes early?',
  'Give up social media or give up takeaway food?',
  'Have a personal chef or a personal driver?',
  'Know how you die or know when you die?',
  'Have super strength or super speed?',
  'Be able to talk to animals or speak every human language?',
];

const ROASTS = [
  'You bring everyone a lot of joy... when you leave.',
  'If you were any more inbred, you would be a sandwich.',
  "I'd agree with you, but then we'd both be wrong.",
  'You have the perfect face for radio.',
  'You are proof that evolution can go in reverse.',
  "I'm jealous of people who don't know you.",
  "You're like a cloud. When you disappear, it's a beautiful day.",
  'If brains were dynamite, you would not have enough to blow your nose.',
  'You have something on your chin... the third one.',
  'I thought of you today. It reminded me to take out the trash.',
];

const COMPLIMENTS = [
  'You have a great sense of humor.',
  'You light up the room.',
  'Your smile is contagious.',
  'You have the best laugh.',
  'You are making a difference.',
  'Your kindness is a blessing.',
  'You have a great sense of style.',
  'You are enough just as you are.',
  'Your creativity is inspiring.',
  'You make a positive impact.',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = [
  {
    name: 'wyr',
    aliases: ['wouldyourather', 'would'],
    category: 'fun',
    description: 'Would you rather?',
    execute: async (ctx) => {
      const q1 = pick(WYR);
      let q2 = pick(WYR);
      while (q2 === q1) q2 = pick(WYR);
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Would You Rather\n${S.heavyBar}\n\n` +
        `  ${S.dot} A: ${q1}\n\n  ${S.dot} B: ${q2}\n\n${S.divider}\n` +
        `  Reply *A* or *B*\n${S.brandLine}`
      );
    },
  },
  {
    name: 'roast',
    category: 'fun',
    description: 'Get roasted by the bot',
    execute: async (ctx) => {
      const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const name = target ? `@${target.split('@')[0]}` : ctx.pushName || 'you';
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Roast\n${S.heavyBar}\n  ${pick(ROASTS)}\n${S.brandLine}`,
        { mentions: target ? [target] : [] }
      );
    },
  },
  {
    name: 'compliment',
    aliases: ['nice', 'praise'],
    category: 'fun',
    description: 'Get a compliment from the bot',
    execute: async (ctx) => {
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Compliment\n${S.heavyBar}\n  ${pick(COMPLIMENTS)}\n${S.brandLine}`
      );
    },
  },
  {
    name: 'ship',
    aliases: ['love', 'compat'],
    category: 'fun',
    description: 'Check love compatibility between two people',
    execute: async (ctx) => {
      const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentioned.length < 2 && ctx.args.length < 2) {
        return reply(ctx.sock, ctx, `${S.warn} Tag two people: *${ctx.prefix}ship @user1 @user2*`);
      }
      const p1 = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : ctx.args[0] || 'Person 1';
      const p2 = mentioned[1] ? `@${mentioned[1].split('@')[0]}` : ctx.args[1] || 'Person 2';
      const score = Math.floor(Math.random() * 100) + 1;
      const hearts = score > 70 ? '♥♥♥♥♥' : score > 50 ? '♥♥♥♥' : score > 30 ? '♥♥♥' : score > 10 ? '♥♥' : '♥';
      const verdict = score > 80 ? 'Perfect match!' : score > 60 ? 'Great chemistry!' : score > 40 ? 'Possible spark...' : score > 20 ? 'Just friends?' : 'Not meant to be.';

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Love Calculator\n${S.heavyBar}\n\n` +
        `  ${S.dot} ${p1} ${S.heart} ${p2}\n\n` +
        `  ${hearts}\n\n` +
        `  ${S.dot} Compatibility ${S.arr} *${score}%*\n` +
        `  ${S.dot} ${verdict}\n${S.brandLine}`,
        { mentions: [...mentioned] }
      );
    },
  },
  {
    name: 'rate',
    category: 'fun',
    description: 'Rate something on a scale of 1-10',
    execute: async (ctx) => {
      const subject = ctx.args.join(' ') || 'this';
      const score = Math.floor(Math.random() * 10) + 1;
      const bar = '█'.repeat(score) + '░'.repeat(10 - score);
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Rate\n${S.heavyBar}\n` +
        `  ${S.dot} ${subject} ${S.arr} *${score}*/10\n` +
        `  ${S.dot} [${bar}]\n${S.brandLine}`
      );
    },
  },
  {
    name: 'choose',
    aliases: ['pick'],
    category: 'fun',
    description: 'Choose between options separated by |',
    execute: async (ctx) => {
      const input = ctx.args.join(' ');
      if (!input) return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}choose option1 | option2 | option3*`);
      const options = input.split('|').map(s => s.trim()).filter(Boolean);
      if (options.length < 2) return reply(ctx.sock, ctx, `${S.warn} Provide at least 2 options separated by |`);
      const chosen = pick(options);
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Choose\n${S.heavyBar}\n` +
        `  ${S.dot} Options ${S.arr} ${options.length}\n` +
        `  ${S.dot} Picked ${S.arr} *${chosen}*\n${S.brandLine}`
      );
    },
  },
];

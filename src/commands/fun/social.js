const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const SHIPS = [
  'Soulmates', 'Eternal Love', 'Destined', 'Burning Passion', 'Deep Connection',
  'Karmic Bond', 'True Love', 'Fated', 'Heartbound', 'Twinned Flames',
  'Serenade', 'Enchantment', 'Blissful', 'Harmonious', 'Inseparable',
  'Passionate', 'Romantic', 'Tender', 'Playful', 'Adventurous',
];

const getShipScore = (n1, n2) => {
  let hash = 0;
  const combined = (n1 + n2).toLowerCase();
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 101;
};

const getBar = (pct) => {
  const full = Math.floor(pct / 10);
  return S.bar.repeat(full) + S.thinBar.repeat(10 - full);
};

module.exports = [
  {
    name: 'ship',
    aliases: ['love', 'marry'],
    category: 'fun',
    description: 'Ship two people',
    execute: async (ctx) => {
      let p1, p2;
      const mentions = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (mentions.length >= 2) {
        p1 = mentions[0].split('@')[0];
        p2 = mentions[1].split('@')[0];
      } else if (mentions.length === 1 && ctx.args.length > 0) {
        p1 = ctx.pushName || 'You';
        p2 = mentions[0].split('@')[0];
      } else if (ctx.args.length >= 2) {
        p1 = ctx.args[0];
        p2 = ctx.args[1];
      } else {
        p1 = ctx.pushName || 'You';
        p2 = 'Mythos';
      }
      const score = getShipScore(p1, p2);
      const ship = SHIPS[Math.floor(Math.random() * SHIPS.length)];
      const hearts = Math.round(score / 10);
      const heartStr = S.heart.repeat(hearts) + S.outStar.repeat(10 - hearts);
      const verdict = score > 80 ? 'Perfect match!' : score > 60 ? 'Great chemistry!' : score > 40 ? 'Not bad!' : score > 20 ? 'Could work...' : 'Not meant to be';

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Ship ${S.arr} ${p1} ${S.heart} ${p2}\n${S.heavyBar}\n\n` +
        `  ${S.tri} Score ${S.arr} *${score}%*\n` +
        `  ${S.tri} ${heartStr}\n` +
        `  ${S.tri} Status ${S.arr} *${ship}*\n` +
        `  ${S.tri} ${verdict}\n\n${S.brandLine}`
      );
    },
  },
  {
    name: 'flirt',
    category: 'fun',
    description: 'Send a flirt message',
    execute: async (ctx) => {
      const flirts = [
        'Are you a magician? Because whenever I look at you, everyone else disappears.',
        'Do you have a map? I keep getting lost in your eyes.',
        'Are you a campfire? Because you are hot and I want s\'mores.',
        'Is your name Google? Because you have everything I\'m searching for.',
        'Do you believe in love at first sight, or should I walk by again?',
        'Are you a parking ticket? Because you\'ve got FINE written all over you.',
        'If you were a vegetable, you\'d be a cute-cumber.',
        'Do you have a sunburn, or are you always this hot?',
        'Is there an airport nearby, or is that just my heart taking off?',
        'Can you take a picture? I want to show my friends what an angel looks like.',
      ];
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Flirt\n${S.heavyBar}\n  ${flirts[Math.floor(Math.random() * flirts.length)]}\n${S.brandLine}`
      );
    },
  },
  {
    name: 'insult',
    aliases: ['roast'],
    category: 'fun',
    description: 'Generate a playful roast',
    execute: async (ctx) => {
      const insults = [
        'You\'re the reason God created the middle finger.',
        'If you were any more inbred, you\'d be a sandwich.',
        'You bring everyone a lot of joy... when you leave.',
        'I\'d agree with you, but then we\'d both be wrong.',
        'You\'re like a cloud. When you disappear, it\'s a beautiful day.',
        'I\'m jealous of people who don\'t know you.',
        'You have the right to remain silent. Please use it.',
        'If stupidity was a sport, you\'d be an Olympian.',
        'Your face is perfectly designed for a mask.',
        'Somewhere out there, a tree is producing oxygen for you. I\'m sorry, tree.',
      ];
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Roast\n${S.heavyBar}\n  ${insults[Math.floor(Math.random() * insults.length)]}\n${S.brandLine}`
      );
    },
  },
  {
    name: 'pickup',
    aliases: ['pickupline', 'rizz'],
    category: 'fun',
    description: 'Get a pickup line',
    execute: async (ctx) => {
      const lines = [
        'Are you WiFi? Because I\'m feeling a connection.',
        'Did it hurt? When you fell from heaven?',
        'Do you have a Band-Aid? I scraped my knee falling for you.',
        'Are you a light switch? Because you just turned me on.',
        'Do you believe in fate? Because I think we\'re written in the stars.',
        'If you were a tear drop, I\'d never cry for fear of losing you.',
        'Your hand looks heavy. Can I hold it for you?',
        'I must be a snowflake, because I\'ve fallen for you.',
        'Are you a camera? Because every time I look at you, I smile.',
        'Even if there was gravity on Earth, I\'d still fall for you.',
      ];
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Pickup Line\n${S.heavyBar}\n  ${lines[Math.floor(Math.random() * lines.length)]}\n${S.brandLine}`
      );
    },
  },
  {
    name: 'magic8',
    aliases: ['magicconch', 'conch'],
    category: 'fun',
    description: 'Ask the magic conch shell',
    execute: async (ctx) => {
      const answers = [
        'Maybe someday.',
        'Try again later.',
        'I don\'t think so.',
        'Yes.',
        'No.',
        'The answer is buried in sand.',
        'The wind says yes.',
        'The spirits say no.',
        'Reply hazy, try again.',
        'Ask again when the moon is full.',
        'The conch has spoken. The answer is yes.',
        'The conch has spoken. The answer is no.',
        'The conch is sleeping. Come back later.',
        'Absolutely not.',
        'Without a doubt.',
      ];
      const q = ctx.args.join(' ') || 'What does the future hold?';
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Magic Conch\n${S.heavyBar}\n` +
        `  ${S.tri} Q ${S.arr}  ${q}\n  ${S.tri} A ${S.arr}  *${answers[Math.floor(Math.random() * answers.length)]}*\n${S.brandLine}`
      );
    },
  },
];

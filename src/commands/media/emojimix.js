const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

const EMOJI_MAP = {
  smile: ['😀', '😃', '😄', '😁', '😆'],
  love: ['❤️', '💕', '💖', '💗', '💘'],
  sad: ['😢', '😭', '💔', '🥺', '😞'],
  angry: ['😡', '🤬', '💢', '😤', '😾'],
  fire: ['🔥', '💥', '💫', '⚡', '🌟'],
  nature: ['🌸', '🌺', '🌻', '🌷', '🌹'],
  food: ['🍕', '🍔', '🍟', '🌮', '🍣'],
  animal: ['🐱', '🐶', '🐰', '🦊', '🐼'],
};

module.exports = [
  {
    name: 'emojimix',
    aliases: ['emix'],
    category: 'media',
    description: 'Mix two emojis',
    execute: async (ctx) => {
      const args = ctx.args;
      if (args.length < 2) {
        const themes = Object.keys(EMOJI_MAP).map(k => `  ${S.sqr} ${k} ${S.arr} ${EMOJI_MAP[k].slice(0, 3).join(' ')}`).join('\n');
        return reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Emoji Mix\n${S.heavyBar}\n` +
          `${themes}\n${S.divider}\n  ${S.tri} Usage ${S.arr} ${ctx.prefix}emix <emoji1> <emoji2>\n  ${S.tri} Or ${S.arr} ${ctx.prefix}emix <theme>\n${S.brandLine}`
        );
      }

      let e1, e2;
      if (EMOJI_MAP[args[0].toLowerCase()]) {
        const pool = EMOJI_MAP[args[0].toLowerCase()];
        e1 = pool[Math.floor(Math.random() * pool.length)];
        e2 = pool[Math.floor(Math.random() * pool.length)];
      } else {
        e1 = args[0];
        e2 = args[1];
      }

      const combos = [
        `${e1}${e2}`, `${e2}${e1}`, `${e1}${e1}${e2}`, `${e2}${e1}${e2}`,
        `${e1}✨${e2}`, `${e1}💫${e2}`, `${e2}⭐${e1}`,
      ];
      const picked = combos.sort(() => Math.random() - 0.5).slice(0, 3);

      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Emoji Mix\n${S.heavyBar}\n\n` +
        `  ${S.tri} ${e1} ${S.heart} ${e2} ${S.arr} *${picked[0]}*\n` +
        picked.slice(1).map((c, i) => `  ${S.tri} Alt ${i + 1} ${S.arr} ${c}`).join('\n') +
        `\n${S.divider}\n  ${S.sub} React with these to use them!\n${S.brandLine}`
      );
    },
  },
  {
    name: 'pick',
    aliases: ['choose', 'random'],
    category: 'fun',
    description: 'Pick a random option',
    execute: async (ctx) => {
      const options = ctx.args.join(' ').split(/[,|]/).map(s => s.trim()).filter(Boolean);
      if (options.length < 2) {
        return reply(ctx.sock, ctx, `${S.warn} Usage: *${ctx.prefix}pick option1, option2, option3*`);
      }
      const pick = options[Math.floor(Math.random() * options.length)];
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Random Pick\n${S.heavyBar}\n` +
        `  ${S.tri} Options ${S.arr} ${options.map(o => `*${o}*`).join(', ')}\n` +
        `  ${S.tri} Picked ${S.arr} *${pick}*\n${S.brandLine}`
      );
    },
  },
];

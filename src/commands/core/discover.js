/**
 * .discover — Mythos in motion. Native-flow single-select showcase.
 * (Carousel/cards was the original design but WhatsApp deprecated the cards
 * surface; a single-select picker renders identically in current clients.)
 */

const { sendNativeList, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const config = require('../../config');

const FEATURES = [
  {
    title: `${S.brand} Command Atlas`,
    subtitle: 'Fifty Names, Seven Realms',
    body: 'Open the Mythos command atlas. Every command is one tap away.',
  },
  {
    title: `${S.brand} Group Mastery`,
    subtitle: 'Welcome, Goodbye, Antilink',
    body: 'Mythos greets new members, says goodbye, and polices links.',
  },
  {
    title: `${S.brand} The Forge`,
    subtitle: 'Calc, QR, Hash, Base64',
    body: 'Twenty-three tools. Calculator, QR, base64, UUID, password forge.',
  },
  {
    title: `${S.brand} The Oracle`,
    subtitle: 'Weather, Define, Translate, Time',
    body: 'Time across the world. Definitions. Translations. Weather in 15 cities.',
  },
  {
    title: `${S.brand} Reminders`,
    subtitle: 'Memories that Return',
    body: 'Tell Mythos to remind you. The bot will whisper back at the exact moment.',
  },
];

module.exports = {
  name: 'discover',
  aliases: ['tour', 'features'],
  category: 'core',
  description: 'Mythos in motion — interactive feature showcase',
  execute: async (ctx) => {
    const sections = [
      {
        title: `${S.sub} Movements of Mythos`,
        rows: [
          { id: `${config.bot.prefix}menu`, title: `${S.tri} Atlas`, description: 'Browse all 62 commands' },
          { id: `${config.bot.prefix}commands group`, title: `${S.tri} Group Mastery`, description: 'Welcome, goodbye, antilink' },
          { id: `${config.bot.prefix}commands tools`, title: `${S.tri} The Forge`, description: 'Calc, QR, hash, base64' },
          { id: `${config.bot.prefix}commands utility`, title: `${S.tri} The Oracle`, description: 'Weather, define, translate, time' },
          { id: `${config.bot.prefix}remind 1h walk the dog`, title: `${S.tri} Reminders`, description: 'Try setting a reminder' },
        ],
      },
    ];
    await sendNativeList(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${S.brandSub}\n${S.heavyBar}\n` +
        `  ${S.heart}  Five movements of Mythos.\n  ${S.sub}  Pick one to begin.\n${S.brandLine}`,
      title: 'Mythos ⟁ Discover',
      buttonText: '▸ Pick a movement',
      sections,
    }, ctx.msg);
  },
};

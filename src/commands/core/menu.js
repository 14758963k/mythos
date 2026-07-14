/**
 * .menu — startup card + two-level command index.
 * Level 1: user card + category picker.
 * Level 2: themed category card + command picker.
 */

const { sendText, sendNativeList } = require('../../helpers/messages');
const { startupCard, categoryTitle } = require('../../helpers/interactive');
const { S } = require('../../helpers/formatter');
const config = require('../../config');
const store = require('../../core/store');
const loader = require('../../core/loader');

const categoryCard = ({ cat, cmds, pushName, participant, prefix }) => {
  const total = cmds.length;
  const role = 'User';
  const displayMention = `@${participant?.split('@')[0] || '?'}`;

  const body =
    `⟁  Mythos  ⟁  Ascendant\n` +
    `${S.ultraBar}\n` +
    `↳  ${displayMention}, browsing ${categoryTitle(cat)}\n` +
    `${S.heavyBar}\n` +
    `\n` +
    `⟁ *${S.lBrack} ${categoryTitle(cat).toUpperCase()} ${S.rBrack}* ⟁\n` +
    `  ${S.tri} Category   ${S.arr}  ${categoryTitle(cat)}\n` +
    `  ${S.tri} Commands   ${S.arr}  ${total}\n` +
    `  ${S.tri} Browse     ${S.arr}  Pick below\n` +
    `\n` +
    `${S.heavyBar}\n` +
    `↳  *${prefix}menu* for all categories\n` +
    `⟁  Mythos  ⟁  Ascendant`;

  const mentionJid = `${(participant || '').split('@')[0]}@s.whatsapp.net`;
  return { text: body, mentions: [mentionJid] };
};

const showCategories = async (ctx) => {
  const total = loader.all().length;
  const grouped = loader.grouped();
  const catCount = Object.keys(grouped).length;

  const card = startupCard({
    pushName: ctx.pushName,
    participant: ctx.participant,
    isOwner: ctx.isOwner,
    totalCommands: total,
    startedAt: store.get('bot').startedAt || Date.now(),
    phone: ctx.phone,
  });
  await sendText(ctx.sock, ctx.from, card.text, { mentions: card.mentions });

  const sections = [{
    title: `${S.brand} Categories`,
    rows: Object.entries(grouped).map(([cat, cmds]) => ({
      header: cat.slice(0, 3).toUpperCase(),
      title: categoryTitle(cat),
      description: `${cmds.length} commands`,
      id: `cat:${cat}`,
    })),
  }];

  await sendNativeList(
    ctx.sock,
    ctx.from,
    {
      text: `${S.ultraBar}\n  ${S.sub} ${total} commands across ${catCount} categories\n${S.heavyBar}\n  ${S.sub} Pick a category to browse`,
      title: `${S.brand} Command Index`,
      buttonText: 'Browse',
      footer: `${S.brand} ${config.bot.name}`,
      sections,
    },
    ctx.msg
  );
};

const showCategory = async (ctx, cat) => {
  const grouped = loader.grouped();
  const cmds = grouped[cat];
  if (!cmds) return reply(ctx.sock, ctx, `${S.cross} Unknown category.`);

  const card = categoryCard({
    cat, cmds,
    pushName: ctx.pushName,
    participant: ctx.participant,
    prefix: ctx.prefix,
  });
  await sendText(ctx.sock, ctx.from, card.text, { mentions: card.mentions });

  const sections = [{
    title: `${S.tri} ${categoryTitle(cat)}`,
    rows: cmds.map((c) => ({
      header: cat.slice(0, 3).toUpperCase(),
      title: c.name,
      description: (c.description || '').slice(0, 50),
      id: c.name,
    })),
  }];

  await sendNativeList(
    ctx.sock,
    ctx.from,
    {
      text: `${S.ultraBar}\n  ${S.sub} ${cmds.length} commands in ${categoryTitle(cat)}\n${S.heavyBar}\n  ${S.sub} Pick a command to run`,
      title: `${S.brand} ${categoryTitle(cat)}`,
      buttonText: 'Run',
      footer: `${S.brand} ${config.bot.name}`,
      sections,
    },
    ctx.msg
  );
};

module.exports = {
  name: 'menu',
  aliases: ['m', 'help'],
  category: 'core',
  description: 'Open the command index',
  showCategories,
  showCategory,
  execute: async (ctx) => showCategories(ctx),
};

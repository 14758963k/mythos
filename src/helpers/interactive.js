/**
 * Mythos ⟁ Ascendant — interactive menu builders.
 * These are the workhorses behind the main menu, command browser, and the
 * various sub-menus we use throughout the bot.
 */

const { S } = require('./formatter');
const config = require('../config');
const { bestPhone, jidToNumber } = require('./jid');

/** Convert a category to a human title. */
const categoryTitle = (cat) => {
  const map = {
    core: 'Core',
    fun: 'Entertainment',
    tools: 'Tools',
    utility: 'Utility',
    group: 'Group',
    media: 'Media',
    owner: 'Owner',
    converter: 'Converter',
    economy: 'Economy',
    sticker: 'Sticker',
    editor: 'Image Editor',
    audio: 'Audio Effects',
    audiofx: 'Audio Effects',
    downloader: 'Downloaders',
    search: 'Search',
    info: 'Info',
    games: 'Games',
    misc: 'Misc',
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
};

/** Build a "section of commands" entry for a list message. */
const commandSection = (cat, cmds) => ({
  title: `${S.tri} ${categoryTitle(cat)}`,
  rows: cmds.map((c) => ({
    header: categoryTitle(cat).slice(0, 3).toUpperCase(),
    title: `${S.tri} ${c.name}`,
    description: (c.description || '').slice(0, 60),
    id: c.name,
  })),
});

/** Main menu sections — one section per command category. */
const mainMenuSections = (grouped) => {
  const cats = Object.keys(grouped);
  const sections = cats.map((cat) => commandSection(cat, grouped[cat]));
  return sections;
};

/** A single section with category chooser. */
const categoryChooser = (grouped) => [
  {
    title: `${S.brand} Categories`,
    rows: Object.keys(grouped).map((cat) => ({
      header: categoryTitle(cat).slice(0, 3).toUpperCase(),
      title: `${S.tri} ${categoryTitle(cat)}`,
      description: `${grouped[cat].length} commands`,
      id: `cat:${cat}`,
    })),
  },
];

/** Info card used by .info command. */
const infoCard = ({ name, tag, version, prefix, owner, uptimeMs, totalCommands, totalUsers }) => {
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date(Date.now() - uptimeMs);
  const up = `${d.getUTCHours()}h ${pad(d.getUTCMinutes())}m ${pad(d.getUTCSeconds())}s`;
  return (
    `${S.brandLine}\n` +
    `${S.ultraBar}\n` +
    `${S.sub}  ${tag}  ${S.arr}  v${version}\n` +
    `${S.heavyBar}\n` +
    `  ${S.sqr} Name       ${S.arr}  ${name}\n` +
    `  ${S.sqr} Prefix     ${S.arr}  ${prefix}\n` +
    `  ${S.sqr} Owner      ${S.arr}  ${owner || 'unset'}\n` +
    `  ${S.sqr} Uptime     ${S.arr}  ${up}\n` +
    `  ${S.sqr} Commands   ${S.arr}  ${totalCommands}\n` +
    `  ${S.sqr} Users      ${S.arr}  ${totalUsers}\n` +
    `${S.divider}\n` +
    `  ${S.sparkle} ${S.brandSub}\n` +
    `${S.heavyBar}\n` +
    `  ${S.sub} Reply with *${prefix}menu* to return to the index.\n` +
    `${S.brandLine}`
  );
};

// ─── startup card (USER INFO + BOT STATUS) ─────────────────────────────
/**
 * The Mythos startup card — USER INFO + BOT STATUS in one compact panel,
 * followed by a credits footer. Designed to be the first thing a user sees
 * when they type .menu, .start, or just "mythos".
 *
 * Returns { text, mentions }. Pass mentions to sendMessage.
 */
const startupCard = ({ pushName, participant, isOwner, totalCommands, startedAt, role, phone }) => {
  // Use the phone if we have it (works for both PN and LID JIDs);
  // fall back to pushName-derived number; else "—".
  const num = phone || bestPhone(participant, pushName) || '—';
  // The mention is the user's actual JID so the @ is clickable; the visible
  // text uses the phone so users see "254743651390" not the opaque LID.
  const displayMention = num === '—' ? `@${participant?.split('@')[0] || '?'}` : `@${num}`;
  // Phone-source for the JID: when we know the phone, prefer the PN JID so
  // WhatsApp shows the phone version when the @ is tapped.
  const mentionJid = num !== '—' && jidToNumber(participant)
    ? participant  // already a PN JID
    : (num !== '—' ? `${num}@s.whatsapp.net` : participant);

  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const now = `${pad(d.getDate())}/${d.getMonth() + 1}/${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
  const upMs = Date.now() - (startedAt || Date.now());
  const upD = Math.floor(upMs / 86400000);
  const upH = Math.floor((upMs % 86400000) / 3600000);
  const upM = Math.floor((upMs % 3600000) / 60000);
  const upS = Math.floor((upMs % 60000) / 1000);
  const up = upD > 0 ? `${upD}d ${upH}h ${upM}m ${upS}s` : `${upH}h ${upM}m ${upS}s`;
  const roleText = role || (isOwner ? 'Owner' : 'User');

  const body =
    `⟁  Mythos  ⟁  Ascendant\n` +
    `${S.ultraBar}\n` +
    `↳  Welcome, ${displayMention}\n` +
    `${S.heavyBar}\n` +
    `\n` +
    `⟁ *${S.lBrack} USER INFO ${S.rBrack}* ⟁\n` +
    `  ${S.userMark} Name      ${S.arr}  ${pushName || 'Unknown'}\n` +
    `  ${S.phoneMark} Phone     ${S.arr}  ${num}\n` +
    `  ${S.timeMark} Time      ${S.arr}  ${now}\n` +
    `  ${S.roleMark} Role      ${S.arr}  ${roleText}\n` +
    `\n` +
    `⟁ *${S.lBrack} BOT STATUS ${S.rBrack}* ⟁\n` +
    `  ${S.botMark} Botname   ${S.arr}  ${config.bot.name}\n` +
    `  ${S.featMark} Features  ${S.arr}  ${totalCommands} commands\n` +
    `  ${S.engineMark} Engine    ${S.arr}  WhiskeySockets Baileys\n` +
    `  ${S.runtimeMark} Runtime   ${S.arr}  ${up}\n` +
    `  ${S.stackMark} Stack     ${S.arr}  Node.js, baileys_helpers\n` +
    `  ${S.versionMark} Version   ${S.arr}  ${config.bot.version}\n` +
    `\n` +
    `${S.heavyBar}\n` +
    `↳  Made in GOATED-404 LABS by Stiletto\n` +
    `↳  ${config.bot.subtitle}\n` +
    `⟁  Mythos  ⟁  Ascendant`;

  return { text: body, mentions: mentionJid ? [mentionJid] : [] };
};

module.exports = { mainMenuSections, categoryChooser, commandSection, categoryTitle, infoCard, startupCard };

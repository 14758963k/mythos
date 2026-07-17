/**
 * .menu — single rich response menu using @itsliaaa/baileys features.
 * One message: text header + table of categories + inline links.
 * No multi-message spam.
 */

const { sendText } = require('../../helpers/messages');
const { startupCard, categoryTitle } = require('../../helpers/interactive');
const { S } = require('../../helpers/formatter');
const config = require('../../config');
const store = require('../../core/store');
const loader = require('../../core/loader');

module.exports = {
  name: 'menu',
  aliases: ['m', 'help'],
  category: 'core',
  description: 'Open the command index',
  execute: async (ctx) => {
    const total = loader.all().length;
    const grouped = loader.grouped();
    const catCount = Object.keys(grouped).length;
    const startedAt = store.get('bot').startedAt || Date.now();

    // user info
    const num = ctx.phone || ctx.participant?.split('@')[0] || '?';
    const role = ctx.isOwner ? 'Owner' : 'User';
    const pushName = ctx.pushName || 'User';

    // uptime
    const upMs = Date.now() - startedAt;
    const upD = Math.floor(upMs / 86400000);
    const upH = Math.floor((upMs % 86400000) / 3600000);
    const upM = Math.floor((upMs % 3600000) / 60000);
    const uptime = upD > 0 ? `${upD}d ${upH}h ${upM}m` : `${upH}h ${upM}m`;

    // build category table rows sorted by size
    const catRows = Object.entries(grouped)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([cat, cmds], i) => ({
        isHeading: false,
        items: [
          `${i + 1}. ${categoryTitle(cat)}`,
          `${cmds.length}`,
          `${ctx.prefix}menu ${cat}`,
        ],
      }));

    // build rich response
    const richResponse = [
      // header
      { text: `⟁ ${config.bot.name} ⟁ ${config.bot.version}\n` },
      // user info
      { text: `Welcome, **${pushName}** (@${num})\nRole: **${role}** | Uptime: **${uptime}**\n` },
      // category table
      { text: `**${catCount} categories — ${total} commands**\n` },
      {
        title: 'Command Categories',
        table: [
          { isHeading: true, items: ['Category', 'Commands', 'Browse'] },
          ...catRows,
        ],
      },
      { text: `\n---\n` },
      // quick links
      { text: `**Quick Commands**\n` },
      { text: `${ctx.prefix}menu <cat> — Browse a category\n` },
      { text: `${ctx.prefix}commands — Interactive list\n` },
      { text: `${ctx.prefix}info — Bot status\n` },
      { text: `${ctx.prefix}start — Quick start\n` },
      { text: `\n---\n` },
      // footer
      { text: `*${config.bot.subtitle}*\nMade in GOATED-404 LABS by Stiletto` },
    ];

    await ctx.sock.sendMessage(ctx.from, {
      disclaimerText: `${config.bot.name} ⟁ Command Index`,
      richResponse,
      externalAdReply: {
        title: `${config.bot.name} ⟁ ${config.bot.version}`,
        body: `${total} commands across ${catCount} categories`,
        thumbnailUrl: config.bot.thumbnail,
        sourceUrl: 'https://github.com/GOATED-404',
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    }, { quoted: ctx.msg });
  },
};

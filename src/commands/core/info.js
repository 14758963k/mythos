/**
 * .info — bot status card with table format.
 */

const { sendTable } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const config = require('../../config');
const store = require('../../core/store');

module.exports = {
  name: 'info',
  aliases: ['about', 'status'],
  category: 'core',
  description: 'Show bot status, uptime and version',
  execute: async (ctx) => {
    const data = store.get('bot');
    const users = Object.keys(store.get('users')).length;
    const startedAt = data.startedAt || Date.now();
    const upMs = Date.now() - startedAt;
    const upD = Math.floor(upMs / 86400000);
    const upH = Math.floor((upMs % 86400000) / 3600000);
    const upM = Math.floor((upMs % 3600000) / 60000);
    const uptime = upD > 0 ? `${upD}d ${upH}h ${upM}m` : `${upH}h ${upM}m`;

    const table = [
      ['Property', 'Value'],
      ['Name', config.bot.name],
      ['Tag', config.bot.tag],
      ['Version', `v${config.bot.version}`],
      ['Prefix', data.prefix || config.bot.prefix],
      ['Owner', config.owner.jids[0] || 'unset'],
      ['Uptime', uptime],
      ['Commands', String(data.totalCommands || 0)],
      ['Users', String(users)],
      ['Engine', '@itsliaaa/baileys'],
      ['Runtime', 'Node.js'],
    ];

    await sendTable(ctx.sock, ctx.from, {
      headerText: `## ${config.bot.name} ⟁ ${config.bot.version}`,
      title: 'Bot Information',
      table,
      footerText: `${config.bot.subtitle}`,
      quoted: ctx.msg,
    });
  },
};

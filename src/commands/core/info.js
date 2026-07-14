/**
 * .info â€” bot status card with uptime, version, owner.
 */

const { reply } = require('../../helpers/messages');
const { infoCard } = require('../../helpers/interactive');
const config = require('../../config');
const store = require('../../core/store');

module.exports = {
  name: 'info',
  aliases: ['about2', 'status'],
  category: 'core',
  description: 'Show bot status, uptime and version',
  execute: async (ctx) => {
    const data = store.get('bot');
    const users = Object.keys(store.get('users')).length;
    const startedAt = data.startedAt || Date.now();
    const card = infoCard({
      name: data.name || config.bot.name,
      tag: config.bot.tag,
      version: config.bot.version,
      prefix: data.prefix || config.bot.prefix,
      owner: config.owner.jids[0] || 'unset',
      uptimeMs: Date.now() - startedAt,
      totalCommands: data.totalCommands || 0,
      totalUsers: users,
    });
    await reply(ctx.sock, ctx, card);
  },
};



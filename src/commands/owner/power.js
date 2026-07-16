/**
 * Owner power commands — privacy, profile, calls, blocklist.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const config = require('../../config');

module.exports = [
  // ── .privacy ───────────────────────────────────────────────────
  {
    name: 'privacy',
    aliases: ['privsettings', 'priv'],
    category: 'owner',
    owner: true,
    description: 'Show all current privacy settings',
    execute: async (ctx) => {
      try {
        const p = await ctx.sock.fetchPrivacySettings(true);
        const labels = {
          last: 'Last Seen',
          online: 'Online Status',
          profile: 'Profile Picture',
          status: 'Status/Story',
          read_receipts: 'Read Receipts',
          groups: 'Add to Groups',
          call: 'Incoming Calls',
          messages: 'Messages',
        };
        const lines = Object.entries(p).map(([k, v]) =>
          `  ${S.tri} ${(labels[k] || k).padEnd(18)} ${S.arr}  ${v || 'default'}`
        );
        await reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Privacy Settings\n${S.heavyBar}\n` +
          lines.join('\n') + `\n${S.brandLine}`
        );
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .lastseen <everyone|contacts|nobody> ───────────────────────
  {
    name: 'lastseen',
    aliases: ['lastvisib', 'visibility'],
    category: 'owner',
    owner: true,
    description: 'Control last seen visibility',
    execute: async (ctx) => {
      const val = (ctx.args[0] || '').toLowerCase();
      const map = { everyone: 'all', contacts: 'contacts', nobody: 'none', all: 'all', none: 'none' };
      if (!map[val]) return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}lastseen <everyone|contacts|nobody>`);
      try {
        await ctx.sock.updateLastSeenPrivacy(map[val]);
        await reply(ctx.sock, ctx, `${S.check}  Last seen: *${val}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .online <everyone|contacts|nobody> ─────────────────────────
  {
    name: 'online',
    aliases: ['onlinevis', 'onlinepriv'],
    category: 'owner',
    owner: true,
    description: 'Control online status visibility',
    execute: async (ctx) => {
      const val = (ctx.args[0] || '').toLowerCase();
      const map = { everyone: 'all', contacts: 'contacts', nobody: 'none', all: 'all', none: 'none' };
      if (!map[val]) return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}online <everyone|contacts|nobody>`);
      try {
        await ctx.sock.updateOnlinePrivacy(map[val]);
        await reply(ctx.sock, ctx, `${S.check}  Online status: *${val}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .readreceipts <on|off> ─────────────────────────────────────
  {
    name: 'readreceipts',
    aliases: ['blueticks', 'ticks'],
    category: 'owner',
    owner: true,
    description: 'Toggle read receipts (blue ticks)',
    execute: async (ctx) => {
      const val = (ctx.args[0] || '').toLowerCase();
      let setting;
      if (val === 'on' || val === 'true' || val === 'yes') setting = 'all';
      else if (val === 'off' || val === 'false' || val === 'no') setting = 'none';
      else return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}readreceipts <on|off>`);
      try {
        await ctx.sock.updateReadReceiptsPrivacy(setting);
        await reply(ctx.sock, ctx, `${S.check}  Read receipts: *${val}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .profilepic <reply image> ──────────────────────────────────
  {
    name: 'profilepic',
    aliases: ['setpp', 'botpp'],
    category: 'owner',
    owner: true,
    description: 'Change the bot profile picture (reply to image)',
    execute: async (ctx) => {
      const { downloadQuotedMedia } = require('../../helpers/messages');
      let buffer;
      if (ctx.quoted && ctx.quoted.message) {
        buffer = await downloadQuotedMedia(ctx.quoted);
      }
      if (!buffer) return reply(ctx.sock, ctx, `${S.warn} Reply to an image with ${ctx.prefix}profilepic`);
      try {
        const { generateProfilePicture } = require('@itsliaaa/baileys');
        const { image } = await generateProfilePicture(buffer);
        await ctx.sock.updateProfilePicture(ctx.sock.user.id, image);
        await reply(ctx.sock, ctx, `${S.check}  Profile picture updated.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .removepic ─────────────────────────────────────────────────
  {
    name: 'removepic',
    aliases: ['delpic', 'deletepic'],
    category: 'owner',
    owner: true,
    description: 'Remove the bot profile picture',
    execute: async (ctx) => {
      try {
        await ctx.sock.removeProfilePicture(ctx.sock.user.id);
        await reply(ctx.sock, ctx, `${S.check}  Profile picture removed.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .rejectcall <on|off> ──────────────────────────────────────
  {
    name: 'rejectcall',
    aliases: ['autoreject', 'nocalls'],
    category: 'owner',
    owner: true,
    description: 'Auto-reject all incoming calls',
    execute: async (ctx) => {
      const val = (ctx.args[0] || '').toLowerCase();
      const store = require('../../core/store');
      if (val === 'on') {
        store.update('bot', (b) => { b.rejectCalls = true; });
        return reply(ctx.sock, ctx, `${S.check}  Auto-reject calls: *ON*`);
      }
      if (val === 'off') {
        store.update('bot', (b) => { b.rejectCalls = false; });
        return reply(ctx.sock, ctx, `${S.check}  Auto-reject calls: *OFF*`);
      }
      const bot = store.get('bot');
      return reply(ctx.sock, ctx,
        `${S.tri} Auto-reject calls: *${bot.rejectCalls ? 'ON' : 'OFF'}*\n` +
        `  ${S.sub} ${ctx.prefix}rejectcall on|off`
      );
    },
  },

  // ── .calllink <voice|video> ────────────────────────────────────
  {
    name: 'calllink',
    aliases: ['createcall', 'genlink'],
    category: 'owner',
    owner: true,
    description: 'Generate a call link',
    execute: async (ctx) => {
      const type = (ctx.args[0] || 'voice').toLowerCase();
      try {
        const link = await ctx.sock.createCallLink(type === 'video' ? 'video' : 'voice');
        await reply(ctx.sock, ctx,
          `${S.check}  *${type === 'video' ? 'Video' : 'Voice'}* call link:\n  ${link}`
        );
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .blocklist ─────────────────────────────────────────────────
  {
    name: 'blocklist',
    aliases: ['blocked', 'listblocked'],
    category: 'owner',
    owner: true,
    description: 'View all blocked users',
    execute: async (ctx) => {
      try {
        const { chatModify } = ctx.sock;
        // blocklist is available via the blocklist.update event or store
        const bot = require('../../core/store').get('bot');
        const blocked = bot.blockedUsers || [];
        if (!blocked.length) return reply(ctx.sock, ctx, `${S.sqr} No blocked users.`);
        const lines = blocked.map((jid, i) => `  ${S.tri} ${i + 1}. ${jid.split('@')[0]}`);
        await reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Blocklist (${blocked.length})\n${S.divider}\n` +
          lines.join('\n') + `\n${S.brandLine}`
        );
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .disappear <24h|7d|90d|off> ────────────────────────────────
  {
    name: 'disappear',
    aliases: ['ephemeralglobal', 'vanishmode'],
    category: 'owner',
    owner: true,
    description: 'Set default disappearing messages for all new chats',
    execute: async (ctx) => {
      const val = (ctx.args[0] || '').toLowerCase();
      const map = { '24h': 86400, '7d': 604800, '90d': 7776000, 'off': 0 };
      if (!(val in map)) return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}disappear <24h|7d|90d|off>`);
      try {
        await ctx.sock.updateDefaultDisappearingMode(map[val]);
        await reply(ctx.sock, ctx, `${S.check}  Default disappear: *${val.toUpperCase()}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },
];

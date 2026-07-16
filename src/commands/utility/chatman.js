/**
 * Chat management commands — pin, archive, mute, star.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = [
  // ── .pin ───────────────────────────────────────────────────────
  {
    name: 'pin',
    aliases: ['pinchat'],
    category: 'utility',
    description: 'Pin the current chat',
    execute: async (ctx) => {
      try {
        await ctx.sock.chatModify({ pin: true }, ctx.from);
        await reply(ctx.sock, ctx, `${S.check}  Chat pinned.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .unpin ─────────────────────────────────────────────────────
  {
    name: 'unpin',
    aliases: ['unpinchat'],
    category: 'utility',
    description: 'Unpin the current chat',
    execute: async (ctx) => {
      try {
        await ctx.sock.chatModify({ pin: false }, ctx.from);
        await reply(ctx.sock, ctx, `${S.check}  Chat unpinned.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .archive ───────────────────────────────────────────────────
  {
    name: 'archive',
    aliases: ['archchat'],
    category: 'utility',
    description: 'Archive the current chat',
    execute: async (ctx) => {
      try {
        await ctx.sock.chatModify({ archive: true }, ctx.from);
        await reply(ctx.sock, ctx, `${S.check}  Chat archived.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .unarchive ─────────────────────────────────────────────────
  {
    name: 'unarchive',
    aliases: ['unarchchat'],
    category: 'utility',
    description: 'Unarchive the current chat',
    execute: async (ctx) => {
      try {
        await ctx.sock.chatModify({ archive: false }, ctx.from);
        await reply(ctx.sock, ctx, `${S.check}  Chat unarchived.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .mute <hours> ──────────────────────────────────────────────
  {
    name: 'mute',
    aliases: ['mutechat'],
    category: 'utility',
    description: 'Mute the current chat (hours, default 8h)',
    execute: async (ctx) => {
      const hours = parseInt(ctx.args[0]) || 8;
      const duration = hours * 60 * 60 * 1000;
      const muteUntil = Date.now() + duration;
      try {
        await ctx.sock.chatModify({ mute: muteUntil }, ctx.from);
        await reply(ctx.sock, ctx, `${S.check}  Chat muted for *${hours}h*.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .unmute ────────────────────────────────────────────────────
  {
    name: 'unmute',
    aliases: ['unmutechat'],
    category: 'utility',
    description: 'Unmute the current chat',
    execute: async (ctx) => {
      try {
        await ctx.sock.chatModify({ mute: null }, ctx.from);
        await reply(ctx.sock, ctx, `${S.check}  Chat unmuted.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .star ──────────────────────────────────────────────────────
  {
    name: 'star',
    aliases: ['starmsg'],
    category: 'utility',
    description: 'Star a quoted message',
    execute: async (ctx) => {
      if (!ctx.quoted) return reply(ctx.sock, ctx, `${S.warn} Reply to a message to star it.`);
      try {
        await ctx.sock.star(ctx.from, [ctx.quoted.key.id], true);
        await reply(ctx.sock, ctx, `${S.check}  Message starred.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .unstar ────────────────────────────────────────────────────
  {
    name: 'unstar',
    aliases: ['unstarmsg'],
    category: 'utility',
    description: 'Unstar a quoted message',
    execute: async (ctx) => {
      if (!ctx.quoted) return reply(ctx.sock, ctx, `${S.warn} Reply to a message to unstar it.`);
      try {
        await ctx.sock.star(ctx.from, [ctx.quoted.key.id], false);
        await reply(ctx.sock, ctx, `${S.check}  Message unstarred.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },
];

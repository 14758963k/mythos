/**
 * Group power commands — create, leave, rename, desc, invite, settings.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');

module.exports = [
  // ── .create <name> [mentions] ──────────────────────────────────
  {
    name: 'create',
    aliases: ['newgroup', 'makegroup'],
    category: 'group',
    owner: true,
    description: 'Create a new group with mentioned users',
    execute: async (ctx) => {
      const name = ctx.args.join(' ') || 'Untitled Group';
      const participants = (ctx.mentionedJid || []).map(j => ({ jid: j, admin: null }));
      if (!participants.length) {
        participants.push({ jid: ctx.sender, admin: 'superadmin' });
      }
      try {
        const result = await ctx.sock.groupCreate(name, participants);
        await reply(ctx.sock, ctx, `${S.check}  Group *${name}* created.\n  ${S.tri} ${participants.length} participants added.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed to create group: ${e.message}`);
      }
    },
  },

  // ── .leave ─────────────────────────────────────────────────────
  {
    name: 'leave',
    aliases: ['exit', 'left'],
    category: 'group',
    owner: true,
    description: 'Bot leaves the current group',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} This command works in groups only.`);
      const g = store.get('groups')[ctx.from];
      const name = g?.name || (await ctx.sock.groupMetadata(ctx.from)).subject;
      await reply(ctx.sock, ctx, `${S.tri} Leaving *${name}*...`);
      await ctx.sock.groupLeave(ctx.from);
    },
  },

  // ── .rename <new name> ────────────────────────────────────────
  {
    name: 'rename',
    aliases: ['setname', 'gname'],
    category: 'group',
    owner: true,
    description: 'Rename the group',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      const name = ctx.args.join(' ');
      if (!name) return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}rename <new name>`);
      try {
        await ctx.sock.groupUpdateSubject(ctx.from, name);
        await reply(ctx.sock, ctx, `${S.check}  Group renamed to *${name}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .setdesc <text> ───────────────────────────────────────────
  {
    name: 'setdesc',
    aliases: ['gdesc', 'groupdesc'],
    category: 'group',
    owner: true,
    description: 'Set the group description',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      const desc = ctx.args.join(' ');
      if (!desc) return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}setdesc <text>`);
      try {
        await ctx.sock.groupUpdateDescription(ctx.from, desc);
        await reply(ctx.sock, ctx, `${S.check}  Group description updated.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .invite ────────────────────────────────────────────────────
  {
    name: 'invite',
    aliases: ['grouplink', 'glink'],
    category: 'group',
    owner: true,
    description: 'Get the group invite link',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      try {
        const code = await ctx.sock.groupInviteCode(ctx.from);
        const link = `https://chat.whatsapp.com/${code}`;
        await reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Group Invite Link\n${S.divider}\n  ${link}\n${S.brandLine}`
        );
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .revikelink ────────────────────────────────────────────────
  {
    name: 'revikelink',
    aliases: ['resetlink', 'newlink'],
    category: 'group',
    owner: true,
    description: 'Regenerate the group invite link',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      try {
        await ctx.sock.groupRevokeInvite(ctx.from);
        const code = await ctx.sock.groupInviteCode(ctx.from);
        const link = `https://chat.whatsapp.com/${code}`;
        await reply(ctx.sock, ctx,
          `${S.check}  Invite link regenerated.\n  ${link}`
        );
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .gmode <announcement|not_announcement> ─────────────────────
  {
    name: 'gmode',
    aliases: ['groupmode', 'announce'],
    category: 'group',
    owner: true,
    description: 'Toggle announcement-only mode (admins only can send)',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      const mode = (ctx.args[0] || '').toLowerCase();
      let setting;
      if (mode === 'on' || mode === 'admin' || mode === 'announcement') setting = 'announcement';
      else if (mode === 'off' || mode === 'all' || mode === 'not_announcement') setting = 'not_announcement';
      else {
        const meta = await ctx.sock.groupMetadata(ctx.from);
        const current = meta.restrict ? 'announcement' : 'not_announcement';
        const next = current === 'announcement' ? 'not_announcement' : 'announcement';
        setting = next;
      }
      try {
        await ctx.sock.groupSettingUpdate(ctx.from, setting);
        const label = setting === 'announcement' ? 'Admins only' : 'Everyone';
        await reply(ctx.sock, ctx, `${S.check}  Group mode: *${label}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .ephemeral <24h|7d|90d|off> ───────────────────────────────
  {
    name: 'ephemeral',
    aliases: ['disappear', 'vanish'],
    category: 'group',
    owner: true,
    description: 'Toggle disappearing messages in the group',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      const val = (ctx.args[0] || '').toLowerCase();
      const map = { '24h': 86400, '7d': 604800, '90d': 7776000, 'off': 0, 'on': 604800 };
      const duration = map[val] ?? 0;
      try {
        await ctx.sock.groupToggleEphemeral(ctx.from, duration);
        const label = duration === 0 ? 'Off' : val.toUpperCase();
        await reply(ctx.sock, ctx, `${S.check}  Disappearing messages: *${label}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .addmode <everyone|admins> ─────────────────────────────────
  {
    name: 'addmode',
    aliases: ['memberadd', 'whoadd'],
    category: 'group',
    owner: true,
    description: 'Control who can add members',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      const mode = (ctx.args[0] || '').toLowerCase();
      let addMode;
      if (mode === 'admin' || mode === 'admins') addMode = 'admins';
      else if (mode === 'all' || mode === 'everyone') addMode = 'all';
      else return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}addmode <all|admins>`);
      try {
        await ctx.sock.groupMemberAddMode(ctx.from, addMode);
        await reply(ctx.sock, ctx, `${S.check}  Add mode: *${addMode === 'admins' ? 'Admins only' : 'Everyone'}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .approval <on|off> ─────────────────────────────────────────
  {
    name: 'approval',
    aliases: ['joinapproval', 'reqjoin'],
    category: 'group',
    owner: true,
    description: 'Toggle join approval requirement',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      const val = (ctx.args[0] || '').toLowerCase();
      let mode;
      if (val === 'on' || val === 'true' || val === 'yes') mode = 'on';
      else if (val === 'off' || val === 'false' || val === 'no') mode = 'off';
      else return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}approval <on|off>`);
      try {
        await ctx.sock.groupJoinApprovalMode(ctx.from, mode);
        await reply(ctx.sock, ctx, `${S.check}  Join approval: *${mode === 'on' ? 'Required' : 'Open'}*`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .pending ───────────────────────────────────────────────────
  {
    name: 'pending',
    aliases: ['pendlist', 'joinrequests'],
    category: 'group',
    owner: true,
    description: 'List pending join requests',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      try {
        const list = await ctx.sock.groupRequestParticipantsList(ctx.from);
        if (!list || !list.length) return reply(ctx.sock, ctx, `${S.sqr} No pending join requests.`);
        const lines = list.map((p, i) => `  ${S.tri} ${i + 1}. ${p.jid.split('@')[0]}`);
        await reply(ctx.sock, ctx,
          `${S.brandLine}\n${S.sub}  Pending Join Requests (${list.length})\n${S.divider}\n${lines.join('\n')}\n${S.divider}\n` +
          `  ${ctx.prefix}approve all  |  ${ctx.prefix}reject all\n${S.brandLine}`
        );
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .approve <@all|@user> ─────────────────────────────────────
  {
    name: 'approve',
    aliases: ['accept'],
    category: 'group',
    owner: true,
    description: 'Approve pending join requests',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      try {
        const pending = await ctx.sock.groupRequestParticipantsList(ctx.from);
        if (!pending || !pending.length) return reply(ctx.sock, ctx, `${S.sqr} No pending requests.`);
        let targets;
        if (ctx.args[0] === 'all') {
          targets = pending.map(p => p.jid);
        } else {
          targets = ctx.mentionedJid || [];
          if (!targets.length && ctx.args[0]) {
            targets = [ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'];
          }
        }
        if (!targets.length) return reply(ctx.sock, ctx, `${S.warn} Mention users or use "all".`);
        const result = await ctx.sock.groupRequestParticipantsUpdate(ctx.from, targets, 'approve');
        await reply(ctx.sock, ctx, `${S.check}  Approved ${targets.length} member(s).`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .reject <@all|@user> ──────────────────────────────────────
  {
    name: 'reject',
    aliases: ['deny'],
    category: 'group',
    owner: true,
    description: 'Reject pending join requests',
    execute: async (ctx) => {
      if (!ctx.isGroup) return reply(ctx.sock, ctx, `${S.warn} Groups only.`);
      try {
        const pending = await ctx.sock.groupRequestParticipantsList(ctx.from);
        if (!pending || !pending.length) return reply(ctx.sock, ctx, `${S.sqr} No pending requests.`);
        let targets;
        if (ctx.args[0] === 'all') {
          targets = pending.map(p => p.jid);
        } else {
          targets = ctx.mentionedJid || [];
          if (!targets.length && ctx.args[0]) {
            targets = [ctx.args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'];
          }
        }
        if (!targets.length) return reply(ctx.sock, ctx, `${S.warn} Mention users or use "all".`);
        const result = await ctx.sock.groupRequestParticipantsUpdate(ctx.from, targets, 'reject');
        await reply(ctx.sock, ctx, `${S.check}  Rejected ${targets.length} request(s).`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .grouplist ─────────────────────────────────────────────────
  {
    name: 'grouplist',
    aliases: ['mygroups', 'glist'],
    category: 'group',
    owner: true,
    description: 'List all groups the bot is in',
    execute: async (ctx) => {
      try {
        const groups = await ctx.sock.groupFetchAllParticipating();
        const list = Object.values(groups);
        if (!list.length) return reply(ctx.sock, ctx, `${S.sqr} Not in any groups.`);
        const lines = list.map((g, i) =>
          `  ${S.tri} ${i + 1}. ${g.subject}\n     ${S.sub} ${g.id.split('@')[0]} | ${g.participants.length} members`
        );
        const chunked = [];
        for (let i = 0; i < lines.length; i += 10) {
          chunked.push(lines.slice(i, i + 10).join('\n'));
        }
        for (const chunk of chunked) {
          await reply(ctx.sock, ctx,
            `${S.brandLine}\n${S.sub}  Groups (${list.length})\n${S.divider}\n${chunk}\n${S.brandLine}`
          );
        }
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },
];

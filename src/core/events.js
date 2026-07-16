/**
 * Mythos ⟁ Ascendant — group event handlers.
 * Hooked into sock.ev in core/client.js.
 *
 *  - welcome / goodbye messages when members join or leave
 *  - anti-link auto-delete (configurable per group)
 *  - reminder dispatcher (every 30s)
 */

const config = require('../config');
const log = require('./logger');
const store = require('./store');
const { S } = require('../helpers/formatter');
const { reply, sendText } = require('../helpers/messages');
const { isJidGroup } = require('../helpers/jid');

/** Map of timer IDs to reminder records, so we can clear them. */
const timers = new Map();

const fmt = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getUTCSeconds ? d.getUTCSeconds() : d.getSeconds())}`;
};

const toJid = (p) => (typeof p === 'string' ? p : (p?.id || p?.phoneNumber || p?.jid || ''));

const greet = (pushName, jid) => {
  const j = toJid(jid);
  const num = j.split('@')[0]?.split(':')[0] || '?';
  return `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Welcome  ${S.arr}  ${pushName || 'New Member'}\n${S.heavyBar}\n  ${S.dot} @${num}\n${S.divider}\n  ${S.heart} Greetings from Mythos.\n  ${S.sub} Reply *${config.bot.prefix}menu* to see what is possible.\n${S.brandLine}`;
};

const farewell = (pushName, jid) => {
  const j = toJid(jid);
  const num = j.split('@')[0]?.split(':')[0] || '?';
  return `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Goodbye  ${S.arr}  ${pushName || 'Member'}\n${S.heavyBar}\n  ${S.dot} @${num}\n${S.divider}\n  ${S.loop} The seats refresh. We continue.\n${S.brandLine}`;
};

const handleParticipantsUpdate = async (sock, event) => {
  try {
    const groups = store.get('groups');
    const g = groups[event.id] || {};
    const meta = await sock.groupMetadata(event.id).catch(() => null);
    if (meta && meta.subject) {
      groups[event.id] = { ...g, name: meta.subject };
      store.set('groups', groups);
    }
    for (const raw of event.participants || []) {
      const participant = toJid(raw);
      if (!participant) continue;
      const isJoin = event.action === 'add';
      const isLeave = event.action === 'remove';
      const isPromote = event.action === 'promote';
      const isDemote = event.action === 'demote';
      const fresh = groups[event.id] || {};

      if (isJoin && fresh.welcomeOn !== false) {
        const msg = fresh.welcome || greet(null, participant);
        await sock.sendMessage(event.id, { text: msg, contextInfo: { mentionedJid: [participant] } }).catch((e) => log.warn('welcome send failed', { err: e.message }));
      }
      if (isLeave) {
        if (fresh.goodbyeOn === true) {
          const msg = fresh.goodbye || farewell(null, participant);
          await sock.sendMessage(event.id, { text: msg, contextInfo: { mentionedJid: [participant] } }).catch((e) => log.warn('goodbye send failed', { err: e.message }));
        }
      }
      // anti-promote: auto-demote anyone who promotes others
      if (isPromote && fresh.antiPromote) {
        try {
          await sock.groupParticipantsUpdate(event.id, [participant], 'demote');
          await sock.sendMessage(event.id, {
            text: `${S.warn} Anti-promote is active. @${participant.split('@')[0]} has been demoted.`,
            contextInfo: { mentionedJid: [participant] },
          });
        } catch (e) {
          log.warn('anti-promote demote failed', { err: e.message });
        }
      }
      // anti-demote: auto-re-promote anyone who gets demoted
      if (isDemote && fresh.antiDemote) {
        try {
          await sock.groupParticipantsUpdate(event.id, [participant], 'promote');
          await sock.sendMessage(event.id, {
            text: `${S.warn} Anti-demote is active. @${participant.split('@')[0]} has been re-promoted.`,
            contextInfo: { mentionedJid: [participant] },
          });
        } catch (e) {
          log.warn('anti-demote promote failed', { err: e.message });
        }
      }
    }
  } catch (e) {
    log.warn('participants.update failed', { err: e.message });
  }
};

const URL_REGEX = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[A-Za-z0-9]+|wa\.me\/[0-9]+|whatsapp\.com\/[A-Za-z0-9]+)/i;

// ── anti-spam tracker ───────────────────────────────────────────────────
const spamTracker = {}; // { groupJid: { senderJid: [timestamps] } }

const checkSpam = async (sock, msg, groups) => {
  try {
    const chatJid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const g = groups[chatJid];
    if (!g || !g.antiSpam) return;

    const now = Date.now();
    const window = (g.spamWindow || 10) * 1000;
    const limit = g.spamLimit || 5;

    if (!spamTracker[chatJid]) spamTracker[chatJid] = {};
    if (!spamTracker[chatJid][sender]) spamTracker[chatJid][sender] = [];

    spamTracker[chatJid][sender] = spamTracker[chatJid][sender].filter(t => now - t < window);
    spamTracker[chatJid][sender].push(now);

    if (spamTracker[chatJid][sender].length >= limit) {
      spamTracker[chatJid][sender] = [];
      // auto-warn via the warn system
      if (!g.warnings) g.warnings = {};
      if (!g.warnings[sender]) g.warnings[sender] = 0;
      g.warnings[sender]++;
      const threshold = g.warnThreshold || 3;

      if (g.warnings[sender] >= threshold) {
        try {
          await sock.groupParticipantsUpdate(chatJid, [sender], 'remove');
          await sock.sendMessage(chatJid, { text: `${S.cross} @${sender.split('@')[0]} auto-kicked for spam (${threshold} warnings).`, contextInfo: { mentionedJid: [sender] } });
        } catch {}
        delete g.warnings[sender];
      } else {
        await sock.sendMessage(chatJid, { text: `${S.warn} @${sender.split('@')[0]} auto-warned for spam (${g.warnings[sender]}/${threshold}).`, contextInfo: { mentionedJid: [sender] } });
      }
      groups[chatJid] = g;
      store.set('groups', groups);
    }
  } catch {}
};

// ── anti-badword checker ────────────────────────────────────────────────
const checkBadword = async (sock, msg, groups, text) => {
  try {
    const chatJid = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const g = groups[chatJid];
    if (!g || !g.antiBadword || !g.badwords?.length) return;
    if (msg.key.fromMe) return;

    const lower = text.toLowerCase();
    const matched = g.badwords.find(w => lower.includes(w));
    if (matched) {
      await sock.sendMessage(chatJid, { delete: msg.key }).catch(() => {});
      await sock.sendMessage(chatJid, {
        text: `${S.warn} @${sender.split('@')[0]}, that word is not allowed here.`,
        contextInfo: { mentionedJid: [sender] },
      });
      return true;
    }
  } catch {}
  return false;
};

const handleMessagesUpsert = async (sock, msg) => {
  // antilink is only for group text messages
  if (!isJidGroup(msg.key.remoteJid)) return;
  const type = Object.keys(msg.message || {})[0];
  if (!type || !['conversation', 'extendedTextMessage'].includes(type)) return;
  const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  if (!text) return;
  const groups = store.get('groups');
  const g = groups[msg.key.remoteJid];
  if (!g || !g.antilink) return;
  if (URL_REGEX.test(text)) {
    // only act if sender is not admin/owner
    const meta = await sock.groupMetadata(msg.key.remoteJid).catch(() => null);
    const sender = msg.key.participant || msg.key.remoteJid;
    const isAdmin = meta?.participants?.find((p) => p.id === sender && p.admin);
    if (isAdmin) return;
    try {
      await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });
      if (g.antilinkMode === 'warn') {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `${S.warn}  @${sender.split('@')[0]}, links are not allowed in this group.`,
          contextInfo: { mentionedJid: [sender] },
        });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          text: `${S.cross}  Link removed. @${sender.split('@')[0]}, watch the rules.`,
          contextInfo: { mentionedJid: [sender] },
        });
      }
    } catch (e) {
      log.warn('antilink delete failed', { err: e.message });
    }
  }
};

// ── self-sent tracking (so handler can drop our own echoes) ──────────
const selfSentIds = new Set();
const SELF_SENT_MAX = 200;
const trackSelfSent = (msg) => {
  if (!msg || !msg.key || !msg.key.id) return;
  selfSentIds.add(msg.key.id);
  if (selfSentIds.size > SELF_SENT_MAX) {
    const drop = selfSentIds.size - SELF_SENT_MAX;
    const it = selfSentIds.values();
    for (let i = 0; i < drop; i++) selfSentIds.delete(it.next().value);
  }
};

// ── reminders ──────────────────────────────────────────────────────────
const addReminder = (record) => {
  const all = store.get('reminders');
  all[record.id] = record;
  store.set('reminders', all);
  const delay = Math.max(0, record.fireAt - Date.now());
  const t = setTimeout(async () => {
    try {
      await sockRef.sendMessage(record.jid, {
        text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Reminder  ${S.arr}  ${fmt(new Date())}\n${S.heavyBar}\n  ${S.dot} ${record.message}\n${S.divider}\n  ${S.sub} Set by @${record.user.split('@')[0]}\n${S.brandLine}`,
        contextInfo: { mentionedJid: [record.user] },
      });
    } catch (e) {
      log.warn('reminder send failed', { err: e.message });
    }
    const cur = store.get('reminders');
    delete cur[record.id];
    store.set('reminders', cur);
    timers.delete(record.id);
  }, delay);
  timers.set(record.id, t);
};

const cancelReminder = (id) => {
  if (timers.has(id)) {
    clearTimeout(timers.get(id));
    timers.delete(id);
  }
  const all = store.get('reminders');
  if (all[id]) {
    delete all[id];
    store.set('reminders', all);
    return true;
  }
  return false;
};

const listReminders = (jid) => {
  const all = store.get('reminders');
  return Object.values(all).filter((r) => r.jid === jid).sort((a, b) => a.fireAt - b.fireAt);
};

let sockRef = null;
const init = (sock) => {
  sockRef = sock;
  // re-arm existing reminders (e.g. after a restart)
  for (const r of Object.values(store.get('reminders'))) {
    if (r.fireAt > Date.now()) addReminder(r);
    else {
      // expired during downtime — drop
      const all = store.get('reminders');
      delete all[r.id];
      store.set('reminders', all);
    }
  }
};

// ── anti-delete ──────────────────────────────────────────────────────────────
const handleDelete = async (sock, msg) => {
  try {
    const chat = msg.key.remoteJid;
    const groups = store.get('groups');
    const g = groups[chat] || {};
    if (!g.antiDelete) return;
    if (msg.key.fromMe) return;
    const deletedMsg = msg.message?.protocolMessage;
    if (!deletedMsg) return;
    const deletedKey = deletedMsg.key;
    if (!deletedKey) return;
    // try to recover from store or send notice
    const sender = deletedKey.participant || deletedKey.remoteJid;
    const num = (sender || '').split('@')[0].split(':')[0];
    await sock.sendMessage(chat, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n` +
        `${S.sub}  Message Deleted  ${S.arr}  Recovered\n` +
        `${S.heavyBar}\n` +
        `  ${S.dot} By @${num}\n` +
        `  ${S.dot} The deleted message could not be recovered from protocol.\n` +
        `${S.brandLine}`,
      contextInfo: { mentionedJid: sender ? [sender] : [] },
    });
  } catch (e) {
    log.warn('anti-delete failed', { err: e.message });
  }
};

// ── status reader ────────────────────────────────────────────────────────────
const handleStatusUpsert = async (sock, msg) => {
  try {
    if (!config.features.readStatus) return;
    if (msg.key.remoteJid !== 'status@broadcast') return;
    // mark as read
    await sock.readMessages([msg.key]).catch(() => {});
    log.evt('status read', { from: msg.key.participant });
  } catch (e) {
    // silent
  }
};

// ── auto-react ───────────────────────────────────────────────────────────────
const AUTO_REACT_EMOJIS = ['✦', '◆', '◇', '▸', '▹', '▪', '▫', '♦', '♢', '★', '☆', '⬡', '⬢', '❖', '✧'];
const autoReact = async (sock, msg) => {
  try {
    if (!config.features.autoReact) return;
    if (msg.key.fromMe) return;
    const emoji = AUTO_REACT_EMOJIS[Math.floor(Math.random() * AUTO_REACT_EMOJIS.length)];
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emoji, key: msg.key },
    });
  } catch {}
};

// ── call handler ─────────────────────────────────────────────────────────────
const handleCall = async (sock, call) => {
  try {
    const bot = store.get('bot');
    if (!bot.rejectCalls) return;
    for (const c of call) {
      if (c.status === 'offer') {
        await sock.rejectCall(c.id, c.from).catch(() => {});
        log.evt('call rejected', { from: c.from, type: c.isVideo ? 'video' : 'voice' });
      }
    }
  } catch {}
};

// ── reaction tracker ─────────────────────────────────────────────────────────
const reactionCounts = {};

const handleReaction = async (sock, msg) => {
  try {
    const reaction = msg.reaction;
    if (!reaction || !reaction.text) return;
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;
    const key = `${jid}:${user}:${reaction.text}`;
    if (!reactionCounts[key]) reactionCounts[key] = { count: 0, emoji: reaction.text, user, jid };
    reactionCounts[key].count++;
  } catch {}
};

const getReactionLeaderboard = (jid, limit = 10) => {
  const entries = Object.values(reactionCounts)
    .filter(e => e.jid === jid)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return entries;
};

// ── blocklist tracker ────────────────────────────────────────────────────────
const handleBlocklist = async (sock, update) => {
  try {
    const bot = store.get('bot');
    if (!bot.blockedUsers) bot.blockedUsers = [];
    if (update.type === 'add') {
      for (const jid of update.blocklist || []) {
        if (!bot.blockedUsers.includes(jid)) bot.blockedUsers.push(jid);
      }
    } else if (update.type === 'remove') {
      bot.blockedUsers = bot.blockedUsers.filter(jid => !(update.blocklist || []).includes(jid));
    }
    store.set('bot', bot);
  } catch {}
};

// ── join request handler ─────────────────────────────────────────────────────
const handleJoinRequest = async (sock, update) => {
  try {
    const bot = store.get('bot');
    if (!bot.autoApproveJoin) return;
    const { jid, participant } = update;
    if (!jid || !participant) return;
    await sock.groupRequestParticipantsUpdate(jid, [participant], 'approve').catch(() => {});
    log.evt('auto-approved join', { group: jid, user: participant });
  } catch {}
};

module.exports = {
  init,
  handleParticipantsUpdate,
  handleMessagesUpsert,
  handleDelete,
  handleStatusUpsert,
  autoReact,
  handleCall,
  handleReaction,
  getReactionLeaderboard,
  handleBlocklist,
  handleJoinRequest,
  addReminder,
  cancelReminder,
  listReminders,
  trackSelfSent,
  selfSentIds,
  checkSpam,
  checkBadword,
};

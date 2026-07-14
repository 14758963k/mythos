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

const greet = (pushName, jid) => {
  const num = jid?.split('@')[0]?.split(':')[0] || '?';
  return `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Welcome  ${S.arr}  ${pushName || 'New Member'}\n${S.heavyBar}\n  ${S.dot} @${num}\n${S.divider}\n  ${S.heart} Greetings from Mythos.\n  ${S.sub} Reply *${config.bot.prefix}menu* to see what is possible.\n${S.brandLine}`;
};

const farewell = (pushName, jid) => {
  const num = jid?.split('@')[0]?.split(':')[0] || '?';
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
    for (const participant of event.participants || []) {
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

module.exports = {
  init,
  handleParticipantsUpdate,
  handleMessagesUpsert,
  handleDelete,
  handleStatusUpsert,
  autoReact,
  addReminder,
  cancelReminder,
  listReminders,
  trackSelfSent,
  selfSentIds,
};

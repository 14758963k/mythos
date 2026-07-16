/**
 * Mythos ⟁ Ascendant — Baileys socket factory.
 * Wraps makeWASocket from @whiskeysockets/baileys and exposes a clean
 * connect/close lifecycle.
 *
 * Every event listener (creds.update, connection.update, messages.upsert,
 * group events) is attached here, so any reconnect via setTimeout gets
 * a fully-wired socket — no silent drops after a reconnect.
 */

const fs = require('fs');
const path = require('path');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  Browsers,
} = require('@itsliaaa/baileys');
const NodeCache = require('node-cache');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

const log = require('./logger');
const config = require('../config');
const events = require('./events');
const { handle } = require('./handler');

// ── reconnect state (persists across reconnects) ───────────────────────
let reconnectAttempts = 0;
const MAX_RECONNECT = 10;
const BASE_DELAY = 3000;
const MAX_DELAY = 60000;
let intervalsInitialized = false;
let autoTypingInterval = null;
let autoRecordingInterval = null;
let autoBioInterval = null;

const clearAllIntervals = () => {
  if (autoTypingInterval) clearInterval(autoTypingInterval);
  if (autoRecordingInterval) clearInterval(autoRecordingInterval);
  if (autoBioInterval) clearInterval(autoBioInterval);
  autoTypingInterval = null;
  autoRecordingInterval = null;
  autoBioInterval = null;
};

const startSock = async (sockRef) => {
  const authDir = config.auth.path;
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

  const sock = makeWASocket({
    version,
    logger: pino({ level: config.logLevel }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser: Browsers.ubuntu('Mythos Ascendant'),
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
    cachedGroupMetadata: async (jid) => groupCache.get(jid),
    markOnlineOnConnect: true,
    getMessage: async () => undefined,
    keepAliveIntervalMs: 25000,
  });

  sockRef.current = sock;
  sock._groupCache = groupCache;
  sock._saveCreds = saveCreds;

  // ── wrap sendMessage / relayMessage so we can track our own outgoing
  //    message IDs and ignore them when they bounce back through our own
  //    session (multi-device). The handler uses the tracked set to drop
  //    self-echoes without dropping real user commands sent from the phone.
  if (!sock._mythosWrapped) {
    sock._mythosWrapped = true;
    const origSend = sock.sendMessage.bind(sock);
    const origRelay = sock.relayMessage?.bind(sock);
    sock.sendMessage = async (...args) => {
      const out = await origSend(...args);
      if (out && out.key && out.key.id) events.trackSelfSent({ key: out.key });
      return out;
    };
    if (origRelay) {
      sock.relayMessage = async (...args) => {
        const out = await origRelay(...args);
        if (out && out.key && out.key.id) events.trackSelfSent({ key: out.key });
        return out;
      };
    }
  }

  // ── credentials update ─────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ── status reader ───────────────────────────────────────────────
  sock.ev.on('messages.upsert', (data) => {
    // status reader + auto-status-view
    for (const msg of data.messages || []) {
      events.handleStatusUpsert(sock, msg).catch(() => {});
      // auto-status-view: view all status updates when enabled
      if (msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {
        const bot = require('./store').get('bot');
        if (bot.autoStatusView) {
          sock.readMessages([msg.key]).catch(() => {});
        }
      }
    }
    handle(sock, data).catch((e) => log.err('handler', { error: e.message, stack: e.stack }));
  });

  // ── anti-delete handler ───────────────────────────────────────────
  sock.ev.on('messages.update', (updates) => {
    for (const update of updates) {
      if (update.update?.message?.protocolMessage?.type === 0) {
        events.handleDelete(sock, { key: update.key, message: update.update.message }).catch(() => {});
      }
    }
  });

  // ── connection lifecycle ───────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr && config.auth.printQR) {
      qrcode.generate(qr, { small: true });
      log.info('QR generated — scan with WhatsApp Linked Devices');
    }
    if (connection === 'open') {
      log.ok('connection opened', { user: sock.user?.id });
      reconnectAttempts = 0;

      // keepalive heartbeat — send presence every 25s to prevent timeout
      if (autoTypingInterval) clearInterval(autoTypingInterval);
      autoTypingInterval = setInterval(() => {
        sock.sendPresenceUpdate('available').catch(() => {});
      }, 25000);

      // defer heavy work 3s after connect to avoid flooding the fresh connection
      setTimeout(async () => {
        // notify owners
        const owners = config.owner.jids;
        if (owners.length) {
          for (const jid of owners) {
            try {
              await sock.sendMessage(jid, {
                text:
                  `⟁ Mythos is online.\n` +
                  `  ↳ prefix *${config.bot.prefix}*\n` +
                  `  ↳ type *${config.bot.prefix}menu* to begin.`,
              });
            } catch (e) {
              log.warn('owner notify failed', { jid, err: e.message });
            }
          }
        }
      }, 3000);

      // only create intervals once — not on every reconnect
      if (!intervalsInitialized) {
        intervalsInitialized = true;

        // auto-recording indicator
        autoRecordingInterval = setInterval(async () => {
          try {
            const bot = require('./store').get('bot');
            if (bot.autoRecording) {
              const groups = require('./store').get('groups');
              for (const [jid, g] of Object.entries(groups)) {
                if (g.botEnabled !== false) {
                  await sock.sendPresenceUpdate('recording', jid).catch(() => {});
                }
              }
            }
          } catch {}
        }, 45000);

        // auto-bio updater
        if (config.features.autoBio) {
          const updateBio = async () => {
            try {
              const upMs = Date.now() - (store.get('bot').startedAt || Date.now());
              const upH = Math.floor(upMs / 3600000);
              const upM = Math.floor((upMs % 3600000) / 60000);
              const bio = `${config.bot.name} ⟁ v${config.bot.version}  ⟳  ${upH}h ${upM}m`;
              await sock.updateProfileStatus(bio).catch(() => {});
            } catch {}
          };
          updateBio();
          autoBioInterval = setInterval(updateBio, 5 * 60 * 1000);
        }
      }
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      log.warn('connection closed', { reason });

      // non-recoverable reasons — stop trying
      if (
        reason === DisconnectReason.loggedOut ||
        reason === DisconnectReason.forbidden ||
        reason === 411
      ) {
        log.err('non-recoverable disconnect — delete auth_info to re-pair', { reason });
        reconnectAttempts = 0;
        return;
      }

      // restart required — try immediately
      if (reason === DisconnectReason.restartRequired) {
        log.info('restart required — reconnecting');
        setTimeout(() => startSock(sockRef), 1000);
        return;
      }

      // transient errors — exponential backoff
      reconnectAttempts++;
      if (reconnectAttempts > MAX_RECONNECT) {
        log.err('max reconnect attempts reached — stopping', { attempts: reconnectAttempts });
        reconnectAttempts = 0;
        return;
      }
      const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttempts - 1), MAX_DELAY);
      log.info(`reconnecting (attempt ${reconnectAttempts}/${MAX_RECONNECT}) in ${delay}ms`);
      setTimeout(() => startSock(sockRef), delay);
    }
  });

  // ── group metadata cache ───────────────────────────────────────────
  sock.ev.on('groups.update', async ([event]) => {
    try {
      const meta = await sock.groupMetadata(event.id);
      groupCache.set(event.id, meta);
    } catch {}
  });
  sock.ev.on('group-participants.update', async (event) => {
    try {
      const meta = await sock.groupMetadata(event.id);
      groupCache.set(event.id, meta);
    } catch {}
    events.handleParticipantsUpdate(sock, event);
  });

  // ── call handler (auto-reject) ──────────────────────────────────
  sock.ev.on('call', (calls) => events.handleCall(sock, calls));

  // ── reaction tracker ────────────────────────────────────────────
  sock.ev.on('messages.reaction', (msg) => events.handleReaction(sock, msg));

  // ── blocklist tracker ───────────────────────────────────────────
  sock.ev.on('blocklist.update', (update) => events.handleBlocklist(sock, update));

  // ── join request handler ────────────────────────────────────────
  sock.ev.on('group.join-request', (update) => events.handleJoinRequest(sock, update));

  // attach event listeners (welcome, goodbye, antilink, reminders)
  events.init(sock);

  return sock;
};

module.exports = { startSock };

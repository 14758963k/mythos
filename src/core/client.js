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
    markOnlineOnConnect: false,
    getMessage: async () => undefined,
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

  // ── message router — the critical one, re-registered on every reconnect
  sock.ev.on('messages.upsert', (data) => {
    // status reader
    for (const msg of data.messages || []) {
      events.handleStatusUpsert(sock, msg).catch(() => {});
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

      // auto-typing indicator
      const autoTypingInterval = setInterval(async () => {
        try {
          const bot = require('./store').get('bot');
          if (bot.autoTyping) {
            // simulate typing in all groups
            const groups = require('./store').get('groups');
            for (const [jid, g] of Object.entries(groups)) {
              if (g.botEnabled !== false) {
                await sock.sendPresenceUpdate('composing', jid).catch(() => {});
              }
            }
          }
        } catch {}
      }, 30000);

      // auto-recording indicator
      const autoRecordingInterval = setInterval(async () => {
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
        setInterval(updateBio, 5 * 60 * 1000);
      }
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
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      log.warn('connection closed', { reason });
      if (reason !== DisconnectReason.loggedOut) {
        log.info('reconnecting in 3s');
        setTimeout(() => startSock(sockRef), 3000);
      } else {
        log.err('logged out — delete auth_info to re-pair', { reason });
      }
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

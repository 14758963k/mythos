/**
 * Mythos ⟁ Ascendant — message handler.
 * Resolves incoming messages to commands, runs middleware, executes, and
 * catches errors so a single bad command never kills the bot.
 */

const { getContentType, isJidGroup } = require('@itsliaaa/baileys');

const config = require('../config');
const loader = require('./loader');
const rateLimit = require('../middleware/rateLimit');
const store = require('./store');
const events = require('./events');
const { reply, react, userCard, unwrapMessage } = require('../helpers/messages');
const { chat: mistralChat, clearHistory } = require('../helpers/chatbot');
const ai = require('../helpers/ai');
const { S } = require('../helpers/formatter');
const { suggest } = require('../helpers/typo');
const { bestPhone, matchesOwner } = require('../helpers/jid');
const log = require('./logger');

// ── contextual reactions by category ────────────────────────────────
const CATEGORY_REACTIONS = {
  core: '✦',
  fun: '★',
  tools: '⚙',
  utility: '◆',
  group: '◇',
  media: '▶',
  owner: '★',
  converter: '✦',
  economy: '₿',
  sticker: '❉',
  editor: '✦',
  audio: '♪',
  downloader: '↓',
  search: '⌕',
  info: '◈',
  games: '🎮',
  audio: '♪',
  misc: '·',
};

const handledTypes = new Set([
  'conversation',
  'extendedTextMessage',
  'imageMessage',
  'videoMessage',
  'stickerMessage',
  'documentMessage',
  'audioMessage',
  'ephemeralMessage',
  'viewOnceMessageV2',
  'viewOnceMessage',
]);

const isOwner = (jid, sock) => {
  if (matchesOwner(jid, config.owner.jids)) return true;
  // XLICON-style: bot's own number is always owner
  if (sock && sock.user) {
    const botNumber = sock.user.id?.split(':')[0]?.replace('@s.whatsapp.net', '');
    if (botNumber && matchesOwner(jid, [botNumber])) return true;
  }
  return false;
};

// We get the self-sent set from events.js (populated by client.js's socket wrap).
// Re-import the reference (live) so we always see the current set.
const selfSentIds = events.selfSentIds;

/** Check if bot is enabled in this group (default: true). */
const isBotEnabled = (chatJid) => {
  if (!isJidGroup(chatJid)) return true;
  const groups = store.get('groups');
  const g = groups[chatJid];
  if (!g) return true;
  return g.botEnabled !== false;
};

const extractText = (msg) => {
  let m = msg.message;
  if (!m) return '';
  // unwrap ephemeral / viewOnce
  if (m.ephemeralMessage) m = m.ephemeralMessage.message || {};
  if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message || {};
  if (m.viewOnceMessage) m = m.viewOnceMessage.message || {};
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    ''
  );
};

const extractQuoted = (msg) => {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (!ctx || !ctx.quotedMessage) return null;
  return {
    key: { remoteJid: msg.key.remoteJid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant },
    message: ctx.quotedMessage,
    sender: ctx.participant, // JID of the person whose message we quoted
  };
};

const extractMentions = (msg) => {
  let m = msg.message || {};
  // unwrap ephemeral / viewOnce
  if (m.ephemeralMessage) m = m.ephemeralMessage.message || {};
  if (m.viewOnceMessageV2) m = m.viewOnceMessageV2.message || {};
  if (m.viewOnceMessage) m = m.viewOnceMessage.message || {};
  return (
    m.extendedTextMessage?.contextInfo?.mentionedJid ||
    m.imageMessage?.contextInfo?.mentionedJid ||
    m.videoMessage?.contextInfo?.mentionedJid ||
    m.documentMessage?.contextInfo?.mentionedJid ||
    []
  );
};

const buildContext = (sock, msg) => {
  const from = msg.key.remoteJid;
  const participant = msg.key.participant || from;
  const isGroup = isJidGroup(from);
  const pushName = msg.pushName || 'Unknown';
  const text = extractText(msg);
  const mentionedJid = extractMentions(msg);
  const quoted = extractQuoted(msg);
  const prefix = isGroup
    ? store.get('groups')[from]?.prefix || config.bot.prefix
    : store.get('bot').prefix || config.bot.prefix;
  return {
    sock,
    msg,
    from,
    participant,
    sender: participant, // alias used by economy + XLICON-style commands
    isGroup,
    pushName,
    text,
    mentionedJid,
    quoted,
    prefix,
    isOwner: isOwner(participant, sock) || isOwner(from, sock),
    phone: bestPhone(participant, pushName) || bestPhone(from, pushName),
    args: [],
    command: null,
  };
};

const parseCommand = (text, prefix) => {
  if (!text) return null;
  // 1. explicit prefix (".menu", "!menu", ...)
  if (text.startsWith(prefix)) {
    const body = text.slice(prefix.length).trim();
    if (!body) return null;
    const [name, ...args] = body.split(/\s+/);
    return { name: name.toLowerCase(), args, raw: body };
  }
  // 2. wake word: "mythos <cmd...>" → treat as command (case-insensitive)
  const m = text.match(/^\s*mythos\b\s*[:,]?\s*(.*)$/i);
  if (m) {
    const body = (m[1] || '').trim();
    if (!body) {
      return { name: 'menu', args: [], raw: 'mythos' };
    }
    // group activation via wake words
    const actOn = /^(start|on|activate|awake|arise|enable)$/i;
    const actOff = /^(stop|off|deactivate|sleep|die|disable)$/i;
    const first = body.split(/\s+/)[0].toLowerCase();
    if (actOn.test(first)) return { name: 'bot', args: ['on'], raw: body };
    if (actOff.test(first)) return { name: 'bot', args: ['off'], raw: body };
    const [name, ...args] = body.split(/\s+/);
    return { name: name.toLowerCase(), args, raw: body };
  }
  return null;
};

/**
 * Extract the "selected id" from any kind of interactive response message.
 * Returns a string id (e.g. ".quote") or null if nothing usable is found.
 *
 * Covers all three flavours we get back from WhatsApp:
 *   - buttonsResponseMessage        (legacy buttonsMessage)
 *   - listResponseMessage           (legacy sections list)
 *   - interactiveResponseMessage    (native flow — single_select, quick_reply, etc.)
 *   - templateButtonReplyMessage    (template buttons, legacy)
 */
const extractResponseId = (msg, ctype, fallbackText) => {
  const m = msg.message || {};
  // 1. legacy buttonsMessage → buttonsResponseMessage
  if (ctype === 'buttonsResponseMessage') {
    return m.buttonsResponseMessage?.selectedButtonId
      || m.buttonsResponseMessage?.buttonId
      || fallbackText
      || null;
  }
  // 2. legacy list → listResponseMessage
  if (ctype === 'listResponseMessage') {
    return m.listResponseMessage?.singleSelectReply?.selectedRowId
      || m.listResponseMessage?.selectedRowId
      || m.listResponseMessage?.title
      || fallbackText
      || null;
  }
  // 3. native flow (single_select, quick_reply, cta_*, ...) → interactiveResponseMessage
  if (ctype === 'interactiveResponseMessage') {
    const ir = m.interactiveResponseMessage || {};
    const nfr = ir.nativeFlowResponseMessage || {};
    // 3a. try paramsJson (stringified JSON containing {id, ...})
    if (nfr.paramsJson) {
      try {
        const parsed = JSON.parse(nfr.paramsJson);
        if (parsed && (parsed.id || parsed.selectedRowId)) {
          return parsed.id || parsed.selectedRowId;
        }
      } catch {}
    }
    // 3b. try params (object directly)
    if (nfr.params && typeof nfr.params === 'object') {
      if (nfr.params.id) return nfr.params.id;
    }
    // 3c. top-level id / selectedButtonId
    if (ir.selectedButtonId) return ir.selectedButtonId;
    if (ir.id) return ir.id;
    // 3d. singleSelectReply on the interactive wrapper
    if (ir.singleSelectReply?.selectedRowId) return ir.singleSelectReply.selectedRowId;
    return fallbackText || null;
  }
  // 4. template button reply
  if (ctype === 'templateButtonReplyMessage') {
    return m.templateButtonReplyMessage?.selectedId
      || m.templateButtonReplyMessage?.selectedButtonId
      || fallbackText
      || null;
  }
  return fallbackText || null;
};

const tick = '\u2713';

const handle = async (sock, { messages, type }) => {
  if (type !== 'notify' && type !== 'append') return;
  for (const msg of messages) {
    if (!msg.message) continue;
    // unwrap ephemeral / viewOnce for content type detection
    let rawMsg = msg.message;
    if (rawMsg.ephemeralMessage) rawMsg = rawMsg.ephemeralMessage.message || {};
    if (rawMsg.viewOnceMessageV2) rawMsg = rawMsg.viewOnceMessageV2.message || {};
    if (rawMsg.viewOnceMessage) rawMsg = rawMsg.viewOnceMessage.message || {};
    const ctype = getContentType(rawMsg) || getContentType(msg.message);
    const isResponse =
      ctype === 'buttonsResponseMessage' ||
      ctype === 'listResponseMessage' ||
      ctype === 'interactiveResponseMessage' ||
      ctype === 'templateButtonReplyMessage';

    // Track our own outgoing message IDs so we don't re-process them.
    // (Without this, our own replies / reactions / button messages would
    // come back through the same socket and loop forever.)
    if (msg.key.fromMe && selfSentIds.has(msg.key.id)) {
      selfSentIds.delete(msg.key.id);
      continue;
    }
    // Also drop our own reactions (they have no text and aren't commands,
    // but the `fromMe: true` reaction can arrive a second later as a separate
    // upsert, especially in private chats).
    if (ctype === 'reactionMessage') continue;

    if (!handledTypes.has(ctype) && !isResponse) {
      if (process.env.DEBUG_INGEST) {
        log.evt('ignored message', { type: ctype, from: msg.key.remoteJid, fromMe: msg.key.fromMe });
      }
      continue;
    }

    const ctx = buildContext(sock, msg);

    // DEBUG: log every incoming message with owner status
    log.evt('MSG', {
      from: ctx.from,
      participant: ctx.participant,
      pushName: ctx.pushName,
      isOwner: ctx.isOwner,
      isGroup: ctx.isGroup,
      text: (ctx.text || '').slice(0, 60),
      type: ctype,
    });

    // ── antilink check (text only, groups only) ────────────────────
    if (ctx.isGroup && !isResponse) await events.handleMessagesUpsert(sock, msg);

    // ── anti-badword check ─────────────────────────────────────────
    if (ctx.isGroup && ctx.text && !isResponse) {
      const badwordHit = await events.checkBadword(sock, msg, store.get('groups'), ctx.text);
      if (badwordHit) continue;
    }

    // ── anti-spam check ────────────────────────────────────────────
    if (ctx.isGroup && !isResponse) {
      await events.checkSpam(sock, msg, store.get('groups'));
    }

    // ── PM permit (anti-spam in DMs) ──────────────────────────────
    if (!ctx.isGroup && !ctx.fromMe) {
      const bot = store.get('bot');
      if (bot.pmPermit && ctx.participant) {
        const sender = ctx.participant;
        // skip if sender is owner
        if (!isOwner(sender, sock)) {
          if (!bot.pmTracker) bot.pmTracker = {};
          if (!bot.pmTracker[sender]) bot.pmTracker[sender] = { count: 0, warned: false };
          bot.pmTracker[sender].count++;
          const limit = bot.pmLimit || 5;
          if (bot.pmTracker[sender].count >= limit) {
            // block the spammer
            try {
              await sock.updateBlockStatus(sender, 'block');
              await reply(sock, ctx, `${S.cross} Auto-blocked for spamming (${limit} messages).`);
            } catch {}
            delete bot.pmTracker[sender];
            store.set('bot', bot);
            continue;
          } else if (bot.pmTracker[sender].count === limit - 1 && !bot.pmTracker[sender].warned) {
            bot.pmTracker[sender].warned = true;
            await reply(sock, ctx, `${S.warn} Warning: You have sent ${bot.pmTracker[sender].count} messages. One more and you will be blocked.`);
            store.set('bot', bot);
          }
        }
      }
    }

    // ── button / list / interactive response routing ───────────────
    if (isResponse) {
      const id = extractResponseId(msg, ctype, ctx.text);
      if (process.env.DEBUG_INGEST) {
        log.evt('interactive response', { type: ctype, id, from: msg.key.remoteJid, fromMe: msg.key.fromMe });
      }
      if (id) {
        // category sub-menu: "cat:editor" → show commands in that category
        if (id.startsWith('cat:')) {
          const cat = id.slice(4);
          const menuCmd = loader.resolve('menu');
          if (menuCmd && menuCmd.showCategory) {
            await menuCmd.showCategory(ctx, cat);
          }
          continue;
        }
        const parsed = parseCommand(id, ctx.prefix);
        if (parsed) {
          ctx.command = parsed.name;
          ctx.args = parsed.args;
          await runCommand(sock, ctx, parsed.raw, id);
        } else if (process.env.DEBUG_INGEST) {
          log.evt('response id not a command', { id, prefix: ctx.prefix });
        }
      }
      continue;
    }

    // ── normal text command ─────────────────────────────────────────
    if (process.env.DEBUG_INGEST) {
      log.evt('text message', { text: ctx.text.slice(0, 80), from: msg.key.remoteJid, fromMe: msg.key.fromMe, prefix: ctx.prefix });
    }
    const parsed = parseCommand(ctx.text, ctx.prefix);
    if (!parsed) {
      // ── chatbot: respond to mentions (groups) or DMs ────────────
      const bot = store.get('bot');
      if (bot.chatbot && ctx.text && !ctx.fromMe) {
        const isMentioned = ctx.mentionedJid?.some((j) => {
          const botNum = sock.user?.id?.split(':')[0]?.replace('@s.whatsapp.net', '');
          return j === botNum || j === sock.user?.id;
        });
        const shouldReply = !ctx.isGroup || isMentioned;
        if (shouldReply) {
          try {
            await sock.sendPresenceUpdate('composing', ctx.from).catch(() => {});
            await new Promise(r => setTimeout(r, 600));
            await react(sock, ctx, '...');
            const userName = ctx.pushName || 'User';
            const response = await mistralChat(ctx.sender, ctx.text, { userName });
            await reply(sock, ctx, response);
          } catch (e) {
            log.err('chatbot failed', { error: e.message });
            await reply(sock, ctx, `${S.cross} AI temporarily unavailable.`);
          }
        }
      }
      continue;
    }
    ctx.command = parsed.name;
    ctx.args = parsed.args;

    // check if bot is enabled in this group (but always allow bot on/off for reactivation)
    if (!isBotEnabled(ctx.from) && ctx.command !== 'bot') continue;

    if (!rateLimit.allow(ctx.from, ctx.participant)) {
      await react(sock, ctx, '⏳');
      continue;
    }

    await runCommand(sock, ctx, parsed.raw, ctx.text);
  }
};

const runCommand = async (sock, ctx, raw, displayText) => {
  const cmd = loader.resolve(ctx.command);
  if (!cmd) {
    // silent for trivial short input (e.g. just ".")
    if (ctx.command.length >= 3) {
      const allNames = loader.all().flatMap((c) => [c.name, ...(c.aliases || [])]);
      const guess = suggest(ctx.command, allNames);
      if (guess) {
        await reply(
          sock,
          ctx,
          `${S.warn}  Unknown command *${ctx.prefix}${ctx.command}*.\n  ${S.sub}  ${S.arr}  Did you mean *${ctx.prefix}${guess}*?`
        );
      }
    }
    return;
  }

  // owner-only gate
  if (cmd.owner && !ctx.isOwner) {
    await reply(sock, ctx, 'This command is reserved for the owner of the bot.');
    return;
  }

    log.cmd(raw, { from: ctx.from, user: ctx.pushName, group: ctx.isGroup, isOwner: ctx.isOwner, participant: ctx.participant });

  // ── XP tracking (every message earns XP) ───────────────────────
  try {
    const users = store.get('users') || {};
    const ujid = ctx.sender;
    if (!users[ujid]) users[ujid] = { xp: 0, messages: 0, phone: ctx.phone };
    users[ujid].messages = (users[ujid].messages || 0) + 1;
    users[ujid].xp = (users[ujid].xp || 0) + Math.floor(Math.random() * 5) + 1;
    store.set('users', users);
  } catch {}

  try {
    // show typing indicator before command execution
    await sock.sendPresenceUpdate('composing', ctx.from).catch(() => {});
    await new Promise(r => setTimeout(r, 400));
    // show user card before command execution
    await userCard(sock, ctx, { extra: `${S.tri} Command ${S.arr}  *${ctx.prefix}${ctx.command}*` }).catch(() => {});
    await cmd.execute(ctx);
    store.update('users', (u) => {
      const jid = ctx.participant;
      if (!u[jid]) u[jid] = { name: ctx.pushName, messages: 0, lastSeen: Date.now() };
      u[jid].messages += 1;
      u[jid].lastSeen = Date.now();
    });
    store.update('bot', (b) => {
      b.totalCommands = (b.totalCommands || 0) + 1;
    });
    // contextual reaction by command category
    const catReaction = CATEGORY_REACTIONS[cmd.category] || tick;
    await react(sock, ctx, catReaction);
    // auto-react with random symbol
    events.autoReact(sock, ctx.msg).catch(() => {});
  } catch (e) {
    log.err(`command ${ctx.command} failed`, { error: e.message });
    await reply(sock, ctx, 'The command could not be completed. Check the bot logs.');
  }
};

module.exports = { handle };

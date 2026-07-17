/**
 * Mythos ⟁ Ascendant — high-level message helpers.
 * Uses @itsliaaa/baileys native sendMessage with branded defaults.
 */

const {
  downloadContentFromMessage,
  generateWAMessageFromContent,
  normalizeMessageContent,
  generateMessageIDV2,
  isJidGroup,
} = require('@itsliaaa/baileys');

const { S } = require('./formatter');
const config = require('../config');

// ── branded card defaults ────────────────────────────────────────────
const BRAND_AD_REPLY = {
  title: 'Mythos',
  body: config.bot?.subtitle || 'Fifty Names from the First Error',
  thumbnailUrl: config.bot?.thumbnail || 'https://files.catbox.moe/k3j8m1.jpg',
  sourceUrl: 'https://github.com/GOATED-404',
  mediaType: 1,
  renderLargerThumbnail: true,
};

/**
 * Build a branded context object.
 * In the new baileys, externalAdReply goes directly on the message object,
 * but we keep contextInfo for backwards compatibility.
 */
const brandContext = (opts = {}) => {
  const ctx = {};
  if (opts.mentions?.length) ctx.mentionedJid = opts.mentions;
  if (!opts.noAd) {
    ctx.externalAdReply = {
      ...BRAND_AD_REPLY,
      ...(opts.ad || {}),
    };
  }
  return ctx;
};

/** Send a plain (or quoted) text reply with branded card. */
const reply = async (sock, ctx, text, opts = {}) => {
  const mentions = opts.mentions || [];
  return sock.sendMessage(ctx.from, {
    text,
    externalAdReply: opts.noAd ? undefined : { ...BRAND_AD_REPLY, ...(opts.ad || {}) },
    mentions: mentions.length ? mentions : undefined,
  }, { quoted: ctx.msg, ...opts });
};

/**
 * Send a user card reply — profile pic + hi @user + phone + role.
 */
const userCard = async (sock, ctx, { extra = '' } = {}) => {
  const sender = ctx.participant || ctx.from;
  const num = sender?.split('@')[0]?.split(':')[0] || '?';
  const phone = ctx.phone || num;
  const role = ctx.isOwner ? 'Owner' : 'User';
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const body =
    `Hi @${num}\n\n` +
    `${S.tri} Name  ${S.arr}  ${ctx.pushName || 'Unknown'}\n` +
    `${S.tri} Phone ${S.arr}  ${phone}\n` +
    `${S.tri} Role  ${S.arr}  ${role}\n` +
    `${S.tri} Time  ${S.arr}  ${time}` +
    (extra ? `\n${extra}` : '');

  let pfp;
  try { pfp = await sock.profilePictureUrl(sender, 'image'); } catch { pfp = null; }

  if (pfp) {
    return sock.sendMessage(ctx.from, {
      image: { url: pfp },
      caption: body,
      mentions: [sender],
      externalAdReply: {
        ...BRAND_AD_REPLY,
        title: `${ctx.pushName || 'User'} ⟁ ${role}`,
        body: `${S.tri} Command ${S.arr} ${ctx.command || 'N/A'}`,
        mediaType: 1,
      },
    }, { quoted: ctx.msg });
  }
  return sock.sendMessage(ctx.from, {
    text: body,
    mentions: [sender],
    externalAdReply: {
      ...BRAND_AD_REPLY,
      title: `${ctx.pushName || 'User'} ⟁ ${role}`,
      body: `${S.tri} Command ${S.arr} ${ctx.command || 'N/A'}`,
      mediaType: 1,
    },
  }, { quoted: ctx.msg });
};

/** Send text with auto-extracted @mentions. */
const sendTextWithMentions = async (sock, jid, text, quoted, opts = {}) => {
  const jids = [...new Set([...text.matchAll(/@(\d{5,16})/g)].map(v => v[1] + '@s.whatsapp.net'))];
  return sock.sendMessage(jid, {
    text,
    mentions: jids.length ? jids : undefined,
    externalAdReply: opts.noAd ? undefined : { ...BRAND_AD_REPLY, ...(opts.ad || {}) },
  }, { quoted, ...opts });
};

/** Resolve a LID to a phone-number JID if possible. */
const resolveToPhone = (jid, store) => {
  if (!jid) return jid;
  if (jid.endsWith('@s.whatsapp.net')) return jid;
  const contacts = store?.get?.('contacts') || {};
  const entry = contacts[jid];
  if (entry?.phone) return `${entry.phone}@s.whatsapp.net`;
  const users = store?.get?.('users') || {};
  const uEntry = users[jid];
  if (uEntry?.phone) return `${uEntry.phone}@s.whatsapp.net`;
  return jid;
};

/** React to the triggering message with a symbol. */
const react = async (sock, ctx, symbol) => {
  try {
    await sock.sendMessage(ctx.from, {
      react: { text: symbol || '', key: ctx.msg.key },
    });
  } catch {}
};

/** Send plain text without quoting. */
const sendText = async (sock, jid, text, opts = {}) => {
  return sock.sendMessage(jid, {
    text,
    externalAdReply: opts.noAd ? undefined : { ...BRAND_AD_REPLY, ...(opts.ad || {}) },
  }, opts);
};

/** Send an image. Accepts url, buffer, or path. */
const sendImage = async (sock, jid, { image, caption = '', quoted, contextInfo }) => {
  return sock.sendMessage(jid, {
    image,
    caption,
    externalAdReply: contextInfo?.externalAdReply || BRAND_AD_REPLY,
    mentions: contextInfo?.mentionedJid,
  }, quoted ? { quoted } : {});
};

/** Send a video. */
const sendVideo = async (sock, jid, { video, caption = '', quoted, ptv = false, contextInfo }) => {
  return sock.sendMessage(jid, {
    video,
    caption,
    ptv,
    externalAdReply: contextInfo?.externalAdReply || BRAND_AD_REPLY,
    mentions: contextInfo?.mentionedJid,
  }, quoted ? { quoted } : {});
};

/** Send an audio clip (voice note style). */
const sendAudio = async (sock, jid, { audio, ptt = false, quoted }) => {
  return sock.sendMessage(jid, { audio, ptt, mimetype: 'audio/ogg; codecs=opus' }, quoted ? { quoted } : {});
};

/** Send a document. */
const sendDocument = async (sock, jid, { document, fileName = 'file', mimetype = 'application/octet-stream', quoted }) => {
  return sock.sendMessage(jid, { document, fileName, mimetype }, quoted ? { quoted } : {});
};

/** Send a sticker from buffer. */
const sendSticker = async (sock, jid, buffer, quoted, opts = {}) => {
  const Sticker = require('wa-sticker-formatter');
  const sticker = new Sticker(buffer, {
    pack: opts.pack || 'Mythos ⟁ Ascendant',
    author: opts.author || 'Mythos',
    type: 'full',
    categories: ['🤩', '✨'],
    quality: 70,
  });
  const out = await sticker.toBuffer();
  return sock.sendMessage(jid, { sticker: out }, quoted ? { quoted } : {});
};

/**
 * Send a quick-reply button message using native baileys buttons.
 * Buttons: [{ id: '.cmd', text: 'Label' }]
 */
const sendQuickReply = async (sock, jid, { text, footer, buttons, quoted }) => {
  return sock.sendMessage(jid, {
    text,
    footer: footer || `${S.brand} Mythos ⟁ Ascendant`,
    buttons: (buttons || []).map(b => ({
      text: b.text || b.id,
      id: b.id,
    })),
  }, quoted ? { quoted } : {});
};

/**
 * Send an interactive native-flow message.
 * Accepts either `nativeFlow` (new style) or `interactiveButtons` (legacy).
 * Supports: quick_reply, cta_url, cta_copy, cta_call, single_select,
 *           open_webview, galaxy_message, etc.
 */
const sendInteractive = async (sock, jid, payload, quoted) => {
  const { text, title, footer, nativeFlow, interactiveButtons, optionText, offerText, offerCode, offerUrl, offerExpiration } = payload;
  // Merge nativeFlow + interactiveButtons (interactiveButtons is legacy compat)
  const buttons = [
    ...(nativeFlow || []),
    ...(interactiveButtons || []),
  ];
  return sock.sendMessage(jid, {
    text: text || '',
    footer: footer || `${S.brand} Mythos ⟁ Ascendant`,
    optionText,
    offerText,
    offerCode,
    offerUrl,
    offerExpiration,
    nativeFlow: buttons.length ? buttons : undefined,
  }, quoted ? { quoted } : {});
};

/**
 * Binary node builder for special interactive button types.
 * Maps button names to the exact binary structures WhatsApp expects.
 */
function getButtonArgs(normalizedContent) {
  const nativeFlow = normalizedContent.interactiveMessage?.nativeFlowMessage;
  const firstButtonName = nativeFlow?.buttons?.[0]?.name;
  const FLOWS_MAP = {
    mpm: true, cta_catalog: true, send_location: true,
    call_permission_request: true, wa_payment_transaction_details: true,
    automated_greeting_message_view_catalog: true,
  };

  if (firstButtonName === 'open_webview') {
    return {
      tag: 'biz',
      attrs: {},
      content: [{
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '2', name: 'open_webview' } }],
      }],
    };
  }
  if (firstButtonName === 'galaxy_message') {
    return {
      tag: 'biz',
      attrs: { native_flow_name: 'galaxy_message' },
    };
  }
  if (firstButtonName === 'review_and_pay' || firstButtonName === 'payment_info') {
    return {
      tag: 'biz',
      attrs: { native_flow_name: firstButtonName === 'review_and_pay' ? 'order_details' : firstButtonName },
    };
  }
  if (firstButtonName && FLOWS_MAP[firstButtonName]) {
    return {
      tag: 'biz',
      attrs: {},
      content: [{
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '2', name: firstButtonName } }],
      }],
    };
  }
  if (nativeFlow || normalizedContent.buttonsMessage) {
    return {
      tag: 'biz',
      attrs: {},
      content: [{
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
      }],
    };
  }
  if (normalizedContent.listMessage) {
    return { tag: 'biz', attrs: {}, content: [{ tag: 'list', attrs: { v: '2', type: 'product_list' } }] };
  }
  return { tag: 'biz', attrs: {} };
}

const sendInteractiveMessage = async (sock, jid, content, options = {}) => {
  const userJid = sock.authState?.creds?.me?.id || sock.user?.id;
  const fullMsg = generateWAMessageFromContent(jid, content, {
    logger: sock.logger,
    userJid,
    messageId: generateMessageIDV2(userJid),
    timestamp: new Date(),
    ...options,
  });
  const normalizedContent = normalizeMessageContent(fullMsg.message);
  const additionalNodes = [...(options.additionalNodes || [])];
  if (normalizedContent.interactiveMessage || normalizedContent.buttonsMessage || normalizedContent.listMessage) {
    additionalNodes.push(getButtonArgs(normalizedContent));
    if (!isJidGroup(jid)) {
      additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
    }
  }
  await sock.relayMessage(jid, fullMsg.message, {
    messageId: fullMsg.key.id,
    additionalAttributes: options.additionalAttributes || {},
    statusJidList: options.statusJidList,
    additionalNodes,
  });
  return fullMsg;
};

const sendInteractiveRelay = async (sock, jid, { text, footer, buttons }, quoted) => {
  const content = {
    interactiveMessage: {
      nativeFlowMessage: { buttons },
      body: { text: text || '' },
      footer: { text: footer || `${S.brand} Mythos ⟁ Ascendant` },
    },
  };
  return sendInteractiveMessage(sock, jid, content, quoted ? { quoted } : {});
};

/** Send an interactive list menu (sections with rows). */
const sendList = async (sock, jid, { text, footer, buttonText, title, sections, quoted }) => {
  return sock.sendMessage(jid, {
    text,
    footer: footer || `${S.brand} Mythos ⟁ Ascendant`,
    buttonText: buttonText || '▸ Open Menu',
    title: title || 'Mythos ⟁ Ascendant',
    sections,
  }, quoted ? { quoted } : {});
};

/**
 * Send a native-flow single-select picker.
 */
const sendNativeList = async (sock, jid, { text, footer, title, buttonText, sections, quoted }) => {
  const rows = [];
  for (const section of sections || []) {
    for (const row of section.rows || []) {
      rows.push({
        text: row.title,
        id: row.id,
        icon: row.header || undefined,
      });
    }
  }
  return sock.sendMessage(jid, {
    text: text || '',
    footer: footer || `${S.brand} Mythos ⟁ Ascendant`,
    optionText: buttonText || '▸ Choose',
    nativeFlow: rows,
  }, quoted ? { quoted } : {});
};

/**
 * Send an interactive carousel using native cards API.
 * Cards: [{ image, caption, footer, nativeFlow: [{ text, id }] }]
 */
const sendCarousel = async (sock, jid, { text, footer, cards, quoted }) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error('sendCarousel requires at least one card');
  }
  return sock.sendMessage(jid, {
    text: text || '',
    footer: footer || `${S.brand} Mythos ⟁ Ascendant`,
    cards: cards.map(c => ({
      image: c.image,
      video: c.video,
      caption: c.caption || c.body || '',
      footer: c.footer || footer || `${S.brand} Mythos`,
      nativeFlow: (c.buttons || c.nativeFlow || []).map(b => ({
        text: b.text || b.displayText || 'Select',
        id: b.id,
      })),
    })),
  }, quoted ? { quoted } : {});
};

/** Download media from a quoted message. */
const downloadQuotedMedia = async (sock, msg) => {
  const type = Object.keys(msg.message || {})[0];
  if (!type || !type.endsWith('Message')) return null;
  const node = msg.message[type];
  const stream = await downloadContentFromMessage(node, type.replace('Message', '').toLowerCase());
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
};

/**
 * Unwrap ephemeral or viewOnce messages to get the inner message.
 */
const unwrapMessage = (msg) => {
  const m = msg.message;
  if (!m) return { message: null, type: null };

  if (m.ephemeralMessage) {
    const inner = m.ephemeralMessage.message;
    const type = inner ? Object.keys(inner)[0] : null;
    return { message: inner, type };
  }
  if (m.viewOnceMessageV2) {
    const inner = m.viewOnceMessageV2.message;
    const type = inner ? Object.keys(inner)[0] : null;
    return { message: inner, type };
  }
  if (m.viewOnceMessage) {
    const inner = m.viewOnceMessage.message;
    const type = inner ? Object.keys(inner)[0] : null;
    return { message: inner, type };
  }

  const type = Object.keys(m)[0];
  return { message: m, type };
};

/** Send a location message. */
const sendLocation = async (sock, jid, { degreesLatitude, degreesLongitude, name, address, quoted }) => {
  return sock.sendMessage(jid, {
    location: {
      degreesLatitude,
      degreesLongitude,
      name: name || 'Mythos Location',
      address: address || '',
    },
  }, quoted ? { quoted } : {});
};

/** Send a poll message. */
const sendPoll = async (sock, jid, { name, values, selectableCount = 1, quoted }) => {
  return sock.sendMessage(jid, {
    poll: {
      name: name || 'Poll',
      values: values || [],
      selectableCount,
    },
  }, quoted ? { quoted } : {});
};

/** Send a contact/vcard message. */
const sendContact = async (sock, jid, { contacts, quoted }) => {
  const arr = Array.isArray(contacts) ? contacts : [contacts];
  return sock.sendMessage(jid, {
    contacts: {
      displayName: arr[0]?.name || 'Contact',
      contacts: arr.map((c) => ({
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name || ''}\nTEL;type=CELL:${c.phone || ''}\n${c.email ? `EMAIL:${c.email}\n` : ''}${c.url ? `URL:${c.url}\n` : ''}END:VCARD`,
      })),
    },
  }, quoted ? { quoted } : {});
};

/** Send an album (multiple images/videos in one message). */
const sendAlbum = async (sock, jid, { media, quoted }) => {
  return sock.sendMessage(jid, {
    album: media,
  }, quoted ? { quoted } : {});
};

/** Send a rich response with submessages (text, code, tables). */
const sendRichResponse = async (sock, jid, { disclaimerText, richResponse, quoted }) => {
  return sock.sendMessage(jid, {
    disclaimerText: disclaimerText || '',
    richResponse,
  }, quoted ? { quoted } : {});
};

/** Send a code block message with syntax highlighting. */
const sendCodeBlock = async (sock, jid, { headerText, code, language, footerText, quoted }) => {
  return sock.sendMessage(jid, {
    disclaimerText: '',
    headerText: headerText || '',
    contentText: '---',
    code,
    language: language || 'javascript',
    footerText: footerText || '',
  }, quoted ? { quoted } : {});
};

/** Send a table message. */
const sendTable = async (sock, jid, { headerText, title, table, noHeading, footerText, quoted }) => {
  return sock.sendMessage(jid, {
    disclaimerText: '',
    headerText: headerText || '',
    contentText: '---',
    title: title || '',
    table,
    noHeading: noHeading || false,
    footerText: footerText || '',
  }, quoted ? { quoted } : {});
};

/** Send a product message with price and image. */
const sendProduct = async (sock, jid, { image, body, footer, product, businessOwnerJid, quoted }) => {
  return sock.sendMessage(jid, {
    image,
    body: body || '',
    footer: footer || `${S.brand} Mythos ⟁ Ascendant`,
    product,
    businessOwnerJid: businessOwnerJid || '0@s.whatsapp.net',
  }, quoted ? { quoted } : {});
};

/** Send a WhatsApp event. */
const sendEvent = async (sock, jid, { event, quoted }) => {
  return sock.sendMessage(jid, { event }, quoted ? { quoted } : {});
};

/** Send a group invite card. */
const sendGroupInvite = async (sock, jid, { groupInvite, quoted }) => {
  return sock.sendMessage(jid, { groupInvite }, quoted ? { quoted } : {});
};

/** Send an AI-branded reply with the AI icon. */
const sendAIReply = async (sock, jid, { text, image, quoted }) => {
  const msg = { text, ai: true };
  if (image) msg.image = image;
  if (image) msg.caption = text;
  return sock.sendMessage(jid, msg, quoted ? { quoted } : {});
};

/** Wrap a message in ephemeral (disappearing messages). */
const sendEphemeral = async (sock, jid, content, quoted) => {
  return sock.sendMessage(jid, { ...content, ephemeral: true }, quoted ? { quoted } : {});
};

/** Wrap a message in spoiler. */
const sendSpoiler = async (sock, jid, content, quoted) => {
  return sock.sendMessage(jid, { ...content, spoiler: true }, quoted ? { quoted } : {});
};

/** Send a view-once message. */
const sendViewOnce = async (sock, jid, content, quoted) => {
  return sock.sendMessage(jid, { ...content, viewOnce: true }, quoted ? { quoted } : {});
};

module.exports = {
  reply,
  react,
  sendText,
  sendTextWithMentions,
  resolveToPhone,
  userCard,
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendSticker,
  sendQuickReply,
  sendInteractive,
  sendList,
  sendNativeList,
  sendCarousel,
  downloadQuotedMedia,
  unwrapMessage,
  sendLocation,
  sendPoll,
  sendContact,
  brandContext,
  sendInteractiveMessage,
  sendInteractiveRelay,
  getButtonArgs,
  sendAlbum,
  sendRichResponse,
  sendCodeBlock,
  sendTable,
  sendProduct,
  sendEvent,
  sendGroupInvite,
  sendAIReply,
  sendEphemeral,
  sendSpoiler,
  sendViewOnce,
};

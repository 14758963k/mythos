/**
 * Mythos ⟁ Ascendant — JID utilities.
 */

const isJidGroup = (jid) => typeof jid === 'string' && jid.endsWith('@g.us');
const isJidUser = (jid) => typeof jid === 'string' && jid.endsWith('@s.whatsapp.net');
const isJidStatus = (jid) => typeof jid === 'string' && jid === 'status@broadcast';
const isJidLid = (jid) => typeof jid === 'string' && jid.endsWith('@lid');

/**
 * Extract the human-readable phone number from a JID.
 * Returns the phone as a digit string, or '' if the JID is opaque (LID with
 * no resolvable phone). Handles:
 *   "254712345678@s.whatsapp.net"          → "254712345678"
 *   "254712345678:42@s.whatsapp.net"       → "254712345678"
 *   "173461464957066@lid"                  → ""
 *   "123456@g.us"                          → "" (group, no phone)
 */
const jidToNumber = (jid) => {
  if (!jid) return '';
  // Phone-number-based JIDs always start with the country code digits.
  if (jid.endsWith('@s.whatsapp.net')) {
    const head = jid.split('@')[0];
    const digits = head.split(':')[0];
    if (/^\d{6,}$/.test(digits)) return digits;
  }
  return '';
};

/**
 * Best-effort phone lookup: try the JID, then fall back to extracting a
 * number from the pushName (some users set their WhatsApp display name
 * to "User_<phone>" or "Name +<phone>"). Returns '' if nothing is found.
 */
const bestPhone = (jid, pushName) => {
  const fromJid = jidToNumber(jid);
  if (fromJid) return fromJid;
  if (pushName) {
    const m = pushName.match(/\+?(\d{7,15})/);
    if (m) return m[1];
  }
  return '';
};

const sanitizeJid = (number) => {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, '');
  if (!digits) return null;
  return `${digits}@s.whatsapp.net`;
};

const senderJid = (msg) => {
  if (!msg?.key) return null;
  if (msg.key.fromMe) return msg.key.remoteJid;
  return msg.key.participant || msg.key.remoteJid;
};

const groupJid = (msgOrJid) => {
  const jid = typeof msgOrJid === 'string' ? msgOrJid : msgOrJid?.key?.remoteJid;
  return isJidGroup(jid) ? jid : null;
};

/**
 * Check whether a JID matches any owner JID — by either exact match or by
 * phone number. Necessary because Baileys sometimes delivers LID-based JIDs
 * whose phone matches a PN-based OWNER_JIDS entry.
 */
const matchesOwner = (jid, ownerJids) => {
  if (!jid || !ownerJids || !ownerJids.length) return false;
  // exact match
  if (ownerJids.includes(jid)) return true;
  // strip device suffix (e.g. "12345:2@lid" → "12345@lid")
  const bare = jid.replace(/:\d+@/, '@');
  if (bare !== jid && ownerJids.includes(bare)) return true;
  // XLICON-style: extract phone, build @s.whatsapp.net JID, check
  const phone = jidToNumber(jid);
  if (phone) {
    const pnJid = `${phone}@s.whatsapp.net`;
    if (ownerJids.includes(pnJid)) return true;
    if (ownerJids.includes(phone)) return true;
  }
  // also check each owner JID: strip non-digits + @s.whatsapp.net (XLICON pattern)
  return ownerJids.some((oj) => {
    const ownerPhone = jidToNumber(oj);
    if (ownerPhone && phone && ownerPhone === phone) return true;
    // XLICON-style: owner might be stored as bare number
    const stripped = oj.replace(/[^0-9]/g, '');
    if (phone && stripped === phone) return true;
    // also check if jid itself is a bare number matching an owner
    const jidStripped = jid.replace(/[^0-9]/g, '');
    if (jidStripped && stripped && jidStripped === stripped) return true;
    return false;
  });
};

module.exports = {
  isJidGroup,
  isJidUser,
  isJidStatus,
  isJidLid,
  jidToNumber,
  bestPhone,
  sanitizeJid,
  senderJid,
  groupJid,
  matchesOwner,
};

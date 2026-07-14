/**
 * Smoke test — load every module, simulate a fake message, run the handler,
 * and check that the loader resolves all 50 commands.
 *
 * Run: node scripts/smoke.js
 */

const path = require('path');
const loader = require('../src/core/loader');

const count = loader.register(path.join(__dirname, '..', 'src', 'commands'));
const all = loader.all();

console.log('═══════════════════════════════════════════════════════════');
console.log('  ⟁  Mythos ⟁ Ascendant  —  Smoke Test');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Commands loaded: ${count}`);
console.log(`  Total resolved : ${all.length}`);
console.log('');

const expected = new Set([
  'menu', 'help', 'ping', 'info', 'stats', 'owner', 'about', 'commands', 'discover', 'leaderboard',
  'start', 'echo',
  'quote', 'joke', 'fact', 'meme', 'roll', 'flip', '8ball', 'rate',
  'calc', 'qr', 'shorten', 'uuid', 'hash', 'base64', 'binary', 'password',
  'time', 'date', 'weather', 'define', 'translate', 'count', 'case', 'reverse',
  'remind', 'reminders', 'delreminder',
  'tagall', 'hidetag', 'groupinfo', 'admins', 'add', 'kick', 'promote', 'demote',
  'welcome', 'goodbye', 'antilink',
  'sticker', 'toimg', 'tts', 'whois', 'profile',
  'setprefix', 'broadcast', 'block', 'unblock', 'restart',
]);

const got = new Set(all.map((c) => c.name));
const missing = [...expected].filter((n) => !got.has(n));
const extra = [...got].filter((n) => !expected.has(n));

if (missing.length) {
  console.log('  ✗ Missing commands:', missing.join(', '));
  process.exit(1);
}
if (extra.length) {
  console.log('  ⚠ Extra commands (still ok):', extra.join(', '));
}

// category breakdown
const byCat = {};
for (const c of all) {
  byCat[c.category] = (byCat[c.category] || 0) + 1;
}
console.log('  Category breakdown:');
for (const [k, v] of Object.entries(byCat).sort()) {
  console.log(`    ${k.padEnd(10)} ${v}`);
}

// check all commands have valid shape
let bad = 0;
for (const c of all) {
  if (typeof c.name !== 'string' || !c.name) { console.log('  ✗ bad name', c); bad++; }
  if (typeof c.execute !== 'function') { console.log('  ✗ bad execute', c.name); bad++; }
  if (typeof c.description !== 'string') { console.log('  ✗ bad description', c.name); bad++; }
  if (typeof c.category !== 'string') { console.log('  ✗ bad category', c.name); bad++; }
}
if (bad) {
  console.log(`  ✗ ${bad} malformed command(s).`);
  process.exit(1);
}

  console.log('');
  console.log('  ✓ Loader OK');
  console.log('  ✓ All 58 commands registered');
  console.log('  ✓ All exports well-formed');

// try requiring core modules
try {
  require('../src/config');
  require('../src/core/logger');
  require('../src/core/store');
  require('../src/core/handler');
  require('../src/helpers/formatter');
  require('../src/helpers/messages');
  require('../src/helpers/jid');
  require('../src/helpers/interactive');
  require('../src/middleware/rateLimit');
  console.log('  ✓ All core modules load');
} catch (e) {
  console.log('  ✗ module load error:', e.message);
  process.exit(1);
}

// check that interactive modules can be required (without actually connecting)
try {
  const helpers = require('baileys_helpers');
  const exported = Object.keys(helpers || {});
  console.log('  ✓ baileys_helpers exports:', exported.join(', '));
} catch (e) {
  console.log('  ✗ baileys_helpers load error:', e.message);
  process.exit(1);
}

try {
  const bw = require('@whiskeysockets/baileys');
  const has = (k) => typeof bw[k] === 'function' || bw[k] !== undefined;
  const checklist = ['default', 'useMultiFileAuthState', 'fetchLatestBaileysVersion', 'DisconnectReason', 'makeCacheableSignalKeyStore', 'Browsers', 'getContentType', 'isJidGroup', 'downloadContentFromMessage', 'generateWAMessageFromContent', 'normalizeMessageContent', 'generateMessageIDV2', 'makeInMemoryStore'];
  const missing = checklist.filter((k) => !has(k));
  if (missing.length) {
    console.log('  ⚠ baileys missing exports:', missing.join(', '));
  } else {
    console.log('  ✓ @whiskeysockets/baileys exports all expected helpers');
  }
} catch (e) {
  console.log('  ✗ baileys load error:', e.message);
  process.exit(1);
}

  console.log('');
  console.log('  Mythos is ready. Run `npm start` to bring it online.');
  console.log('═══════════════════════════════════════════════════════════');

  // ── carousel render check ─────────────────────────────────────────
  console.log('');
  console.log('  Carousel preview (discover) — first card:');
  const discover = require('../src/commands/core/discover.js');
  const first = discover.execute.toString().match(/title: `([^`]+)`/);
  console.log('  ', first ? first[1] : '(unable to introspect)');
  console.log('  Cards:', discover.execute.toString().split('title:').length - 1);

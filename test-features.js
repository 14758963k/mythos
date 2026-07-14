/**
 * Quick validation test for Mythos ⟁ Ascendant — new features.
 * Run: node test-features.js
 */

const { S, progress, box, themedCard } = require('./src/helpers/formatter');
const { unwrapMessage, brandContext } = require('./src/helpers/messages');
const loader = require('./src/core/loader');
const path = require('path');

let pass = 0;
let fail = 0;
const ok = (label) => { pass++; console.log(`  ✓ ${label}`); };
const bad = (label, e) => { fail++; console.log(`  ✗ ${label}: ${e}`); };

// ── 1. Formatter: box-drawing borders ──────────────────────────────
console.log('\n━━━ 1. BOX DRAWING ━━━');
try {
  const b = box('Hello\nWorld', { title: 'Test' });
  console.log(b);
  ok('box() renders correctly');
} catch (e) { bad('box()', e.message); }

// ── 2. Formatter: progress bars ────────────────────────────────────
console.log('\n━━━ 2. PROGRESS BAR ━━━');
try {
  const bars = [
    progress(0, 15),
    progress(0.25, 15),
    progress(0.5, 15),
    progress(0.75, 15),
    progress(1.0, 15),
  ];
  bars.forEach((b, i) => console.log(`  ${String(i * 25).padStart(3)}% ${b}`));
  ok('progress() renders correctly');
} catch (e) { bad('progress()', e.message); }

// ── 3. Formatter: themed card ──────────────────────────────────────
console.log('\n━━━ 3. THEMED CARD ━━━');
try {
  const tc = themedCard('STATUS', [
    `${S.tri} Name   ${S.arr}  Mythos`,
    `${S.tri} Engine ${S.arr}  Baileys`,
    `${S.tri} Uptime ${S.arr}  3h 42m`,
  ], { footer: `${S.sub} Made by Stiletto` });
  console.log(tc);
  ok('themedCard() renders correctly');
} catch (e) { bad('themedCard()', e.message); }

// ── 4. Formatter: new symbols exist ────────────────────────────────
console.log('\n━━━ 4. NEW SYMBOLS ━━━');
const newSyms = [
  'boxTopL', 'boxTopR', 'boxBotL', 'boxBotR', 'boxH', 'boxV',
  'barFull', 'bar75', 'bar50', 'bar25',
];
let allSyms = true;
for (const s of newSyms) {
  if (!S[s]) { bad(`S.${s}`, 'missing'); allSyms = false; }
}
if (allSyms) ok('All new symbols defined');

// ── 5. Messages: brandContext ──────────────────────────────────────
console.log('\n━━━ 5. BRAND CONTEXT ━━━');
try {
  const ctx1 = brandContext();
  console.log('  default:', JSON.stringify(ctx1, null, 2).slice(0, 200));
  ok('brandContext() with no opts');

  const ctx2 = brandContext({ mentions: ['12345@s.whatsapp.net'], noAd: true });
  if (!ctx2.externalAdReply && ctx2.mentionedJid?.length === 1) ok('brandContext() with noAd + mentions');
  else bad('brandContext noAd', JSON.stringify(ctx2));

  const ctx3 = brandContext({ ad: { title: 'Custom' } });
  if (ctx3.externalAdReply?.title === 'Custom') ok('brandContext() with custom ad override');
  else bad('brandContext custom ad', JSON.stringify(ctx3));
} catch (e) { bad('brandContext()', e.message); }

// ── 6. Messages: unwrapMessage ─────────────────────────────────────
console.log('\n━━━ 6. UNWRAP MESSAGE ━━━');
try {
  // plain message
  const r1 = unwrapMessage({ message: { conversation: 'hello' } });
  if (r1.type === 'conversation' && r1.message?.conversation === 'hello') ok('unwrap: plain message');
  else bad('unwrap plain', JSON.stringify(r1));

  // ephemeral
  const r2 = unwrapMessage({ message: { ephemeralMessage: { message: { conversation: 'secret' } } } });
  if (r2.type === 'conversation' && r2.message?.conversation === 'secret') ok('unwrap: ephemeralMessage');
  else bad('unwrap ephemeral', JSON.stringify(r2));

  // viewOnceMessageV2
  const r3 = unwrapMessage({ message: { viewOnceMessageV2: { message: { imageMessage: { url: 'x' } } } } });
  if (r3.type === 'imageMessage') ok('unwrap: viewOnceMessageV2');
  else bad('unwrap viewOnceV2', JSON.stringify(r3));

  // viewOnceMessage
  const r4 = unwrapMessage({ message: { viewOnceMessage: { message: { videoMessage: { url: 'y' } } } } });
  if (r4.type === 'videoMessage') ok('unwrap: viewOnceMessage');
  else bad('unwrap viewOnce', JSON.stringify(r4));

  // null
  const r5 = unwrapMessage({});
  if (r5.type === null) ok('unwrap: empty message');
  else bad('unwrap empty', JSON.stringify(r5));
} catch (e) { bad('unwrapMessage()', e.message); }

// ── 7. Loader: commands still load ─────────────────────────────────
console.log('\n━━━ 7. COMMAND LOADER ━━━');
try {
  const count = loader.register(path.resolve(__dirname, 'src', 'commands'));
  const cats = Object.keys(loader.grouped());
  console.log(`  ${count} commands in ${cats.length} categories`);
  if (count >= 160) ok(`${count} commands loaded`);
  else bad('command count', `expected >=160, got ${count}`);

  // check a few specific commands
  const menu = loader.resolve('menu');
  if (menu && typeof menu.execute === 'function') ok('menu command resolves');
  else bad('menu', 'not found or no execute');

  const ping = loader.resolve('ping');
  if (ping && typeof ping.execute === 'function') ok('ping command resolves');
  else bad('ping', 'not found or no execute');
} catch (e) { bad('loader', e.message); }

// ── 8. Handler: contextual reactions ───────────────────────────────
console.log('\n━━━ 8. CONTEXTUAL REACTIONS ━━━');
try {
  // We can't import handler directly without the full socket setup,
  // so we check the file contains the map
  const fs = require('fs');
  const handlerSrc = fs.readFileSync(path.resolve(__dirname, 'src', 'core', 'handler.js'), 'utf8');
  const expectedCats = ['core', 'fun', 'tools', 'economy', 'editor', 'downloader'];
  let allPresent = true;
  for (const c of expectedCats) {
    if (!handlerSrc.includes(`${c}:`)) {
      bad(`CATEGORY_REACTIONS[${c}]`, 'not found in handler.js');
      allPresent = false;
    }
  }
  if (allPresent) ok('CATEGORY_REACTIONS map has expected categories');
} catch (e) { bad('handler check', e.message); }

// ── 9. Config: thumbnail field ─────────────────────────────────────
console.log('\n━━━ 9. CONFIG ━━━');
try {
  const config = require('./src/config.js');
  if (config.bot.thumbnail) ok(`bot.thumbnail = ${config.bot.thumbnail.slice(0, 40)}...`);
  else ok('bot.thumbnail not set (optional, defaults in messages.js)');
} catch (e) { bad('config', e.message); }

// ── Summary ────────────────────────────────────────────────────────
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  PASS: ${pass}   FAIL: ${fail}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

process.exit(fail > 0 ? 1 : 0);

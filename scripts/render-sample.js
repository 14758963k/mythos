/**
 * Render a sample of Mythos output to the terminal so you can sanity-check
 * the visual style before the bot goes live.
 *
 * Run: node scripts/render-sample.js
 */

const { S, header, section, row, footer } = require('../src/helpers/formatter');
const { infoCard } = require('../src/helpers/interactive');
const config = require('../src/config');

const pad = (n) => String(n).padStart(2, '0');
const d = new Date();
const up = `${d.getUTCHours()}h ${pad(d.getUTCMinutes())}m ${pad(d.getUTCSeconds())}s`;

console.log('');
console.log(infoCard({
  name: 'Mythos',
  tag: config.bot.tag,
  version: config.bot.version,
  prefix: '.',
  owner: '254712345678@s.whatsapp.net',
  uptimeMs: 3600 * 1000 + 60 * 1000 + 12 * 1000,
  totalCommands: 1247,
  totalUsers: 53,
}));

console.log('');
console.log(header('Dice Roll  →  3d20'));
console.log(row('Total', '31'));
console.log(row('Rolls', '2 ◆ 16 ◆ 13'));
console.log(footer('Tap a button below'));

console.log('');
console.log(header('Coin Flip'));
console.log(row('Result', `${S.star} Heads`));
console.log(footer());

console.log('');
console.log(header('Calculator'));
console.log(row('2 * (3 + 4) / 5', '2.8'));
console.log(footer());

console.log('');
console.log(header('World Clock'));
console.log(row('Local', '13:46:57'));
console.log(row('UTC',   '20:46:57'));
console.log(section('Major Cities', [
  row('New York',    '16:46:57'),
  row('Los Angeles', '13:46:57'),
  row('London',      '21:46:57'),
  row('Tokyo',       '05:46:57'),
  row('Nairobi',     '23:46:57'),
].join('\n')));
console.log(footer('Tap a city to refresh'));

console.log('');
console.log(header('Quote of the moment'));
console.log(`  ${S.dot} "The most damaging phrase in the language is: we have always done it this way."`);
console.log(`  ${S.sub} ${S.arr}  Grace Hopper`);
console.log(footer());

console.log('');
console.log(header('Leaderboard  →  Top 5'));
const sample = [
  { name: 'Kimani', n: 1843 },
  { name: 'Stiletto', n: 921 },
  { name: 'Mwangi', n: 612 },
  { name: 'Aiyana', n: 388 },
  { name: 'Onyango', n: 247 },
];
sample.forEach((u, i) => {
  const medal = ['★', '◆', '◇', '◈', '◦'][i];
  console.log(`  ${medal} ${u.name.padEnd(14, ' ')} ${S.arr}  ${u.n}`);
});
console.log(footer());

console.log('');
console.log(header('Reminder Set'));
console.log(`  ${S.sqr} Fires in   ${S.arr}  1h 30m`);
console.log(`  ${S.sqr} At         ${S.arr}  2026-07-12 23:00 UTC`);
console.log(`  ${S.sqr} Message    ${S.arr}  walk the dog`);
console.log(`  ${S.sqr} ID         ${S.arr}  r_1783906205483_421`);
console.log(footer());

console.log('');
console.log(header('Welcome Config'));
console.log(`  ${S.sqr} Status   ${S.arr}  ${S.check} ON`);
console.log(`  ${S.sqr} Mode     ${S.arr}  delete`);
console.log(`  ${S.sqr} Current  ${S.arr}  Welcome @user to Mythos`);
console.log(footer());

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Carousel preview (cards swipeable)');
console.log('  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ...');
console.log('  │  ⟁ Atlas     │ │  ⟁ Group     │ │  ⟁ Forge     │');
console.log('  │  Fifty Names │ │  Welcome     │ │  Calc / QR   │');
console.log('  │  [▸ Open]    │ │  [▸ Group]   │ │  [▸ Calc]    │');
console.log('  └──────────────┘ └──────────────┘ └──────────────┘');
console.log('  5 cards total. Swipe horizontally in WhatsApp.');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

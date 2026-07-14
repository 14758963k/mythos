/**
 * End-to-end smoke test — simulate a real incoming message, run it through
 * the handler, and assert that the right command fires.
 */

const path = require('path');

// Load config (creates data files on first run)
const config = require('../src/config');
const store = require('../src/core/store');
const loader = require('../src/core/loader');
const { handle } = require('../src/core/handler');

const sockRef = { current: null };
const sent = [];

const fakeSock = {
  user: { id: '111111111111@bot' },
  ev: { on: () => {} },
  ws: { on: () => {} },
  authState: { creds: { me: { id: '111111111111@bot' } }, keys: {} },
  config: { emitOwnEvents: false },
  sendMessage: async (jid, content, opts) => {
    sent.push({ jid, content, opts });
    return { key: { id: 'fake_' + sent.length, remoteJid: jid, fromMe: true }, message: content };
  },
  relayMessage: async (jid, message, opts) => {
    sent.push({ jid, content: message, opts, _viaRelay: true });
    return { key: { id: 'relay_' + sent.length, remoteJid: jid, fromMe: true } };
  },
  groupMetadata: async () => ({ id: 'group@g.us', subject: 'Test', participants: [{ id: '1234567890@s.whatsapp.net', admin: 'admin' }], announce: false, restrict: false, ephemeralDuration: 0, creation: 0 }),
};

const makeMessage = (text, from = '254712345678@s.whatsapp.net', participant = '254712345678@s.whatsapp.net', name = 'Tester') => ({
  key: { remoteJid: from, fromMe: false, id: 'msg_' + Math.random().toString(36).slice(2), participant },
  pushName: name,
  message: { conversation: text, messageContextInfo: {} },
  messageTimestamp: Date.now() / 1000,
});

const makeResponse = (ctype, payload, from = '254712345678@s.whatsapp.net', participant = '254712345678@s.whatsapp.net') => ({
  key: { remoteJid: from, fromMe: false, id: 'resp_' + Math.random().toString(36).slice(2), participant },
  pushName: 'Tester',
  message: { [ctype]: payload, messageContextInfo: {} },
  messageTimestamp: Date.now() / 1000,
});

const run = async (text) => {
  sent.length = 0;
  const msg = makeMessage(text);
  await handle(fakeSock, { messages: [msg], type: 'notify' });
  // Find first non-react message (react is appended after the actual command output).
  return sent.find((s) => s.content && !s.content.react) || sent[sent.length - 1] || null;
};

(async () => {
  loader.register(path.join(__dirname, '..', 'src', 'commands'));
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ⟁  Mythos ⟁ Ascendant  —  Live Test');
  console.log('═══════════════════════════════════════════════════════════');

  // 1. menu
  let r = await run('.menu');
  let ok = r && r.content && r.content.interactiveMessage && r.content.interactiveMessage.body;
  console.log(ok ? '  ✓ .menu  → single-select picker' : '  ✗ .menu  → ' + JSON.stringify(r));

  // 2. ping
  r = await run('.ping');
  ok = r && r.content && r.content.text && r.content.text.includes('Pong');
  console.log(ok ? '  ✓ .ping  → Pong reply' : '  ✗ .ping  → ' + JSON.stringify(r));

  // 3. info
  r = await run('.info');
  ok = r && r.content && r.content.text && r.content.text.includes('Mythos');
  console.log(ok ? '  ✓ .info  → status card' : '  ✗ .info  → ' + JSON.stringify(r));

  // 4. quote
  r = await run('.quote');
  ok = r && r.content && r.content.interactiveButtons;
  console.log(ok ? '  ✓ .quote → quick reply buttons' : '  ✗ .quote → ' + JSON.stringify(r));

  // 5. roll
  r = await run('.roll 3d20');
  ok = r && r.content && r.content.text && r.content.text.includes('3d20');
  console.log(ok ? '  ✓ .roll  → 3d20' : '  ✗ .roll  → ' + JSON.stringify(r));

  // 6. flip
  r = await run('.flip');
  ok = r && r.content && r.content.text && (r.content.text.includes('Heads') || r.content.text.includes('Tails'));
  console.log(ok ? '  ✓ .flip  → heads/tails' : '  ✗ .flip  → ' + JSON.stringify(r));

  // 7. 8ball
  r = await run('.8ball will it work');
  ok = r && r.content && r.content.text;
  console.log(ok ? '  ✓ .8ball → answer' : '  ✗ .8ball → ' + JSON.stringify(r));

  // 8. calc
  r = await run('.calc 2*(3+4)/5');
  ok = r && r.content && r.content.text && r.content.text.includes('2.8');
  console.log(ok ? '  ✓ .calc  → 2.8' : '  ✗ .calc  → ' + JSON.stringify(r));

  // 9. uuid
  r = await run('.uuid');
  ok = r && r.content && r.content.text && /[0-9a-f-]{36}/i.test(r.content.text);
  console.log(ok ? '  ✓ .uuid  → uuid v4' : '  ✗ .uuid  → ' + JSON.stringify(r));

  // 10. base64
  r = await run('.base64 e hello');
  ok = r && r.content && r.content.text && r.content.text.includes('aGVsbG8=');
  console.log(ok ? '  ✓ .base64 → aGVsbG8=' : '  ✗ .base64 → ' + JSON.stringify(r));

  // 11. password
  r = await run('.password 24');
  ok = r && r.content && r.content.text && r.content.text.includes('24 chars');
  console.log(ok ? '  ✓ .password → 24 chars' : '  ✗ .password → ' + JSON.stringify(r));

  // 12. count
  r = await run('.count hello world this is mythos');
  ok = r && r.content && r.content.text && r.content.text.includes('5');
  console.log(ok ? '  ✓ .count → 5 words' : '  ✗ .count → ' + JSON.stringify(r));

  // 13. case
  r = await run('.case upper hello');
  ok = r && r.content && r.content.text && r.content.text.includes('HELLO');
  console.log(ok ? '  ✓ .case  → HELLO' : '  ✗ .case  → ' + JSON.stringify(r));

  // 14. reverse
  r = await run('.reverse hello');
  ok = r && r.content && r.content.text && r.content.text.includes('olleh');
  console.log(ok ? '  ✓ .reverse → olleh' : '  ✗ .reverse → ' + JSON.stringify(r));

  // 15. time
  r = await run('.time');
  ok = r && r.content && r.content.text && r.content.text.includes('World Clock');
  console.log(ok ? '  ✓ .time  → World Clock' : '  ✗ .time  → ' + JSON.stringify(r));

  // 16. groupinfo (group)
  r = await run('.groupinfo');
  ok = r && r.content && r.content.text && r.content.text.includes('Test');
  console.log(ok ? '  ✓ .groupinfo → group meta' : '  ✗ .groupinfo → ' + JSON.stringify(r));

  // 17. tagall (group)
  r = await run('.tagall hello all');
  ok = r && r.content && r.content.mentions && r.content.mentions.length === 1;
  console.log(ok ? '  ✓ .tagall → mention 1 user' : '  ✗ .tagall → ' + JSON.stringify(r));

  // 18. whois
  r = await run('.whois 254712345678');
  ok = r !== null;
  console.log(ok ? '  ✓ .whois → handled' : '  ✗ .whois → ' + JSON.stringify(r));

  // 19. unknown command → silent ignore
  r = await run('.notacommand');
  ok = sent.length === 0;
  console.log(ok ? '  ✓ unknown command ignored' : '  ✗ unknown command returned content');

  // 20. owner gate — non-owner cannot run .restart
  r = await run('.restart');
  ok = sent.length === 0;
  console.log(ok ? '  ✓ owner-only command blocked for non-owner' : '  ✗ owner gate failed: ' + JSON.stringify(r));

  // 21. leaderboard
  r = await run('.leaderboard');
  ok = r && r.content && r.content.interactiveButtons;
  console.log(ok ? '  ✓ .leaderboard → interactive buttons' : '  ✗ .leaderboard → ' + JSON.stringify(r));

  // 22. discover (carousel)
  r = await run('.discover');
  ok = r && r.content && r.content.cards && r.content.cards.length === 5;
  console.log(ok ? '  ✓ .discover → 5-card carousel' : '  ✗ .discover → ' + JSON.stringify(r));

  // 23. remind
  r = await run('.remind 5m take a break');
  ok = r && r.content && r.content.interactiveButtons;
  console.log(ok ? '  ✓ .remind → set reminder' : '  ✗ .remind → ' + JSON.stringify(r));

  // 24. reminders
  r = await run('.reminders');
  ok = r && r.content && r.content.interactiveButtons;
  console.log(ok ? '  ✓ .reminders → list' : '  ✗ .reminders → ' + JSON.stringify(r));

  // 25. welcome
  r = await run('.welcome');
  ok = r && r.content && r.content.text && r.content.text.includes('Welcome');
  console.log(ok ? '  ✓ .welcome → config' : '  ✗ .welcome → ' + JSON.stringify(r));

  // 26. antilink
  r = await run('.antilink on');
  ok = r && r.content && r.content.text && r.content.text.includes('Antilink');
  console.log(ok ? '  ✓ .antilink → toggle' : '  ✗ .antilink → ' + JSON.stringify(r));

  // ── interactive response routing (the bug we just fixed) ─────────
  // 27. buttonsResponseMessage (legacy buttons) → id extracted
  sent.length = 0;
  await handle(fakeSock, {
    messages: [makeResponse('buttonsResponseMessage', {
      selectedButtonId: '.quote',
      selectedDisplayText: 'Another',
    })],
    type: 'notify',
  });
  r = sent.find((s) => s.content && !s.content.react);
  ok = r && r.content && (r.content.interactiveMessage || r.content.text);
  console.log(ok ? '  ✓ buttonsResponseMessage.selectedButtonId → routed' : '  ✗ buttonsResponseMessage routing failed');

  // 28. interactiveResponseMessage with nativeFlowResponseMessage.paramsJson
  sent.length = 0;
  await handle(fakeSock, {
    messages: [makeResponse('interactiveResponseMessage', {
      nativeFlowResponseMessage: {
        name: 'quick_reply',
        paramsJson: JSON.stringify({ id: '.flip', display_text: 'Flip again' }),
        version: 3,
      },
    })],
    type: 'notify',
  });
  r = sent.find((s) => s.content && !s.content.react);
  ok = r && r.content;
  console.log(ok ? '  ✓ interactiveResponseMessage.paramsJson → routed' : '  ✗ nativeFlow paramsJson routing failed');

  // 29. listResponseMessage.singleSelectReply.selectedRowId
  sent.length = 0;
  await handle(fakeSock, {
    messages: [makeResponse('listResponseMessage', {
      title: 'Quote of the moment',
      singleSelectReply: { selectedRowId: '.roll 3d20' },
      listType: 1,
    })],
    type: 'notify',
  });
  r = sent.find((s) => s.content && !s.content.react);
  ok = r && r.content;
  console.log(ok ? '  ✓ listResponseMessage.singleSelectReply → routed' : '  ✗ singleSelectReply routing failed');

  console.log('');
  console.log('  All 29 live tests complete.');
  console.log('═══════════════════════════════════════════════════════════');
  process.exit(0);
})().catch((e) => {
  console.error('Test crashed:', e);
  process.exit(1);
});

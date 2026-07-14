/**
 * Mythos ⟁ Ascendant — boot entry.
 * Wires the client, the handler, and the auto-loader.
 *
 * IMPORTANT: the `messages.upsert` listener is registered INSIDE the
 * `startSock` factory's `connection.update` callback so that every
 * reconnected socket gets it. Previously it was registered once on the
 * first socket, and any reconnect (logged out, dropped, kicked by
 * phone-side unlink, etc.) would leave the bot silent.
 */

const path = require('path');

const config = require('./config');
const log = require('./core/logger');
const { startSock } = require('./core/client');
const { handle } = require('./core/handler');
const loader = require('./core/loader');
const store = require('./core/store');

const main = async () => {
  log.banner();

  // mark started
  store.update('bot', (b) => {
    if (!b.startedAt) b.startedAt = Date.now();
    b.name = config.bot.name;
  });

  // load commands
  const count = loader.register(path.join(__dirname, 'commands'));
  log.ok(`loaded ${count} commands across ${new Set(loader.all().map((c) => c.category)).size} categories`);

  // boot client — handlers are attached inside startSock, including on reconnect
  const sockRef = { current: null };
  await startSock(sockRef);
  log.ok('Mythos is up. Type a command in WhatsApp to test.');
};

main().catch((e) => {
  log.err('fatal', { error: e.message, stack: e.stack });
  process.exit(1);
});

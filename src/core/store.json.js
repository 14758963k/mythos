/**
 * Mythos ⟁ Ascendant — JSON-backed data store.
 * Three small files, no external DB needed for the first edition.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const FILES = {
  bot: path.join(dataDir, 'bot.json'),
  users: path.join(dataDir, 'users.json'),
  groups: path.join(dataDir, 'groups.json'),
  reminders: path.join(dataDir, 'reminders.json'),
};

const DEFAULTS = {
  bot: {
    name: 'Mythos',
    prefix: '.',
    startedAt: null,
    totalCommands: 0,
    blocked: [],
  },
  users: {},
  groups: {},
  reminders: {},
};

const cache = {};
let writing = false;
let pending = false;

const fileFor = (key) => FILES[key] || path.join(dataDir, `${key}.json`);
const defaultFor = (key) => (DEFAULTS[key] !== undefined ? DEFAULTS[key] : {});

const ensureFile = (key) => {
  if (cache[key] !== undefined) return;
  const file = fileFor(key);
  if (!fs.existsSync(file)) {
    const def = defaultFor(key);
    fs.writeFileSync(file, JSON.stringify(def, null, 2));
    cache[key] = JSON.parse(JSON.stringify(def));
    return;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    cache[key] = JSON.parse(raw);
  } catch (e) {
    cache[key] = JSON.parse(JSON.stringify(defaultFor(key)));
  }
};

const flush = () => {
  if (writing) {
    pending = true;
    return;
  }
  writing = true;
  setImmediate(() => {
    Object.keys(cache).forEach((k) => {
      try {
        fs.writeFileSync(fileFor(k), JSON.stringify(cache[k], null, 2));
      } catch (e) {
        console.error('[store] failed to write', k, e.message);
      }
    });
    writing = false;
    if (pending) {
      pending = false;
      flush();
    }
  });
};

const get = (key) => {
  ensureFile(key);
  return cache[key];
};

const set = (key, value) => {
  ensureFile(key);
  cache[key] = value;
  flush();
};

const update = (key, mutator) => {
  ensureFile(key);
  mutator(cache[key]);
  flush();
};

module.exports = { get, set, update };

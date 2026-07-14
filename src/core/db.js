/**
 * Mythos ⟁ Ascendant — SQLite-backed store (opt-in via STORE_BACKEND=sqlite).
 * Drop-in replacement for the JSON store; same {get, set, update} surface.
 *
 * On first start, if the JSON files exist and the SQLite DB is empty, we
 * migrate the data over so nothing is lost.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  throw new Error('better-sqlite3 is not installed. Run: npm install better-sqlite3');
}

const dataDir = config.data;
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'mythos.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS kv (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

const getStmt = db.prepare('SELECT value FROM kv WHERE key = ?');
const setStmt = db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
const allStmt = db.prepare('SELECT key, value FROM kv');

const readVal = (key) => {
  const row = getStmt.get(key);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
};

const writeVal = (key, value) => {
  setStmt.run(key, JSON.stringify(value));
};

const cache = {};
let hydrated = false;

const hydrate = () => {
  if (hydrated) return;
  for (const row of allStmt.all()) {
    try {
      cache[row.key] = JSON.parse(row.value);
    } catch {}
  }
  hydrated = true;
};

const get = (key) => {
  hydrate();
  if (cache[key] !== undefined) return cache[key];
  // try DB directly in case cache was just cleared
  const v = readVal(key);
  if (v !== null) {
    cache[key] = v;
    return v;
  }
  return null;
};

const set = (key, value) => {
  hydrate();
  cache[key] = value;
  writeVal(key, value);
};

const update = (key, mutator) => {
  hydrate();
  const current = cache[key] || {};
  mutator(current);
  cache[key] = current;
  writeVal(key, current);
};

// ── migration: JSON → SQLite ────────────────────────────────────────
const migrateFromJson = () => {
  const jsonFiles = {
    bot: path.join(dataDir, 'bot.json'),
    users: path.join(dataDir, 'users.json'),
    groups: path.join(dataDir, 'groups.json'),
    reminders: path.join(dataDir, 'reminders.json'),
  };
  hydrate();
  for (const [key, p] of Object.entries(jsonFiles)) {
    if (cache[key] !== undefined) continue; // already in DB
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      const parsed = JSON.parse(raw);
      cache[key] = parsed;
      writeVal(key, parsed);
      // leave the JSON in place as a backup
    } catch (e) {
      // ignore corrupt json
    }
  }
};

migrateFromJson();

const close = () => db.close();

module.exports = { get, set, update, close, _path: dbPath };

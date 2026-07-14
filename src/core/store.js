/**
 * Mythos ⟁ Ascendant — data store.
 * Defaults to JSON; switches to SQLite when STORE_BACKEND=sqlite.
 * Same {get, set, update} surface in both modes.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const backend = (process.env.STORE_BACKEND || 'json').toLowerCase();

let impl;
if (backend === 'sqlite') {
  impl = require('./db');
} else {
  impl = require('./store.json');
}

module.exports = impl;


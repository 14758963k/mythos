/**
 * Mythos ⟁ Ascendant — global configuration.
 * Reads from .env and exposes a single frozen config object.
 */

require('dotenv').config();

const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const required = (name) => {
  const v = process.env[name];
  if (!v || v.trim() === '') return null;
  return v;
};

const config = Object.freeze({
  root: ROOT,
  src: path.join(ROOT, 'src'),
  data: path.join(ROOT, 'src', 'data'),
  research: path.join(ROOT, 'research'),

  bot: {
    name: process.env.BOT_NAME || 'Mythos',
    tag: 'Mythos ⟁ Ascendant',
    subtitle: 'Fifty Names from the First Error',
    version: '1.0.0.0',
    prefix: (process.env.PREFIX || '.').trim().charAt(0) || '.',
    thumbnail: process.env.BOT_THUMBNAIL || 'https://files.catbox.moe/k3j8m1.jpg',
  },

  owner: {
    number: process.env.PAIRING_NUMBER || null,
    jids: (process.env.OWNER_JIDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  auth: {
    path: path.join(ROOT, process.env.AUTH_DIR || 'auth_info'),
    pairing: !!process.env.PAIRING_NUMBER,
    printQR: (process.env.PRINT_QR ?? 'true').toLowerCase() !== 'false',
  },

  logLevel: process.env.LOG_LEVEL || 'silent',

  features: {
    readStatus: (process.env.READ_STATUS || 'false').toLowerCase() === 'true',
    autoReact: (process.env.AUTO_REACT || 'false').toLowerCase() === 'true',
    autoBio: (process.env.AUTO_BIO || 'false').toLowerCase() === 'true',
    antiDelete: (process.env.ANTI_DELETE || 'false').toLowerCase() === 'true',
    chatbot: (process.env.CHATBOT || 'false').toLowerCase() === 'true',
  },
});

module.exports = config;

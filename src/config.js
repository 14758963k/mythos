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
    antiSpam: (process.env.ANTI_SPAM || 'false').toLowerCase() === 'true',
    antiBadword: (process.env.ANTI_BADWORD || 'false').toLowerCase() === 'true',
    autoStatusView: (process.env.AUTO_STATUS_VIEW || 'false').toLowerCase() === 'true',
  },

  ai: {
    defaultProvider: process.env.AI_PROVIDER || 'mistral',
    providers: {
      mistral: {
        apiKey: process.env.MISTRAL_API_KEY || '',
        model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
        url: 'https://api.mistral.ai/v1/chat/completions',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        url: 'https://api.openai.com/v1/chat/completions',
      },
      gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        url: 'https://generativelanguage.googleapis.com/v1beta/models',
      },
      deepseek: {
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        url: 'https://api.deepseek.com/v1/chat/completions',
      },
      claude: {
        apiKey: process.env.CLAUDE_API_KEY || '',
        model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        url: 'https://api.anthropic.com/v1/messages',
      },
    },
  },
});

module.exports = config;

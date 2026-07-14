/**
 * Mythos ⟁ Ascendant — Mistral AI chatbot helper.
 * Handles conversational replies via Mistral API with persistent memory.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MEMORY_FILE = path.join(__dirname, '..', 'data', 'chatbot-memory.json');
const MAX_HISTORY = 15;

let conversations = {};

// Load persistent memory on startup
try {
  if (fs.existsSync(MEMORY_FILE)) {
    conversations = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  }
} catch {}

const saveMemory = () => {
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(conversations, null, 2));
  } catch {}
};

const getHistory = (userId) => {
  if (!conversations[userId]) conversations[userId] = [];
  return conversations[userId];
};

const addToHistory = (userId, role, content) => {
  const history = getHistory(userId);
  history.push({ role, content, ts: Date.now() });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  saveMemory();
};

const clearHistory = (userId) => {
  delete conversations[userId];
  saveMemory();
};

const clearAllHistory = () => {
  conversations = {};
  saveMemory();
};

const chat = async (userId, message, opts = {}) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set in .env');

  const model = process.env.CHATBOT_MODEL || 'mistral-small-latest';
  const systemPrompt = opts.systemPrompt || process.env.CHATBOT_SYSTEM || 'You are a helpful assistant. Reply concisely. Do not use emojis.';

  addToHistory(userId, 'user', message);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...getHistory(userId).map(({ role, content }) => ({ role, content })),
  ];

  try {
    const res = await axios.post(MISTRAL_API_URL, {
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    const reply = res.data?.choices?.[0]?.message?.content || 'No response from AI.';
    addToHistory(userId, 'assistant', reply);
    return reply;
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.message || err.message;
    throw new Error(`Mistral API error (${status || 'network'}): ${detail}`);
  }
};

module.exports = { chat, clearHistory, clearAllHistory, getHistory };

/**
 * Mythos ⟁ Ascendant — multi-provider AI helper.
 * Supports Mistral, OpenAI, Gemini, DeepSeek, Claude.
 * Used by both the chatbot (auto-reply) and explicit .ai/.gpt/.gemini commands.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const MEMORY_FILE = path.join(__dirname, '..', 'data', 'chatbot-memory.json');
const MAX_HISTORY = 20;

let conversations = {};

// Load persistent memory on startup
try {
  if (fs.existsSync(MEMORY_FILE)) {
    conversations = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  }
} catch {}

let saveTimer = null;
const scheduleSave = () => {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      const dir = path.dirname(MEMORY_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(conversations, null, 2));
    } catch {}
  }, 1000);
};

const getHistory = (userId) => {
  if (!conversations[userId]) conversations[userId] = [];
  return conversations[userId];
};

const addToHistory = (userId, role, content) => {
  const history = getHistory(userId);
  history.push({ role, content, ts: Date.now() });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  scheduleSave();
};

const clearHistory = (userId) => {
  delete conversations[userId];
  scheduleSave();
};

const clearAllHistory = () => {
  conversations = {};
  scheduleSave();
};

const getHistoryForProvider = (userId, provider) => {
  const history = getHistory(userId);
  if (provider === 'claude') {
    // Claude uses 'user'/'assistant' format, no system in messages array
    return history.map(({ role, content }) => ({ role, content }));
  }
  return history.map(({ role, content }) => ({ role, content }));
};

// ── Provider-specific request handlers ──────────────────────────────────

const callMistral = async (messages, providerConfig, systemPrompt) => {
  const res = await axios.post(providerConfig.url, {
    model: providerConfig.model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 2048,
    temperature: 0.7,
  }, {
    headers: { 'Authorization': `Bearer ${providerConfig.apiKey}`, 'Content-Type': 'application/json' },
    timeout: 60000,
  });
  return res.data?.choices?.[0]?.message?.content || 'No response from AI.';
};

const callOpenAI = async (messages, providerConfig, systemPrompt) => {
  const res = await axios.post(providerConfig.url, {
    model: providerConfig.model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 2048,
    temperature: 0.7,
  }, {
    headers: { 'Authorization': `Bearer ${providerConfig.apiKey}`, 'Content-Type': 'application/json' },
    timeout: 60000,
  });
  return res.data?.choices?.[0]?.message?.content || 'No response from AI.';
};

const callDeepSeek = async (messages, providerConfig, systemPrompt) => {
  const res = await axios.post(providerConfig.url, {
    model: providerConfig.model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 2048,
    temperature: 0.7,
  }, {
    headers: { 'Authorization': `Bearer ${providerConfig.apiKey}`, 'Content-Type': 'application/json' },
    timeout: 60000,
  });
  return res.data?.choices?.[0]?.message?.content || 'No response from AI.';
};

const callGemini = async (messages, providerConfig, systemPrompt) => {
  const url = `${providerConfig.url}/${providerConfig.model}:generateContent?key=${providerConfig.apiKey}`;
  const contents = [];
  // Gemini doesn't have system role in the same way; prepend to first user message
  let systemInjected = false;
  for (const m of messages) {
    if (m.role === 'user' && !systemInjected) {
      contents.push({ role: 'user', parts: [{ text: `${systemPrompt}\n\n${m.content}` }] });
      systemInjected = true;
    } else {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      });
    }
  }
  const res = await axios.post(url, { contents }, { timeout: 60000 });
  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
};

const callClaude = async (messages, providerConfig, systemPrompt) => {
  const res = await axios.post(providerConfig.url, {
    model: providerConfig.model,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  }, {
    headers: {
      'x-api-key': providerConfig.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });
  return res.data?.content?.[0]?.text || 'No response from AI.';
};

const PROVIDERS = {
  mistral: callMistral,
  openai: callOpenAI,
  gemini: callGemini,
  deepseek: callDeepSeek,
  claude: callClaude,
};

// ── Main chat function ──────────────────────────────────────────────────

const chat = async (userId, message, opts = {}) => {
  const providerName = opts.provider || config.ai.defaultProvider || 'mistral';
  const providerConfig = config.ai.providers[providerName];
  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error(`AI provider "${providerName}" is not configured. Set the API key in .env`);
  }

  const handler = PROVIDERS[providerName];
  if (!handler) throw new Error(`Unknown AI provider: ${providerName}`);

  const systemPrompt = opts.systemPrompt || process.env.CHATBOT_SYSTEM || 'You are Mythos, GOATED-404 Labs assistant built by Stiletto (Kimani). Reply concisely. Do not use emojis.';

  addToHistory(userId, 'user', message);
  const history = getHistoryForProvider(userId, providerName);

  try {
    const reply = await handler(history, providerConfig, systemPrompt);
    addToHistory(userId, 'assistant', reply);
    return reply;
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.message || err.response?.data?.error?.message || err.message;
    throw new Error(`${providerName} API error (${status || 'network'}): ${detail}`);
  }
};

// ── Quick single-shot (no memory) ──────────────────────────────────────

const ask = async (message, providerName, systemPrompt) => {
  const prov = providerName || config.ai.defaultProvider || 'mistral';
  const providerConfig = config.ai.providers[prov];
  if (!providerConfig || !providerConfig.apiKey) {
    throw new Error(`AI provider "${prov}" is not configured.`);
  }
  const handler = PROVIDERS[prov];
  if (!handler) throw new Error(`Unknown AI provider: ${prov}`);
  const sys = systemPrompt || 'You are a helpful assistant. Reply concisely. Do not use emojis.';
  return await handler([{ role: 'user', content: message }], providerConfig, sys);
};

// ── Get available providers ─────────────────────────────────────────────

const availableProviders = () => {
  return Object.entries(config.ai.providers)
    .filter(([, cfg]) => cfg.apiKey)
    .map(([name, cfg]) => ({ name, model: cfg.model }));
};

module.exports = {
  chat,
  ask,
  clearHistory,
  clearAllHistory,
  getHistory,
  availableProviders,
  PROVIDERS,
};

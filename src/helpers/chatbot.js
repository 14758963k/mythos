/**
 * Mythos ⟁ Ascendant — chatbot helper (backwards compatible).
 * Delegates to src/helpers/ai.js for multi-provider support.
 */

const ai = require('./ai');

const chat = async (userId, message, opts = {}) => {
  return ai.chat(userId, message, opts);
};

const clearHistory = (userId) => ai.clearHistory(userId);
const clearAllHistory = () => ai.clearAllHistory();
const getHistory = (userId) => ai.getHistory(userId);

module.exports = { chat, clearHistory, clearAllHistory, getHistory };

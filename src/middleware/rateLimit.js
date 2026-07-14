/**
 * Mythos ⟁ Ascendant — per-user rate limiter.
 * 20 messages per 10 seconds per chat/user. Cheap, in-memory.
 */

const buckets = new Map();
const WINDOW = 10_000;
const MAX = 20;

const allow = (chat, user) => {
  const k = `${chat}::${user}`;
  const now = Date.now();
  const arr = buckets.get(k) || [];
  const fresh = arr.filter((t) => now - t < WINDOW);
  if (fresh.length >= MAX) {
    buckets.set(k, fresh);
    return false;
  }
  fresh.push(now);
  buckets.set(k, fresh);
  return true;
};

const reset = (chat, user) => buckets.delete(`${chat}::${user}`);

module.exports = { allow, reset };

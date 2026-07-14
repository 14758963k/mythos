/**
 * Economy helper — manage user coins, banks, and capacity.
 */

const store = require('../core/store');

const DEFAULT_WALLET = 0;
const DEFAULT_BANK = 0;
const DEFAULT_CAPACITY = 1000;
const BANK_CAPACITY_PER_LEVEL = 500;

const getEconomy = (userId) => {
  const eco = store.get('economy') || {};
  if (!eco[userId]) {
    eco[userId] = { wallet: DEFAULT_WALLET, bank: DEFAULT_BANK, capacity: DEFAULT_CAPACITY, level: 1 };
    store.set('economy', eco);
  }
  return eco[userId];
};

const saveEconomy = (userId, data) => {
  const eco = store.get('economy') || {};
  eco[userId] = data;
  store.set('economy', eco);
};

const addCoins = (userId, amount) => {
  const eco = getEconomy(userId);
  eco.wallet += amount;
  saveEconomy(userId, eco);
  return eco;
};

const removeCoins = (userId, amount) => {
  const eco = getEconomy(userId);
  if (eco.wallet < amount) return null;
  eco.wallet -= amount;
  saveEconomy(userId, eco);
  return eco;
};

const depositCoins = (userId, amount) => {
  const eco = getEconomy(userId);
  if (eco.wallet < amount) return null;
  if (eco.bank + amount > eco.capacity) return null;
  eco.wallet -= amount;
  eco.bank += amount;
  saveEconomy(userId, eco);
  return eco;
};

const withdrawCoins = (userId, amount) => {
  const eco = getEconomy(userId);
  if (eco.bank < amount) return null;
  eco.bank -= amount;
  eco.wallet += amount;
  saveEconomy(userId, eco);
  return eco;
};

module.exports = { getEconomy, saveEconomy, addCoins, removeCoins, depositCoins, withdrawCoins, DEFAULT_CAPACITY };

/**
 * Mythos ⟁ Ascendant — automatic command loader.
 * Scans src/commands recursively and registers every exported command.
 */

const fs = require('fs');
const path = require('path');

const commands = new Map();
const aliases = new Map();
const byCategory = new Map();

const load = (dir) => {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...load(full));
      continue;
    }
    if (!item.endsWith('.js')) continue;
    try {
      const mod = require(full);
      const list = Array.isArray(mod) ? mod : [mod];
      for (const cmd of list) {
        if (cmd && cmd.name && typeof cmd.execute === 'function') {
          out.push({ ...cmd, _path: full });
        }
      }
    } catch (e) {
      console.error('[loader] failed to load', full, e.message);
    }
  }
  return out;
};

const register = (dir) => {
  const list = load(dir);
  commands.clear();
  aliases.clear();
  byCategory.clear();
  for (const cmd of list) {
    commands.set(cmd.name.toLowerCase(), cmd);
    if (Array.isArray(cmd.aliases)) {
      for (const a of cmd.aliases) {
        aliases.set(a.toLowerCase(), cmd.name.toLowerCase());
      }
    }
    const cat = cmd.category || 'core';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(cmd);
  }
  return list.length;
};

const resolve = (name) => {
  const k = name.toLowerCase();
  if (commands.has(k)) return commands.get(k);
  if (aliases.has(k)) return commands.get(aliases.get(k));
  return null;
};

const all = () => Array.from(commands.values());

const grouped = () => {
  const out = {};
  for (const [cat, cmds] of byCategory.entries()) {
    out[cat] = cmds
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ name: c.name, description: c.description }));
  }
  return out;
};

module.exports = { register, resolve, all, grouped };

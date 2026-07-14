/**
 * Mythos ⟁ Ascendant — clean console logger.
 * Uses stdout for the bot, so the Baileys pino logs can stay separated.
 * Optionally mirrors every line to a log file (with size-based rotation).
 */

const fs = require('fs');
const path = require('path');

const stamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
  );
};

const tag = (s) => `\x1b[36m${s}\x1b[0m`;
const dim = (s) => `\x1b[90m${s}\x1b[0m`;
const good = (s) => `\x1b[32m${s}\x1b[0m`;
const warn = (s) => `\x1b[33m${s}\x1b[0m`;
const bad = (s) => `\x1b[31m${s}\x1b[0m`;
const mark = (s) => `\x1b[35m${s}\x1b[0m`;
const strip = (s) => (typeof s === 'string' ? s.replace(/\x1b\[[0-9;]*m/g, '') : s);

const LOG_FILE = (() => {
  const env = process.env.LOG_FILE;
  if (env === '') return null; // explicitly disabled
  if (env) return env;
  return path.join(__dirname, '..', 'data', 'mythos.log');
})();

const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB
let writingFile = false;
let pendingFile = null;

const ensureDir = (p) => {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const writeToFile = (line) => {
  if (!LOG_FILE) return;
  if (writingFile) {
    pendingFile = line;
    return;
  }
  writingFile = true;
  setImmediate(() => {
    try {
      ensureDir(LOG_FILE);
      if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE) {
        // rotate: mythos.log → mythos.log.1
        const rotated = LOG_FILE + '.1';
        if (fs.existsSync(rotated)) fs.unlinkSync(rotated);
        fs.renameSync(LOG_FILE, rotated);
      }
      fs.appendFileSync(LOG_FILE, line + '\n');
    } catch (e) {
      // swallow file errors so logging never crashes the bot
    }
    writingFile = false;
    if (pendingFile) {
      const next = pendingFile;
      pendingFile = null;
      writeToFile(next);
    }
  });
};

const write = (level, msg, meta) => {
  const m = meta ? ' ' + JSON.stringify(meta) : '';
  const line = `${stamp()} ${level}  ${msg}${m}`;
  writeToFile(line);
};

const log = {
  banner: () => {
    const lines = [
      '',
      '   ⟁  Mythos  ⟁  Ascendant',
      '   ' + '─'.repeat(34),
      '   Fifty Names from the First Error',
      '   ' + stamp(),
      '',
    ];
    console.log(lines.map((l) => (l ? mark(l) : '')).join('\n'));
  },

  info: (msg, meta) => {
    const m = meta ? ' ' + dim(JSON.stringify(meta)) : '';
    console.log(`${dim(stamp())} ${tag('info')}  ${msg}${m}`);
    write('info', msg, meta);
  },

  ok: (msg, meta) => {
    const m = meta ? ' ' + dim(JSON.stringify(meta)) : '';
    console.log(`${dim(stamp())} ${good('ok  ')}  ${msg}${m}`);
    write('ok  ', msg, meta);
  },

  warn: (msg, meta) => {
    const m = meta ? ' ' + dim(JSON.stringify(meta)) : '';
    console.log(`${dim(stamp())} ${warn('warn')}  ${msg}${m}`);
    write('warn', msg, meta);
  },

  err: (msg, meta) => {
    const m = meta ? ' ' + dim(JSON.stringify(meta)) : '';
    console.log(`${dim(stamp())} ${bad('err ')}  ${msg}${m}`);
    write('err ', msg, meta);
  },

  evt: (msg, meta) => {
    const m = meta ? ' ' + dim(JSON.stringify(meta)) : '';
    console.log(`${dim(stamp())} ${mark('evt ')}  ${msg}${m}`);
    write('evt ', msg, meta);
  },

  cmd: (msg, meta) => {
    const m = meta ? ' ' + dim(JSON.stringify(meta)) : '';
    console.log(`${dim(stamp())} ${tag('cmd ')}  ${msg}${m}`);
    write('cmd ', msg, meta);
  },

  file: LOG_FILE,
};

module.exports = log;

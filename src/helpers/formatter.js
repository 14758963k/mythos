/**
 * Mythos ⟁ Ascendant — symbol-rich text formatter.
 * Centralizes every visual element so the bot feels coherent.
 *
 * We avoid plain ASCII (looks cheap on WhatsApp) and use Unicode symbols
 * that render well across Android, iOS and desktop WhatsApp clients.
 */

const S = {
  // brand
  brand: '⟁',
  brandWord: 'Mythos',
  brandLine: '⟁ Mythos ⟁ Ascendant',
  brandSub: 'Fifty Names from the First Error',

  // structural
  bar: '▰▰▰▰▰',
  thinBar: '▱▱▱▱▱',
  heavyBar: '━━━━━',
  ultraBar: '▰▰▰▰▰▰▰▰▰▰',
  divider: '─ ─ ─ ─ ─ ─ ─',
  thinDivider: '───────────',
  corner: '⟁',

  // status / verdict
  check: '✓',
  cross: '✗',
  ok: '✦',
  warn: '◇',
  err: '✗',
  info: '◈',
  dot: '◆',
  bullet: '◦',
  tri: '▸',
  sqr: '▪',

  // arrows
  arr: '→',
  arrL: '←',
  arrU: '↑',
  arrD: '↓',
  arrNE: '↗',
  arrNW: '↖',
  arrSE: '↘',
  arrSW: '↙',
  sub: '↳',
  ret: '↪',
  dblArr: '⇒',
  dblArrL: '⇐',
  swap: '⇄',
  loop: '↺',
  spin: '↻',
  play: '▶',
  rev: '◀',
  star: '★',
  outStar: '☆',
  sparkle: '❉',
  flower: '❀',
  heart: '♡',
  filledHeart: '❤',
  diamond: '◆',
  smallDia: '◇',
  hex: '⬢',
  shield: '⛨',

  // currency
  bit: '₿',
  eth: 'Ξ',
  ltc: 'Ł',
  doge: 'Ð',
  xmr: '✦',
  degree: '°',
  micro: 'µ',
  permille: '‰',
  usd: '$',
  eur: '€',
  gbp: '£',
  peso: '₱',
  yen: '¥',
  rupee: '₹',
  won: '₩',
  rub: '₽',
  shil: 'Sh',

  // tech
  bolt: '⚡',
  gear: '⚙',
  key: '⚷',
  compass: '✦',
  at: '@',
  hash: '#',
  bullet2: '•',

  // greek / decoration
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  sigma: 'σ',
  omega: 'Ω',
  pi: 'π',
  mu: 'μ',
  lambda: 'λ',
  psi: 'ψ',
  theta: 'θ',
  phi: 'φ',
  epsilon: 'ε',
  infinity: '∞',
  approx: '≈',
  neq: '≠',
  leq: '≤',
  geq: '≥',
  plus: '±',
  times: '×',
  divide: '÷',
  half: '½',
  third: '⅓',
  quarter: '¼',
  threeQ: '¾',
  eighth: '⅛',
  sum: '∑',
  prod: '∏',
  integral: '∫',
  partial: '∂',
  grad: '∇',
  forall: '∀',
  exist: '∃',
  empty: '∅',
  elem: '∈',
  union: '∪',
  intersect: '∩',
  subset: '⊂',
  superset: '⊃',
  not: '¬',
  and: '∧',
  or: '∨',
  therefore: '∴',
  because: '∵',
  got: '∎',
  arrowR: '⟶',
  arrowL: '⟵',
  pipe: '│',
  back: '└',
  tee: '├',
  cross2: '┼',
  topT: '┬',

  // heraldic / astrological — used in USER INFO and BOT STATUS
  star8: '✦',
  star4: '✧',
  starBig: '★',
  starOut: '☆',
  spark: '✶',
  florette: '❉',
  fleur: '❀',
  sun: '☀',
  moon: '☽',
  comet: '☄',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  cross_pat: '✠',
  cross_lor: '✞',
  maltese: '✠',
  sparkle: '✦',
  sparkle2: '✧',
  sparkle3: '✩',
  fleuron: '✤',
  seal: '✪',
  ankh: '☥',
  star6: '✶',
  eye: '☉',
  rx: '℞',
  sextile: '⚹',
  cKetu: '☋',
  cRahu: '☊',
  // label glyphs we use for USER INFO / BOT STATUS
  userMark: '✪',
  phoneMark: '✆',
  timeMark: '☽',
  roleMark: '◊',
  // BOT STATUS
  botMark: '𑁍',
  featMark: '⌘',
  engineMark: '♆',
  runtimeMark: '⟲',
  stackMark: '∴',
  versionMark: '℣',
  uptime: '⟳',
  // decorative brackets
  lBrack: '《',
  rBrack: '》',
  lSq: '⟦',
  rSq: '⟧',
  lCorner: '⟬',
  rCorner: '⟭',
  // apostrophes / dashes
  emDash: '—',
  enDash: '–',
  figureDash: '‒',
  minus: '−',
  // media controls
  mPlay: '▶',
  mPause: '⏸',
  mStop: '⏹',
  mRec: '⏺',
  mFwd: '⏭',
  mBack: '⏮',

  // ── box-drawing borders ──────────────────────────────────────────
  boxTopL: '┌',
  boxTopR: '┐',
  boxBotL: '└',
  boxBotR: '┘',
  boxH: '─',
  boxV: '│',
  boxCross: '┼',
  boxTeeL: '├',
  boxTeeR: '┤',
  boxTeeT: '┬',
  boxTeeB: '┴',

  // ── progress bar blocks ──────────────────────────────────────────
  barFull: '█',
  bar75: '▓',
  bar50: '▒',
  bar25: '░',
  barEmpty: ' ',

  // ── spinner frames ───────────────────────────────────────────────
  spin1: '⠋',
  spin2: '⠙',
  spin3: '⠹',
  spin4: '⠸',
  spin5: '⠼',
  spin6: '⠴',
  spin7: '⠦',
  spin8: '⠧',
  spin9: '⠇',
  spin10: '⠏',
};

/**
 * Build a progress bar: e.g. progress(0.7, 10) → "███████░░░"
 * @param {number} pct  0..1
 * @param {number} len  total width
 */
const progress = (pct, len = 10) => {
  const filled = Math.round(Math.max(0, Math.min(1, pct)) * len);
  return S.barFull.repeat(filled) + S.barEmpty.repeat(len - filled);
};

/**
 * Build a box-drawing frame around text.
 * box("hello\\nworld", { title: "Status" }) →
 *   ┌─ Status ─┐
 *   │ hello     │
 *   │ world     │
 *   └───────────┘
 */
const box = (text, { title, width } = {}) => {
  const lines = text.split('\n');
  const contentLen = title ? title.length + 4 : 0;
  const maxW = width || Math.max(contentLen, ...lines.map((l) => l.length));
  const top = title
    ? `${S.boxTopL}${S.boxH} ${title} ${S.boxH.repeat(Math.max(0, maxW - title.length - 2))}${S.boxTopR}`
    : `${S.boxTopL}${S.boxH.repeat(maxW)}${S.boxTopR}`;
  const bot = `${S.boxBotL}${S.boxH.repeat(maxW)}${S.boxBotR}`;
  const body = lines.map((l) => `${S.boxV} ${l}${' '.repeat(Math.max(0, maxW - l.length))} ${S.boxV}`).join('\n');
  return `${top}\n${body}\n${bot}`;
};

/**
 * Quick themed card with box borders.
 * themedCard("title", ["line1", "line2"], { footer: "footer" })
 */
const themedCard = (title, lines, { footer, width } = {}) => {
  const inner = lines.join('\n');
  const b = box(inner, { title, width });
  return footer ? `${b}\n${S.sub} ${footer}` : b;
};

const brand = (text = '') => `${S.brandLine}\n${S.divider}\n${S.brandSub}\n${S.divider}${text ? '\n' + text : ''}`;

const header = (title) =>
  `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${title}\n${S.heavyBar}`;

const section = (title, body) =>
  `${S.tri} *${title}*\n${S.divider}\n${body}\n`;

const row = (k, v) => `  ${S.sqr} ${k}  ${S.arr}  ${v}`;

const footer = (hint = 'Reply with the matching number or use the menu') =>
  `${S.heavyBar}\n${S.sub} ${hint}\n${S.brandLine}`;

const wrap = (body, { title, footer: ft, hint } = {}) => {
  const t = title ? `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${title}\n${S.heavyBar}\n\n` : '';
  const f = ft ?? footer(hint);
  return `${t}${body}\n${f}`;
};

module.exports = { S, brand, header, section, row, footer, wrap, progress, box, themedCard };

/**
 * Mythos ⟁ Ascendant — typo suggestions.
 * Uses Levenshtein distance to find the closest registered command.
 */

const distance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  const v1 = new Array(b.length + 1);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a.charCodeAt(i) === b.charCodeAt(j) ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
};

const suggest = (input, commands, threshold = 2) => {
  if (!input) return null;
  const lower = input.toLowerCase();
  let best = null;
  let bestDist = Infinity;
  for (const c of commands) {
    const d = distance(lower, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  // accept only if within threshold and shorter than the input (so we don't suggest longer words for short inputs)
  if (best && bestDist > 0 && bestDist <= threshold && bestDist < lower.length) {
    return best;
  }
  return null;
};

module.exports = { suggest };

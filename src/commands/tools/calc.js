/**
 * .calc â€” safe arithmetic calculator.
 * Supports + - * / % ** ( ) and decimals.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const ALLOWED = /^[0-9+\-*/().% \t\n]+$/;
const isSafe = (s) => ALLOWED.test(s);

const safeEval = (expr) => {
  // Replace ^ with **, % with /100
  const normalized = expr.replace(/\^/g, '**').replace(/%/g, '/100');
  if (!isSafe(normalized)) throw new Error('Disallowed characters');
  // eslint-disable-next-line no-new-func
  const fn = new Function(`"use strict"; return (${normalized});`);
  const out = fn();
  if (typeof out !== 'number' || !isFinite(out)) throw new Error('Not a finite number');
  return out;
};

module.exports = {
  name: 'calc',
  aliases: ['math', 'calculate'],
  category: 'tools',
  description: 'Calculate arithmetic (e.g. 2*(3+4)/5)',
  execute: async (ctx) => {
    const expr = ctx.args.join(' ');
    if (!expr) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}calc 2*(3+4)/5*`);
      return;
    }
    try {
      const result = safeEval(expr);
      const rounded = Math.round(result * 1e10) / 1e10;
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Calculator\n${S.heavyBar}\n  ${S.dot} ${expr}\n  ${S.arr}  ${rounded}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Could not evaluate: ${e.message}`);
    }
  },
};



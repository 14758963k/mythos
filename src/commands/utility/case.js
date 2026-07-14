/**
 * .case â€” convert text case: upper, lower, title, sentence, snake, kebab, camel, reverse.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const titleCase = (s) => s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
const sentenceCase = (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
const snake = (s) => s.trim().toLowerCase().replace(/[\s\-]+/g, '_').replace(/[^a-z0-9_]/g, '');
const kebab = (s) => s.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9\-]/g, '');
const camel = (s) => {
  const t = s.trim().toLowerCase().replace(/[\s\-_]+(.)/g, (_, c) => c.toUpperCase());
  return t.charAt(0).toLowerCase() + t.slice(1);
};
const reverse = (s) => [...s].reverse().join('');

const transform = {
  upper: (s) => s.toUpperCase(),
  lower: (s) => s.toLowerCase(),
  title: titleCase,
  sentence: sentenceCase,
  snake,
  kebab,
  camel,
  reverse,
};

module.exports = {
  name: 'case',
  aliases: ['text', 'transform'],
  category: 'utility',
  description: 'Convert case. Usage: .case <mode> <text>',
  execute: async (ctx) => {
    const mode = (ctx.args[0] || 'lower').toLowerCase();
    const text = ctx.args.slice(1).join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}case upper hello world*`);
      return;
    }
    const fn = transform[mode];
    if (!fn) {
      await reply(ctx.sock, ctx, `${S.warn}  Modes: ${Object.keys(transform).join(', ')}`);
      return;
    }
    const out = fn(text);
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Case  ${S.arr}  ${mode}\n${S.heavyBar}\n` +
        `  ${S.dot} ${out}\n${S.brandLine}`,
      buttons: Object.keys(transform)
        .filter((m) => m !== mode)
        .slice(0, 3)
        .map((m) => ({ id: `${ctx.prefix}case ${m} ${out}`, text: `â–¸ ${m}` })),
    }, ctx.msg);
  },
};



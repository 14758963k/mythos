/**
 * .hash â€” hash text with md5 / sha1 / sha256 / sha512.
 */

const crypto = require('crypto');
const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'hash',
  aliases: ['digest'],
  category: 'tools',
  description: 'Hash text. Algorithm optional: md5 | sha1 | sha256 | sha512',
  execute: async (ctx) => {
    const algo = (ctx.args[0] || 'sha256').toLowerCase();
    const text = ctx.args.slice(1).join(' ') || (ctx.quoted?.message?.conversation || '');
    if (!['md5', 'sha1', 'sha256', 'sha512'].includes(algo)) {
      await reply(ctx.sock, ctx, `${S.warn} Use md5, sha1, sha256, or sha512.`);
      return;
    }
    if (!text) {
      await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}hash sha256 hello world*`);
      return;
    }
    const out = crypto.createHash(algo).update(text).digest('hex');
    await sendQuickReply(ctx.sock, ctx.from, {
      text:
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Hash  ${S.arr}  ${algo.toUpperCase()}\n${S.heavyBar}\n` +
        `  ${S.dot} Input  ${S.arr}  ${text}\n  ${S.dot} Output ${S.arr}  ${out}\n${S.brandLine}`,
      buttons: [
        { id: `${ctx.prefix}hash md5 ${text}`, text: 'â–¸ MD5' },
        { id: `${ctx.prefix}hash sha1 ${text}`, text: 'â–¸ SHA1' },
        { id: `${ctx.prefix}hash sha512 ${text}`, text: 'â–¸ SHA512' },
      ],
    }, ctx.msg);
  },
};



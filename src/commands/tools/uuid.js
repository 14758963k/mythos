/**
 * .uuid â€” generate a v4 UUID.
 */

const crypto = require('crypto');
const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'uuid',
  aliases: ['guid'],
  category: 'tools',
  description: 'Generate a random UUID v4',
  execute: async (ctx) => {
    const id = crypto.randomUUID();
    await sendQuickReply(ctx.sock, ctx.from, {
      text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  UUID v4\n${S.heavyBar}\n  ${S.dot} ${id}\n${S.brandLine}`,
      buttons: [{ id: `${ctx.prefix}uuid`, text: 'â†» New' }],
    }, ctx.msg);
  },
};



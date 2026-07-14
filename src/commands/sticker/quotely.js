/**
 * .quotely — make a sticker from a quoted message (like a quote card).
 */

const { reply, sendSticker } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'quotely',
  aliases: ['q', 'quotesticker'],
  category: 'sticker',
  description: 'Create a quote sticker from a replied message',
  execute: async (ctx) => {
    if (!ctx.quoted) return reply(ctx.sock, ctx, `${S.warn}  Quote a message, then run *${ctx.prefix}quotely*.`);
    const text = ctx.quoted.message?.conversation || ctx.quoted.message?.extendedTextMessage?.text || '';
    if (!text) return reply(ctx.sock, ctx, `${S.cross}  The quoted message has no text.`);
    try {
      let pfp;
      try {
        pfp = await ctx.sock.profilePictureUrl(ctx.quoted.sender || ctx.participant, 'image');
      } catch { pfp = ''; }
      const body = {
        type: 'quote', format: 'png', backgroundColor: '#000000',
        width: 512, height: 512, scale: 3,
        messages: [{
          avatar: true,
          from: { first_name: ctx.pushName || 'User', language_code: 'en', name: ctx.pushName || 'User', photo: pfp ? { url: pfp } : undefined },
          text, replyMessage: {},
        }],
      };
      const { data } = await axios.post('https://bot.lyo.su/quote/generate', body);
      const imgBuf = Buffer.from(data.result.image, 'base64');
      await sendSticker(ctx.sock, ctx.from, imgBuf, ctx.msg, { pack: 'Mythos', author: 'Quotely' });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Quote sticker failed: ${e.message}`);
    }
  },
};

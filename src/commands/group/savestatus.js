/**
 * .savestatus — save a quoted status/story to the bot's chat.
 */

const { reply, sendText, downloadQuotedMedia, sendImage, sendVideo } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'savestatus',
  aliases: ['save', 'savepics'],
  category: 'group',
  description: 'Save a quoted WhatsApp status to your chat',
  execute: async (ctx) => {
    if (!ctx.quoted) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote a status, then run *${ctx.prefix}savestatus*.`);
    }
    try {
      const msg = ctx.quoted.message;
      if (!msg) return reply(ctx.sock, ctx, `${S.cross}  Could not read the quoted message.`);

      if (msg.imageMessage) {
        const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
        if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the image.`);
        const caption = msg.imageMessage.caption || '';
        await sendImage(ctx.sock, ctx.from, { image: buf, caption: `${S.brand} ${caption}` }, { quoted: ctx.msg });
        return reply(ctx.sock, ctx, `${S.check}  Status image saved.`);
      }

      if (msg.videoMessage) {
        const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
        if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the video.`);
        const caption = msg.videoMessage.caption || '';
        await sendVideo(ctx.sock, ctx.from, { video: buf, caption: `${S.brand} ${caption}` }, { quoted: ctx.msg });
        return reply(ctx.sock, ctx, `${S.check}  Status video saved.`);
      }

      return reply(ctx.sock, ctx, `${S.warn}  Only image and video statuses can be saved.`);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Failed: ${e.message}`);
    }
  },
};

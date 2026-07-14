/**
 * .status — post a regular Status to your own contacts list (not group-targeted).
 *   .status <caption>          — text-only status
 *   .status text <caption>     — text-only status (explicit)
 *   quote an image + caption   — image status
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { downloadQuotedMedia, react } = require('../../helpers/messages');

const GRADIENTS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
const grad = (i) => GRADIENTS[i % GRADIENTS.length];

module.exports = {
  name: 'status',
  aliases: ['story', 'mystatus'],
  category: 'media',
  description: 'Post a Status to your own contacts. Quote an image for image status, or pass a caption for text.',
  execute: async (ctx) => {
    const caption = ctx.args.join(' ').trim();
    const hasQuotedImage = ctx.quoted && ctx.quoted.message?.imageMessage;
    if (!hasQuotedImage && !caption) {
      await reply(ctx.sock, ctx, `${S.warn}  Quote an image or pass a caption. Example: *${ctx.prefix}status hello world*`);
      return;
    }
    try {
      if (hasQuotedImage) {
        const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
        if (!buf) {
          await reply(ctx.sock, ctx, `${S.cross} Could not download the image.`);
          return;
        }
        await ctx.sock.sendMessage(
          'status@broadcast',
          { image: buf, caption: caption || '' },
          {}
        );
      } else {
        const color = grad(Date.now() & 0xff);
        await ctx.sock.sendMessage(
          'status@broadcast',
          { text: caption, font: 0 },
          { backgroundColor: color }
        );
      }
      await react(ctx.sock, ctx, '⟁');
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Status Posted\n${S.heavyBar}\n  ${S.sqr} Mode    ${S.arr}  ${hasQuotedImage ? 'image' : 'text'}\n  ${S.sqr} Caption ${S.arr}  ${caption || '—'}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} ${e.message}`);
    }
  },
};

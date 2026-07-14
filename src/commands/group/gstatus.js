/**
 * .gstatus — post a Status (story) to the current group, using the
 * "group status v2" surface. The bot posts to `status@broadcast` and
 * includes the group JID in `statusJidList`, so the status is visible
 * to the group audience.
 *
 *   .gstatus <caption>          — uses a quoted image (or text-only status)
 *   .gstatus text <caption>     — pure text status (background gradient)
 *   .gstatus <jid> <caption>    — post to a specific group via its JID
 */

const { reply, sendImage, sendText } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { downloadQuotedMedia, react } = require('../../helpers/messages');

const GRADIENTS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

const grad = (i) => GRADIENTS[i % GRADIENTS.length];

module.exports = {
  name: 'gstatus',
  aliases: ['groupstatus'],
  category: 'group',
  description: 'Post a status to the current group (groupstatus v2). Use a quoted image, or .gstatus text <message>',
  execute: async (ctx) => {
    if (!ctx.isGroup) {
      await reply(ctx.sock, ctx, `${S.warn} Use this inside the group you want to post the status to.`);
      return;
    }
    const args = ctx.args;
    let targetJid = ctx.from; // default: current group
    let mode = 'image'; // 'image' | 'text'
    let captionParts = args;

    if (args[0] && args[0].toLowerCase() === 'text') {
      mode = 'text';
      captionParts = args.slice(1);
    } else if (args[0] && /^\d[\d-]+@g\.us$/.test(args[0])) {
      targetJid = args[0];
      captionParts = args.slice(1);
    }

    const caption = captionParts.join(' ').trim();

    try {
      if (mode === 'text') {
        if (!caption) {
          await reply(ctx.sock, ctx, `${S.warn}  Example: *${ctx.prefix}gstatus text the meeting starts in 5*`);
          return;
        }
        // text-only status — background colour rotates per call
        const color = grad(Date.now() & 0xff);
        await ctx.sock.sendMessage(
          'status@broadcast',
          { text: caption, font: 0 },
          { backgroundColor: color, statusJidList: [targetJid] }
        );
        await react(ctx.sock, ctx, '⟁');
        await reply(
          ctx.sock,
          ctx,
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Status Posted\n${S.heavyBar}\n  ${S.dot} Target  ${S.arr}  ${targetJid}\n  ${S.sqr} Mode    ${S.arr}  text\n  ${S.sqr} Color   ${S.arr}  ${color}\n  ${S.sqr} Caption ${S.arr}  ${caption}\n${S.brandLine}`
        );
        return;
      }

      // image mode — need a quoted image
      const hasQuotedImage = ctx.quoted && ctx.quoted.message?.imageMessage;
      if (!hasQuotedImage && !caption) {
        await reply(ctx.sock, ctx, `${S.warn}  Quote an image, or use *${ctx.prefix}gstatus text <message>*.`);
        return;
      }
      if (hasQuotedImage) {
        const buf = await downloadQuotedMedia(ctx.sock, ctx.quoted);
        if (!buf) {
          await reply(ctx.sock, ctx, `${S.cross} Could not download the quoted image.`);
          return;
        }
        await ctx.sock.sendMessage(
          'status@broadcast',
          { image: buf, caption: caption || '' },
          { statusJidList: [targetJid] }
        );
        await react(ctx.sock, ctx, '⟁');
        await reply(
          ctx.sock,
          ctx,
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Status Posted\n${S.heavyBar}\n  ${S.dot} Target  ${S.arr}  ${targetJid}\n  ${S.sqr} Mode    ${S.arr}  image\n  ${S.sqr} Caption ${S.arr}  ${caption || '—'}\n${S.brandLine}`
        );
        return;
      }

      // caption only, no image → fall through to text
      const color = grad(Date.now() & 0xff);
      await ctx.sock.sendMessage(
        'status@broadcast',
        { text: caption, font: 0 },
        { backgroundColor: color, statusJidList: [targetJid] }
      );
      await react(ctx.sock, ctx, '⟁');
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Status Posted\n${S.heavyBar}\n  ${S.dot} Target  ${S.arr}  ${targetJid}\n  ${S.sqr} Mode    ${S.arr}  text\n  ${S.sqr} Color   ${S.arr}  ${color}\n  ${S.sqr} Caption ${S.arr}  ${caption}\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Status post failed: ${e.message}`);
    }
  },
};

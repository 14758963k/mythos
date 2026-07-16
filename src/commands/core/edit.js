/**
 * Message editing and lottie sticker commands.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = [
  // ── .edit <reply new text> ─────────────────────────────────────
  {
    name: 'edit',
    aliases: ['editmsg', 'modify'],
    category: 'core',
    description: 'Edit a previously sent message (reply to it)',
    execute: async (ctx) => {
      if (!ctx.quoted) return reply(ctx.sock, ctx, `${S.warn} Reply to a message you sent to edit it.`);
      if (!ctx.quoted.key.fromMe) return reply(ctx.sock, ctx, `${S.warn} You can only edit your own messages.`);
      const newText = ctx.args.join(' ');
      if (!newText) return reply(ctx.sock, ctx, `${S.warn} Usage: ${ctx.prefix}edit <new text>`);
      try {
        await ctx.sock.sendMessage(ctx.from, {
          edit: ctx.quoted.key,
          text: newText,
        });
        await reply(ctx.sock, ctx, `${S.check}  Message edited.`);
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },

  // ── .lottie <reply webp/json> ──────────────────────────────────
  {
    name: 'lottie',
    aliases: ['animsticker', 'animatedsticker'],
    category: 'sticker',
    description: 'Send an animated lottie sticker',
    execute: async (ctx) => {
      const { downloadQuotedMedia } = require('../../helpers/messages');
      let buffer;
      if (ctx.quoted && ctx.quoted.message) {
        buffer = await downloadQuotedMedia(ctx.quoted);
      }
      if (!buffer) return reply(ctx.sock, ctx, `${S.warn} Reply to a sticker or image with ${ctx.prefix}lottie`);
      try {
        await ctx.sock.sendMessage(ctx.from, {
          sticker: buffer,
          isLottie: true,
        });
      } catch (e) {
        await reply(ctx.sock, ctx, `${S.cross} Failed: ${e.message}`);
      }
    },
  },
];

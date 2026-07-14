/**
 * .poll — send a native WhatsApp poll. Usage: .poll "Question" "Opt1" "Opt2" ...
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'poll',
  aliases: ['vote', 'ask'],
  category: 'utility',
  description: 'Send a native WhatsApp poll. Usage: .poll "Question" "Opt1" "Opt2" ...',
  execute: async (ctx) => {
    if (ctx.args.length < 3) {
      await reply(
        ctx.sock,
        ctx,
        `${S.warn}  Example:\n  *${ctx.prefix}poll "Best language?" "JavaScript" "Python" "Go"*\n  *${ctx.prefix}poll "Lunch?" "Pizza" "Sushi" "Salad" 1*  ${S.sub}  (last number = max selections)`
      );
      return;
    }
    // parse quoted-question + options; allow either explicit quotes or a Q? ... pattern
    const raw = ctx.args.join(' ');
    const quoted = raw.match(/"([^"]+)"/g);
    let name, values, selectableCount = 1;
    if (quoted && quoted.length >= 3) {
      name = quoted[0].slice(1, -1);
      values = quoted.slice(1).map((s) => s.slice(1, -1));
      const tail = raw.split('"').pop().trim();
      if (/^\d+$/.test(tail)) selectableCount = Math.max(1, Math.min(values.length, parseInt(tail, 10)));
    } else {
      // fallback: first arg is question, rest are options
      name = ctx.args[0];
      values = ctx.args.slice(1);
    }
    if (values.length < 2) {
      await reply(ctx.sock, ctx, `${S.warn}  A poll needs at least 2 options.`);
      return;
    }
    if (values.length > 12) {
      await reply(ctx.sock, ctx, `${S.warn}  Max 12 options.`);
      return;
    }
    try {
      await ctx.sock.sendMessage(ctx.from, {
        poll: {
          name,
          values,
          selectableCount,
          toAnnouncementGroup: false,
        },
      }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Poll failed: ${e.message}`);
    }
  },
};

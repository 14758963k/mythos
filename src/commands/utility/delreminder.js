/**
 * .delreminder — delete a reminder by ID.
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const events = require('../../core/events');

module.exports = {
  name: 'delreminder',
  aliases: ['delrmd', 'rmdcancel'],
  category: 'utility',
  description: 'Cancel a reminder by ID',
  execute: async (ctx) => {
    const id = ctx.args[0];
    if (!id) {
      await reply(ctx.sock, ctx, `${S.warn}  Pass the reminder ID. Use *${ctx.prefix}reminders* to find it.`);
      return;
    }
    const ok = events.cancelReminder(id);
    if (ok) {
      await sendQuickReply(ctx.sock, ctx.from, {
        text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Reminder Cancelled\n${S.heavyBar}\n  ${S.check} ${id}\n${S.brandLine}`,
        buttons: [{ id: `${ctx.prefix}reminders`, text: '▸ List' }],
      }, ctx.msg);
    } else {
      await reply(ctx.sock, ctx, `${S.warn}  No reminder with that ID.`);
    }
  },
};

/**
 * .help — show a specific command's details, or the index if none given.
 */

const { reply, sendNativeList } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { categoryChooser, commandSection } = require('../../helpers/interactive');
const loader = require('../../core/loader');

module.exports = {
  name: 'help',
  aliases: ['h', '?'],
  category: 'core',
  description: 'Show help for a command, or browse the index',
  execute: async (ctx) => {
    const arg = ctx.args[0];
    if (arg) {
      const cmd = loader.resolve(arg.replace(ctx.prefix, ''));
      if (!cmd) {
        await reply(ctx.sock, ctx, `No command named *${arg}*. Try *${ctx.prefix}menu*.`);
        return;
      }
      const body =
        `  ${S.sqr} Name        ${S.arr}  ${cmd.name}\n` +
        (cmd.aliases?.length
          ? `  ${S.sqr} Aliases     ${S.arr}  ${cmd.aliases.map((a) => `${S.tri} ${a}`).join('  ')}\n`
          : '') +
        `  ${S.sqr} Category    ${S.arr}  ${cmd.category}\n` +
        (cmd.usage ? `  ${S.sqr} Usage       ${S.arr}  ${cmd.usage}\n` : '') +
        `  ${S.sqr} Description ${S.arr}  ${cmd.description}\n`;
      await reply(
        ctx.sock,
        ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Command Reference  ${S.arr}  ${cmd.name}\n${S.heavyBar}\n${body}${S.brandLine}`
      );
      return;
    }
    const grouped = loader.grouped();
    await sendNativeList(ctx.sock, ctx.from, {
      text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Pick a category to browse\n${S.heavyBar}\n${S.sub} Reply *${ctx.prefix}help <cmd>* for full details.`,
      title: 'Mythos ⟁ Command Index',
      buttonText: '▸ Browse Categories',
      footer: `${S.brand} Mythos ⟁ Ascendant`,
      sections: categoryChooser(grouped),
    }, ctx.msg);
  },
};

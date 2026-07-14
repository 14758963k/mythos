/**
 * .commands — interactive command browser (one section per category).
 */

const { sendNativeList } = require('../../helpers/messages');
const { mainMenuSections, commandSection } = require('../../helpers/interactive');
const { S } = require('../../helpers/formatter');
const loader = require('../../core/loader');

module.exports = {
  name: 'commands',
  aliases: ['cmds', 'all'],
  category: 'core',
  description: 'Browse all commands as a multi-section list',
  execute: async (ctx) => {
    const grouped = loader.grouped();
    const arg = ctx.args[0];
    if (arg) {
      const cat = arg.toLowerCase();
      if (!grouped[cat]) {
        await ctx.sock.sendMessage(
          ctx.from,
          { text: `${S.warn} Unknown category *${arg}*. Try ${ctx.prefix}menu.` },
          { quoted: ctx.msg }
        );
        return;
      }
      await sendNativeList(
        ctx.sock,
        ctx.from,
        {
          text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Category ${S.arr}  ${arg}\n${S.heavyBar}`,
          title: `Mythos ⟁ ${arg.toUpperCase()}`,
          buttonText: '▸ Pick a command',
          sections: [commandSection(cat, grouped[cat])],
        },
        ctx.msg
      );
      return;
    }
    await sendNativeList(
      ctx.sock,
      ctx.from,
      {
        text: `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Browse by category\n${S.heavyBar}\n  ${S.sub} Sections contain all commands with quick-launch IDs.`,
        title: 'Mythos ⟁ All Commands',
        buttonText: '▸ Browse',
        sections: mainMenuSections(grouped),
      },
      ctx.msg
    );
  },
};

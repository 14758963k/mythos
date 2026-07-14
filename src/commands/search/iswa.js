/**
 * .iswa — search for WhatsApp accounts in a number range.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'iswa',
  aliases: ['whatsearch'],
  category: 'search',
  description: 'Search WhatsApp accounts in a number range (use x for wildcards)',
  execute: async (ctx) => {
    const input = ctx.args[0] || '';
    if (!input || !input.includes('x')) {
      return reply(ctx.sock, ctx, `${S.warn}  Provide a number with x as wildcard.\n  ${S.sub}  ${ctx.prefix}iswa 25471234567x\n  ${S.sub}  ${ctx.prefix}iswa 254712345xxx`);
    }
    const wildcardCount = (input.match(/x/gi) || []).length;
    const maxSearch = wildcardCount === 1 ? 10 : wildcardCount === 2 ? 20 : 30;
    if (wildcardCount > 3) return reply(ctx.sock, ctx, `${S.warn}  Max 3 wildcards allowed.`);
    await reply(ctx.sock, ctx, `${S.info}  Scanning up to ${maxSearch} numbers...`);
    const prefix = input.split('x')[0];
    const results = [];
    const noAccount = [];
    for (let i = 0; i < maxSearch; i++) {
      const num = String(i).padStart(wildcardCount, '0');
      const fullNum = prefix + num;
      try {
        const [exists] = await ctx.sock.onWhatsApp(`${fullNum}@s.whatsapp.net`);
        if (exists && exists.exists) {
          let bio = 'No bio';
          try {
            const status = await ctx.sock.fetchStatus(`${fullNum}@s.whatsapp.net`);
            bio = status.status || 'No bio';
          } catch {}
          results.push(`  ${S.sqr} wa.me/${fullNum}\n  ${S.sub} Bio: ${bio}`);
        } else {
          noAccount.push(fullNum);
        }
      } catch {
        noAccount.push(fullNum);
      }
    }
    let output = `${S.brandLine}\n${S.ultraBar}\n${S.sub}  WhatsApp Search  ${S.arr}  ${input}\n${S.heavyBar}\n`;
    if (results.length) {
      output += `  ${S.dot} Found ${results.length} accounts:\n\n${results.join('\n')}\n`;
    } else {
      output += `  ${S.dot} No accounts found in range.\n`;
    }
    if (noAccount.length) {
      output += `${S.divider}\n  ${S.cross} No WhatsApp: ${noAccount.slice(0, 10).join(', ')}${noAccount.length > 10 ? '...' : ''}\n`;
    }
    output += S.brandLine;
    await reply(ctx.sock, ctx, output);
  },
};

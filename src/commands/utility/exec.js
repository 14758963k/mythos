/**
 * .exec — evaluate code via JDoodle API.
 */

const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');

module.exports = {
  name: 'exec',
  aliases: ['code', 'run'],
  category: 'utility',
  description: 'Execute code snippet (reply to a code block)',
  execute: async (ctx) => {
    if (!ctx.quoted || !ctx.quoted.message?.conversation && !ctx.quoted.message?.extendedTextMessage?.text) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote a code block, then run *${ctx.prefix}exec <language>*.\n  ${S.sub} Languages: js, py, java, c, cpp, rb, go, ts`);
    }
    const code = ctx.quoted.message.conversation || ctx.quoted.message.extendedTextMessage?.text || '';
    const lang = (ctx.args[0] || 'js').toLowerCase();
    const langMap = { js: 'nodejs', py: 'python3', python: 'python3', java: 'java', c: 'c', cpp: 'cpp', rb: 'ruby', go: 'go', ts: 'nodejs' };
    const jdoodleLang = langMap[lang] || 'nodejs';
    try {
      const { data } = await axios.post('https://api.jdoodle.com/v1/execute', {
        script: code,
        language: jdoodleLang,
        versionIndex: '0',
        stdin: '',
        clientId: '694805244d4f825fc02a9d6260a54a99',
        clientSecret: '741b8b6a57446508285bb5893f106df3e20f1226fa3858a1f2aba813799d4734',
      });
      const output = (data.output || 'No output').slice(0, 3000);
      await reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Execution Result  ${S.arr}  ${lang.toUpperCase()}\n${S.heavyBar}\n` +
        `\`\`\`\n${output}\n\`\`\`\n${S.brandLine}`
      );
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  Execution failed: ${e.message}`);
    }
  },
};

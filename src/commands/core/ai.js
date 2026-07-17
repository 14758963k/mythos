/**
 * .ai — chat with AI (multi-provider).
 * Supports: .ai, .gpt, .gemini, .deepseek, .claude
 */

const { reply, sendAIReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const ai = require('../../helpers/ai');

const providerMap = {
  ai: null, // use default
  gpt: 'openai',
  openai: 'openai',
  gemini: 'gemini',
  deepseek: 'deepseek',
  claude: 'claude',
  mistral: 'mistral',
};

const createAICommand = (providerOverride) => ({
  name: null, // set below
  aliases: [],
  category: 'core',
  description: `Chat with AI (${providerOverride || 'default provider'})`,
  execute: async (ctx) => {
    const prompt = ctx.args.join(' ');
    if (!prompt) {
      const providers = ai.availableProviders();
      const list = providers.map(p => `  ${S.dot} *${p.name}* ${S.arr} ${p.model}`).join('\n');
      return reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  AI Chat\n${S.heavyBar}\n` +
        `${list || '  No AI providers configured.'}\n${S.divider}\n` +
        `  ${S.sub} Usage: *${ctx.prefix}${ctx.command} <prompt>*\n${S.brandLine}`
      );
    }

    try {
      await ctx.sock.sendPresenceUpdate('composing', ctx.from).catch(() => {});
      const provider = providerOverride || null;
      const response = await ai.chat(ctx.sender, prompt, { provider });
      const provLabel = provider || 'AI';
      await sendAIReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  ${provLabel.toUpperCase()} ${S.arr} Response\n${S.heavyBar}\n\n` +
          `  ${response}\n\n${S.brandLine}`,
        quoted: ctx.msg,
      });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} AI error: ${e.message}`);
    }
  },
});

const cmds = [];
const names = [
  { name: 'ai', aliases: ['ask', 'chat'], provider: null },
  { name: 'gpt', aliases: ['openai', 'gpt4'], provider: 'openai' },
  { name: 'gemini', aliases: ['google'], provider: 'gemini' },
  { name: 'deepseek', aliases: ['ds'], provider: 'deepseek' },
  { name: 'claude', aliases: ['anthropic'], provider: 'claude' },
];

for (const def of names) {
  const cmd = createAICommand(def.provider);
  cmd.name = def.name;
  cmd.aliases = def.aliases;
  cmds.push(cmd);
}

module.exports = cmds;

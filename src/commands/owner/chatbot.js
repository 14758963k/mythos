/**
 * .chatbot — toggle AI chatbot auto-reply (multi-provider).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');
const { clearHistory, clearAllHistory } = require('../../helpers/chatbot');
const ai = require('../../helpers/ai');

module.exports = {
  name: 'chatbot',
  aliases: ['botai'],
  category: 'owner',
  owner: true,
  description: 'Toggle AI chatbot auto-reply (multi-provider)',
  execute: async (ctx) => {
    const arg = (ctx.args[0] || '').toLowerCase();
    const providers = ai.availableProviders();
    const defaultProv = process.env.AI_PROVIDER || 'mistral';

    if (!arg) {
      const bot = store.get('bot');
      const on = !!bot.chatbot;
      const provList = providers.length
        ? providers.map(p => `  ${S.dot} ${p.name} ${S.arr} ${p.model}`).join('\n')
        : '  No providers configured.';
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Chatbot ${S.arr} ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr} ${on ? S.check : S.cross}\n` +
          `  ${S.sqr} Default ${S.arr} ${defaultProv}\n` +
          `  ${S.sqr} Trigger ${S.arr} Mentions + all DMs\n` +
          `${S.divider}\n${provList}\n${S.divider}\n` +
          `  ${S.sub} ${ctx.prefix}chatbot on/off\n` +
          `  ${S.sub} ${ctx.prefix}chatbot provider <name>\n` +
          `  ${S.sub} ${ctx.prefix}chatbot clear/clearall\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}chatbot on`, text: '▸ On' },
          { id: `${ctx.prefix}chatbot off`, text: '▸ Off' },
          { id: `${ctx.prefix}chatbot clear`, text: '▸ Clear' },
        ],
      }, ctx.msg);
    }

    if (arg === 'on') {
      if (!providers.length) {
        return reply(ctx.sock, ctx, `${S.cross} No AI providers configured. Set at least one API key in .env`);
      }
      store.update('bot', (b) => { b.chatbot = true; });
      return reply(ctx.sock, ctx, `${S.check} Chatbot activated (${defaultProv}).`);
    }
    if (arg === 'off') {
      store.update('bot', (b) => { b.chatbot = false; });
      return reply(ctx.sock, ctx, `${S.check} Chatbot deactivated.`);
    }
    if (arg === 'provider' || arg === 'set') {
      const name = ctx.args[1]?.toLowerCase();
      if (!name || !providers.find(p => p.name === name)) {
        const list = providers.map(p => p.name).join(', ') || 'none';
        return reply(ctx.sock, ctx, `${S.warn} Available: ${list}`);
      }
      process.env.AI_PROVIDER = name;
      return reply(ctx.sock, ctx, `${S.check} Default provider set to *${name}*.`);
    }
    if (arg === 'clear') {
      clearHistory(ctx.sender);
      return reply(ctx.sock, ctx, `${S.check} Your conversation history cleared.`);
    }
    if (arg === 'clearall') {
      clearAllHistory();
      return reply(ctx.sock, ctx, `${S.check} All conversation histories cleared.`);
    }
    return reply(ctx.sock, ctx, `${S.warn} Use on, off, provider, clear, or clearall.`);
  },
};

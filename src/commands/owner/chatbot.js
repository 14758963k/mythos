/**
 * .chatbot — toggle AI chatbot auto-reply (Mistral AI).
 */

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const store = require('../../core/store');
const { clearHistory, clearAllHistory } = require('../../helpers/chatbot');

module.exports = {
  name: 'chatbot',
  aliases: ['botai'],
  category: 'owner',
  owner: true,
  description: 'Toggle AI chatbot auto-reply to mentions and DMs',
  execute: async (ctx) => {
    const arg = (ctx.args[0] || '').toLowerCase();
    const hasKey = !!process.env.MISTRAL_API_KEY;
    const model = process.env.CHATBOT_MODEL || 'mistral-small-latest';

    if (!arg) {
      const bot = store.get('bot');
      const on = !!bot.chatbot;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Chatbot  ${S.arr}  ${on ? 'ON' : 'OFF'}\n${S.heavyBar}\n` +
          `  ${S.sqr} Status ${S.arr}  ${on ? S.check : S.cross}\n` +
          `  ${S.sqr} API Key ${S.arr}  ${hasKey ? S.check : S.cross}\n` +
          `  ${S.sqr} Model ${S.arr}  ${model}\n` +
          `  ${S.sqr} Trigger ${S.arr}  Mentions in groups + all DMs\n` +
          `${S.divider}\n` +
          `  ${S.sub}  ${ctx.prefix}chatbot on\n` +
          `  ${S.sub}  ${ctx.prefix}chatbot off\n` +
          `  ${S.sub}  ${ctx.prefix}chatbot clear  ${S.arr}  Clear your chat history\n` +
          `  ${S.sub}  ${ctx.prefix}chatbot clearall  ${S.arr}  Clear everyone's history\n${S.brandLine}`,
        buttons: [
          { id: `${ctx.prefix}chatbot on`, text: '▸ On' },
          { id: `${ctx.prefix}chatbot off`, text: '▸ Off' },
          { id: `${ctx.prefix}chatbot clear`, text: '▸ Clear History' },
        ],
      }, ctx.msg);
    }
    if (arg === 'on') {
      if (!hasKey) {
        return reply(ctx.sock, ctx, `${S.cross} MISTRAL_API_KEY not set in .env.\nGet one at: https://console.mistral.ai/`);
      }
      store.update('bot', (b) => { b.chatbot = true; });
      return reply(ctx.sock, ctx, `${S.check}  Chatbot activated (${model}).`);
    }
    if (arg === 'off') {
      store.update('bot', (b) => { b.chatbot = false; });
      return reply(ctx.sock, ctx, `${S.check}  Chatbot deactivated.`);
    }
    if (arg === 'clear') {
      clearHistory(ctx.sender);
      return reply(ctx.sock, ctx, `${S.check}  Your conversation history cleared.`);
    }
    if (arg === 'clearall') {
      clearAllHistory();
      return reply(ctx.sock, ctx, `${S.check}  All conversation histories cleared.`);
    }
    return reply(ctx.sock, ctx, `${S.warn}  Use on, off, clear, or clearall.`);
  },
};

const { reply, sendQuickReply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

const games = new Map();

const createBoard = () => Array(9).fill(' ');
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const renderBoard = (b) => {
  const cell = (i) => b[i] === ' ' ? `${i+1}` : b[i];
  return (
    `\n  ${S.tri} ${cell(0)} │ ${cell(1)} │ ${cell(2)}\n` +
    `  ${S.tri} ${S.divider}\n` +
    `  ${S.tri} ${cell(3)} │ ${cell(4)} │ ${cell(5)}\n` +
    `  ${S.tri} ${S.divider}\n` +
    `  ${S.tri} ${cell(6)} │ ${cell(7)} │ ${cell(8)}`
  );
};

const checkWinner = (b, p) => winPatterns.some(([a,c,d]) => b[a]===p && b[c]===p && b[d]===p);
const isDraw = (b) => b.every(c => c !== ' ');

module.exports = {
  name: 'ttt',
  aliases: ['tictactoe', 'xo'],
  category: 'games',
  description: 'Play Tic Tac Toe (2 players)',
  execute: async (ctx) => {
    const chatId = ctx.from;
    const arg = (ctx.args[0] || '').toLowerCase();

    if (arg === 'end') {
      const g = games.get(chatId);
      if (!g) return reply(ctx.sock, ctx, `${S.warn} No active game.`);
      games.delete(chatId);
      return reply(ctx.sock, ctx, `${S.check} Game ended.`);
    }

    const g = games.get(chatId);
    if (g && !arg) {
      if (ctx.sender !== g.turn && ctx.sender !== g.p2) {
        return reply(ctx.sock, ctx, `${S.warn} Not your turn.`);
      }
      const pos = parseInt(ctx.args[0]) - 1;
      if (isNaN(pos) || pos < 0 || pos > 8 || g.board[pos] !== ' ') {
        return reply(ctx.sock, ctx, `${S.warn} Invalid position (1-9).`);
      }
      g.board[pos] = g.turn === g.p1 ? 'X' : 'O';
      const mark = g.turn === g.p1 ? 'X' : 'O';
      if (checkWinner(g.board, mark)) {
        const winner = g.turn;
        const text =
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Tic Tac Toe ${S.arr} Game Over\n${S.heavyBar}\n` +
          renderBoard(g.board) + '\n' +
          `${S.divider}\n  ${S.check} *${winner === g.p1 ? g.p1Name : g.p2Name}* wins!\n${S.brandLine}`;
        games.delete(chatId);
        return reply(ctx.sock, ctx, text);
      }
      if (isDraw(g.board)) {
        const text =
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Tic Tac Toe ${S.arr} Draw\n${S.heavyBar}\n` +
          renderBoard(g.board) + '\n' +
          `${S.divider}\n  ${S.warn} It's a draw!\n${S.brandLine}`;
        games.delete(chatId);
        return reply(ctx.sock, ctx, text);
      }
      g.turn = g.turn === g.p1 ? g.p2 : g.p1;
      const turnName = g.turn === g.p1 ? g.p1Name : g.p2Name;
      return sendQuickReply(ctx.sock, ctx.from, {
        text:
          `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Tic Tac Toe\n${S.heavyBar}\n` +
          renderBoard(g.board) + '\n' +
          `${S.divider}\n  ${S.tri} Turn ${S.arr} @${turnName}\n  ${S.tri} X ${S.arr} @${g.p1Name}\n  ${S.tri} O ${S.arr} @${g.p2Name}`,
        buttons: [
          { id: `${ctx.prefix}ttt end`, text: '▸ End' },
        ],
      }, ctx.msg);
    }

    const p2 = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!p2) {
      return reply(ctx.sock, ctx, `${S.warn} Tag someone to play! Example: *${ctx.prefix}ttt @player2*`);
    }
    if (p2 === ctx.sender) return reply(ctx.sock, ctx, `${S.warn} You can't play against yourself!`);

    const gNew = {
      p1: ctx.sender, p1Name: ctx.pushName || 'Player 1',
      p2, p2Name: p2.split('@')[0],
      board: createBoard(),
      turn: ctx.sender,
    };
    games.set(chatId, gNew);
    const text =
      `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Tic Tac Toe ${S.arr} New Game!\n${S.heavyBar}\n` +
      renderBoard(gNew.board) + '\n' +
      `${S.divider}\n  ${S.tri} X ${S.arr} @${gNew.p1Name} (you)\n  ${S.tri} O ${S.arr} @${gNew.p2Name}\n` +
      `  ${S.sub} Reply with a number 1-9\n${S.brandLine}`;
    await sendQuickReply(ctx.sock, ctx.from, {
      text,
      buttons: [{ id: `${ctx.prefix}ttt end`, text: '▸ Forfeit' }],
    }, ctx.msg);
  },
};

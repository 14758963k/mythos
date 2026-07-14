const { reply } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const { downloadQuotedMedia } = require('../../helpers/messages');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
  name: 'voicechanger',
  aliases: ['vc', 'voicemod'],
  category: 'media',
  description: 'Change voice of audio message',
  execute: async (ctx) => {
    const mode = (ctx.args[0] || '').toLowerCase();
    const validModes = ['robot', 'deep', 'fast', 'slow', 'echo', 'cave', 'chipmunk', 'reverse'];
    if (!mode || !validModes.includes(mode)) {
      return reply(ctx.sock, ctx,
        `${S.brandLine}\n${S.sub}  Voice Changer\n${S.heavyBar}\n` +
        validModes.map(m => `  ${S.sqr} ${m}`).join('\n') +
        `\n${S.divider}\n  ${S.tri} Usage ${S.arr} ${ctx.prefix}vc <mode>\n  ${S.tri} Reply to an audio with the command\n${S.brandLine}`
      );
    }

    const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo;
    const audioMsg = quoted?.quotedMessage?.audioMessage;
    if (!audioMsg) return reply(ctx.sock, ctx, `${S.warn} Reply to an audio message.`);

    try {
      const buffer = await downloadQuotedMedia(ctx.sock, ctx.msg);
      const tmpDir = os.tmpdir();
      const inPath = path.join(tmpDir, `vc_in_${Date.now()}.ogg`);
      const outPath = path.join(tmpDir, `vc_out_${Date.now()}.mp3`);
      fs.writeFileSync(inPath, buffer);

      const filters = {
        robot: 'aecho=0.8:0.8:6:0.4',
        deep: 'asetrate=44100*0.75,aresample=44100',
        fast: 'atempo=1.5',
        slow: 'atempo=0.7',
        echo: 'aecho=0.8:0.9:1000:0.3',
        cave: 'aecho=0.8:0.88:60:0.4',
        chipmunk: 'asetrate=44100*1.5,aresample=44100',
        reverse: 'areverse',
      };

      const { execSync } = require('child_process');
      execSync(`ffmpeg -y -i "${inPath}" -af "${filters[mode]}" "${outPath}" 2>nul`, { timeout: 30000 });

      const audioBuffer = fs.readFileSync(outPath);
      await ctx.sock.sendMessage(ctx.from, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false,
        contextInfo: { externalAdReply: { title: `Voice ${S.arr} ${mode}`, body: 'Mythos ⟁ Ascendant', thumbnailUrl: 'https://files.catbox.moe/k3j8m1.jpg', mediaType: 1 } },
      }, { quoted: ctx.msg });

      fs.unlinkSync(inPath);
      fs.unlinkSync(outPath);
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross} Voice conversion failed: ${e.message}`);
    }
  },
};

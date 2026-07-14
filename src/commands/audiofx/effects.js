/**
 * Audio effects — bass, blown, deep, fast, reverse, echo.
 */

const { reply, sendAudio, downloadQuotedMedia } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');
const axios = require('axios');
const { TelegraPh } = require('../../helpers/scraper');

const createAudioFx = (effect) => ({
  name: effect,
  aliases: [],
  category: 'audio',
  description: `Apply ${effect} audio effect to a quoted audio/video`,
  execute: async (ctx) => {
    const quoted = ctx.quoted;
    if (!quoted || (!quoted.message?.audioMessage && !quoted.message?.videoMessage)) {
      return reply(ctx.sock, ctx, `${S.warn}  Quote an audio/video, then run *${ctx.prefix}${effect}*.`);
    }
    try {
      await reply(ctx.sock, ctx, `${S.info}  Applying ${effect} effect...`);
      const buf = await downloadQuotedMedia(ctx.sock, quoted);
      if (!buf) return reply(ctx.sock, ctx, `${S.cross}  Could not download the media.`);
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      const tmpIn = path.join(process.env.TEMP || '/tmp', `in_${Date.now()}.mp3`);
      const tmpOut = path.join(process.env.TEMP || '/tmp', `out_${Date.now()}.mp3`);
      fs.writeFileSync(tmpIn, buf);
      let filter;
      switch (effect) {
        case 'bass': filter = 'equalizer=f=32:t=q:w=200:g=20'; break;
        case 'blown': filter = 'overdrive=gain=20'; break;
        case 'deep': filter = 'asetrate=44100*0.8'; break;
        case 'fast': filter = 'atempo=1.5'; break;
        case 'reverse': filter = 'areverse'; break;
        case 'echo': filter = 'aecho=0.8:0.8:60:0.4'; break;
        default: filter = 'aecho=0.8:0.8:60:0.4';
      }
      execSync(`ffmpeg -y -i "${tmpIn}" -af ${filter} "${tmpOut}"`, { timeout: 30000 });
      const outBuf = fs.readFileSync(tmpOut);
      fs.unlinkSync(tmpIn);
      fs.unlinkSync(tmpOut);
      await sendAudio(ctx.sock, ctx.from, { audio: outBuf, mimetype: 'audio/mpeg', ptt: false }, { quoted: ctx.msg });
    } catch (e) {
      await reply(ctx.sock, ctx, `${S.cross}  ${effect} failed: ${e.message}`);
    }
  },
});

module.exports = [
  createAudioFx('bass'),
  createAudioFx('blown'),
  createAudioFx('deep'),
  createAudioFx('fast'),
  createAudioFx('reverse'),
  createAudioFx('echo'),
];

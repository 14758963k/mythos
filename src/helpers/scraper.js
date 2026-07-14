/**
 * Mythos ⟁ Ascendant — scraper helpers.
 * Provides a TelegraPh upload function for image editor commands.
 */

const axios = require('axios');
const FormData = require('form-data') || null;
const fs = require('fs');
const path = require('path');

/**
 * Upload a buffer or file path to Telegraph and return the URL.
 */
const TelegraPh = async (bufferOrPath) => {
  let buffer;
  let filename = 'image.png';
  if (typeof bufferOrPath === 'string') {
    buffer = fs.readFileSync(bufferOrPath);
    filename = path.basename(bufferOrPath);
  } else {
    buffer = bufferOrPath;
  }
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', buffer, { filename, contentType: 'image/png' });
  const { data } = await axios.post('https://telegra.ph/upload', form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  if (!data || !data[0] || !data[0].src) throw new Error('Telegraph upload failed');
  return `https://telegra.ph${data[0].src}`;
};

module.exports = { TelegraPh };

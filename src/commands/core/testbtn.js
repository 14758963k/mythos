const { sendQuickReply, sendInteractive, sendNativeList, sendInteractiveRelay } = require('../../helpers/messages');
const { S } = require('../../helpers/formatter');

module.exports = {
  name: 'testbtn',
  aliases: ['testbuttons'],
  category: 'core',
  description: 'Test all button types',
  owner: true,
  execute: async (ctx) => {
    const jid = ctx.from;
    const { sock, msg } = ctx;
    const section = ctx.args[0] || '1';

    if (section === '1') {
      // Test 1: quick_reply buttons via sendQuickReply
      await sendQuickReply(sock, jid, {
        text: `${S.tri} Test 1: Quick Reply Buttons`,
        footer: `${S.brand} Button Test`,
        buttons: [
          { id: 'btn_yes', text: 'Yes' },
          { id: 'btn_no', text: 'No' },
          { id: 'btn_maybe', text: 'Maybe' },
        ],
      }, msg);
    }

    if (section === '2') {
      // Test 2: cta_url + cta_copy + cta_call
      await sendInteractive(sock, jid, {
        text: `${S.tri} Test 2: CTA Buttons`,
        footer: `${S.brand} Button Test`,
        nativeFlow: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Visit GitHub',
              url: 'https://github.com/GOATED-404',
            }),
          },
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
              display_text: 'Copy Code',
              copy_code: 'MYTHOS-ASCENDANT',
            }),
          },
          {
            name: 'cta_call',
            buttonParamsJson: JSON.stringify({
              display_text: 'Call Owner',
              phone_number: '+254743651390',
            }),
          },
        ],
      }, msg);
    }

    if (section === '3') {
      // Test 3: single_select (list picker)
      await sendNativeList(sock, jid, {
        text: `${S.tri} Test 3: Single Select Menu`,
        title: `${S.brand} Button Test`,
        buttonText: 'Pick One',
        sections: [
          {
            title: 'Options',
            rows: [
              { id: 'opt_a', title: 'Option A', description: 'First choice' },
              { id: 'opt_b', title: 'Option B', description: 'Second choice' },
              { id: 'opt_c', title: 'Option C', description: 'Third choice' },
            ],
          },
        ],
      }, msg);
    }

    if (section === '4') {
      // Test 4: quick_reply with image header
      await sendInteractive(sock, jid, {
        text: `${S.tri} Test 4: Image Header + Buttons`,
        footer: `${S.brand} Button Test`,
        image: { url: 'https://files.catbox.moe/k3j8m1.jpg' },
        nativeFlow: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: 'Cool!', id: 'cool' }),
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: 'Nice!', id: 'nice' }),
          },
        ],
      }, msg);
    }

    if (section === '5') {
      // Test 5: mixed buttons (all types together)
      await sendInteractive(sock, jid, {
        text: `${S.tri} Test 5: Mixed Buttons\n${S.sub} All types in one message`,
        footer: `${S.brand} Button Test`,
        nativeFlow: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: 'Reply', id: 'reply_1' }),
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({ display_text: 'Open Link', url: 'https://github.com' }),
          },
          {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({ display_text: 'Copy Token', copy_code: 'MYTHOS-TOKEN-123' }),
          },
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'More Options',
              sections: [{
                title: 'Actions',
                rows: [
                  { id: 'action_1', title: 'Action 1', description: 'Do something' },
                  { id: 'action_2', title: 'Action 2', description: 'Do another' },
                ],
              }],
            }),
          },
        ],
      }, msg);
    }

    if (section === '6') {
      // Test 6: cta_catalog
      await sendInteractive(sock, jid, {
        text: `${S.tri} Test 6: CTA Catalog`,
        footer: `${S.brand} Button Test`,
        nativeFlow: [
          {
            name: 'cta_catalog',
            buttonParamsJson: JSON.stringify({
              business_phone_number: '254743651390',
            }),
          },
        ],
      }, msg);
    }

    if (section === '7') {
      // Test 7: send_location
      await sendInteractive(sock, jid, {
        text: `${S.tri} Test 7: Send Location`,
        footer: `${S.brand} Button Test`,
        nativeFlow: [
          {
            name: 'send_location',
            buttonParamsJson: JSON.stringify({
              display_text: 'Share My Location',
            }),
          },
        ],
      }, msg);
    }

    if (section === '8') {
      // Test 8: open_webview — uses relayMessage for custom binary node
      await sendInteractiveRelay(sock, jid, {
        text: `${S.tri} Test 8: Open Webview`,
        footer: `${S.brand} Button Test`,
        buttons: [
          {
            name: 'open_webview',
            buttonParamsJson: JSON.stringify({
              display_text: 'Open Dashboard',
              url: 'https://github.com/GOATED-404',
              in_app_webview: true,
            }),
          },
        ],
      }, msg);
    }

    if (section === '9') {
      // Test 9: galaxy_message — uses relayMessage for custom binary node
      // REQUIRES real flow_id + flow_token from Meta Business Suite.
      const FLOW_ID = process.env.META_FLOW_ID || '';
      const FLOW_TOKEN = process.env.META_FLOW_TOKEN || '';
      if (!FLOW_ID || !FLOW_TOKEN) {
        const { reply } = require('../../helpers/messages');
        await reply(sock, ctx,
          `${S.warn} galaxy_message requires real Meta Flow credentials.\n\n` +
          `  ${S.tri} Set META_FLOW_ID and META_FLOW_TOKEN in .env\n` +
          `  ${S.tri} Get these from: Meta Business Suite > WhatsApp > Flows\n\n` +
          `Without real credentials the button won't render on WhatsApp clients.`
        );
        return;
      }
      await sendInteractiveRelay(sock, jid, {
        text: `${S.tri} Test 9: Galaxy Message (WhatsApp Flows)`,
        footer: `${S.brand} Button Test`,
        buttons: [
          {
            name: 'galaxy_message',
            buttonParamsJson: JSON.stringify({
              mode: 'published',
              flow_message_version: '3',
              flow_token: FLOW_TOKEN,
              flow_id: FLOW_ID,
              flow_cta: 'Open Form',
              flow_action: 'navigate',
              flow_action_payload: {
                screen: 'QUESTION_ONE',
                params: {},
              },
            }),
          },
        ],
      }, msg);
    }

    if (!['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(section)) {
      const { reply } = require('../../helpers/messages');
      await reply(sock, ctx,
        `${S.brandLine}\n${S.ultraBar}\n${S.sub}  Button Tests\n${S.heavyBar}\n` +
        `  ${S.tri} .testbtn 1  ${S.arr}  Quick Reply\n` +
        `  ${S.tri} .testbtn 2  ${S.arr}  CTA (url/copy/call)\n` +
        `  ${S.tri} .testbtn 3  ${S.arr}  Single Select\n` +
        `  ${S.tri} .testbtn 4  ${S.arr}  Image + Buttons\n` +
        `  ${S.tri} .testbtn 5  ${S.arr}  Mixed All Types\n` +
        `  ${S.tri} .testbtn 6  ${S.arr}  CTA Catalog\n` +
        `  ${S.tri} .testbtn 7  ${S.arr}  Send Location\n` +
        `  ${S.tri} .testbtn 8  ${S.arr}  Open Webview\n` +
        `  ${S.tri} .testbtn 9  ${S.arr}  Galaxy Message\n` +
        `${S.brandLine}`
      );
    }
  },
};

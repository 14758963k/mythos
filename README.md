# Mythos ⟁ Ascendant

> Fifty Names from the First Error.
> A production-shaped WhatsApp bot built on [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) and the [baileys_helpers](https://libraries.io/npm/baileys_helpers) interactive-message layer.

---

## Why "Mythos ⟁ Ascendant"?

- **Mythos** — a system of stories that explains how a thing came to be.
- **⟁** — the brand mark, an Aelf-stone that reads as both "ascending" and "an error that learned to climb".
- **Ascendant** — the first error, climbing into a working system.

The whole UI is symbol-led, never emoji-led. Look at `src/helpers/formatter.js` for the symbol vocabulary. The aesthetic is dense, geometric, and never uses raw ASCII (no `* * *` or `=========`).

---

## Features

- 62 fully working commands, hand-organised into 7 categories.
- Buttons, interactive lists, single-select menus, **multi-card carousels**, native **polls**, and quick replies — all routed through the `baileys_helpers` `sendButtons` / `sendInteractiveMessage` layer so private chats and group chats both render correctly.
- Auto-loader — drop a `.js` into `src/commands/<category>/` and it is registered. Hot-reload with `.reload`.
- Group automation: welcome / goodbye messages, antilink auto-delete, tagall, hidetag, polls.
- Reminder system: `.remind 1h walk the dog`, `.reminders`, `.delreminder <id>`.
- Two interchangeable data stores: `json` (default) or `sqlite` (opt-in via `STORE_BACKEND=sqlite`). SQLite auto-migrates your existing JSON on first run.
- File-based logging with size-based rotation (`src/data/mythos.log`).
- Typo suggestions — "Did you mean `.quote`?" when you fat-finger a command.
- Per-user rate limit, owner-only gate, multi-device auth with QR or pairing code.
- Cleanly separated: core / helpers / menus / commands / middleware.

---

## Project layout

```
mythos/
├── package.json
├── .env.example
├── src/
│   ├── index.js              ← entry, wires client + handler + loader
│   ├── config.js             ← frozen config from .env
│   ├── core/
│   │   ├── client.js         ← Baileys socket factory
│   │   ├── events.js         ← welcome, goodbye, antilink, reminders
│   │   ├── handler.js        ← message router
│   │   ├── loader.js         ← auto-loads commands
│   │   ├── logger.js         ← console logger
│   │   └── store.js          ← JSON-backed store
│   ├── helpers/
│   │   ├── formatter.js      ← the symbol vocabulary
│   │   ├── interactive.js    ← menu builders
│   │   ├── jid.js            ← JID utilities
│   │   └── messages.js       ← sendText / sendImage / sendList / sendCarousel / …
│   ├── middleware/
│   │   └── rateLimit.js
│   ├── commands/             ← all 58 commands live here
│   │   ├── core/   (10) menu, help, ping, info, stats, owner, about, commands, discover, leaderboard
│   │   ├── fun/    (8)  quote, joke, fact, meme, roll, flip, 8ball, rate
│   │   ├── tools/  (8)  calc, qr, shorten, uuid, hash, base64, binary, password
│   │   ├── utility/(11) time, date, weather, define, translate, count, case, reverse, remind, reminders, delreminder
│   │   ├── group/  (11) tagall, hidetag, groupinfo, admins, add, kick, promote, demote, welcome, goodbye, antilink
│   │   ├── media/  (5)  sticker, toimg, tts, whois, profile
│   │   └── owner/  (5)  setprefix, broadcast, block, unblock, restart
│   └── data/                 ← runtime JSON (bot.json, users.json, groups.json, reminders.json)
├── research/                 ← the cloned reference repos
│   ├── Baileys/
│   └── baileys_helpers/
├── auth_info/                ← session files (created on first run)
└── README.md
```

---

## Quick start

```bash
# 1. install
npm install

# 2. configure
cp .env.example .env
# edit .env, especially OWNER_JIDS and (optionally) PAIRING_NUMBER

# 3. run
npm start
```

On first launch the bot prints a QR to the terminal — scan it with
**WhatsApp → Linked Devices → Link a Device**. The session is then persisted
under `auth_info/`, so subsequent boots skip the QR.

To use a pairing code instead (single-device), set `PAIRING_NUMBER` in `.env`
and run `npm run pair`.

---

## Command index (62)

| Cat | Command | Description |
| --- | --- | --- |
| core | `menu` | Open the main interactive command index |
| core | `help` | Show help for a command, or browse the index |
| core | `ping` | Response time check |
| core | `info` | Show bot status, uptime and version |
| core | `stats` | View your usage statistics and global counters |
| core | `owner` | Show the owner contact |
| core | `about` | Short introduction to Mythos |
| core | `commands` | Browse all commands as a multi-section list |
| core | `discover` | Mythos in motion — an interactive carousel of features |
| core | `leaderboard` | Top 10 most active users |
| fun | `quote` | Pull a random inspirational quote |
| fun | `joke` | Tell a random joke |
| fun | `fact` | A random fact |
| fun | `meme` | Random meme caption |
| fun | `roll` | Roll a dice. Optional: NdM like 3d20 |
| fun | `flip` | Flip a coin |
| fun | `8ball` | Magic 8 ball — ask a yes/no question |
| fun | `rate` | Rate something out of 10 |
| tools | `calc` | Calculate arithmetic (e.g. 2*(3+4)/5) |
| tools | `qr` | Generate a QR code for any text or URL |
| tools | `shorten` | Shorten a URL using is.gd |
| tools | `uuid` | Generate a random UUID v4 |
| tools | `hash` | Hash text. Algorithm optional |
| tools | `base64` | Encode or decode base64 |
| tools | `binary` | Convert text to/from binary |
| tools | `password` | Generate a strong random password |
| utility | `time` | Show the current time in major cities |
| utility | `date` | Show today's date |
| utility | `weather` | Current weather for a known city |
| utility | `define` | Look up a word definition |
| utility | `translate` | Translate text to a target language |
| utility | `count` | Count characters, words, lines, bytes |
| utility | `case` | Convert case (upper/lower/title/snake/...) |
| utility | `reverse` | Reverse characters in a string |
| utility | `remind` | Set a reminder. Usage: .remind <duration> <text> |
| utility | `reminders` | List pending reminders in this chat |
| utility | `delreminder` | Cancel a reminder by ID |
| utility | `poll` | Send a native WhatsApp poll |
| group | `tagall` | Mention every member of the group |
| group | `hidetag` | Mention everyone without showing @ text |
| group | `groupinfo` | Show metadata for the current group |
| group | `admins` | List the admins of the current group |
| group | `add` | Add a user to the group |
| group | `kick` | Remove a user from the group |
| group | `promote` | Promote a user to admin |
| group | `demote` | Demote an admin back to member |
| group | `welcome` | View or set the welcome message (admin only) |
| group | `goodbye` | View or set the goodbye message (admin only) |
| group | `antilink` | Toggle antilink. Usage: .antilink on\|off\|warn |
| media | `sticker` | Convert a quoted image to a sticker |
| media | `toimg` | Convert a quoted sticker to image |
| media | `tts` | Read text aloud |
| media | `whois` | Show a user or group profile picture |
| media | `profile` | Show your own profile picture |
| owner | `setprefix` | Change the bot command prefix (owner) |
| owner | `broadcast` | Broadcast a message to all known private chats (owner) |
| owner | `block` | Block a user (owner) |
| owner | `unblock` | Unblock a user (owner) |
| owner | `restart` | Restart the bot process (owner) |
| owner | `reload` | Hot-reload all commands (owner) |
| owner | `setbio` | Change the bot profile status (owner) |
| owner | `setname` | Change the bot display name (owner) |

---

## Architecture notes

- **Auto-loader** — `src/core/loader.js` walks `src/commands/**/*.js` and
  registers anything that exports `{ name, execute }`. Categories are derived
  from the folder name.
- **Routing** — `src/core/handler.js` parses the incoming message, looks up
  the command, runs the rate-limit, calls `cmd.execute(ctx)`, and reacts with
  a `✓` on success. If the message is a `buttonsResponseMessage`,
  `listResponseMessage` or `interactiveResponseMessage`, the selected `id`
  is treated as a command (`{prefix}{id}`) so taps on menus trigger the
  right command.
- **Interactive send** — `src/helpers/messages.js` re-exports
  `sendButtons` and `sendInteractiveMessage` from `baileys_helpers`. They
  automatically inject the `biz`, `interactive`, `native_flow` and (for
  private chats) `bot (biz_bot=1)` binary nodes that WhatsApp expects for
  interactive messages.
- **Formatter** — `src/helpers/formatter.js` is the single source of truth
  for every visual element. Touch this file to re-skin the entire bot.
- **Store** — `src/core/store.js` writes JSON to `src/data/*.json` on every
  update. Simple, but enough for the first edition. Swap it for SQLite when
  you outgrow it.

---

## Research sources

The `research/` folder contains the cloned reference repos we used to
understand the library internals:

- `research/Baileys/` — full clone of the WhiskeySockets Baileys repo.
- `research/baileys_helpers/` — full clone of the mehebub648 helper repo,
  with the enhanced `helpers/buttons.js` and the `export.js` entry point.

You can delete these after reading them — they are not part of the runtime.

---

## License

MIT.

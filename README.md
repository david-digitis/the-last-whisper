# The Last Whisper

**Speak. Translate. Write. All from your keyboard.**

A desktop dictaphone that transcribes locally in ~50ms, translates like DeepL, and writes professional emails — without sending your voice to the cloud.

![Bubble recording](docs/bubble.png)

---

## Why The Last Whisper?

Most voice-to-text tools send your audio to a server, add latency, and charge a subscription. The Last Whisper does everything locally and instantly:

| | The Last Whisper | Cloud STT tools |
|--|--|--|
| **Transcription** | ~50ms, local, private | 1-3s, cloud, recorded |
| **Translation** | Built-in, DeepL-like | Separate app |
| **Email writing** | One click | Copy-paste into ChatGPT |
| **Custom modes** | Fully configurable | Not available |
| **Cost** | Free + your own Gemini key | $10-20/month |

---

## How it works

### 1. Push-to-talk dictation

Hold `Ctrl+Space`, speak, release. Your words appear wherever your cursor is — in any app.

During recording, action buttons slide in. Click one before releasing to process the text through AI:

| Button | What it does |
|--------|-------------|
| *(none)* | Raw transcription, pasted as-is |
| **Abc** | Fix spelling, grammar & punctuation |
| **Trad** | Smart translate (see below) |
| **Mail FR** | Professional French email |
| **Mail EN** | Professional English email |

### 2. AI overlay (double Ctrl+C)

Select text anywhere, hit `Ctrl+C` twice quickly. An overlay pops up with the same action buttons — but applied to your selected text instead of dictation.

![Smart translate](docs/simple-translate-mode.png)

### 3. Smart translate

Works like DeepL: set your **native** and **target** languages in the tray menu. The Trad button figures out the direction automatically.

- You dictate in French? Translated to English.
- You select English text? Translated to French.
- Works with: French, English, German, Spanish, Italian, Portuguese, Dutch.

### 4. Custom action modes

Don't need email buttons? Want a "Summarize" or "Make formal" mode instead? Open the modes editor and create your own — each mode is a label + a Gemini prompt.

![Action modes editor](docs/edit-actions.png)

---

## Dual STT engine

Two models, automatically selected based on recording duration:

| Model | Speed | Best for | Size |
|-------|-------|----------|------|
| **Parakeet TDT v3** | ~50-100ms | Short phrases, quick notes | 464 MB |
| **Whisper Turbo** | ~2-3s | Long dictations, high accuracy | 538 MB |

The threshold is configurable from the tray menu (default: 10s). Short recordings get Parakeet's speed, long recordings get Whisper's accuracy.

![Model manager](docs/model-manager.png)

---

## Everything in the tray

Right-click the system tray icon to access all settings. No config files to edit.

![Tray menu](docs/tray-menu.png)

- Microphone selection
- STT model management
- Action modes editor
- Gemini auto-correction toggle
- Whisper switch threshold
- Native & target language
- Start at login
- Gemini API key

---

## Download

### Windows installer

Download the latest `.exe` from the [Releases](https://github.com/david-digitis/the-last-whisper/releases) page.

- **Setup** (recommended): installs to your user folder, with start-at-login support
- **Portable**: single .exe, no installation needed

### From source

```bash
git clone https://github.com/david-digitis/the-last-whisper.git
cd the-last-whisper
npm install
npx electron .
```

> **Note:** Do not launch from the VS Code integrated terminal — it sets `ELECTRON_RUN_AS_NODE` which breaks Electron. Use PowerShell or Windows Terminal.

### Build from source

```bash
# Windows installer + portable
npm run build:win

# Linux AppImage
npm run build:linux
```

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (for building from source)
- A Gemini API key — free at [aistudio.google.com](https://aistudio.google.com/)

---

## First launch

An onboarding wizard walks you through:

1. **Gemini API key** — paste your key (stored encrypted, never sent anywhere except Google's API)
2. **Microphone** — pick your mic
3. **Shortcuts** — `Ctrl+Space` to dictate, `Ctrl+C C` for AI overlay

STT models are downloaded from the tray menu > STT Models (464-538 MB per model).

---

## Linux

Cross-platform support for Linux (Fedora/Wayland tested). See [LINUX-INSTRUCTIONS.md](LINUX-INSTRUCTIONS.md) for details.

```bash
sudo dnf install libX11-devel libXtst-devel libXinerama-devel ydotool gnome-shell-extension-appindicator
```

---

## Tech stack

| Component | Technology |
|-----------|-----------|
| Framework | Electron 33 |
| STT | sherpa-onnx-node (Parakeet TDT v3 + Whisper Turbo) |
| AI | Gemini 2.5 Flash Lite (REST API) |
| Hotkeys | uiohook-napi |
| Audio | Web Audio API (MediaDevices + ScriptProcessor) |
| Auto-paste | VBScript (Windows) / xdotool (Linux) |
| Config | Electron safeStorage (encrypted) |

Only **2 runtime dependencies**: `sherpa-onnx-node` and `uiohook-napi`.

---

## License

MIT — see [LICENSE](LICENSE).

Built by David at [Digitis](https://digitis.cloud).

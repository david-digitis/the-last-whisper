<h1 align="center">Dikto</h1>

<p align="center">
  <strong>Push-to-talk voice typing with ~50ms local STT, built-in AI translation & rewriting, system-wide overlay.</strong><br>
  <em>All in one app, no cloud needed for dictation.</em>
</p>

<p align="center">
  <a href="https://github.com/david-digitis/dikto/releases"><img src="https://img.shields.io/github/v/release/david-digitis/dikto?style=flat-square&color=f97316" alt="Release"></a>
  <a href="https://github.com/david-digitis/dikto/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-brightgreen?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/STT-100%25%20offline-blueviolet?style=flat-square" alt="STT: 100% offline">
  <img src="https://img.shields.io/badge/dependencies-2%20runtime-lightgrey?style=flat-square" alt="Dependencies: 2 runtime">
</p>

<p align="center">
  <img src="docs/bubble.png" alt="Dikto bubble — oscilloscope and action buttons during dictation" width="500">
</p>

---

## Why Dikto?

You're in any app. You hold `Ctrl+Space`, speak, release. Your words appear at the cursor — corrected, translated, or turned into an email if you want. **~50ms latency**, entirely on your machine.

No window switching. No copy-paste into a separate tool. No audio sent to the cloud.

> *"It's like having Wispr Flow + DeepL + a clipboard manager in a single open-source app."*

---

## Features

### Push-to-talk dictation
Hold `Ctrl+Space`, speak, release. Text appears wherever your cursor is — any text field, any app. Transcription runs 100% locally via [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx). No internet needed.

Two STT engines, automatically selected by recording length:

| Model | Latency | Best for |
|-------|---------|----------|
| **Parakeet TDT v3** | ~50-100ms | Short phrases, quick commands |
| **Whisper Large v3 Turbo** | ~2-3s | Long dictations, higher accuracy |

Threshold is adjustable from the tray (default: 10s). Models are downloaded from the built-in model manager.

### Smart translate (DeepL-like)
Click **Trad** while dictating, or select existing text and double `Ctrl+C`. Dikto detects the language and translates bidirectionally:

- Speak French → get English
- Select English text → get French
- No separate app, no window switching

Supported: French, English, German, Spanish, Italian, Portuguese, Dutch.

### AI actions — correction, emails, custom prompts
During recording, action buttons appear on the bubble. Click one before releasing:

| Button | Effect |
|--------|--------|
| *(none)* | Raw transcription, pasted as-is |
| **Abc** | Fix grammar, spelling & punctuation |
| **Trad** | Smart translate (auto-detect direction) |
| **Mail FR / EN** | Turn dictation into a professional email |
| **Your own** | Custom modes with your own Gemini prompts |

> **Privacy**: your voice never leaves your machine. Only the transcribed text is sent to Gemini when you explicitly click an action button.

### Double Ctrl+C — AI overlay on any text
Select text in **any application**, hit `Ctrl+C` twice quickly (< 400ms). An overlay pops up with the same action buttons — translate, correct, or rewrite existing text without re-typing.

System-wide DeepL + Grammarly + email assistant, activated with a double copy.

### Clipboard manager
`Ctrl+B` opens a searchable clipboard history (text + images). Navigate with arrows, Enter to paste, Escape to close. Up to 100 entries.

### Custom action modes
The defaults (Abc, Mail FR, Mail EN) are just the start. Create your own from the tray menu — each mode is a label + a Gemini prompt. Summarize, formalize, translate to Japanese, fix code comments, anything.

### Everything in the tray
Right-click the tray icon. No config files, no CLI, no settings window.

- Microphone selection
- STT model download & management
- Action modes editor
- Gemini auto-correction toggle
- Whisper switch threshold
- Native/target language
- Gemini API key (stored encrypted via safeStorage)
- Start at login
- Clipboard history settings

---

## Quick start

### 1. Download

Grab the latest from the [Releases page](https://github.com/david-digitis/dikto/releases):

| Platform | Format | Size |
|----------|--------|------|
| Windows | `.exe` portable (no install) | ~76 MB |
| Windows | NSIS installer | ~83 MB |
| Linux | `.AppImage` | ~114 MB |

### 2. Launch

First-launch wizard:
1. Enter your **Gemini API key** (free at [aistudio.google.com](https://aistudio.google.com/)) — stored encrypted
2. Select your **microphone**
3. Review **keyboard shortcuts**

> Dictation works without a Gemini key. You only need one for translation, correction, and AI actions.

### 3. Download an STT model

From the tray, open **STT Models** and download Parakeet TDT v3 (464 MB). Done — you can dictate.

---

## Build from source

**Prerequisites**: [Node.js 18+](https://nodejs.org/)

```bash
git clone https://github.com/david-digitis/dikto.git
cd dikto
npm install
npx electron .
```

> Do **not** launch from the VS Code terminal — it sets `ELECTRON_RUN_AS_NODE`. Use a system terminal.

```bash
# Windows (.exe portable + NSIS installer)
npm run build:win

# Linux (.AppImage)
npm run build:linux
```

### Linux prerequisites (Fedora / Wayland)

```bash
sudo dnf install dotool fuse-libs
sudo systemctl enable --now dotool.service
sudo usermod -aG input $USER   # logout/login required
```

Install the GNOME extension [AppIndicator and KStatusNotifierItem Support](https://extensions.gnome.org/extension/615/appindicator-support/) for the tray icon.

---

## Privacy

| What | Where it goes |
|------|---------------|
| **Your voice & audio** | Nowhere. 100% local via sherpa-onnx. |
| **Transcribed text** | Sent to Gemini **only** when you click an AI action. Raw dictation never touches the network. |
| **API key** | Encrypted via Electron safeStorage. Never logged, never in config files. |

No telemetry. No analytics. No account. Your data stays on your machine.

---

## Tech stack

| Component | Technology |
|-----------|-----------|
| Framework | Electron 33 |
| Local STT | [sherpa-onnx-node](https://github.com/k2-fsa/sherpa-onnx) (Parakeet TDT v3 + Whisper Turbo) |
| AI processing | [Gemini 2.5 Flash Lite](https://ai.google.dev/) (optional, cloud) |
| System hotkeys | uiohook-napi (Windows) / evdev (Linux/Wayland) |
| Auto-paste | VBScript (Windows) / dotool (Linux/Wayland) |

**2 runtime dependencies.** No Python, no Docker, no local LLM server.

---

## Competitive landscape

No other open-source tool combines all of this:

| | Dikto | Freeflow | Amical | Tambourine |
|---|:---:|:---:|:---:|:---:|
| 100% local STT | Yes | Yes | Yes | Yes |
| Built-in translation | Yes | No | No | No |
| AI overlay on any text | Yes | No | No | No |
| Clipboard manager | Yes | No | No | No |
| Custom AI prompts | Yes | No | Partial | Partial |
| Windows + Linux | Yes | macOS | Windows | Windows |
| Linux/Wayland | Yes | No | No | No |

---

## Roadmap

- [ ] macOS support
- [ ] GPU acceleration for STT (CUDA / Metal)
- [ ] More STT models (multilingual, specialized)
- [ ] Ollama / local LLM as alternative to Gemini
- [ ] Plugin system for custom actions
- [ ] Dictation history with search
- [ ] Voice commands ("correct that", "translate this")
- [ ] Auto-update mechanism

Have an idea? [Open an issue](https://github.com/david-digitis/dikto/issues).

---

## Contributing

Contributions welcome — bug fixes, features, docs.

1. Fork the repo
2. Create a feature branch
3. Test on your platform (Windows or Linux)
4. Open a PR

**Guidelines**: plain JavaScript, no frameworks in the renderer, no heavy deps (the app has 2 runtime deps — keep it that way). Privacy first — audio never leaves the machine.

---

## Credits

- **[sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)** by k2-fsa — blazing-fast local STT engine
- **[NVIDIA Parakeet TDT](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2)** — the ~50ms model
- **[OpenAI Whisper](https://github.com/openai/whisper)** — accuracy benchmark for longer dictations
- **[Google Gemini](https://ai.google.dev/)** — AI processing for translation, correction, custom actions
- **[Electron](https://www.electronjs.org/)** — cross-platform desktop framework
- **[uiohook-napi](https://github.com/SergioRt1/uiohook-napi)** — native system-wide hotkeys

---

## License

MIT — [LICENSE](LICENSE)

Built by David at [Digitis](https://digitis.cloud).

---

<p align="center">
  <em>If Dikto saves you time, a star on GitHub helps others discover it.</em>
</p>

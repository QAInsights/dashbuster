# DashBuster

A Chrome Manifest V3 extension that finds and replaces em dashes on any web page with style.

## Features

- **Toggle ON/OFF** 
- **Live Counter** 
- **Badge Counter**
- **Per-Site Tracking** 
- **Dynamic Content** 
- **Multiple Replacements** 
  - Hyphen (-)
  - Space
  - Robot emoji (🤖)
  - Poop emoji (💩)
- **Restore Originals** 
- **Persistent State** 

## How it Works

When enabled, DashBuster scans the page for em dash characters (Unicode U+2014) and replaces them with your chosen character. It stores the original text values in a Map, so when you disable it, the page is restored precisely no string-reverse guessing.

## Testing

Unit and end-to-end tests follow Chrome Web Store best practices.

```bash
npm install
npm test              # run all tests
npm run test:unit     # unit + manifest + performance tests only
npm run test:e2e      # Puppeteer end-to-end tests
npm run test:watch    # watch mode
```

| Test File | Coverage |
|-----------|----------|
| `tests/manifest.test.js` | Manifest V3 validation, required fields, icon existence, permission audit |
| `tests/unit/content.test.js` | Em dash counting, text node replacement / restoration, MutationObserver safety |
| `tests/unit/popup.test.js` | Toggle state, radio selection, storage sync, counter updates |
| `tests/unit/background.test.js` | Badge text updates, badge color, tab reload clearing |
| `tests/performance.test.js` | No `unload` handlers, no WebSocket/WebRTC, no `eval`, no `characterData` observer, CSP compliance |
| `tests/e2e/extension.e2e.test.js` | Extension loads without errors, popup renders, dynamic content stability, SPA mutation handling |

## Install

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select this folder
5. Pin DashBuster to your toolbar

## License

MIT

---

[QAInsights](https://qainsights.com) - [Support](https://buymeacoffee.com/qainsights) - [ai.dosa.dev](https://ai.dosa.dev)

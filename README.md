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

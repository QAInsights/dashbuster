/**
 * Performance & security tests per Chrome Web Store best practices.
 */

const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..');

function readSrc(filename) {
  return fs.readFileSync(path.join(base, filename), 'utf8');
}

describe('Performance best practices', () => {
  test('content.js does NOT use unload event listener (prevents bfcache invalidation)', () => {
    const src = readSrc('content.js');
    expect(src).not.toMatch(/addEventListener\s*\(\s*['"]unload['"]/);
    expect(src).not.toMatch(/onunload/);
  });

  test('content.js does NOT use WebSocket or WebRTC (prevents bfcache invalidation)', () => {
    const src = readSrc('content.js');
    expect(src).not.toContain('WebSocket');
    expect(src).not.toContain('WebRTC');
    expect(src).not.toContain('RTCPeerConnection');
  });

  test('content.js does NOT observe characterData (prevents infinite loops on React sites)', () => {
    const src = readSrc('content.js');
    expect(src).not.toContain('characterData: true');
  });

  test('content.js uses childList + subtree only for MutationObserver', () => {
    const src = readSrc('content.js');
    expect(src).toContain('childList: true');
    expect(src).toContain('subtree: true');
  });

  test('content.js has isProcessing guard to prevent re-entrant mutation handling', () => {
    const src = readSrc('content.js');
    expect(src).toContain('isProcessing');
    // Should check flag at entry and set/reset it
    expect(src).toMatch(/if\s*\(\s*!isEnabled\s*\|\|\s*isProcessing\s*\)/);
  });

  test('content.js uses requestIdleCallback or setTimeout for delayed initial scan', () => {
    const src = readSrc('content.js');
    expect(src).toContain('requestIdleCallback');
  });

  test('content.js cancels animation frame on disable / reset', () => {
    const src = readSrc('content.js');
    expect(src).toContain('cancelAnimationFrame');
  });

  test('content.js disconnects MutationObserver on disable', () => {
    const src = readSrc('content.js');
    expect(src).toContain('observer.disconnect');
  });

  test('content.js resets count and map on URL change (per-site counting)', () => {
    const src = readSrc('content.js');
    expect(src).toContain('resetForNewPage');
    expect(src).toContain('originalMap.clear');
  });

  test('no eval or Function constructor in any script (security)', () => {
    const files = ['content.js', 'popup.js', 'background.js'];
    files.forEach((f) => {
      const src = readSrc(f);
      expect(src).not.toContain('eval(');
      expect(src).not.toMatch(/new\s+Function\s*\(/);
    });
  });

  test('no inline event handlers in HTML (CSP compliance)', () => {
    const html = readSrc('popup.html');
    expect(html).not.toMatch(/on\w+\s*=/); // no onload=, onclick=, etc.
  });

  test('no hardcoded secrets or API keys in source files', () => {
    const files = ['content.js', 'popup.js', 'background.js', 'manifest.json'];
    const keyPatterns = [/api[_-]?key/i, /secret/i, /token/i, /password/i];
    files.forEach((f) => {
      const src = readSrc(f);
      keyPatterns.forEach((pat) => {
        expect(src).not.toMatch(pat);
      });
    });
  });
});

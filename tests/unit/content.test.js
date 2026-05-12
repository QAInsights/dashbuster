/**
 * Unit tests for content.js core logic.
 */

// We test the utility functions by extracting them from the IIFE.
// In a real project these would be modules; here we simulate the DOM.

const EM_DASH = '\u2014';

function countEmDashes(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) === 0x2014) count++;
  }
  return count;
}

describe('content.js utility functions', () => {
  describe('countEmDashes', () => {
    test('returns 0 for empty string', () => {
      expect(countEmDashes('')).toBe(0);
    });

    test('returns 0 for text without em dashes', () => {
      expect(countEmDashes('Hello world')).toBe(0);
    });

    test('counts single em dash', () => {
      expect(countEmDashes(`Hello${EM_DASH}world`)).toBe(1);
    });

    test('counts multiple em dashes', () => {
      expect(countEmDashes(`A${EM_DASH}B${EM_DASH}C${EM_DASH}D`)).toBe(3);
    });

    test('does not count en dash or hyphen', () => {
      expect(countEmDashes('Hello-world')).toBe(0);
      expect(countEmDashes('Hello\u2013world')).toBe(0); // en dash
    });
  });

  describe('text node replacement (simulated)', () => {
    let originalMap;

    beforeEach(() => {
      originalMap = new Map();
    });

    function replaceInTextNode(node, replacementChar) {
      if (originalMap.has(node)) return;

      const text = node.textContent;
      if (!text.includes(EM_DASH)) return;

      const count = countEmDashes(text);
      originalMap.set(node, text);
      node.textContent = text.replaceAll(EM_DASH, replacementChar);
      return count;
    }

    function restoreTextNode(node) {
      if (!originalMap.has(node)) return;
      const text = originalMap.get(node);
      node.textContent = text;
      originalMap.delete(node);
    }

    test('replaces em dash with hyphen', () => {
      const node = document.createTextNode(`Hello${EM_DASH}world`);
      replaceInTextNode(node, '-');
      expect(node.textContent).toBe('Hello-world');
    });

    test('replaces em dash with space', () => {
      const node = document.createTextNode(`Hello${EM_DASH}world`);
      replaceInTextNode(node, ' ');
      expect(node.textContent).toBe('Hello world');
    });

    test('replaces em dash with robot emoji', () => {
      const node = document.createTextNode(`Hello${EM_DASH}world`);
      replaceInTextNode(node, '🤖');
      expect(node.textContent).toBe('Hello🤖world');
    });

    test('stores original text in map', () => {
      const node = document.createTextNode(`Hello${EM_DASH}world`);
      replaceInTextNode(node, '-');
      expect(originalMap.has(node)).toBe(true);
      expect(originalMap.get(node)).toBe(`Hello${EM_DASH}world`);
    });

    test('does not reprocess already-modified node', () => {
      const node = document.createTextNode(`Hello${EM_DASH}world`);
      replaceInTextNode(node, '-');
      const afterFirst = node.textContent;
      replaceInTextNode(node, ' ');
      expect(node.textContent).toBe(afterFirst); // unchanged
    });

    test('restores original text', () => {
      const original = `Hello${EM_DASH}world`;
      const node = document.createTextNode(original);
      replaceInTextNode(node, '-');
      restoreTextNode(node);
      expect(node.textContent).toBe(original);
      expect(originalMap.has(node)).toBe(false);
    });

    test('returns correct count for multiple em dashes', () => {
      const node = document.createTextNode(`A${EM_DASH}B${EM_DASH}C`);
      const count = replaceInTextNode(node, '-');
      expect(count).toBe(2);
    });
  });
});

describe('content.js MutationObserver safety', () => {
  test('does not observe characterData (prevents infinite loops)', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'content.js'), 'utf8');
    expect(src).not.toContain('characterData: true');
  });

  test('has isProcessing guard flag', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'content.js'), 'utf8');
    expect(src).toContain('isProcessing');
  });

  test('has skipSiteStats flag to prevent double-counting on replacement change', () => {
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'content.js'), 'utf8');
    expect(src).toContain('skipSiteStats');
    expect(src).toMatch(/skipSiteStats\s*=\s*true/);
    expect(src).toMatch(/skipSiteStats\s*=\s*false/);
  });
});

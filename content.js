(() => {
  'use strict';

  if (window.__emDashReplacerLoaded) return;
  window.__emDashReplacerLoaded = true;

  const STORAGE_KEY = 'emDashReplacer';
  const EM_DASH = '\u2014';

  const originalMap = new Map();

  let isEnabled = false;
  let replacement = '-';
  let observer = null;
  let replacedCount = 0;
  let broadcastTimeout = null;
  let scanRaf = null;
  let isProcessing = false;
  let currentUrl = location.href;
  let titleObserver = null;

  function getReplacementChar() {
    return replacement;
  }

  function countEmDashes(text) {
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 0x2014) count++;
    }
    return count;
  }

  function broadcastCount() {
    if (broadcastTimeout) return;
    broadcastTimeout = setTimeout(() => {
      broadcastTimeout = null;
      try {
        chrome.runtime.sendMessage({ action: 'countUpdate', count: replacedCount });
      } catch (e) {
        // Extension context invalidated
      }
    }, 100);
  }

  function replaceInTextNode(node) {
    if (originalMap.has(node)) return;

    const text = node.textContent;
    if (!text.includes(EM_DASH)) return;

    const count = countEmDashes(text);
    originalMap.set(node, text);
    node.textContent = text.replaceAll(EM_DASH, getReplacementChar());
    replacedCount += count;
    broadcastCount();
  }

  function restoreTextNode(node) {
    if (!originalMap.has(node)) return;
    const text = originalMap.get(node);
    replacedCount -= countEmDashes(text);
    node.textContent = text;
    originalMap.delete(node);
    broadcastCount();
  }

  function replaceInInput(element) {
    if (originalMap.has(element)) return;

    const value = element.value;
    if (!value.includes(EM_DASH)) return;

    const count = countEmDashes(value);
    originalMap.set(element, value);
    element.value = value.replaceAll(EM_DASH, getReplacementChar());
    replacedCount += count;
    broadcastCount();
  }

  function restoreInput(element) {
    if (!originalMap.has(element)) return;
    const value = originalMap.get(element);
    replacedCount -= countEmDashes(value);
    element.value = value;
    originalMap.delete(element);
    broadcastCount();
  }

  function processNode(node) {
    if (!isEnabled) return;

    if (node.nodeType === Node.TEXT_NODE) {
      replaceInTextNode(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        replaceInInput(node);
      } else {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        let textNode;
        while ((textNode = walker.nextNode()) !== null) {
          replaceInTextNode(textNode);
        }
      }
    }
  }

  function scanDocument() {
    if (!isEnabled) return;

    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    while ((textNode = walker.nextNode()) !== null) {
      if (textNode.textContent.includes(EM_DASH)) {
        textNodes.push(textNode);
      }
    }

    document.querySelectorAll('input, textarea').forEach(replaceInInput);
    chunkedScan(textNodes, 0);
  }

  function restoreDocument() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    while ((textNode = walker.nextNode()) !== null) {
      restoreTextNode(textNode);
    }

    document.querySelectorAll('input, textarea').forEach(restoreInput);

    originalMap.clear();
    replacedCount = 0;
    broadcastCount();
  }

  function handleMutations(mutations) {
    if (!isEnabled || isProcessing) return;

    isProcessing = true;
    try {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            processNode(node);
          }
        }
      }
    } finally {
      isProcessing = false;
    }
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function chunkedScan(nodes, index) {
    const chunkSize = 50;
    const end = Math.min(index + chunkSize, nodes.length);
    for (let i = index; i < end; i++) {
      replaceInTextNode(nodes[i]);
    }
    if (end < nodes.length) {
      scanRaf = requestAnimationFrame(() => chunkedScan(nodes, end));
    } else {
      scanRaf = null;
    }
  }

  function performScan() {
    if (!isEnabled) return;

    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    while ((textNode = walker.nextNode()) !== null) {
      if (textNode.textContent.includes(EM_DASH)) {
        textNodes.push(textNode);
      }
    }

    document.querySelectorAll('input, textarea').forEach(replaceInInput);
    chunkedScan(textNodes, 0);
  }

  function resetForNewPage() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (scanRaf) {
      cancelAnimationFrame(scanRaf);
      scanRaf = null;
    }
    originalMap.clear();
    replacedCount = 0;
    broadcastCount();
    currentUrl = location.href;
  }

  function enable(replacementChar) {
    if (isEnabled && replacement === replacementChar && currentUrl === location.href) return;

    if (currentUrl !== location.href) {
      resetForNewPage();
    }

    if (isEnabled && replacement !== replacementChar) {
      restoreDocument();
    }

    isEnabled = true;
    replacement = replacementChar;
    currentUrl = location.href;

    if (scanRaf) {
      cancelAnimationFrame(scanRaf);
      scanRaf = null;
    }

    performScan();
    startObserver();
    startUrlTracking();
  }

  function disable() {
    if (!isEnabled) return;
    isEnabled = false;
    stopObserver();
    if (scanRaf) {
      cancelAnimationFrame(scanRaf);
      scanRaf = null;
    }
    restoreDocument();
  }

  function startUrlTracking() {
    if (titleObserver) return;
    titleObserver = new MutationObserver(() => {
      if (location.href !== currentUrl) {
        resetForNewPage();
      }
    });
    titleObserver.observe(document.querySelector('title') || document.head, { childList: true });

    window.addEventListener('popstate', () => {
      if (location.href !== currentUrl) {
        resetForNewPage();
      }
    });
    window.addEventListener('hashchange', () => {
      if (location.href !== currentUrl) {
        resetForNewPage();
      }
    });
  }

  function init() {
    if (!document.body) return;
    try {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error('EmDashReplacer:', chrome.runtime.lastError);
          return;
        }
        const state = result[STORAGE_KEY];
        if (state && state.enabled) {
          const replacementChar = state.replacement || '-';
          // Delay scan until page is idle to avoid interfering with hydration
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => enable(replacementChar), { timeout: 2000 });
          } else {
            setTimeout(() => enable(replacementChar), 1500);
          }
        }
      });
    } catch (e) {
      console.error('EmDashReplacer init failed:', e);
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'enable') {
      enable(request.replacement || '-');
      sendResponse({ success: true, count: replacedCount });
    } else if (request.action === 'disable') {
      disable();
      sendResponse({ success: true, count: 0 });
    } else if (request.action === 'getState') {
      sendResponse({ enabled: isEnabled, replacement, count: replacedCount });
    } else if (request.action === 'getCount') {
      sendResponse({ count: replacedCount });
    }
    return true;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

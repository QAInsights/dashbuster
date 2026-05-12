/**
 * Unit tests for background.js service worker.
 */

describe('background.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('countUpdate updates badge text with count', () => {
    const handler = jest.fn((request, sender, sendResponse) => {
      if (request.action === 'countUpdate' && sender.tab?.id) {
        const text = request.count > 0 ? String(request.count) : '';
        chrome.action.setBadgeText({ text, tabId: sender.tab.id });
      }
      return true;
    });

    const sender = { tab: { id: 123 } };
    handler({ action: 'countUpdate', count: 5 }, sender, jest.fn());

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '5',
      tabId: 123
    });
  });

  test('countUpdate clears badge when count is zero', () => {
    const handler = jest.fn((request, sender, sendResponse) => {
      if (request.action === 'countUpdate' && sender.tab?.id) {
        const text = request.count > 0 ? String(request.count) : '';
        chrome.action.setBadgeText({ text, tabId: sender.tab.id });
      }
      return true;
    });

    const sender = { tab: { id: 123 } };
    handler({ action: 'countUpdate', count: 0 }, sender, jest.fn());

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 123
    });
  });

  test('onUpdated clears badge when page starts loading', () => {
    const handler = jest.fn((tabId, changeInfo) => {
      if (changeInfo.status === 'loading') {
        chrome.action.setBadgeText({ text: '', tabId });
      }
    });

    handler(123, { status: 'loading' });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 123
    });
  });

  test('badge background color is set to teal', () => {
    const handler = jest.fn((request, sender) => {
      if (request.action === 'countUpdate' && sender.tab?.id) {
        chrome.action.setBadgeBackgroundColor({ color: '#0d9488' });
      }
      return true;
    });

    handler({ action: 'countUpdate', count: 1 }, { tab: { id: 1 } }, jest.fn());

    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#0d9488'
    });
  });
});

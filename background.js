chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'countUpdate' && sender.tab?.id) {
    const text = request.count > 0 ? String(request.count) : '';
    chrome.action.setBadgeText({ text, tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#0d9488' });
  }
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

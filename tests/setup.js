/**
 * Jest setup: global mocks for Chrome Extension APIs.
 * @jest-environment jsdom
 */

// --- chrome.storage mock ---
const storageData = {};
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        const result = {};
        keys.forEach((k) => {
          result[k] = storageData[k];
        });
        callback(result);
      }),
      set: jest.fn((data, callback) => {
        Object.assign(storageData, data);
        if (callback) callback();
      })
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    lastError: null
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    onUpdated: {
      addListener: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  }
};

// Reset storage before each test
beforeEach(() => {
  Object.keys(storageData).forEach((k) => delete storageData[k]);
  jest.clearAllMocks();
});

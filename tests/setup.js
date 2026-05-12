/**
 * Jest setup: global mocks for Chrome Extension APIs.
 * @jest-environment jsdom
 */

// --- chrome.storage mock ---
const storageData = {};
const localStorageData = {};
const storageListeners = [];
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
    },
    local: {
      get: jest.fn((keys, callback) => {
        const result = {};
        keys.forEach((k) => {
          result[k] = localStorageData[k];
        });
        callback(result);
      }),
      set: jest.fn((data, callback) => {
        Object.assign(localStorageData, data);
        if (callback) callback();
      })
    },
    onChanged: {
      addListener: jest.fn((fn) => storageListeners.push(fn)),
      removeListener: jest.fn((fn) => {
        const idx = storageListeners.indexOf(fn);
        if (idx !== -1) storageListeners.splice(idx, 1);
      }),
      _trigger: (changes) => storageListeners.forEach((fn) => fn(changes))
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
  Object.keys(localStorageData).forEach((k) => delete localStorageData[k]);
  storageListeners.length = 0;
  jest.clearAllMocks();
});

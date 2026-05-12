document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');
  const counterEl = document.getElementById('counter');
  const radios = document.querySelectorAll('input[name="replacement"]');
  const STORAGE_KEY = 'emDashReplacer';

  function getSelectedReplacement() {
    for (const radio of radios) {
      if (radio.checked) return radio.value;
    }
    return '-';
  }

  function updateStatus(enabled) {
    status.textContent = enabled ? 'ON' : 'OFF';
    status.className = 'status ' + (enabled ? 'on' : 'off');
    counterEl.style.color = enabled ? '#0d9488' : '#a0aec0';
  }

  function updateCounter(value) {
    const newValue = String(value);
    if (counterEl.textContent !== newValue) {
      counterEl.textContent = newValue;
      counterEl.classList.add('bump');
      setTimeout(() => counterEl.classList.remove('bump'), 200);
    }
  }

  function saveState(enabled, replacement) {
    chrome.storage.sync.set({
      [STORAGE_KEY]: { enabled, replacement }
    });
  }

  function sendMessageToActiveTab(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Could not message tab:', chrome.runtime.lastError.message);
            return;
          }
          if (callback) callback(response);
        });
      }
    });
  }

  function requestCount() {
    sendMessageToActiveTab({ action: 'getCount' }, (response) => {
      if (response && typeof response.count === 'number') {
        updateCounter(response.count);
      }
    });
  }

  // Poll for real-time count updates while popup is open
  const countInterval = setInterval(() => {
    requestCount();
  }, 250);

  // Listen for real-time count updates from background/content
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'countUpdate') {
      updateCounter(request.count);
    }
  });

  chrome.storage.sync.get([STORAGE_KEY], (result) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    const state = result[STORAGE_KEY] || { enabled: false, replacement: '-' };
    toggle.checked = state.enabled;
    updateStatus(state.enabled);

    for (const radio of radios) {
      radio.checked = (radio.value === state.replacement);
    }

    requestCount();
  });

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    const replacement = getSelectedReplacement();
    updateStatus(enabled);
    saveState(enabled, replacement);

    if (enabled) {
      sendMessageToActiveTab({ action: 'enable', replacement }, (response) => {
        if (response && typeof response.count === 'number') {
          updateCounter(response.count);
        }
      });
    } else {
      sendMessageToActiveTab({ action: 'disable' }, (response) => {
        if (response && typeof response.count === 'number') {
          updateCounter(response.count);
        }
      });
    }
  });

  for (const radio of radios) {
    radio.addEventListener('change', () => {
      if (!toggle.checked) return;

      const replacement = getSelectedReplacement();
      saveState(true, replacement);
      sendMessageToActiveTab({ action: 'enable', replacement }, (response) => {
        if (response && typeof response.count === 'number') {
          updateCounter(response.count);
        }
      });
    });
  }
});

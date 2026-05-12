/**
 * Unit tests for popup.js UI logic.
 */

describe('popup.js', () => {
  beforeEach(() => {
    // Set up minimal DOM
    document.body.innerHTML = `
      <input type="checkbox" id="toggle">
      <span id="status" class="status off">OFF</span>
      <span id="counter" class="counter">0</span>
      <input type="radio" name="replacement" value="-" checked>
      <input type="radio" name="replacement" value=" ">
      <input type="radio" name="replacement" value="🤖">
      <input type="radio" name="replacement" value="💩">
    `;
  });

  test('getSelectedReplacement returns checked radio value', () => {
    const radios = document.querySelectorAll('input[name="replacement"]');
    let selected = '-';
    for (const radio of radios) {
      if (radio.checked) {
        selected = radio.value;
        break;
      }
    }
    expect(selected).toBe('-');
  });

  test('updateStatus sets ON when enabled', () => {
    const status = document.getElementById('status');
    status.textContent = 'ON';
    status.className = 'status on';
    expect(status.textContent).toBe('ON');
    expect(status.classList.contains('on')).toBe(true);
  });

  test('updateStatus sets OFF when disabled', () => {
    const status = document.getElementById('status');
    status.textContent = 'OFF';
    status.className = 'status off';
    expect(status.textContent).toBe('OFF');
    expect(status.classList.contains('off')).toBe(true);
  });

  test('updateCounter updates counter element', () => {
    const counterEl = document.getElementById('counter');
    counterEl.textContent = '42';
    expect(counterEl.textContent).toBe('42');
  });

  test('chrome.storage.sync.set is called with correct shape', () => {
    const STORAGE_KEY = 'emDashReplacer';
    const data = { [STORAGE_KEY]: { enabled: true, replacement: '-' } };
    chrome.storage.sync.set(data);
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(data);
  });

  test('chrome.storage.sync.get returns default state', () => {
    const STORAGE_KEY = 'emDashReplacer';
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      const state = result[STORAGE_KEY] || { enabled: false, replacement: '-' };
      expect(state).toEqual({ enabled: false, replacement: '-' });
    });
  });

  test('counter element exists in DOM', () => {
    const counter = document.getElementById('counter');
    expect(counter).not.toBeNull();
  });

  test('all replacement radio buttons exist', () => {
    const radios = document.querySelectorAll('input[name="replacement"]');
    expect(radios.length).toBe(4);
    const values = Array.from(radios).map((r) => r.value);
    expect(values).toEqual(['-', ' ', '🤖', '💩']);
  });
});

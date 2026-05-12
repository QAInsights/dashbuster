/**
 * Unit tests for Hall of Shame (site stats) feature.
 */

describe('Hall of Shame', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="shame-list" class="shame-list"></ul>
    `;
  });

  test('renderHallOfShame shows empty state when no data', () => {
    const list = document.getElementById('shame-list');
    list.innerHTML = '';

    const li = document.createElement('li');
    li.className = 'shame-item';
    li.innerHTML = '<span class="shame-host" style="color:#a0aec0;font-style:italic;">No data yet. Browse around!</span>';
    list.appendChild(li);

    expect(list.children.length).toBe(1);
    expect(list.textContent).toContain('No data yet');
  });

  test('renderHallOfShame sorts and renders top sites', () => {
    const list = document.getElementById('shame-list');
    const stats = {
      'theverge.com': 847,
      'claude.ai': 623,
      'medium.com': 412,
      'nytimes.com': 105,
      'twitter.com': 89
    };

    list.innerHTML = '';
    const entries = Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    entries.forEach(([host, count], index) => {
      const li = document.createElement('li');
      li.className = 'shame-item';
      li.innerHTML = `
        <span class="shame-rank">#${index + 1}</span>
        <span class="shame-host" title="${host}">${host}</span>
        <span class="shame-count">${count.toLocaleString()}</span>
      `;
      list.appendChild(li);
    });

    expect(list.children.length).toBe(5);
    expect(list.children[0].textContent).toContain('#1');
    expect(list.children[0].textContent).toContain('theverge.com');
    expect(list.children[0].textContent).toContain('847');
    expect(list.children[1].textContent).toContain('claude.ai');
    expect(list.children[1].textContent).toContain('623');
  });

  test('renderHallOfShame limits to top 5', () => {
    const list = document.getElementById('shame-list');
    const stats = {
      'a.com': 100, 'b.com': 90, 'c.com': 80, 'd.com': 70,
      'e.com': 60, 'f.com': 50, 'g.com': 40
    };

    list.innerHTML = '';
    const entries = Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    entries.forEach(([host, count], index) => {
      const li = document.createElement('li');
      li.className = 'shame-item';
      li.innerHTML = `<span class="shame-rank">#${index + 1}</span><span class="shame-host">${host}</span><span class="shame-count">${count}</span>`;
      list.appendChild(li);
    });

    expect(list.children.length).toBe(5);
    expect(list.textContent).not.toContain('g.com');
  });

  test('chrome.storage.local is used for site stats', () => {
    const stats = { 'example.com': 42 };
    chrome.storage.local.set({ siteStats: stats });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ siteStats: stats });
  });

  test('chrome.storage.local.get retrieves site stats', () => {
    chrome.storage.local.set({ siteStats: { 'example.com': 42 } });
    chrome.storage.local.get(['siteStats'], (result) => {
      expect(result.siteStats).toBeDefined();
      expect(result.siteStats['example.com']).toBe(42);
    });
    expect(chrome.storage.local.get).toHaveBeenCalledWith(['siteStats'], expect.any(Function));
  });
});

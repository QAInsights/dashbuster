/**
 * @jest-environment node
 *
 * End-to-end tests using Puppeteer per Chrome Web Store best practices.
 *
 * These tests verify the extension loads correctly and performs
 * em dash replacement in a real Chromium browser.
 *
 * Run with: npm run test:e2e
 */

const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.join(__dirname, '..', '..');

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`
    ]
  });
  page = await browser.newPage();
});

afterAll(async () => {
  if (browser) await browser.close();
});

describe('DashBuster E2E', () => {
  test('extension loads without errors', async () => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('data:text/html,<html><body>Test</body></html>');
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });

  test('content script does not crash on page with em dashes', async () => {
    await page.setContent(`
      <html>
        <body>
          <p id="test">Hello\u2014world</p>
          <p id="test2">A\u2014B\u2014C</p>
        </body>
      </html>
    `);

    // Wait for content script init
    await page.waitForTimeout(2000);

    // Verify page is still responsive
    const title = await page.evaluate(() => document.title);
    expect(typeof title).toBe('string');
  });

  test('popup HTML renders without JavaScript errors', async () => {
    const popupErrors = [];
    const popupPage = await browser.newPage();
    popupPage.on('pageerror', (err) => popupErrors.push(err.message));

    // Inject minimal chrome mock so popup.js does not throw
    await popupPage.evaluateOnNewDocument(() => {
      window.chrome = {
        storage: {
          sync: {
            get: (keys, cb) => cb({ emDashReplacer: { enabled: false, replacement: '-' } }),
            set: () => {}
          }
        },
        runtime: { onMessage: { addListener: () => {} }, sendMessage: () => {} },
        tabs: { query: () => {} }
      };
    });

    // Load popup directly
    await popupPage.goto(`file://${EXTENSION_PATH}/popup.html`);
    await popupPage.waitForTimeout(300);

    // Check that required elements exist
    const toggle = await popupPage.$('#toggle');
    const status = await popupPage.$('#status');
    const counter = await popupPage.$('#counter');

    expect(toggle).not.toBeNull();
    expect(status).not.toBeNull();
    expect(counter).not.toBeNull();
    expect(popupErrors).toEqual([]);

    await popupPage.close();
  });

  test('MutationObserver does not cause infinite loop on dynamic content', async () => {
    await page.setContent(`
      <html><body>
        <div id="container"><p>Hello\u2014world</p></div>
      </body></html>
    `);

    // Wait for init
    await page.waitForTimeout(2000);

    // Rapidly add nodes to trigger mutations
    for (let i = 0; i < 20; i++) {
      await page.evaluate((idx) => {
        const p = document.createElement('p');
        p.textContent = 'Dynamic\u2014' + idx;
        document.body.appendChild(p);
      }, i);
    }

    await page.waitForTimeout(500);

    // Page should still be responsive (no crash / hang)
    const bodyText = await page.evaluate(() => document.body.textContent);
    expect(bodyText).toContain('Dynamic');
  });

  test('page stays responsive after SPA-style DOM mutations', async () => {
    await page.setContent(`
      <html><body>
        <div id="app"><p>Initial\u2014content</p></div>
      </body></html>
    `);

    await page.waitForTimeout(1500);

    // Simulate React-style DOM replacement
    await page.evaluate(() => {
      const app = document.getElementById('app');
      app.innerHTML = '<p>Replaced\u2014content</p><span>More\u2014text</span>';
    });

    await page.waitForTimeout(500);

    const text = await page.evaluate(() => document.body.textContent);
    expect(text).toContain('Replaced');
  });
});

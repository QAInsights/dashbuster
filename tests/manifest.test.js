/**
 * Manifest validation tests per Chrome Web Store best practices.
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'manifest.json');

function loadManifest() {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw);
}

describe('Manifest validation', () => {
  let manifest;

  beforeAll(() => {
    manifest = loadManifest();
  });

  test('is valid JSON', () => {
    expect(() => loadManifest()).not.toThrow();
  });

  test('uses Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  test('has required fields', () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.version).toBeTruthy();
    expect(manifest.description).toBeTruthy();
  });

  test('name is <= 75 characters', () => {
    expect(manifest.name.length).toBeLessThanOrEqual(75);
  });

  test('description is <= 132 characters', () => {
    expect(manifest.description.length).toBeLessThanOrEqual(132);
  });

  test('has background service_worker (MV3 requirement)', () => {
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBeTruthy();
  });

  test('has action with default_popup and default_icon', () => {
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_popup).toBe('popup.html');
    expect(manifest.action.default_icon).toBeDefined();
  });

  test('has icons in all required sizes', () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBeTruthy();
    expect(manifest.icons['48']).toBeTruthy();
    expect(manifest.icons['128']).toBeTruthy();
  });

  test('icon files exist', () => {
    const base = path.join(__dirname, '..');
    expect(fs.existsSync(path.join(base, manifest.icons['16']))).toBe(true);
    expect(fs.existsSync(path.join(base, manifest.icons['48']))).toBe(true);
    expect(fs.existsSync(path.join(base, manifest.icons['128']))).toBe(true);
  });

  test('has content_scripts with correct run_at', () => {
    expect(Array.isArray(manifest.content_scripts)).toBe(true);
    expect(manifest.content_scripts[0].js).toContain('content.js');
    expect(manifest.content_scripts[0].run_at).toBe('document_end');
  });

  test('permissions are minimal and valid', () => {
    const allowed = ['activeTab', 'storage'];
    manifest.permissions.forEach((p) => {
      expect(allowed).toContain(p);
    });
  });

  test('no forbidden permissions (host, <all_urls> in permissions)', () => {
    const forbiddenPatterns = ['<all_urls>', '*://', 'http', 'https'];
    manifest.permissions.forEach((p) => {
      forbiddenPatterns.forEach((pat) => {
        expect(p).not.toContain(pat);
      });
    });
  });

  test('no content_security_policy that allows unsafe-inline', () => {
    if (manifest.content_security_policy) {
      const csp = JSON.stringify(manifest.content_security_policy);
      expect(csp).not.toContain('unsafe-inline');
      expect(csp).not.toContain('unsafe-eval');
    }
  });

  test('no web_accessible_resources without justification', () => {
    // Extension has no web_accessible_resources -- good for security
    expect(manifest.web_accessible_resources).toBeUndefined();
  });
});

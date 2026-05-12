# Privacy Policy for DashBuster

**Effective Date:** May 12, 2026

## Overview

DashBuster ("we", "our", or "the extension") is a browser extension that replaces em dashes with user-selected characters on web pages. This Privacy Policy explains how we handle data when you use our extension.

## Data We Collect

### User Preferences
- **What:** Whether the extension is enabled and your chosen replacement character (hyphen, en dash, or tilde)
- **Where stored:** Chrome's synchronized storage (`chrome.storage.sync`)
- **Why:** To maintain your settings across devices and browser sessions
- **Retention:** Until you uninstall the extension or clear browser data

### Site Statistics
- **What:** Anonymous count of em dashes replaced per domain (e.g., `example.com: 42`)
- **Where stored:** Local browser storage only (`chrome.storage.local`)
- **Why:** To display the "Hall of Shame" feature showing which sites use em dashes most frequently
- **Retention:** Until you uninstall the extension or clear browser data

## Data We Do NOT Collect

We explicitly do **not** collect:
- Personal identifying information (name, email, address, etc.)
- Browsing history or URLs you visit
- Page content, text, or any data from websites
- Login credentials or form data
- IP addresses or location data
- Any data transmitted to external servers

## How Data is Processed

### Local Processing Only
All text processing occurs locally within your browser. The extension:
1. Scans page text only when you explicitly enable the extension
2. Replaces em dashes with your chosen character in real-time
3. Stores only the replacement count per domain locally
4. Never transmits any data to external servers

### No External Communication
- No analytics or tracking scripts
- No third-party API calls
- No data synchronization to external servers
- No cookies or fingerprinting

## Your Rights

You can:
- **View your data:** Open the extension popup to see site statistics
- **Delete your data:** Uninstall the extension or clear browser storage
- **Disable data collection:** Turn off the extension; no statistics are collected when disabled

## Changes to This Policy

Any changes to this privacy policy will be reflected in an updated version of this document in our repository.

## Contact

If you have questions about this Privacy Policy, please open an issue on our GitHub repository.

## Permissions Justification

See `PERMISSIONS.md` for detailed explanations of why each browser permission is required.

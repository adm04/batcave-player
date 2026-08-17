# Security Policy & Secret Management

This document outlines the security policies, secret handling guidelines, and vulnerability reporting procedures for the **Batcave Player** project.

---

## 🔒 Secret & Credential Handling Policy

To ensure the repository is completely safe for public hosting on GitHub, strict rules are enforced regarding secrets, credentials, and configuration values.

### Rules for All Contributors & Maintainers:

1. **Zero Hardcoded Secrets**: Never hardcode or commit:
   - API Keys, API Secrets, Access Tokens, OAuth Credentials
   - Database credentials or connection strings
   - Private API endpoints or internal URLs
   - Personal Identification Information (PII) such as emails, phone numbers, or private details
   - Private configuration files (`.env`, `js/config.js`, etc.)

2. **Environment Variable & Runtime Configuration**:
   - For client-side configuration (e.g. Supabase Realtime presence client), copy `js/config.example.js` to `js/config.js` locally.
   - `js/config.js` and all `.env` files (except template examples like `.env.example`) are strictly ignored in `.gitignore`.
   - Never commit your actual `js/config.js` or `.env` files to Git.

3. **Client-Side Security Model**:
   - **Frontend environment variables are exposed in browser JavaScript**: Any key loaded by the browser (such as Supabase publishable `anon` keys) is readable by end users.
   - **Never expose private/secret keys** (such as Supabase `service_role` keys, AWS secret keys, or private API keys) in client-side code.
   - If an API requires a private secret key, requests **must** be proxied through a secure server-side API endpoint with proper authentication and rate limiting.

4. **Placeholder Usage**:
   - Documentation, tests, and example files must exclusively use placeholder values (e.g., `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_PUBLISHABLE_KEY`).

---

## 🛠️ Local Environment Setup

1. Copy the example configuration template:
   ```bash
   cp js/config.example.js js/config.js
   ```
2. Edit `js/config.js` to supply your project credentials:
   ```javascript
   window.ENV = {
     SUPABASE_URL: 'https://your-project.supabase.co',
     SUPABASE_KEY: 'your-publishable-key'
   };
   ```
3. If `js/config.js` is not configured, Batcave Player automatically operates in **graceful offline mode** with local fallback UI states without throwing errors.

---

## ⚠️ Remediation for Committed Secrets

If a secret or credential is accidentally committed to Git:

1. **Revoke & Rotate Immediately**: Revoke the compromised secret from your provider dashboard (e.g., Supabase, AWS, Google Cloud) and issue a replacement. Simply removing the secret in a new commit does **NOT** delete it from Git history.
2. **Purge Git History**: Use tools such as [`git-filter-repo`](https://github.com/newren/git-filter-repo) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to remove the secret from historic commits before pushing to public repositories.

---

## 🐛 Reporting a Vulnerability

If you discover a security vulnerability within this project, please **do not open a public GitHub issue**.

Instead, please report security issues privately by contacting the repository maintainers or using GitHub Private Vulnerability Reporting (if enabled on the repository). Include:
- A detailed description of the issue.
- Steps to reproduce or proof-of-concept.
- Potential impact.

Reports will be investigated promptly and addressed with appropriate patches.

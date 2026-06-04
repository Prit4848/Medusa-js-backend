/**
 * api.js — Swappable data layer for the block editor.
 *
 * HOW TO USE:
 *   - Right now it uses localStorage so the app works with zero backend.
 *   - When you have a real API, replace the bodies of the three functions below.
 *   - The rest of the app never changes — only this file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * STORAGE KEY FORMAT (localStorage / JSON field in DB):
 *   {
 *     id:        string   — page slug e.g. "home", "about"
 *     title:     string   — page title shown on the frontend
 *     html:      string   — serialized Gutenberg block HTML  ← rendered on frontend
 *     json:      string   — raw blocks JSON                  ← re-parsed in editor
 *     updatedAt: string   — ISO date string
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LS_KEY = 'rbb_pages'; // localStorage namespace

// ── helpers ──────────────────────────────────────────────────────────────────

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ═════════════════════════════════════════════════════════════════════════════
//  PUBLIC API — replace these three functions with real fetch() calls
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Save a page to the store.
 * @param {string} id    - page slug / unique identifier
 * @param {string} title - human-readable page title
 * @param {string} html  - serialize(blocks) output
 * @param {string} json  - JSON.stringify(blocks) output
 * @returns {Promise<{id, title, html, json, updatedAt}>}
 *
 * ── Real backend swap ──────────────────────────────────────────────────────
 * export async function savePage(id, title, html, json) {
 *   const res = await fetch(`/api/pages/${id}`, {
 *     method: 'PUT',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ title, html, json }),
 *   });
 *   return res.json();
 * }
 *
 * ── WordPress REST API swap ────────────────────────────────────────────────
 * export async function savePage(id, title, html, json) {
 *   const res = await fetch(`/wp-json/wp/v2/pages/${id}`, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'X-WP-Nonce': window.wpApiSettings.nonce,
 *     },
 *     body: JSON.stringify({ title, content: html }),
 *   });
 *   return res.json();
 * }
 */
export async function savePage(id, title, html, json) {
  const all = readAll();
  const page = { id, title, html, json, updatedAt: new Date().toISOString() };
  all[id] = page;
  writeAll(all);
  return page;
}

/**
 * Load a single page by id.
 * Returns null if not found.
 *
 * ── Real backend swap ──────────────────────────────────────────────────────
 * export async function loadPage(id) {
 *   const res = await fetch(`/api/pages/${id}`);
 *   if (!res.ok) return null;
 *   return res.json();
 * }
 */
export async function loadPage(id) {
  const all = readAll();
  return all[id] ?? null;
}

/**
 * List all saved pages (for the "Open page" picker).
 *
 * ── Real backend swap ──────────────────────────────────────────────────────
 * export async function listPages() {
 *   const res = await fetch('/api/pages');
 *   return res.json(); // expects array
 * }
 */
export async function listPages() {
  const all = readAll();
  return Object.values(all).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
}

/**
 * Delete a page by id.
 *
 * ── Real backend swap ──────────────────────────────────────────────────────
 * export async function deletePage(id) {
 *   await fetch(`/api/pages/${id}`, { method: 'DELETE' });
 * }
 */
export async function deletePage(id) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

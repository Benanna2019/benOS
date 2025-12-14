import { init } from '/assets/instantdb.js';

export const APP_ID = '4744b006-aabe-48be-8b67-08bc76fcbd72';

// Single shared InstantDB client for the whole site (module-scoped, not on window)
export const db = init({ appId: APP_ID });

// Tiny HTML tagged-template helper to avoid quote escaping in innerHTML
export const html = (strings, ...values) =>
  strings.reduce((out, str, i) => out + str + (values[i] ?? ''), '');

/**
 * Returns true if the current user can query drafts (server-enforced permissions).
 * This is a robust admin check that cannot be bypassed by changing client-side variables.
 */
export async function canAccessDrafts() {
  try {
    const res = await db.query({ drafts: { $: { limit: 1 } } });
    return !res?.error;
  } catch {
    return false;
  }
}

export async function requireAdminOrRedirect(redirectTo = '/admin/login/') {
  const ok = await canAccessDrafts();
  if (!ok) {
    window.location.replace(redirectTo);
    return false;
  }
  return true;
}



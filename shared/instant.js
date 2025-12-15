// Shared utilities for InstantDB
// Assumes window.db is already initialized by base.njk

// Tiny HTML tagged-template helper to avoid quote escaping in innerHTML
export const html = (strings, ...values) =>
  strings.reduce((out, str, i) => out + str + (values[i] ?? ''), '');

/**
 * Returns true if the current user can query drafts (server-enforced permissions).
 * This is a robust admin check that cannot be bypassed by changing client-side variables.
 */
export async function canAccessDrafts() {
  return new Promise((resolve) => {
    // Use subscribeQuery so we wait for real-time sync to settle
    const unsub = window.db.subscribeQuery({ drafts: { $: { limit: 1 } } }, (res) => {
      unsub(); // unsubscribe immediately after first result
      // If there's an error (permission denied), res.error will be set
      resolve(!res?.error);
    });
  });
}

/**
 * Optional helper: attempt to set `$users.isAdmin=true` for the bootstrap admin.
 * Safe because perms only allow the bootstrap admin user (by email) to update themselves.
 * Waits for the flag to propagate before returning.
 */
export async function bootstrapAdminFlag() {
  try {
    const user = await window.db.getAuth();
    if (!user?.email) return false;
    if (user.email !== 'bass41992ben@gmail.com') return false;
    
    await window.db.transact(window.db.tx.$users[user.id].merge({ isAdmin: true }));
    
    // Wait for the isAdmin flag to actually appear on the user record
    return new Promise((resolve) => {
      const unsub = window.db.subscribeQuery({ $users: { $: { where: { id: user.id } } } }, (res) => {
        const u = res?.data?.$users?.[0];
        if (u?.isAdmin === true) {
          unsub();
          resolve(true);
        }
      });
      // Timeout after 3 seconds to avoid hanging forever
      setTimeout(() => { unsub(); resolve(false); }, 3000);
    });
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



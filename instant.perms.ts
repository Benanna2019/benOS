// instant.perms.ts
// Used by `npx instant-cli@latest push perms`

import type { InstantRules } from '@instantdb/core';

const ADMIN_EMAIL = 'bass41992ben@gmail.com';

/**
 * Security model:
 * - Admin-ness is stored on `$users.isAdmin`.
 * - Only the real admin (by email) can set `$users.isAdmin=true` (bootstrap).
 * - All admin-only data (`drafts`, `$files`, `music`) is protected by `isAdmin`.
 *
 * NOTE: Even if someone edits client-side JS variables, these rules are enforced server-side.
 */
const rules = {
  // Gate the admin flag itself.
  // Only the bootstrap admin user (by email) can set their own isAdmin=true.
  // Everyone can view $users (optional), but cannot read other users' emails unless you add field rules.
  $users: {
    bind: [
      'isBootstrapAdmin',
      `auth.email == '${ADMIN_EMAIL}'`,
      'isSelf',
      'auth.id != null && auth.id == data.id',
      // isAdmin is stored on the user record; `auth.ref` reads from the authed user's $user.
      'isAdmin',
      `true in auth.ref('$user.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
      // Prevent privilege escalation: only bootstrap admin can change isAdmin, and only on self.
      'isSelfNoEscalation',
      "auth.id != null && auth.id == data.id && newData.ref('isAdmin') == data.ref('isAdmin')",
    ],
    allow: {
      // Keep $users viewable for auth flows; tighten later with fields rules if you want.
      view: 'auth.id != null',
      // Default: no one creates users manually
      create: 'false',
      // Only bootstrap admin can update their own isAdmin (and any other future fields you add).
      update: "(isBootstrapAdmin && isSelf) || isSelfNoEscalation",
      delete: 'false',
    },
  },

  drafts: {
    bind: [
      'isAdmin',
      `true in auth.ref('$user.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
    ],
    allow: {
      view: 'isAdmin',
      create: 'isAdmin',
      update: 'isAdmin',
      delete: 'isAdmin',
    },
  },

  music: {
    bind: [
      'isAdmin',
      `true in auth.ref('$user.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
    ],
    allow: {
      view: 'true',
      create: 'isAdmin',
      update: 'isAdmin',
      delete: 'isAdmin',
    },
  },

  $files: {
    bind: [
      'isAdmin',
      `true in auth.ref('$user.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
    ],
    allow: {
      view: 'true',
      create: 'isAdmin',
      delete: 'isAdmin',
    },
  },
} satisfies InstantRules;

export default rules;



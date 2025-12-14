// instant.perms.ts
// Used by `npx instant-cli@latest push perms`

import type { InstantRules } from '@instantdb/core';

const ADMIN_EMAIL = 'bass41992ben@gmail.com';

/**
 * Security model:
 * - Only admins can view/create/update/delete `drafts` and manage music metadata.
 * - Admin-ness is stored on a user's `profiles.isAdmin` (linked 1:1 to `$users`).
 * - Only the real admin (by email) is allowed to create a profile with isAdmin=true,
 *   and users cannot elevate themselves later (isAdmin is immutable for non-admins).
 *
 * NOTE: Even if someone edits client-side JS variables, these rules are enforced server-side.
 */
const rules = {
  profiles: {
    bind: [
      'isBootstrapAdmin',
      `auth.email == '${ADMIN_EMAIL}'`,
      'isAdmin',
      `true in auth.ref('$user.profile.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
      'isSelf',
      "auth.id != null && auth.id == data.ref('$user.id')",
      'isSelfCreate',
      "auth.id != null && auth.id == newData.ref('$user.id')",
      // Allow self updates but prevent changing isAdmin (unless already admin)
      'isSelfUpdateNoEscalation',
      "auth.id != null && auth.id == data.ref('$user.id') && newData.ref('isAdmin') == data.ref('isAdmin')",
    ],
    allow: {
      view: 'isAdmin || isSelf',
      // Anyone can create their profile, but only the bootstrap admin can set isAdmin=true
      create: "isSelfCreate && (newData.ref('isAdmin') != true || isBootstrapAdmin)",
      update: 'isAdmin || isSelfUpdateNoEscalation',
      delete: 'isAdmin',
    },
  },

  drafts: {
    bind: [
      'isAdmin',
      `true in auth.ref('$user.profile.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
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
      `true in auth.ref('$user.profile.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
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
      `true in auth.ref('$user.profile.isAdmin') || auth.email == '${ADMIN_EMAIL}'`,
    ],
    allow: {
      view: 'true',
      create: 'isAdmin',
      delete: 'isAdmin',
    },
  },
} satisfies InstantRules;

export default rules;



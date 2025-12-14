// instant.schema.ts
// Used by `npx instant-cli@latest push schema`

import { i } from '@instantdb/core';

const schema = i.schema({
  entities: {
    // Admin-only drafts for posts
    drafts: i.entity({
      title: i.string(),
      description: i.string(),
      content: i.string(),
      tags: i.string(),
      contentType: i.string(), // 'tech-blog' | 'articles'
      status: i.string(), // 'draft' | 'publishing' | 'published'
      createdAt: i.number(),
      updatedAt: i.number(),
      publishedAt: i.number(),
    }),

    // Optional music metadata (storage is in $files)
    music: i.entity({
      filename: i.string(),
      path: i.string(),
      uploadedAt: i.number(),
      uploadedBy: i.string(),
    }),

    // 1:1 profile for each user
    profiles: i.entity({
      isAdmin: i.boolean(),
    }),

    // System namespaces for typing (Instant will manage these)
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
  },
  links: {
    // IMPORTANT: system namespace must be in reverse direction
    profileUser: {
      forward: { on: 'profiles', has: 'one', label: '$user' },
      reverse: { on: '$users', has: 'one', label: 'profile' },
    },
  },
  rooms: {},
});

export default schema;
export type AppSchema = typeof schema;



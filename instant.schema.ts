// instant.schema.ts
// Used by `npx instant-cli@latest push schema`

import { i } from '@instantdb/core';

const schema = i.schema({
  entities: {
    // Admin-only drafts for posts
    drafts: i.entity({
      title: i.string(),
      description: i.string().optional(),
      content: i.string(),
      tags: i.string(),
      contentType: i.string(), // 'tech-blog' | 'articles'
      status: i.string().optional(), // 'draft' | 'publishing' | 'published'
      createdAt: i.number().optional(),
      updatedAt: i.number().optional(),
      publishedAt: i.number().optional(),
    }),

    // Optional music metadata (storage is in $files)
    music: i.entity({
      filename: i.string(),
      path: i.string(),
      uploadedAt: i.number(),
      uploadedBy: i.string(),
    }),

    // System namespaces for typing (Instant will manage these)
    $users: i.entity({
      email: i.string().unique().indexed(),
      // Server-enforced admin flag. Only bootstrap admin can set this.
      isAdmin: i.boolean().optional(),
    }),
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
  },
  links: {},
  rooms: {},
});

export default schema;
export type AppSchema = typeof schema;



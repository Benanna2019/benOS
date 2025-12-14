/**
 * Inngest Functions for the Blog
 * 
 * This module defines the Inngest client and functions for:
 * - Publishing posts from InstantDB drafts to GitHub
 */

import { Inngest, InngestMiddleware } from 'inngest';

// Type definitions
interface Env {
  INNGEST_SIGNING_KEY: string;
  INNGEST_EVENT_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;  // e.g., "username/repo"
  INSTANTDB_ADMIN_TOKEN: string;
  INSTANTDB_APP_ID: string;
}

interface Draft {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string;
  contentType: 'tech-blog' | 'articles';
  status: string;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

// Middleware to pass Cloudflare env to functions
const envMiddleware = new InngestMiddleware({
  name: 'Cloudflare Workers bindings',
  init({ client, fn }) {
    return {
      onFunctionRun({ ctx, fn, steps, reqArgs }) {
        return {
          transformInput({ ctx, fn, steps }) {
            // reqArgs[1] is the env object in Cloudflare Workers
            const env = (reqArgs as [Request, Env])[1];
            return {
              ctx: {
                env,
              },
            };
          },
        };
      },
    };
  },
});

// Initialize Inngest client
export const inngest = new Inngest({
  id: 'eleventy-blog',
  middleware: [envMiddleware],
});

// Function: Publish a draft to GitHub
export const publishToGitHub = inngest.createFunction(
  { 
    id: 'publish-to-github',
    name: 'Publish Draft to GitHub',
    retries: 3,
  },
  { event: 'blog/post.publish' },
  async ({ event, step, ctx }) => {
    const { draftId } = event.data;
    const env = (ctx as { env: Env }).env;

    // Step 1: Fetch the draft from InstantDB
    const draft = await step.run('fetch-draft', async () => {
      const response = await fetch('https://api.instantdb.com/admin/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.INSTANTDB_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          query: {
            drafts: {
              $: { where: { id: draftId } }
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch draft: ${response.statusText}`);
      }

      const data = await response.json() as { drafts: Draft[] };
      const draft = data.drafts?.[0];

      if (!draft) {
        throw new Error(`Draft not found: ${draftId}`);
      }

      return draft;
    });

    // Step 2: Generate the markdown file content
    const markdown = await step.run('generate-markdown', async () => {
      const slug = slugify(draft.title);
      const date = new Date().toISOString().split('T')[0];
      
      // Parse tags from comma-separated string
      const tags = draft.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Build frontmatter
      const frontmatter = [
        '---',
        `title: "${draft.title}"`,
        `description: "${draft.description || ''}"`,
        `date: ${date}`,
        `tags:`,
        ...tags.map(tag => `  - ${tag}`),
        '---',
        '',
      ].join('\n');

      return {
        content: frontmatter + draft.content,
        slug,
        path: draft.contentType === 'tech-blog' 
          ? `content/tech-blog/${slug}.md`
          : `content/articles/${slug}.md`,
      };
    });

    // Step 3: Commit to GitHub
    const commit = await step.run('commit-to-github', async () => {
      const [owner, repo] = env.GITHUB_REPO.split('/');
      
      // First, get the current file SHA if it exists (for updates)
      let sha: string | undefined;
      const getFileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${markdown.path}`,
        {
          headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'EleventyBlog-Publisher',
          },
        }
      );
      
      if (getFileResponse.ok) {
        const fileData = await getFileResponse.json() as { sha: string };
        sha = fileData.sha;
      }

      // Create or update the file
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${markdown.path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'EleventyBlog-Publisher',
          },
          body: JSON.stringify({
            message: `Publish: ${draft.title}`,
            content: btoa(unescape(encodeURIComponent(markdown.content))),
            branch: 'main',
            ...(sha && { sha }),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`GitHub commit failed: ${error}`);
      }

      return await response.json();
    });

    // Step 4: Update draft status in InstantDB
    await step.run('update-draft-status', async () => {
      const response = await fetch('https://api.instantdb.com/admin/transact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.INSTANTDB_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          steps: [
            ['update', 'drafts', draftId, { status: 'published' }]
          ]
        }),
      });

      if (!response.ok) {
        console.error('Failed to update draft status, but publish succeeded');
      }
    });

    return {
      success: true,
      draftId,
      path: markdown.path,
      commitSha: (commit as { content?: { sha?: string } })?.content?.sha,
    };
  }
);

// Helper: Convert title to URL slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Export all functions for the serve handler
export const functions = [publishToGitHub];


/**
 * Cloudflare Worker - API Endpoints
 * 
 * Handles:
 * - POST /api/publish - Trigger post publishing
 * - GET/POST /api/inngest - Inngest serve endpoint
 */

import { serve } from 'inngest/edge';
import { inngest, functions } from './inngest';

interface Env {
  INNGEST_SIGNING_KEY: string;
  INNGEST_EVENT_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  INSTANTDB_ADMIN_TOKEN: string;
  INSTANTDB_APP_ID: string;
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: POST /api/publish
    if (path === '/api/publish' && request.method === 'POST') {
      return handlePublish(request, env);
    }

    // Route: Inngest serve endpoint
    if (path === '/api/inngest') {
      const handler = serve({
        client: inngest,
        functions,
      });
      return handler(request, env);
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  },
};

/**
 * Handle POST /api/publish
 * Triggers the Inngest publish workflow
 */
async function handlePublish(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { draftId?: string };
    const { draftId } = body;

    if (!draftId) {
      return new Response(
        JSON.stringify({ error: 'draftId is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send event to Inngest
    await inngest.send({
      name: 'blog/post.publish',
      data: { draftId },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Publish job queued' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Publish error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to queue publish job' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}


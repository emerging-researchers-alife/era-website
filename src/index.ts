import { serve, file, Glob } from "bun";
import index from "./index.html";
import { join } from "path";

const VALID_SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;

async function serveEventAsset(pathPart: string) {
  if (pathPart.includes('..') || pathPart.startsWith('/')) {
    return new Response("Not found", { status: 404 });
  }

  const isDev = process.env.NODE_ENV !== "production";
  const baseDir = isDev ? ".build" : "dist";
  const eventPath = join(process.cwd(), baseDir, "events", pathPart);
  const eventFile = file(eventPath);

  if (await eventFile.exists()) {
    const ext = eventPath.split('.').pop() || '';
    const contentTypes: Record<string, string> = {
      ics: 'text/calendar; charset=utf-8',
      json: 'application/json',
    };

    return new Response(eventFile, {
      headers: { "Content-Type": contentTypes[ext] || "application/octet-stream" },
    });
  }

  return new Response("Not found", { status: 404 });
}

function getEventAssetRoutes() {
  const isDev = process.env.NODE_ENV !== "production";
  const baseDir = isDev ? ".build" : "dist";
  const eventsDir = join(process.cwd(), baseDir, "events");
  const routes: Record<string, () => Promise<Response>> = {};

  try {
    for (const asset of new Glob("*").scanSync(eventsDir)) {
      if (!asset.endsWith(".json") && !asset.endsWith(".ics")) continue;
      routes[`/events/${asset}`] = () => serveEventAsset(asset);
    }
  } catch {
    // Event assets are generated before normal dev/prod starts.
    // If they are absent, the wildcard route still returns 404 for asset URLs.
  }

  return routes;
}

const eventAssetRoutes = getEventAssetRoutes();

const server = serve({
  port: process.env.PORT || 3001,
  routes: {
    "/vendor/katex/*": async req => {
      const asset = new URL(req.url).pathname.replace('/vendor/katex/', '');
      if (!/^(katex\.min\.css|fonts\/[A-Za-z0-9_-]+\.(woff2?|ttf))$/.test(asset)) {
        return new Response('Not found', { status: 404 });
      }
      const base = process.env.NODE_ENV === 'production' ? 'dist/vendor/katex' : 'node_modules/katex/dist';
      const assetFile = file(join(process.cwd(), base, asset));
      return await assetFile.exists() ? new Response(assetFile) : new Response('Not found', { status: 404 });
    },
    "/articles/*": async (req) => {
      try {
        const url = new URL(req.url);
        const pathPart = url.pathname.replace('/articles/', '');

        if (!pathPart.endsWith('.json')) {
          if (pathPart.includes('..') || !/^[a-zA-Z0-9_./-]+$/.test(pathPart)) {
            return new Response('Not found', { status: 404 });
          }
          const assetDir = process.env.NODE_ENV === 'production' ? 'dist' : 'public';
          const asset = file(join(process.cwd(), assetDir, 'articles', pathPart));
          return await asset.exists() ? new Response(asset) : new Response('Not found', { status: 404 });
        }

        const slug = pathPart.replace('.json', '');

        if (!VALID_SLUG_REGEX.test(slug)) {
          return new Response(JSON.stringify({ error: "Invalid article slug" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const isDev = process.env.NODE_ENV !== "production";
        const baseDir = isDev ? ".build" : "dist";
        const articlePath = join(process.cwd(), baseDir, "articles", `${slug}.json`);
        const articleFile = file(articlePath);

        if (await articleFile.exists()) {
          return new Response(articleFile, {
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "Article not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error serving article:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    },

    ...eventAssetRoutes,

    "/events/:slug": index,

    "/events/*": async (req) => {
      try {
        const url = new URL(req.url);
        const pathPart = url.pathname.replace('/events/', '');

        if (pathPart.includes('..') || pathPart.startsWith('/') || pathPart === '') {
          return new Response("Not found", { status: 404 });
        }

        return serveEventAsset(pathPart);
      } catch (error) {
        console.error("Error serving event asset:", error);
        return new Response("Internal server error", { status: 500 });
      }
    },

    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);

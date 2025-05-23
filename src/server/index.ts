import { Hono } from "hono";
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server';
import { createServer } from 'node:http2';

export const server = new Hono();

server.get("/api/login", (c) => c.text("Hello world!"));

if (process.env.type === 'prod') {
    server.get("/*", serveStatic({ root: "./client" }))
    server.notFound(c => serveStatic({ path: "./client/index.html" })(c, async () => { }) as Promise<Response>);

    console.log(process.cwd())

    serve({
        fetch: server.fetch,
        port: 8080,
    })
}
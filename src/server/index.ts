import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { serve } from '@hono/node-server';
import { handleLogin } from './api/login';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export const server = new Hono();

server.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();

  if (err instanceof ZodError)
    return new HTTPException(400, { message: err.message }).getResponse();

  console.error(err);
  throw err;
});

server.post('/api/login', handleLogin);

if (process.env.type === 'prod') {
  server.get('/*', serveStatic({ root: './client' }));
  server.notFound(
    (c) =>
      serveStatic({ path: './client/index.html' })(
        c,
        async () => {},
      ) as Promise<Response>,
  );

  serve({
    fetch: server.fetch,
    port: 8080,
  });
}

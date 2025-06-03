import type { Context } from 'hono';
import type { BlankEnv, BlankInput } from 'hono/types';

import { z } from 'zod';
import jwt from 'jwt-simple';
import { HTTPException } from 'hono/http-exception';

const bodySchema = z.object({
  password: z.string(),
});

export const handleLogin = async (
  c: Context<BlankEnv, '/api/login', BlankInput>,
): Promise<Response> => {
  const body = await c.req.json();
  const parsed = bodySchema.parse(body);

  if (parsed.password !== process.env.SERVER_PASSWORD)
    throw new HTTPException(401, { message: 'Invalid password' });

  const payload = {
    sub: 'financerior',
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.encode(payload, process.env.ZERO_AUTH_SECRET!);

  return c.text(token, 200);
};

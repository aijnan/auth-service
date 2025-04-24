import { Hono } from 'hono'
import { auth } from './lib/auth'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null
  }
}>();


app.use(
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || "http://localhost:3001",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

/**
 * Better Auth routes, see docs before changing
 * @link https://better-auth.com/docs
 */
app.post('/api/auth/init-password', async (c) => {
  const { password } = await c.req.json();

  if (!password || password.length < 8 || password.length > 20) {
    return c.json({ success: false, message: 'password must be between 8 and 20 characters' }, 400);
  }

  const user = c.get("user");

  if (!user || !user.id) {
    return c.json({ success: false, message: 'unauthorized, please login' }, 401);
  }

  const { status } = await auth.api.setPassword({
    headers: c.req.raw.headers,
    body: {
      newPassword: password
    }
  });
  if (!status) {
    return c.json({ success: false, message: 'password set failed' }, 500);
  }
  return c.json({ success: true, message: 'password set success' });
});

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

export default app
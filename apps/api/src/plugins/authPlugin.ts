import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authPlugin = new Elysia({ name: "authPlugin" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key",
    })
  )
  .derive(async ({ jwt, headers }) => {
    const auth = headers.authorization;
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return { userId: null };

    const payload = await jwt.verify(token);
    if (!payload || !payload.id) return { userId: null };

    return { userId: payload.id as string };
  });

export const requireAuth = new Elysia({ name: "requireAuth" })
  .use(authPlugin)
  .onBeforeHandle((context: any) => {
    const { userId, set } = context;
    if (!userId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });

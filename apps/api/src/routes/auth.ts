import { Elysia, t } from "elysia";
import { UserModel } from "../types";
import { authPlugin } from "../plugins/authPlugin";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const { email, password } = body;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        set.status = 400;
        return { error: "User already exists" };
      }

      const passwordHash = await Bun.password.hash(password);
      const user = await UserModel.create({ email, passwordHash });

      const token = await jwt.sign({ id: user._id.toString() });

      return {
        token,
        user: { _id: user._id.toString(), email: user.email },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const { email, password } = body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      const isMatch = await Bun.password.verify(password, user.passwordHash);
      if (!isMatch) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      const token = await jwt.sign({ id: user._id.toString() });

      return {
        token,
        user: { _id: user._id.toString(), email: user.email },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  );

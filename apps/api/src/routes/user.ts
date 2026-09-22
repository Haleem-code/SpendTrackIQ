import { Elysia, t } from "elysia";
import { UserModel } from "../types";
import { requireAuth } from "../plugins/authPlugin";

export const userRoute = new Elysia({ prefix: "/user" })
  .use(requireAuth)
  .get("/settings", async (context) => {
    const { userId, set } = context as any;
    try {
      const user = await UserModel.findById(userId).select("-passwordHash").lean() as any;
      if (!user) {
        set.status = 404;
        return { success: false, message: "User not found." };
      }
      return { success: true, settings: { notificationFrequency: user.notificationFrequency || "weekly" } };
    } catch (err) {
      set.status = 500;
      return { success: false, message: (err as Error).message };
    }
  })
  .patch(
    "/settings",
    async (context) => {
      const { userId, body, set } = context as any;
      try {
        const { notificationFrequency } = body;
        const validFreq = ["weekly", "monthly", "none"];
        if (!validFreq.includes(notificationFrequency)) {
          set.status = 400;
          return { success: false, message: "Invalid frequency." };
        }

        await UserModel.findByIdAndUpdate(userId, { $set: { notificationFrequency } });
        return { success: true, message: "Settings updated." };
      } catch (err) {
        set.status = 500;
        return { success: false, message: (err as Error).message };
      }
    },
    {
      body: t.Object({
        notificationFrequency: t.String(),
      }),
    }
  );

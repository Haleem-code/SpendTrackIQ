import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { connectDB } from "./lib/mongo";
import { authRoute } from "./routes/auth";
import { uploadRoute } from "./routes/upload";
import { incomeRoute } from "./routes/income";
import { reminderRoute } from "./routes/reminder";
import { userRoute } from "./routes/user";

await connectDB();

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "SpendTrackIQ API",
          version: "1.0.0",
          description:
            "Parse GTBank & OPay bank statements, track income, and send upload reminders.",
        },
      },
    })
  )
  .get("/", () => ({
    status: "ok",
    message: "SpendTrackIQ API 🚀",
  }))
  .use(authRoute)
  .use(uploadRoute)
  .use(incomeRoute)
  .use(reminderRoute)
  .use(userRoute)
  .listen(process.env.PORT ?? 3001);

console.log(
  `🦊 API running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;

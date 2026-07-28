import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { connectDB } from "./lib/mongo";
import { uploadRoute } from "./routes/upload";
import { incomeRoute } from "./routes/income";
import { reminderRoute } from "./routes/reminder";

await connectDB();

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Haleem's Income Tracker API",
          version: "1.0.0",
          description:
            "Parse GTBank & OPay bank statements, track income, and send upload reminders.",
        },
      },
    })
  )
  .get("/", () => ({
    status: "ok",
    message: "Haleem's Income Tracker API 🚀",
  }))
  .use(uploadRoute)
  .use(incomeRoute)
  .use(reminderRoute)
  .listen(process.env.PORT ?? 3001);

console.log(
  `🦊 API running at http://${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;

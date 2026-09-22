# AGENTS.md — Haleem's Income Tracker

This document is the single source of truth for building this project. Any agent (or human) picking up this repo should read this fully before writing code.

## 1. What we're building

A web + mobile app that tracks users' yearly income by parsing monthly bank statements from **GTBank** and **OPay**, aggregating income totals, and reminding them (via email) to upload statements weekly/monthly if they haven't.

Optimize for: low maintenance, simplicity over scalability.

## 2. Core user flow

1. A user registers/logs in to the app (JWT based auth).
2. The user exports a bank statement (PDF, sometimes CSV) from GTBank or OPay monthly.
3. They upload it to the web app (mobile later).
4. Backend parses the PDF/CSV into structured transactions.
5. Transactions are classified as `income`, `expense`, `transfer`, or `uncategorized`.
6. Dashboard shows yearly total, monthly breakdown, per-bank breakdown, and a list of transactions they can manually recategorize.
7. If a user hasn't uploaded anything in 7+ days, a scheduled job sends an email reminder.

## 3. Tech stack

- **Runtime:** Bun (monorepo, workspaces)
- **Backend:** Elysia (TypeScript)
- **Frontend (web):** Next.js (App Router)
- **Frontend (mobile):** Flutter (built later — no Mac available, so iOS builds go through Codemagic)
- **Database:** MongoDB (Atlas free tier)
- **PDF parsing:** `pdf-parse` (npm)
- **Email:** Resend
- **WhatsApp:** Twilio WhatsApp API (sandbox to start; approved sender for production)
- **Reminder scheduling:** GitHub Actions scheduled workflow (cron) hitting a backend endpoint — NOT in-process cron, since free hosting tiers sleep and would silently break in-app schedulers
- **Hosting:** Render or Fly.io (backend, free tier), Vercel (frontend, free tier), MongoDB Atlas (database, free tier). No VPS/SSH — explicitly avoided to minimize ops overhead.

## 4. No bank API — statements are manual

Decision made explicitly: **not** using Mono (Nigerian open banking aggregator), despite both GTBank and OPay being supported by it. Reason: avoid any recurring API cost, keep this fully free. Statements are exported manually from each bank's app and uploaded by hand. This is an intentional tradeoff — less real-time, zero cost, full control.

If this ever changes, Mono is the documented fallback (supports both GTBank and OPay, has a free sandbox, pay-per-call production pricing).

## 5. Monorepo structure

```
haleem-income-tracker/
├── package.json                 # root workspace config
├── bun.lockb
├── apps/
│   ├── api/                     # Elysia backend
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   ├── upload.ts        # POST /statements/upload
│   │   │   │   ├── income.ts        # GET /income/summary/:year
│   │   │   │   └── reminder.ts      # POST /reminder/send
│   │   │   ├── lib/
│   │   │   │   ├── mongo.ts
│   │   │   │   ├── parseStatement.ts   # per-bank PDF parsers
│   │   │   │   ├── classify.ts         # income/expense/transfer heuristic
│   │   │   │   ├── email.ts            # Resend sender
│   │   │   │   └── whatsapp.ts         # Twilio WhatsApp sender
│   │   │   └── types.ts
│   │   └── tsconfig.json
│   └── web/                     # Next.js frontend
│       ├── package.json
│       ├── app/
│       │   ├── page.tsx             # dashboard
│       │   └── upload/page.tsx      # upload UI
│       ├── next.config.js
│       └── tsconfig.json
├── packages/
│   └── shared/                  # shared types between api & web
│       ├── package.json
│       └── src/types.ts         # Transaction, IncomeSummary
└── .github/
    └── workflows/
        └── reminder.yml         # weekly cron -> POST /reminder/send
```

## 6. Data model

```ts
// packages/shared/src/types.ts
export interface Transaction {
  date: string; // ISO 8601
  description: string;
  amount: number;
  type: "credit" | "debit";
  bank: "gtbank" | "opay";
  category?: "income" | "expense" | "transfer" | "uncategorized";
}

export interface IncomeSummary {
  month: number;
  year: number;
  bank: Transaction["bank"];
  total: number;
}

export interface UploadRecord {
  bank: "gtbank" | "opay";
  uploadedAt: string; // ISO 8601
  transactionCount: number;
}
```

MongoDB collections: `transactions`, `uploads`.

## 7. Backend routes (Elysia)

| Method | Path | Purpose |
|---|---|---|
| POST | `/statements/upload?bank=gtbank\|opay` | Accept PDF, parse, classify, store transactions, log upload record |
| GET | `/income/summary/:year` | Return monthly/per-bank income totals for a given year |
| GET | `/transactions?year=&category=` | List transactions for review/recategorization in the UI |
| PATCH | `/transactions/:id` | Manually correct a transaction's category |
| POST | `/reminder/send` | Triggered by GitHub Actions cron; checks last upload date, sends WhatsApp/email if overdue |

`/reminder/send` must be protected with a shared secret header (`x-cron-secret`) checked against an env var — this is the only externally-triggerable write-ish endpoint and shouldn't be publicly callable without it.

## 8. Statement parsing

- One parser function per bank: `parseGTBankStatement(buffer)`, `parseOPayStatement(buffer)`.
- Each extracts raw text via `pdf-parse`, then applies a bank-specific line/column pattern to produce `Transaction[]` in the shared shape.
- GTBank and OPay statement layouts differ — do not assume a shared regex. Inspect a real exported PDF from each before finalizing the parser.
- CSV support can be added later as a lighter-weight alternative if either bank supports CSV export.

## 9. Income classification

Simple heuristic first, refine over time:

- Description contains `salary` / `payroll` → `income`
- Description matches a known transfer-between-own-accounts pattern → `transfer` (excluded from income totals)
- Everything else defaults to `uncategorized`, surfaced in the UI for manual tagging

Manual corrections from the UI (`PATCH /transactions/:id`) should be treated as ground truth and can later be used to improve the heuristic (e.g. hardcode client names once they're known).

## 10. Reminder system

- **Primary channel: WhatsApp** via Twilio.
  - Register a WhatsApp Content Template (e.g. "You haven't tracked your income yet — upload now: {{1}}") since reminders will almost always fall outside the 24-hour free-form messaging window.
  - No inbound webhook needed — this is one-way notification only, not two-way chat.
- **Secondary channel: Email** via Resend, same trigger condition.
- **Trigger logic:** `/reminder/send` checks the most recent `uploads` record; if `daysSince(lastUpload) >= 7`, send the reminder(s).
- **Scheduling:** GitHub Actions workflow (`.github/workflows/reminder.yml`) runs weekly (`cron: "0 9 * * 1"`) and does a `curl -X POST` to the deployed `/reminder/send` endpoint with the secret header. Chosen over in-process cron because free-tier hosts (Render/Fly free) idle/sleep and would silently stop firing scheduled jobs.

## 11. Deployment plan

1. Local dev first: get upload → parse → classify → aggregate working end-to-end against real exported PDFs before deploying anything.
2. **MongoDB Atlas**: free M0 cluster, connection string as `MONGO_URI` env var.
3. **Backend → Render** (or Fly.io): deploy `apps/api`, set env vars (`MONGO_URI`, `RESEND_API_KEY`, `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `CRON_SECRET`, `WEB_URL`).
4. **Frontend → Vercel**: deploy `apps/web` with root directory set to `apps/web`, env var `NEXT_PUBLIC_API_URL` pointing at the Render backend URL.
5. **Reminder cron → GitHub Actions**: add `CRON_SECRET` as a repo secret, workflow pings the deployed backend weekly.
6. Mobile (Flutter) app comes after web is stable — reuses the same backend API, file-picker upload instead of drag-and-drop.

## 12. Explicit non-goals (for now)

- No live bank API integration (Mono) — deliberately deferred/skipped for cost reasons.
- No automatic bank credential syncing — everything is manual statement upload by design.

App name: **SpendTrackIQ**. Repo name: `haleem-income-tracker`.

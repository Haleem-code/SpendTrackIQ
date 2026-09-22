# SpendTrackIQ



## How it works

1. **User Accounts**: Users can register and log in to the application. Data is scoped securely to each user via JWT authentication.
2. **Statement Upload**: Users export their bank statements (PDF or CSV) from GTBank or OPay and upload them to their dashboard.
3. **Parsing & Classification**: The backend (Elysia API) parses the statements and extracts structured transactions. Transactions are classified as `income`, `expense`, `transfer`, or `uncategorized`.
4. **Dashboard**: The frontend (Next.js) presents a dashboard showing yearly totals, monthly breakdowns, per-bank breakdowns, and a list of transactions. Users can manually recategorize transactions if needed.
5. **Reminders**: A scheduled cron job (via GitHub Actions) hits the backend weekly. The backend checks each user's last upload date and sends an automated email reminder (via Resend) if they haven't uploaded a statement in 7+ days.

## Tech Stack

- **Runtime:** Bun
- **Backend:** Elysia (TypeScript), MongoDB (Mongoose)
- **Frontend:** Next.js (App Router), React
- **Authentication:** JWT
- **Emails:** Resend

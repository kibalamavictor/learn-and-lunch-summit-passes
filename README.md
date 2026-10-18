# Learn And Lunch — Summit Passes

A guest opens one personal link, shows an entry QR to the registrar, then sees an activated lunch QR on the same page after staff confirm attendance. Lunch can be redeemed once across all serving points.

This is the standalone **GitHub + Cloudflare Workers/D1** edition. Commit the contents of this folder to your own repository. Git has been initialized and the empty private GitHub remote configured. The Cloudflare Worker has been deployed and this repository contains its standalone source. GitHub stores the source; Cloudflare runs the full application. GitHub Pages alone cannot run this backend.

## Before you commit

This folder contains application source and schema migrations only. It excludes participant CSVs, database contents, live pass tokens, credentials and the existing hosted site's identity. Do not copy `.env`, `.dev.vars`, `.wrangler`, `node_modules` or `dist` into GitHub. `.gitignore` already excludes these and CSVs.

The 312 participants have been imported into the configured Cloudflare D1 database. For a separate fresh deployment, import the corrected CSV privately through its staff screen. Each database creates its own invitation links. Do not send links from the old host if you plan to use this deployment. Existing attendance/redemption history is not migrated by a CSV reimport; avoid switching hosts after the event starts without a full data migration.

## 1. Install and check locally

Use Node.js 22.13 or newer.

```sh
npm ci
npm run check
npm run test:auth
```

## 2. Create the free Cloudflare database

Sign in to your Cloudflare account using Wrangler, then create D1:

```sh
npx wrangler login
npm run db:create
```

The approved Cloudflare account and created summit database ID are already set in `wrangler.jsonc`. If setting up a separate environment, replace these with your own account/database IDs. Keep the `DB` binding and `drizzle` migrations directory. Set `STAFF_EMAILS` to the exact staff email addresses, separated by commas.

```sh
npm run db:migrate:remote
```

## 3. Deploy the app

```sh
npm run deploy
```

Cloudflare prints the new HTTPS URL. Guest pages work without an account. Staff access stays closed until the next step is configured. You may connect this repository in Cloudflare Workers Builds for deployment after your own commits; use build command `npm run build` and deploy command `npx wrangler deploy`. Do not put Cloudflare API credentials into source code.

## 4. Create the staff password — no Access subscription

Cloudflare Access is not used. Its free onboarding requests payment details and overage authorization; it was not activated.

The built-in login uses a salted PBKDF2 password hash and 12-hour database sessions with HttpOnly, Secure, SameSite=Strict cookies. Login attempts are limited; sign-out revokes the session. A one-time setup key and the email allowlist protect initial account creation. Initial setup locks permanently after the first staff account is created.

1. Open the deployed Worker in Cloudflare → Settings → Variables and Secrets.
2. Add a **Secret** named `SETUP_TOKEN`. Generate a long random key privately using your password manager (at least 32 characters). Keep it outside Git and do not paste it into chat. Save/deploy the secret.
3. Open `/staff/setup` on the deployed app. Enter that key, `kibalama.victor@gmail.com`, and a new password of at least 14 characters. Confirm the password and create the account yourself.
4. After the account is created, remove `SETUP_TOKEN` from the Worker. Setup is also locked by the database, so the key cannot create a second account.
5. Sign in at `/staff/login`, import your private corrected CSV and test the demo pass before inviting guests.

The staff email allowlist is configured in `wrangler.jsonc`. This version creates one staff account; it may sign in on multiple devices, and redemptions are recorded under that account email. Individual staff accounts and self-service password recovery are not implemented. An account reset requires an authorised database administrator.

Initial invitations are not sent by the app. Copy/export provides personal URLs; the original link updates to lunch after attendance. No transactional email service or second email is required.

## Local preview

```sh
npm run db:migrate:local
npm run dev
```

Guest pages render locally. Staff actions require a database-backed login; there is no header-based identity bypass. `.dev.vars.example` lists configuration names; copy it to ignored `.dev.vars` for local configuration. Use HTTPS deployment for browser testing of secure session cookies.

## Free-tier scope and operation

Select free plans only. Cloudflare Workers and D1 have daily request, CPU, read/write and storage allowances; monitor usage before and during the event. This small summit event is designed for modest usage, but no hosting provider offers unlimited free traffic. There is no paid email dependency in the lunch flow.

The app needs internet connectivity at the registrar and meal line. Guests can reopen the original link or tap Refresh pass. Pending entry pages check for attendance changes every 10 seconds while visible and stop automatic checks after activation. A saved entry screenshot does not update into a lunch pass.

Official references:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/

## Checks performed on this edition

See `HANDOFF.md` for the actual checks completed before handoff. The live Cloudflare deployment uses built-in staff password login. Participant data and credentials are stored outside Git.

## Acceptance emails (Zoho CPaaS)

Open **Acceptance emails** in the staff dashboard. Preview the message, send a test to your own mailbox, review it, then send unsent invitations. Imports never trigger email automatically. Each message has one recipient, a private entry link, the official poster link, event details, ID reminder and visiting-student bag notice. Open/click tracking are disabled.

Store the existing agent Send API key as the encrypted Cloudflare secret `ZOHO_SEND_KEY` (never in Git, a CSV or a browser-visible variable). The sender is Operations At Learn And Lunch <operations@learnandlunch.org>. This integration uses Zoho's transactional sending API at https://cpaas.zoho.com/v1.1/email. Only send registration confirmations to the summit applicants; this is not a marketing sender.

Sending uses resumable batches of five. A database claim prevents concurrent duplicate sends. Accepted messages are never resent automatically. Rejected sends can be retried explicitly. Connection failures or ambiguous responses are marked uncertain; review Zoho logs before deciding what to do. A `sending` record left by an interrupted worker likewise needs manual review. “Accepted” means Zoho accepted the request, not that it reached an inbox. Use Zoho delivery reports for delivery and bounce status. Keep the dashboard open during a sending run.

Run `node tests/invitations.mjs` to check content escaping, privacy settings, concurrent-send protection and failure/retry behavior against an in-memory database and simulated provider. No real email is sent by the tests.

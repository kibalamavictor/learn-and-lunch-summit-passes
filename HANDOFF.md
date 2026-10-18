# Environment handoff

Git is initialized on main with the requested commit identity. The private remote is https://github.com/kibalamavictor/learn-and-lunch-summit-passes. The user has authorised committing and pushing the complete source.

The Cloudflare app is deployed at https://learn-and-lunch-summit-passes.learnandlunch.workers.dev in the approved existing account. Its D1 database is bound and all four migrations are applied. Existing hosted Site and participant records remain unchanged.

Cloudflare Access was not activated because its free plan requested payment details and overage billing authorization. Built-in staff password login was implemented at the user's request. Production account creation must be completed privately by the user: set SETUP_TOKEN in the prepared Cloudflare secret form, then enter it and a new password at /staff/setup. Remove SETUP_TOKEN afterwards. Initial setup is permanently locked by the first staff account record.

Completed checks:
- TypeScript and production build passed.
- Password hashing, salt isolation, incorrect-password rejection and random session checks passed.
- Disposable local integration tests passed: protected setup, origin checks, session access, one-time setup lock, logout revocation, login throttling and forged identity rejection.
- Remote database migrations completed.
- Deployed setup page returns 200, unauthenticated staff API returns 401, and an invalid login returns 401 on the actual Cloudflare runtime.

All 312 participants were imported into Cloudflare through the authorised account connection. The database was verified to contain 312 unique emails with zero check-ins and zero lunch redemptions. Use new-host invitation URLs.

The source export originally reported a critical Next.js dependency advisory; updating to 16.4.2 removed that critical finding. Upstream advisories remain (last full installation audit: 1 low, 7 moderate, 21 high). This is not a completed dependency-security audit.

Automatic review rejected a command that would print a generated setup key. The command never executed and no generated key was stored. The secure alternative is user-entered key/password creation; no password or key belongs in Git or chat.

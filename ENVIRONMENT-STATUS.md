# Environment setup status

- Local project: `/Users/jowel/Documents/GitHub/Run/github/summit-passes`
- Branch: `main`; source publication is authorised.
- Git identity: `kibalamavictor <kibalama.victor@gmail.com>`, as requested.
- Private GitHub remote: https://github.com/kibalamavictor/learn-and-lunch-summit-passes (empty until your commit/push).
- GitHub CLI connected as `kibalamavictor`; local Git uses its credential helper.
- Approved Cloudflare account: `cc1bdbe94d30c33120556b622a3fe263`.
- D1 database: `summit-passes`, ID `022296f4-e787-49cd-afb9-1636aa0f7f75`.
- All four schema migrations applied to the new remote database.
- Worker: `learn-and-lunch-summit-passes`.
- URL: https://learn-and-lunch-summit-passes.learnandlunch.workers.dev
- Built-in staff password login replaces Cloudflare Access. No Access subscription or billing authorization was activated.
- Staff email: `kibalama.victor@gmail.com`.
- User must privately set the one-time `SETUP_TOKEN` secret, create the staff password at `/staff/setup`, then remove the setup secret. No production password/key has been created by the agent.
- All 312 unique participants were imported into Cloudflare, including the corrected email. Attendance and redemptions remain zero. Use the new-host invitation URLs.
- Existing hosted Site unchanged.

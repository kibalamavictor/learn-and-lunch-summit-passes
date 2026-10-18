# Environment setup status

- Local project: `/Users/jowel/Documents/GitHub/Run/github/summit-passes`
- Branch: `main`; source publication is authorised.
- Git identity: `kibalamavictor <kibalama.victor@gmail.com>`, as requested.
- Public GitHub remote: https://github.com/kibalamavictor/learn-and-lunch-summit-passes (source committed and pushed).
- GitHub CLI connected as `kibalamavictor`; local Git uses its credential helper.
- Approved Cloudflare account: `cc1bdbe94d30c33120556b622a3fe263`.
- D1 database: `summit-passes`, ID `022296f4-e787-49cd-afb9-1636aa0f7f75`.
- All five schema migrations applied, including the private invitation sending ledger.
- Worker: `learn-and-lunch-summit-passes`.
- URL: https://learn-and-lunch-summit-passes.learnandlunch.workers.dev
- Built-in staff password login replaces Cloudflare Access. No Access subscription or billing authorization was activated.
- Staff email: `kibalama.victor@gmail.com`.
- Staff password login has been created by the user. Production credentials are excluded from source control.
- Earlier participant data was cleared at the user’s request. The user subsequently imported the final guest list. Guest counts and attendance are live operational data; use the staff dashboard. Use the new-host invitation URLs.
- Existing hosted Site unchanged.

- Acceptance-email preview, test review and resumable individual sending are deployed. Sending requires the encrypted `ZOHO_SEND_KEY` secret. Delivery and bounce reports remain in Zoho.

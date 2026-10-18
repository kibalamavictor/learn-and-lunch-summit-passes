import { env } from 'cloudflare:workers';
export function database() { if (!env.DB) throw new Error('Guest register is unavailable. Please try again.'); return env.DB; }
export const selectFields = 'id, name, email, token, code, demo, created, checked_in AS checkedIn, redeemed, redeemed_by AS redeemedBy, university, registered, contact_issue AS contactIssue, lunch_token AS lunchToken, lunch_code AS lunchCode, (SELECT status FROM mail_outbox WHERE pass_id = passes.id) AS mailStatus';
export function newPass(owner: string, name: string, email: string, demo = 0) {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  const code = Array.from(crypto.getRandomValues(new Uint8Array(10)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
  return {id:crypto.randomUUID(),owner,name,email,token,code,demo,created:new Date().toISOString()};
}
export async function issue(owner: string, name: string, email: string, demo = 0) {
  const p = newPass(owner,name,email,demo);
  await database().prepare('INSERT INTO passes (id,owner,name,email,token,code,demo,created) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(owner,email) DO NOTHING').bind(p.id,p.owner,p.name,p.email,p.token,p.code,p.demo,p.created).run();
  return p;
}
export async function redeem(owner: string, token: string, staff: string) {
  // The condition and write are a single database statement: only one scanner wins.
  return database().prepare('UPDATE passes SET redeemed = ?, redeemed_by = ? WHERE owner = ? AND lunch_token = ? AND redeemed IS NULL AND checked_in IS NOT NULL AND contact_issue = 0 RETURNING '+selectFields).bind(new Date().toISOString(),staff,owner,token).first();
}

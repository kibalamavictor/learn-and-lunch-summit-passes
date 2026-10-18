import { getStaff } from '../../../lib/staff';
import { database, issue, newPass, selectFields } from '../../../lib/passes';
export const dynamic = 'force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
  const user=await getStaff(); if(!user)return json({error:'Sign in with an authorised staff account to open the guest register.'},401);
  try { const result=await database().prepare('SELECT '+selectFields+' FROM passes WHERE owner = ? ORDER BY demo DESC, name COLLATE NOCASE').bind(user.eventOwner).all();return json({passes:result.results,staff:user.email,deliveryMode:'same-link'}); }
  catch {return json({error:'The guest register is unavailable. Please try again.'},503);}
}
export async function POST(request:Request){
  const user=await getStaff();if(!user)return json({error:'Authorised staff sign-in required.'},401);
  if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request rejected.'},403);
  try {
    const body:any=await request.json();
    if(body.action==='send-lunch')return json({error:'Lunch activates on the original guest link. A second email is not required.'},410);
    if(body.action==='correct-contact'){
      const email=String(body.email||'').trim().toLowerCase();
      if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email))return json({error:'Enter a complete email address.'},400);
      const pass=await database().prepare('UPDATE passes SET email = ?, contact_issue = 0 WHERE owner = ? AND id = ? AND contact_issue = 1 RETURNING '+selectFields).bind(email,user.eventOwner,String(body.id)).first();
      return pass?json({pass}):json({error:'Contact record not found.'},404);
    }
    if(body.action==='demo'){await issue(user.eventOwner,'Enock · test pass','demo@local.invalid',1);return json({ok:true});}
    if(body.action==='reset-demo'){
      // Never reopen a real meal entitlement. Test-only resets invalidate the old QR.
      await database().prepare('DELETE FROM passes WHERE owner = ? AND demo = 1').bind(user.eventOwner).run();
      await issue(user.eventOwner,'Enock · test pass','demo@local.invalid',1);return json({ok:true});
    }
    if(body.action!=='import'||!Array.isArray(body.guests)||body.guests.length<1||body.guests.length>1000)return json({error:'Choose a CSV with 1–1,000 guests.'},400);
    const guests=body.guests.map((g:any)=>({name:String(g.full_name||g.first_name||'').trim(),email:String(g.email||'').trim().toLowerCase(),university:String(g.university||'').trim()}));
    if(guests.some((g:any)=>!g.name||g.name.length>150||!g.email||g.email.length>254||g.university.length>250))return json({error:'Every row needs a name and email. Nothing was imported.'},400);
    const seen=new Set();const unique=guests.filter((g:any)=>!seen.has(g.email)&&seen.add(g.email));
    const existing=await database().prepare('SELECT email FROM passes WHERE owner = ?').bind(user.eventOwner).all<{email:string}>();
    const emails=new Set(existing.results.map(g=>g.email));const fresh=unique.filter((g:any)=>!emails.has(g.email));
    // D1 batch runs atomically; validation happens before any write.
    if(fresh.length)await database().batch(fresh.map((g:any)=>{const p=newPass(user.eventOwner,g.name,g.email);const invalid=!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(g.email);return database().prepare('INSERT INTO passes (id,owner,name,email,token,code,demo,created,university,contact_issue) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(owner,email) DO NOTHING').bind(p.id,p.owner,p.name,p.email,p.token,p.code,p.demo,p.created,g.university,invalid?1:0);}));
    return json({ok:true,imported:fresh.length,skipped:guests.length-fresh.length});
  }catch{return json({error:'Could not complete this change. Please try again.'},400);}
}

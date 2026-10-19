import {env} from 'cloudflare:workers';
import {getStaff} from '../../../lib/staff';
import {database} from '../../../lib/passes';
import {deliver,APP_ORIGIN} from '../../../lib/invitation-delivery';
import {invitation,SENDER,INVITATION_VERSION} from '../../../lib/invitation.mjs';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
async function summary(owner:string){
 const result=await database().prepare("SELECT p.id,p.name,p.email,p.contact_issue AS contactIssue,d.status,d.updated,d.provider_id AS providerId,d.error FROM passes p LEFT JOIN invitation_deliveries d ON d.pass_id=p.id WHERE p.owner=? AND p.demo=0 ORDER BY p.name COLLATE NOCASE").bind(owner).all();
 const test=await database().prepare("SELECT value FROM event_settings WHERE key='invitation_test_reviewed'").first<{value:string}>();
 const reminderJob=await database().prepare('SELECT scheduled_at AS scheduledAt,status,recipient_count AS recipientCount,error FROM scheduled_mail_jobs ORDER BY created DESC LIMIT 1').first();
 return {guests:result.results,connected:!!env.ZOHO_SEND_KEY,testReviewed:test?.value===INVITATION_VERSION,sender:SENDER,reminderJob};
}
export async function GET(){const user=await getStaff();if(!user)return json({error:'Staff sign-in required.'},401);return json(await summary(user.eventOwner));}
export async function POST(request:Request){
 const user=await getStaff();if(!user)return json({error:'Staff sign-in required.'},401);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request rejected.'},403);
 try{
  const body:any=await request.json(),db=database();
  if(body.action==='preview'){
   const pass=body.id?await db.prepare('SELECT name,token FROM passes WHERE owner=? AND id=? AND demo=0').bind(user.eventOwner,String(body.id)).first<{name:string;token:string}>():{name:'Guest',token:'0'.repeat(48)};
   if(!pass)return json({error:'Guest not found.'},404);
   return json(invitation({...pass,origin:APP_ORIGIN,test:!body.id}));
  }
  if(!env.ZOHO_SEND_KEY)return json({error:'Zoho sending key has not been connected.'},503);
  if(body.action==='test'){
   const email=String(body.email||'').trim().toLowerCase();if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)||email.length>254)return json({error:'Enter a complete test email address.'},400);
   const count=await db.prepare("SELECT COUNT(*) AS n FROM invitation_deliveries WHERE pass_id LIKE 'test:%' AND created>?").bind(new Date(Date.now()-15*60000).toISOString()).first<{n:number}>();
   if(count!.n>=5)return json({error:'Five tests have already been requested in 15 minutes. Please wait before sending another.'},429);
   const status=await deliver({id:'test:'+crypto.randomUUID(),name:'Guest',email,token:'0'.repeat(48)},user.email,true);
   return json({status});
  }
  if(body.action==='confirm-test'){
   const test=await db.prepare("SELECT pass_id FROM invitation_deliveries WHERE pass_id LIKE 'test:%' AND status='accepted' AND version=? LIMIT 1").bind(INVITATION_VERSION).first();
   if(!test)return json({error:'Send and review a test email first.'},400);
   await db.prepare("INSERT INTO event_settings (key,value) VALUES ('invitation_test_reviewed',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(INVITATION_VERSION).run();
   return json({ok:true});
  }
  if(body.action!=='send-next'&&body.action!=='retry-failed')return json({error:'Unknown action.'},400);
  const state=await summary(user.eventOwner);if(!state.testReviewed)return json({error:'Review the test email before sending guest invitations.'},409);
  const retry=body.action==='retry-failed';
  // Small resumable batches respect request limits. Import never sends mail automatically.
  const result=await db.prepare("SELECT p.id,p.name,p.email,p.token FROM passes p LEFT JOIN invitation_deliveries d ON d.pass_id=p.id WHERE p.owner=? AND p.demo=0 AND p.contact_issue=0 AND "+(retry?"d.status='failed'":"d.pass_id IS NULL")+" ORDER BY p.name COLLATE NOCASE LIMIT 5").bind(user.eventOwner).all<{id:string;name:string;email:string;token:string}>();
  const statuses=[];for(const pass of result.results){const status=await deliver(pass,user.email,false,retry);statuses.push(status);if(status==='failed'||status==='uncertain')break;}
  return json({processed:statuses.length,stopped:statuses.some(s=>s==='failed'||s==='uncertain'),...await summary(user.eventOwner)});
 }catch{return json({error:'Could not complete this request. Refresh sending status before retrying.'},503);}
}

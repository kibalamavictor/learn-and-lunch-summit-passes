import {SENDER,POSTER_URL} from './invitation.mjs';
export const REMINDER_ID='summit-reminder-2026-10-20';
export const REMINDER_AT='2026-10-20T06:12:00.000Z';
export const REMINDER_SUBJECT='Reminder: Your Summit Is Tomorrow | 21 October';
export const REMINDER_TEXT=`Dear {{firstName}},

See you tomorrow, Wednesday 21 October, at the Campus Food Security Summit!

9:00 AM–5:00 PM · 4th Floor, Idi Basajjabalaba Memorial Library, KIU Main Campus, Kansanga.

Please carry your valid university student ID and show your personal gate pass: {{passUrl}}

Students visiting from other universities: please do not bring bags; the venue is a restricted no-bag area.

Create your Summit poster: ${POSTER_URL}

Warm regards,
Operations At Learn And Lunch`;
const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function reminderPayload(guests){
 if(guests.length<1||guests.length>500)throw Error('Reminder requires 1–500 eligible guests.');
 const to=guests.map(p=>{
   const candidate=String(p.name).trim().split(/\s+/)[0].replace(/^[0-9]+/,'');
   const firstName=/^[\p{L}][\p{L}'’.-]*$/u.test(candidate)?candidate:'Guest';
   return {email_address:{address:p.email,name:p.name},merge_info:{firstName:safe(firstName),passUrl:'https://learn-and-lunch-summit-passes.learnandlunch.workers.dev/pass/'+encodeURIComponent(p.token),guestId:p.id}};
 });
 return {from:SENDER,reply_to:[SENDER],to,subject:REMINDER_SUBJECT,textbody:REMINDER_TEXT,
   htmlbody:'<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:620px;margin:auto;border:2px solid #17232b"><div style="padding:20px;background:#ccebf4"><strong>LEARN AND LUNCH</strong><h2>Your Summit is tomorrow.</h2></div><div style="padding:24px">'+REMINDER_TEXT.split('\n\n').map(p=>'<p>'+safe(p).replaceAll('\n','<br/>')+'</p>').join('')+'</div></div>',
   track_opens:false,track_clicks:false,client_reference:REMINDER_ID+':{{guestId}}'};
}
export async function runScheduledReminder(scheduledTime,bindings,transport=fetch,now=Date.now()){
 const due=Date.parse(REMINDER_AT);
 // Date-specific guard makes the annual cron a single event. Never send early, late next year, or twice.
 if(scheduledTime!==due||now<due||now>due+15*60*1000)return {status:'not-due'};
 const db=bindings.DB;if(!db||!bindings.ZOHO_SEND_KEY)throw Error('Reminder sending configuration is missing.');
 const job=await db.prepare("SELECT recipient_ids FROM scheduled_mail_jobs WHERE id=? AND status='pending' AND scheduled_at=?").bind(REMINDER_ID,REMINDER_AT).first();
 if(!job)return {status:'skipped'};
 const result=await db.prepare("SELECT p.id,p.name,p.email,p.token FROM passes p JOIN invitation_deliveries d ON d.pass_id=p.id WHERE p.id IN (SELECT value FROM json_each(?)) AND p.demo=0 AND p.contact_issue=0 AND d.status='accepted' AND d.error IS NULL AND lower(p.email)=lower(d.email) ORDER BY p.name").bind(job.recipient_ids).all();
 const guests=result.results;
 if(!guests.length||guests.length>500)throw Error('Reminder recipient validation failed.');
 const claimed=await db.prepare("UPDATE scheduled_mail_jobs SET status='sending',started=?,recipient_count=? WHERE id=? AND status='pending' RETURNING id").bind(new Date(now).toISOString(),guests.length,REMINDER_ID).first();
 if(!claimed)return {status:'skipped'};
 let status='uncertain',error='Connection interrupted. Check Zoho before any retry.',providerId=null;
 try{
  const key=bindings.ZOHO_SEND_KEY.trim();
  const response=await transport('https://cpaas.zoho.com/v1.1/email/batch',{method:'POST',headers:{'Content-Type':'application/json',Authorization:key.startsWith('Zoho-enczapikey ')?key:'Zoho-enczapikey '+key},body:JSON.stringify(reminderPayload(guests)),signal:AbortSignal.timeout(25000)});
  const data=await response.json().catch(()=>null);
  const accepted=response.ok&&Array.isArray(data?.data)&&data.data.some(d=>d.code==='EM_104');
  status=accepted?'accepted':response.status>=400&&response.status<500?'failed':'uncertain';
  error=accepted?null:`Zoho returned ${response.status}. Review provider logs before retrying.`;
  providerId=typeof data?.request_id==='string'?data.request_id:null;
 }catch{}
 await db.prepare('UPDATE scheduled_mail_jobs SET status=?,finished=?,provider_id=?,error=? WHERE id=?').bind(status,new Date().toISOString(),providerId,error,REMINDER_ID).run();
 return {status,recipients:guests.length};
}

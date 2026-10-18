import {env} from 'cloudflare:workers';
import {database} from './passes';
import {invitation,INVITATION_VERSION,SENDER} from './invitation.mjs';
export const APP_ORIGIN='https://learn-and-lunch-summit-passes.learnandlunch.workers.dev';
export async function deliver(pass:{id:string;name:string;email:string;token:string},staff:string,test=false,retry=false){
  if(!env.ZOHO_SEND_KEY)throw Error('Zoho sending key has not been connected.');
  const db=database(),now=new Date().toISOString();
  // Claim before the network request. Parallel admins cannot send the same invitation twice.
  const claimed=retry?await db.prepare("UPDATE invitation_deliveries SET status='sending',updated=?,error=NULL,staff=? WHERE pass_id=? AND status='failed' RETURNING pass_id").bind(now,staff,pass.id).first():await db.prepare("INSERT INTO invitation_deliveries (pass_id,email,status,created,updated,version,staff) VALUES (?,?,'sending',?,?,?,?) ON CONFLICT(pass_id) DO NOTHING RETURNING pass_id").bind(pass.id,pass.email,now,now,INVITATION_VERSION,staff).first();
  if(!claimed)return 'skipped';
  let response:Response;
  try{
    const content=invitation({...pass,origin:APP_ORIGIN,test});
    response=await fetch('https://cpaas.zoho.com/v1.1/email',{method:'POST',headers:{'Content-Type':'application/json',Authorization:env.ZOHO_SEND_KEY.startsWith('Zoho-enczapikey ')?env.ZOHO_SEND_KEY:'Zoho-enczapikey '+env.ZOHO_SEND_KEY},body:JSON.stringify({from:SENDER,to:[{email_address:{address:pass.email,name:pass.name}}],reply_to:[SENDER],subject:content.subject,htmlbody:content.htmlbody,textbody:content.textbody,track_clicks:false,track_opens:false,client_reference:INVITATION_VERSION+':'+pass.id}),signal:AbortSignal.timeout(15000)});
  }catch{
    // A timeout may occur after Zoho accepts a message. Never retry an uncertain send automatically.
    await db.prepare("UPDATE invitation_deliveries SET status='uncertain',updated=?,error=? WHERE pass_id=?").bind(new Date().toISOString(),'Connection interrupted. Check Zoho logs before any further action.',pass.id).run();
    return 'uncertain';
  }
  const result:any=await response.json().catch(()=>null);
  const accepted=response.ok && Array.isArray(result?.data) && result.data.some((d:any)=>d.code==='EM_104');
  const status=accepted?'accepted':response.status>=400&&response.status<500?'failed':'uncertain';
  // Store only a provider reference / safe error category, never the request body, QR or key.
  const providerId=typeof result?.request_id==='string'?result.request_id:null;
  const error=accepted?null:`Zoho response ${response.status}. Review Zoho email logs${status==='uncertain'?' before retrying':''}.`;
  await db.prepare('UPDATE invitation_deliveries SET status=?,updated=?,provider_id=?,error=? WHERE pass_id=?').bind(status,new Date().toISOString(),providerId,error,pass.id).run();
  return status;
}

import { getStaff } from '../../../lib/staff';
import { database, newPass, redeem, selectFields } from '../../../lib/passes';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 const user=await getStaff();if(!user)return Response.json({error:'Authorised staff sign-in required.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request rejected.'},{status:403});
 try { const {token,action}=await request.json() as {token:string,action:string};if(typeof token!=='string'||!/^[a-f0-9]{48}$/.test(token))return Response.json({error:'This pass is invalid.'},{status:404});
 if(action==='checkin'){
 const db=database(), now=new Date().toISOString(), fresh=newPass(user.eventOwner,'','');
 await db.prepare('UPDATE passes SET checked_in=COALESCE(checked_in,?), registered=COALESCE(registered,?), lunch_token=COALESCE(lunch_token,?), lunch_code=COALESCE(lunch_code,?) WHERE owner=? AND token=? AND contact_issue=0').bind(now,now,fresh.token,fresh.code,user.eventOwner,token).run();
 const p=await db.prepare('SELECT '+selectFields+' FROM passes WHERE owner=? AND token=? AND checked_in IS NOT NULL AND contact_issue=0').bind(user.eventOwner,token).first<any>();
 if(!p)return Response.json({error:'Pass not found or contact needs correction.'},{status:409});
 return Response.json({pass:p});
 }
 if(action!=='redeem')return Response.json({error:'Unknown action.'},{status:400});
 const p=await redeem(user.eventOwner,token,user.email);if(p)return Response.json({pass:p});
 const used=await database().prepare('SELECT '+selectFields+' FROM passes WHERE owner = ? AND lunch_token = ?').bind(user.eventOwner,token).first<any>();
 return Response.json(used?{error:used.contactIssue?'Participant contact needs correction.':!used.checkedIn?'The registrar must confirm attendance before lunch is activated.':'Lunch already redeemed. Do not issue another meal.',pass:used}:{error:'Pass not found.'},{status:used?409:404});
 }catch{return Response.json({error:'Could not confirm redemption. Check the pass status before trying again.'},{status:503});}
}

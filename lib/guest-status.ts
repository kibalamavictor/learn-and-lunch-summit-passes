import {database} from './passes';
export async function guestStatus(entryToken:string){
 if(!/^[a-f0-9]{48}$/.test(entryToken))return null;
 const p=await database().prepare('SELECT name,token,code,demo,checked_in AS checkedIn,redeemed,lunch_token AS lunchToken,lunch_code AS lunchCode FROM passes WHERE token=? AND contact_issue=0').bind(entryToken).first<any>();
 if(!p)return null;
 const active=!!(p.checkedIn&&p.lunchToken&&p.lunchCode);
 return {name:p.name,token:active?p.lunchToken:p.token,code:active?p.lunchCode:p.code,demo:p.demo,checkedIn:p.checkedIn,redeemed:p.redeemed,kind:active?'lunch':'entry'};
}

import {database} from '../../../lib/passes';
import GuestPass from '../../guest-pass';
export const dynamic='force-dynamic';
export default async function LunchPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 const pass=/^[a-f0-9]{48}$/.test(token)?await database().prepare('SELECT name,lunch_token AS token,lunch_code AS code,demo,redeemed FROM passes WHERE lunch_token = ? AND checked_in IS NOT NULL AND contact_issue = 0').bind(token).first():null;
 if(!pass)return <main className="empty-page"><h1>Lunch pass unavailable</h1><p>Please ask the summit welcome team for help.</p></main>;
 return <GuestPass pass={pass} kind="lunch"/>;
}

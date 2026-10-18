import {guestStatus} from '../../../lib/guest-status';
import GuestPass from '../../guest-pass';
export const dynamic='force-dynamic';
export default async function PassPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params,pass=await guestStatus(token);
 if(!pass)return <main className="empty-page"><h1>Pass unavailable</h1><p>Please ask the summit welcome team for help.</p></main>;
 return <GuestPass pass={pass} kind={pass.kind as 'entry'|'lunch'} entryToken={token}/>;
}

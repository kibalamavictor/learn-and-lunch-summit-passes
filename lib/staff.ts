import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { database } from './passes';
export async function getStaff(){
 const user=await getChatGPTUser();if(!user)return null;
 const allowed=(env.STAFF_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean);
 if(!allowed.includes(user.email.toLowerCase()))return null;
 // Only allowlisted staff can create/read the event's shared owner record.
 await database().prepare('INSERT INTO event_settings (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING').bind('event_owner',user.userId).run();
 const record=await database().prepare('SELECT value FROM event_settings WHERE key = ?').bind('event_owner').first<{value:string}>();
 return {...user,eventOwner:record!.value};
}

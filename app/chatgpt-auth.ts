import {cookies} from 'next/headers';
import {database} from '../lib/passes';
import {digest} from '../lib/password-auth.mjs';
// Legacy function name retained; identity comes only from database sessions.
export async function getChatGPTUser(){
 const token=(await cookies()).get('__Host-summit_staff')?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const user=await database().prepare('SELECT u.id,u.email FROM staff_sessions s JOIN staff_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?').bind(await digest(token),Date.now()).first<{id:string,email:string}>();
 return user?{userId:user.id,email:user.email,displayName:user.email,fullName:null}:null;
}

import {env} from 'cloudflare:workers';
import {database} from '../../../lib/passes';
import {randomToken,digest,passwordHash,equal} from '../../../lib/password-auth.mjs';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200,cookie?:string)=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Request rejected.'},403);
 try{
 const db=database(),b:any=await request.json();
 if(b.action==='logout'){const cookie=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-summit_staff=([a-f0-9]{64})(?:;|$)/)?.[1];if(cookie)await db.prepare('DELETE FROM staff_sessions WHERE token_hash=?').bind(await digest(cookie)).run();return json({ok:true},200,'__Host-summit_staff=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');}
 const email=String(b.email||'').trim().toLowerCase(),password=String(b.password||'');
 if(!email||email.length>254||password.length>256)return json({error:'Check your email and password.'},400);
 const now=Date.now(),bucket=Math.floor(now/900000),ip=request.headers.get('cf-connecting-ip')||'local';
 const limit=await db.prepare('INSERT INTO login_limits (key,bucket,attempts) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN bucket=excluded.bucket THEN attempts+1 ELSE 1 END,bucket=excluded.bucket RETURNING attempts').bind(await digest(ip+'|'+email),bucket).first<any>();
 if(limit.attempts>8)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 let user:any;
 if(b.action==='setup'){
 if(!env.SETUP_TOKEN||!equal(String(b.setupToken||''),env.SETUP_TOKEN))return json({error:'Setup link is invalid.'},403);
 if(password.length<14||b.confirmPassword!==password)return json({error:'Use at least 14 characters and matching passwords.'},400);
 const allowed=(env.STAFF_EMAILS||'').split(',').map(x=>x.trim().toLowerCase());if(!allowed.includes(email))return json({error:'Use the configured staff email address.'},403);
 if(await db.prepare('SELECT id FROM staff_users LIMIT 1').first())return json({error:'Initial account setup has already been completed.'},409);
 user={id:crypto.randomUUID(),email};const salt=randomToken();
 await db.prepare('INSERT INTO staff_users (id,email,password_hash,salt,singleton) VALUES (?,?,?,?,1)').bind(user.id,email,await passwordHash(password,salt),salt).run();
 }else if(b.action==='login'){
 user=await db.prepare('SELECT id,email,password_hash,salt FROM staff_users WHERE email=?').bind(email).first<any>();
 const computed=await passwordHash(password,user?.salt||'no-account-placeholder-salt');if(!user||!equal(computed,user.password_hash))return json({error:'Email or password is incorrect.'},401);
 }else return json({error:'Unknown action.'},400);
 const token=randomToken();await db.batch([db.prepare('DELETE FROM staff_sessions WHERE expires<=?').bind(now),db.prepare('INSERT INTO staff_sessions (token_hash,user_id,expires) VALUES (?,?,?)').bind(await digest(token),user.id,now+12*60*60*1000)]);
 return json({ok:true},200,'__Host-summit_staff='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200');
 }catch{return json({error:'Could not complete sign-in. Please try again.'},503);}
}

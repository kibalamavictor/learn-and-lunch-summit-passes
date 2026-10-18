import {guestStatus} from '../../../../lib/guest-status';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 const pass=await guestStatus(token);
 return Response.json(pass?{pass}:{error:'Pass unavailable. Please ask the welcome team.'},{status:pass?200:404,headers:{'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer'}});
}

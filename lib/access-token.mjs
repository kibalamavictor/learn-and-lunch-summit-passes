import {createRemoteJWKSet,jwtVerify} from 'jose';
const sets=new Map();
export async function verifyAccessToken(token,teamDomain,audience,keySet){
 try{
  if(!token||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(teamDomain||'')||!audience)return null;
  let keys=keySet||sets.get(teamDomain);
  if(!keys){keys=createRemoteJWKSet(new URL(teamDomain+'/cdn-cgi/access/certs'));sets.set(teamDomain,keys);}
  const {payload}=await jwtVerify(token,keys,{issuer:teamDomain,audience,algorithms:['RS256'],requiredClaims:['sub','email','exp','iat']});
  if(typeof payload.email!=='string'||typeof payload.sub!=='string')return null;
  return {userId:payload.sub,email:payload.email,displayName:payload.email,fullName:null};
 }catch{return null;}
}

export const POSTER_URL:string;
export const INVITATION_VERSION:string;
export const SENDER:{address:string;name:string};
export function invitation(input:{name:string;token:string;origin:string;test?:boolean}):{subject:string;textbody:string;htmlbody:string;passUrl:string};

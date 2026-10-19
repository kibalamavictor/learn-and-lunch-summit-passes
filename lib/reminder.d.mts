export const REMINDER_ID:string;
export const REMINDER_AT:string;
export const REMINDER_SUBJECT:string;
export const REMINDER_TEXT:string;
export function reminderPayload(guests:{id:string;name:string;email:string;token:string}[]):any;
export function runScheduledReminder(scheduledTime:number,bindings:{DB?:D1Database;ZOHO_SEND_KEY?:string},transport?:typeof fetch,now?:number):Promise<{status:string;recipients?:number}>;

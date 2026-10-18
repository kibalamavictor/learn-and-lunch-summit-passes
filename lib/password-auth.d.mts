export function randomToken():string;
export function digest(value:string):Promise<string>;
export function passwordHash(password:string,salt:string):Promise<string>;
export function equal(a:string,b:string):boolean;

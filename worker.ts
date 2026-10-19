import app from 'vinext/server/fetch-handler';
import {runScheduledReminder} from './lib/reminder.mjs';
export default {
 ...app,
 scheduled(controller:ScheduledController,bindings:Cloudflare.Env,ctx:ExecutionContext){
  ctx.waitUntil(runScheduledReminder(controller.scheduledTime,bindings).then(result=>{
   console.log('Summit reminder:',JSON.stringify(result));
  }));
 }
};

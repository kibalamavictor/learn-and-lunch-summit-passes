export const POSTER_URL = 'https://www.learnandlunch.org/summit-poster/';
export const INVITATION_VERSION = 'summit-2026-v1';
export const SENDER = {address:'operations@learnandlunch.org', name:'Operations At Learn And Lunch'};
const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function invitation({name,token,origin,test=false}) {
  const candidate=String(name).trim().split(/\s+/)[0].replace(/^[0-9]+/,'');
  const firstName=/^[\p{L}][\p{L}'’.-]*$/u.test(candidate)?candidate:'Guest';
  const passUrl=new URL('/pass/'+encodeURIComponent(token),origin).href;
  const subject=(test?'[TEST] ':'')+'Your Registration is Confirmed | Campus Food Security Summit 2026';
  const paragraphs=[
    `Dear ${firstName},`,
    'Congratulations! We are pleased to confirm your registration for the Campus Food Security Summit 2026.',
    'We look forward to welcoming you as we bring together students, university leaders, policymakers and partners to advance the conversation on building food-secure universities in Uganda.',
    'EVENT DETAILS\nTheme: Building Food-Secure Universities in Uganda\nDate: Wednesday, 21 October 2026\nTime: 9:00 AM – 5:00 PM (East Africa Time)\nVenue: 4th Floor, Idi Basajjabalaba Memorial Library, Kampala International University (KIU), Main Campus, Kansanga.',
    `YOUR PERSONAL GATE PASS\n${test?'This is a preview only. The sample pass is not valid for entry.\n':''}${passUrl}\nKeep this link private. Show your entry QR to the registrar when you arrive. After staff verify your identity and confirm attendance, reopen or refresh the same link to see your activated lunch QR. Present that QR at the lunch line. Each lunch pass can be redeemed once.`,
    'UNIVERSITY ID\nPlease carry your valid university student ID for identification at the event.',
    'IMPORTANT NOTICE FOR VISITING STUDENTS\nIf you are visiting from a university other than KIU, please do not bring a bag. The event will take place in a restricted area where bags are not permitted.',
    `YOUR PERSONALISED SUMMIT POSTER\nCreate and share your personalised Summit poster here:\n${POSTER_URL}`,
    'Please arrive on time and come ready to contribute to meaningful conversations and solutions. We look forward to seeing you on 21 October!',
    'No Student Should Study Hungry.',
    'Warm regards,\nOperations At Learn And Lunch\noperations@learnandlunch.org',
    'You are receiving this registration confirmation because you applied to attend the summit. If you believe this was sent to you in error or need help, reply to this email.'
  ];
  const button=(url,label)=>`<p style="margin:24px 0"><a href="${escape(url)}" style="display:inline-block;background:#ffd34d;color:#111;border:2px solid #111;padding:14px 22px;font-weight:bold;text-decoration:none">${label}</a></p>`;
  const htmlbody=`<!doctype html><html><body style="margin:0;background:#eef7fa;color:#17232b;font-family:Arial,sans-serif;line-height:1.6"><div style="max-width:640px;margin:24px auto;border:2px solid #17232b;background:#fff"><div style="padding:28px;background:#ccebf4;border-bottom:2px solid #17232b"><img src="${escape(origin)}/summit-logo.png" width="180" alt="Learn And Lunch"/><p style="font-size:12px;letter-spacing:2px">CAMPUS FOOD SECURITY SUMMIT 2026</p><h1 style="font-size:28px;line-height:1.2;margin:0">Your registration is confirmed.</h1></div><div style="padding:28px">${test?'<p style="padding:12px;background:#fff2c4"><strong>TEST EMAIL:</strong> Preview only. This sample pass is not valid for entry.</p>':''}${paragraphs.map((p,i)=>{
    if(i===4)return `<h2 style="font-size:19px">Your personal gate pass</h2>${button(passUrl,'View My Personal Gate Pass')}<p>${escape(p.split('\n').slice(test?3:2).join('\n')).replaceAll('\n','<br/>')}</p><p style="font-size:12px;word-break:break-all">If the button does not open, copy this link:<br/><a href="${escape(passUrl)}">${escape(passUrl)}</a></p>`;
    if(i===7)return `<h2 style="font-size:19px">Your personalised Summit poster</h2><p>Create and share your personalised Summit poster.</p>${button(POSTER_URL,'Create My Summit Poster')}`;
    return `<p${i===6?' style="padding:16px;background:#fff2c4;border-left:4px solid #17232b"':''}>${escape(p).replaceAll('\n','<br/>')}</p>`;
  }).join('')}</div></div></body></html>`;
  return {subject,textbody:paragraphs.join('\n\n'),htmlbody,passUrl};
}

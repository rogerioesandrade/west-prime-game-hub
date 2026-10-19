(function(root){
 'use strict';
 const started=Date.now();let api=null,initialized=false,finished=false,completed=false,snapshot='',lastReport=null,issue='',failedWrite=false;
 function find(win){let n=0;while(win&&n++<100){try{if(win.API&&typeof win.API.LMSInitialize==='function')return win.API;if(win.parent===win)break;win=win.parent;}catch(_){break;}}return null;}
 function call(method,...args){try{return api[method](...args);}catch(e){issue=method+' unavailable';return 'false';}}
 function ok(result){return String(result).toLowerCase()==='true';}
 function set(key,value){if(!initialized||finished)return false;const success=ok(call('LMSSetValue',key,String(value)));if(!success){issue=key+': '+call('LMSGetLastError');failedWrite=true;}return success;}
 function get(key){return initialized?String(call('LMSGetValue',key)||''):'';}
 function commit(){if(!initialized||finished)return false;const success=ok(call('LMSCommit',''));if(!success)issue='LMSCommit: '+call('LMSGetLastError');root.dispatchEvent?.(new Event('wg-save'));return success&&!failedWrite;}
 function initialize(){api=find(root);if(!api)try{api=find(root.opener);}catch(_){}if(!api){issue='preview';return false;}initialized=ok(call('LMSInitialize',''));if(!initialized){issue='LMSInitialize: '+call('LMSGetLastError');return false;}const status=get('cmi.core.lesson_status');completed=status==='completed'||status==='passed';snapshot=get('cmi.suspend_data');return true;}
 function interaction(n,id,response,correct){set('cmi.interactions.'+n+'.id',id);set('cmi.interactions.'+n+'.type','choice');set('cmi.interactions.'+n+'.student_response',String.fromCharCode(97+response));set('cmi.interactions.'+n+'.correct_responses.0.pattern',String.fromCharCode(97+correct));set('cmi.interactions.'+n+'.result',response===correct?'correct':'wrong');}
 function report(raw){let s;try{s=JSON.parse(raw);}catch(_){return false;}if(s.version!==1||s.stage<1||s.stage>7||!Array.isArray(s.answers)||s.answers.length>4||!Array.isArray(s.devices)||!Array.isArray(s.decisionAttempts)||s.decisionAttempts.length>64)return false;
  lastReport=s;if(completed)return true;const safe=JSON.stringify(s);if(new TextEncoder().encode(safe).length>4096){issue='suspend_data too large';return false;}snapshot=safe;
  if(!initialized||finished)return false;failedWrite=false;issue='';
  set('cmi.core.lesson_status',s.stage===7?'completed':'incomplete');set('cmi.core.lesson_location',String(s.stage));set('cmi.suspend_data',safe);set('cmi.core.score.min',0);set('cmi.core.score.max',100);set('cmi.core.score.raw',Math.max(0,Math.min(100,s.correct*25)));
  const q=[1,0,2,1],d=[0,1,2];s.answers.forEach((a,i)=>interaction(i,'nr13_question_'+(i+1),a,q[i]));s.decisionAttempts.forEach((encoded,i)=>{const step=Math.floor(encoded/10),answer=encoded%10;if(step>=0&&step<3)interaction(4+i,'nr13_decision_'+(step+1)+'_attempt_'+(i+1),answer,d[step]);});
  set('cmi.core.exit',s.stage===7?'':'suspend');const saved=commit();if(s.stage===7&&saved)completed=true;return saved;
 }
 function duration(ms){let cs=Math.floor(ms/10),h=Math.floor(cs/360000);cs%=360000;let m=Math.floor(cs/6000);cs%=6000;let sec=Math.floor(cs/100);return String(h).padStart(4,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs%100).padStart(2,'0');}
 function finish(){if(finished)return true;if(!initialized)return !api;if(lastReport&&!completed&&!report(JSON.stringify(lastReport)))return false;set('cmi.core.session_time',duration(Date.now()-started));set('cmi.core.exit',completed?'':'suspend');if(!commit())return false;const success=ok(call('LMSFinish',''));finished=success;return success;}
 initialize();root.addEventListener?.('pagehide',finish);root.addEventListener?.('beforeunload',finish);root.document?.addEventListener('visibilitychange',()=>{if(root.document.hidden&&!finished&&initialized)commit();});
 root.WGSCORM={report,finish,commit,get resume(){return snapshot;},get connected(){return initialized;},get completed(){return completed;},get issue(){return issue;},duration};
})(typeof window==='undefined'?globalThis:window);

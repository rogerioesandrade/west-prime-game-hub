import { createScorm12Runtime } from './scorm-runtime.mjs';
// Keep the existing progress key across compatible 1.1.x releases.
const key='west-prime:nr13:v1.1.1';
const $=id=>document.getElementById(id);
let frame=null,runtime=null,timer=null,checking=false,pausedForLeave=false;
function save(values){
 try {localStorage.setItem(key,JSON.stringify({values,updatedAt:new Date().toISOString()}));}
 catch(error){$('save-status').textContent='Não foi possível salvar neste navegador';throw error;}
 const completed=['completed','passed'].includes(values['cmi.core.lesson_status']);
 $('restart').hidden=!completed;
 $('save-status').textContent=completed?'Treinamento concluído':'Progresso salvo neste navegador';
}
function prepareRuntime(reset=false){
 let values={};
 try {if(reset)localStorage.removeItem(key);else {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.values) values=Object.fromEntries(Object.entries(saved.values).filter(([k,v])=>k.startsWith('cmi.')&&typeof v==='string'));}}
 catch {$('save-status').textContent='Armazenamento indisponível neste navegador';}
 runtime=createScorm12Runtime(values,save);window.API=runtime.api;
 $('restart').hidden=!['completed','passed'].includes(values['cmi.core.lesson_status']);
}
async function check(){
 if(checking||frame)return;checking=true;clearTimeout(timer);$('retry').hidden=true;
 try {const response=await fetch(new URL('./nr13-ready.json',import.meta.url),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Unavailable');const data=await response.json();if(!data.ready)throw new Error('Not ready');
  frame=document.createElement('iframe');frame.src=new URL('./scorm/nr13/v1.1.2/index.html',import.meta.url).href;frame.title='Simulador NR-13 — escolha celular ou computador';frame.allow='fullscreen; autoplay';frame.allowFullscreen=true;frame.addEventListener('load',()=>{$('loading').hidden=true});$('stage').append(frame);
 }catch {$('loading-message').textContent='O simulador ainda não está disponível. Tentando novamente…';$('retry').hidden=false;timer=setTimeout(check,10000);}
 finally{checking=false;}
}
function persistGame(){
 try{frame?.contentWindow.WGSend?.('Persist');frame?.contentWindow.WGSCORM?.commit?.();}catch{}
 return runtime?.flush()==='true';
}
$('retry').onclick=check;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(frame?.requestFullscreen)await frame.requestFullscreen();}catch{$('save-status').textContent='Tela cheia indisponível. Use o celular na horizontal.'}};
$('restart').onclick=()=>{frame?.remove();frame=null;runtime?.flush();prepareRuntime(true);$('loading').hidden=false;$('loading-message').textContent='Preparando o simulador…';void check();};
$('hub-back').onclick=event=>{
 if(!frame)return;event.preventDefault();
 const game=frame.contentWindow;
 try {pausedForLeave=true;game.WGSend?.('BrowserVisibility','0');game.document.exitPointerLock?.();} catch{}
 $('leave-dialog').showModal();
};
function resume(){try{if(pausedForLeave)frame?.contentWindow.WGSend?.('BrowserVisibility','1');}catch{}pausedForLeave=false;}
$('stay').onclick=()=>$('leave-dialog').close();
$('leave-dialog').addEventListener('close',resume);
$('leave').onclick=()=>{if(!persistGame()){$('leave-error').textContent='Não foi possível salvar. Tente novamente ou continue jogando.';return;}location.assign(new URL('./',import.meta.url).href);};
window.addEventListener('pagehide',persistGame);
prepareRuntime();void check();

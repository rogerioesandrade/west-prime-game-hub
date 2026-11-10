/* West Group — independent test scene, no external assets or runtime dependencies. */
'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d');
let locked=false,started=false,yaw=0,pitch=.22,total=0,x=0,z=0,sensitivity=.10,previous=performance.now();
const keys=new Set();
function syncLock(){locked=document.pointerLockElement===canvas;keys.clear();$('overlay').hidden=locked;$('crosshair').hidden=!locked;$('pause').hidden=!locked;$('status').textContent=locked?'CÂMERA CAPTURADA · SEM LIMITE HORIZONTAL':'PAUSADO';if(locked)started=true;$('start').textContent=started?'RETOMAR TESTE':'INICIAR TESTE';}
function release(){keys.clear();if(document.pointerLockElement===canvas)document.exitPointerLock();}
$('start').onclick=async()=>{if(!canvas.requestPointerLock){$('message').textContent='Este navegador não oferece captura do mouse. Abra o teste no Chrome ou Edge para PC.';return;}canvas.focus();try{await canvas.requestPointerLock();}catch{$('message').textContent='A captura não foi autorizada. Clique novamente em Retomar teste.';}};
document.addEventListener('pointerlockchange',syncLock);
document.addEventListener('pointerlockerror',()=>{$('message').textContent='O navegador recusou a captura. Clique novamente no botão para tentar.';syncLock();});
document.addEventListener('mousemove',e=>{if(!locked)return;const dx=e.movementX*sensitivity*Math.PI/180,dy=e.movementY*sensitivity*Math.PI/180;yaw+=dx;total+=dx;pitch=Math.max(-.25,Math.min(1.05,pitch+dy));});
document.addEventListener('keydown',e=>{if(e.code==='Escape'){release();return;}if(locked&&['KeyW','KeyA','KeyS','KeyD'].includes(e.code)){keys.add(e.code);e.preventDefault();}});
document.addEventListener('keyup',e=>keys.delete(e.code));
$('pause').onclick=release;window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
$('sensitivity').oninput=e=>{sensitivity=Number(e.target.value);$('value').textContent=sensitivity.toFixed(2).replace('.',',');};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('message').textContent='Tela cheia indisponível. O teste também funciona em janela.';}};
let W=0,H=0,F=0,cam,forward,right,up;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function space(p){const v=p.map((a,i)=>a-cam[i]);return [dot(v,right),dot(v,up),dot(v,forward)];}
function project(p){return [W/2+p[0]*F/p[2],H/2-p[1]*F/p[2]];}
function line(a,b,color,width=1){a=space(a);b=space(b);if(a[2]<.08&&b[2]<.08)return;if(a[2]<.08){let t=(.08-a[2])/(b[2]-a[2]);a=a.map((v,i)=>v+(b[i]-v)*t);}if(b[2]<.08){let t=(.08-b[2])/(a[2]-b[2]);b=b.map((v,i)=>v+(a[i]-v)*t);}a=project(a);b=project(b);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
const faces=[];
function box(cx,cy,cz,w,h,d,color,angle=0){const c=Math.cos(angle),s=Math.sin(angle),points=[];for(const y of [-h/2,h/2])for(const z of [-d/2,d/2])for(const x of [-w/2,w/2])points.push(space([cx+x*c+z*s,cy+y,cz-x*s+z*c]));for(const ids of [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]){const p=ids.map(i=>points[i]);if(p.some(v=>v[2]<.08))continue;faces.push({p:p.map(project),depth:p.reduce((a,v)=>a+v[2],0)/4,color});}}
function label(text,p,color='#edf2f7'){p=space(p);if(p[2]<.1)return;const q=project(p);ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillStyle='#091c39e8';ctx.fillRect(q[0]-55,q[1]-20,110,28);ctx.fillStyle=color;ctx.fillText(text,...q);}
function render(now){let dt=Math.min((now-previous)/1000,.05);previous=now;const dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);F=Math.min(W,H)*.85;
 const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);if(locked){let a=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),b=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),n=Math.hypot(a,b)||1;x=Math.max(-9,Math.min(9,x+(a*cy+b*sy)/n*dt*2));z=Math.max(-9,Math.min(9,z+(-a*sy+b*cy)/n*dt*2));}
 cam=[x-sy*cp*4,1.2+sp*4,z-cy*cp*4];forward=[sy*cp,-sp,cy*cp];right=[cy,0,-sy];up=[sy*sp,cp,cy*sp];ctx.fillStyle='#183957';ctx.fillRect(0,0,W,H);
 for(let i=-14;i<=14;i++){line([i,0,-14],[i,0,14],i===0?'#b69b4b':'#507184',i===0?2:1);line([-14,0,i],[14,0,i],i===0?'#b69b4b':'#507184',i===0?2:1);}faces.length=0;
 for(const [px,pz,color] of [[0,10,'#0288d1'],[10,0,'#ff8800'],[0,-10,'#2e9d92'],[-10,0,'#b39136']])box(px,1.1,pz,1,2.2,1,color);
 box(x,.94,z,.48,.65,.28,'#0288d1',yaw);box(x,1.47,z,.32,.34,.32,'#edf2f7',yaw);
 for(const side of [-1,1]){box(x+cy*side*.15,.39,z-sy*side*.15,.18,.65,.24,'#10243b',yaw);box(x+cy*side*.35,.96,z-sy*side*.35,.14,.58,.18,'#0288d1',yaw);}
 faces.sort((a,b)=>b.depth-a.depth);for(const face of faces){ctx.beginPath();face.p.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='#091c3977';ctx.stroke();}
 label('NORTE',[0,2.6,10]);label('LESTE',[10,2.6,0]);label('SUL',[0,2.6,-10]);label('OESTE',[-10,2.6,0]);$('turns').textContent='Giro acumulado: '+Math.round(total*180/Math.PI)+'°';requestAnimationFrame(render);
}
syncLock();requestAnimationFrame(render);

/* West Group — independent test scene, no external assets or runtime dependencies. */
'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d');
let locked=false,started=false,yaw=0,pitch=.03,total=0,x=0,z=0,bodyYaw=0,sensitivity=.10,previous=performance.now(),active=null,noticeUntil=0,cameraDistance=2.7,targetDistance=2.7;
const objects=[{name:'PAINEL A',p:[.8,1.15,3.2],s:[.9,1.4,.5],interactive:true,on:false},{name:'PAINEL B',p:[-3,1.15,1],s:[.9,1.4,.5],interactive:true,on:false},{name:'BARREIRA',p:[-2,1,-1],s:[1.3,2,.35],interactive:false}];
for(const [px,pz,color] of [[0,10,'#0288d1'],[10,0,'#ff8800'],[0,-10,'#2e9d92'],[-10,0,'#b39136']])objects.push({p:[px,1.1,pz],s:[1,2.2,1],color,interactive:false});
function rayBox(origin,dir,obj){let near=0,far=100;for(let i=0;i<3;i++){const lo=obj.p[i]-obj.s[i]/2,hi=obj.p[i]+obj.s[i]/2;if(Math.abs(dir[i])<1e-7){if(origin[i]<lo||origin[i]>hi)return null;}else{let a=(lo-origin[i])/dir[i],b=(hi-origin[i])/dir[i];near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return null;}}return near;}
function interact(){if(!locked||!active)return;active.on=!active.on;$('action').textContent=active.name+(active.on?' · LIGADO':' · DESLIGADO');noticeUntil=performance.now()+1400;}
document.addEventListener('mousedown',e=>{if(e.button===0)interact();});
const keys=new Set();
canvas.addEventListener('wheel',e=>{if(!locked)return;e.preventDefault();targetDistance=Math.max(2.2,Math.min(4.2,targetDistance+Math.sign(e.deltaY)*.25));},{passive:false});
function syncLock(){locked=document.pointerLockElement===canvas;keys.clear();$('overlay').hidden=locked;$('crosshair').hidden=!locked;$('pause').hidden=!locked;$('status').textContent=locked?'CÂMERA CAPTURADA · SEM LIMITE HORIZONTAL':'PAUSADO';if(locked)started=true;$('start').textContent=started?'RETOMAR TESTE':'INICIAR TESTE';}
function release(){keys.clear();if(document.pointerLockElement===canvas)document.exitPointerLock();}
$('start').onclick=async()=>{if(!canvas.requestPointerLock){$('message').textContent='Este navegador não oferece captura do mouse. Abra o teste no Chrome ou Edge para PC.';return;}canvas.focus();try{await canvas.requestPointerLock();}catch{$('message').textContent='A captura não foi autorizada. Clique novamente em Retomar teste.';}};
document.addEventListener('pointerlockchange',syncLock);
document.addEventListener('pointerlockerror',()=>{$('message').textContent='O navegador recusou a captura. Clique novamente no botão para tentar.';syncLock();});
document.addEventListener('mousemove',e=>{if(!locked)return;const dx=e.movementX*sensitivity*Math.PI/180,dy=e.movementY*sensitivity*Math.PI/180;yaw+=dx;total+=dx;pitch=Math.max(-.25,Math.min(1.05,pitch+dy));});
document.addEventListener('keydown',e=>{if(e.code==='Escape'){release();return;}if(e.code==='KeyE'&&!e.repeat){interact();return;}if(locked&&['KeyW','KeyA','KeyS','KeyD'].includes(e.code)){keys.add(e.code);e.preventDefault();}});
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
 const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);if(locked){let a=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),b=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),n=Math.hypot(a,b)||1;const dx=(a*cy+b*sy)/n,dz=(-a*sy+b*cy)/n;const free=(px,pz)=>!objects.some(o=>Math.abs(px-o.p[0])<o.s[0]/2+.28&&Math.abs(pz-o.p[2])<o.s[2]/2+.28);let nx=Math.max(-9,Math.min(9,x+dx*dt*2)),nz=Math.max(-9,Math.min(9,z+dz*dt*2));if(free(nx,z))x=nx;if(free(x,nz))z=nz;if(a||b){const diff=Math.atan2(Math.sin(Math.atan2(dx,dz)-bodyYaw),Math.cos(Math.atan2(dx,dz)-bodyYaw));bodyYaw+=diff*Math.min(1,dt*12);}}
 cameraDistance+=(targetDistance-cameraDistance)*(1-Math.exp(-10*dt));
 cam=[x-sy*cp*cameraDistance+cy*.75,1.55,z-cy*cp*cameraDistance-sy*.75];forward=[sy*cp,-sp,cy*cp];right=[cy,0,-sy];up=[sy*sp,cp,cy*sp];ctx.fillStyle='#183957';ctx.fillRect(0,0,W,H);
 active=null;let hit=null,distance=100;for(const obj of objects){const t=rayBox(cam,forward,obj);if(t!==null&&t<distance){distance=t;hit=obj;}}
 let hint='Mire no painel e aproxime-se para interagir.';if(hit&&hit.interactive){const point=cam.map((v,i)=>v+forward[i]*distance),chest=[x,1.2,z],d=point.map((v,i)=>v-chest[i]),reach=Math.hypot(...d),direction=d.map(v=>v/(reach||1));const blocked=objects.some(o=>o!==hit&&rayBox(chest,direction,o)!==null&&rayBox(chest,direction,o)<reach-.02);if(reach<=2.7&&!blocked){active=hit;hint=hit.name+' · Clique ou [ E ] · '+(hit.on?'Desligar':'Ligar');}else hint=hit.name+' · Aproxime-se';}
 $('crosshair').classList.toggle('ready',!!active&&locked);$('dot').hidden=!!active;$('hand').toggleAttribute('hidden',!active);$('action').hidden=!locked;if(now>noticeUntil)$('action').textContent=hint;
 for(let i=-14;i<=14;i++){line([i,0,-14],[i,0,14],i===0?'#b69b4b':'#507184',i===0?2:1);line([-14,0,i],[14,0,i],i===0?'#b69b4b':'#507184',i===0?2:1);}faces.length=0;
 for(const obj of objects){box(...obj.p,...obj.s,obj.color||(obj.interactive?(obj.on?'#2e9d92':'#ff8800'):'#687a88'));if(obj.interactive){box(obj.p[0],obj.p[1]+.18,obj.p[2]-.26,.62,.42,.03,'#091c39');box(obj.p[0],obj.p[1]-.22,obj.p[2]-.28,.16,.16,.06,obj===active?'#edf2f7':'#b39136');}}
 const bs=Math.sin(bodyYaw),bc=Math.cos(bodyYaw);box(x,.94,z,.48,.65,.28,'#0288d1',bodyYaw);box(x,1.47,z,.32,.34,.32,'#edf2f7',bodyYaw);
 for(const side of [-1,1]){box(x+bc*side*.15,.39,z-bs*side*.15,.18,.65,.24,'#10243b',bodyYaw);box(x+bc*side*.35,.96,z-bs*side*.35,.14,.58,.18,'#0288d1',bodyYaw);}
 faces.sort((a,b)=>b.depth-a.depth);for(const face of faces){ctx.beginPath();face.p.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='#091c3977';ctx.stroke();}
 label('NORTE',[0,2.6,10]);label('LESTE',[10,2.6,0]);label('SUL',[0,2.6,-10]);label('OESTE',[-10,2.6,0]);$('turns').textContent='Giro acumulado: '+Math.round(total*180/Math.PI)+'°';requestAnimationFrame(render);
}
syncLock();requestAnimationFrame(render);

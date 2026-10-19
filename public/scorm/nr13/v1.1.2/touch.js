/* HTML touch controls send explicit actions; they never synthesize mouse/keyboard input. */
window.WGTouch=(()=>{
 const $=id=>document.getElementById(id),root=$('touch-controls'),stick=$('move-pad'),knob=$('move-knob'),look=$('look-pad');
 let enabled=false,moveId=null,lookId=null,lastX=0,lastY=0,dx=0,dy=0,frame=0,wasPortrait=false;
 const send=(method,value)=>{if(window.WGSend)window.WGSend(method,value);};
 function clear(){moveId=lookId=null;dx=dy=0;knob.style.transform='translate(-50%,-50%)';send('ResetTouch');}
 function position(e){const r=stick.getBoundingClientRect(),radius=r.width*.34;let x=(e.clientX-r.left-r.width/2)/radius,y=(r.top+r.height/2-e.clientY)/radius;const length=Math.hypot(x,y);if(length>1){x/=length;y/=length;}knob.style.transform=`translate(calc(-50% + ${x*radius}px),calc(-50% - ${y*radius}px))`;send('TouchMove',JSON.stringify({x,y}));}
 stick.addEventListener('pointerdown',e=>{if(!enabled||moveId!==null)return;e.preventDefault();moveId=e.pointerId;stick.setPointerCapture(e.pointerId);position(e);});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===moveId){e.preventDefault();position(e);}});
 function stopMove(e){if(e.pointerId!==moveId)return;moveId=null;knob.style.transform='translate(-50%,-50%)';send('TouchMove','{"x":0,"y":0}');}
 for(const name of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(name,stopMove);
 look.addEventListener('pointerdown',e=>{if(!enabled||lookId!==null)return;e.preventDefault();lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY;look.setPointerCapture(e.pointerId);});
 look.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;e.preventDefault();dx+=e.clientX-lastX;dy+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(enabled&&(dx||dy))send('TouchLook',JSON.stringify({x:dx,y:dy}));dx=dy=0;});});
 const stopLook=e=>{if(e.pointerId===lookId){lookId=null;dx=dy=0;}};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(name,stopLook);
 $('touch-interact').addEventListener('click',()=>{clear();send('TouchInteract');});
 $('touch-pause').addEventListener('click',()=>{clear();send('TouchPause');});
 function state(s){enabled=!!s.moving;root.hidden=!enabled;if(!enabled)clear();$('touch-interact').hidden=!s.interact;$('touch-interact').textContent=(s.prompt||'').replace(/Pressione\s+/g,'Toque ').replace(/Press\s+/g,'Tap ').replace(/Pulse\s+/g,'Toque ');window.WGTouchState=s;}
 function viewport(){const mobile=document.body.dataset.device==='mobile',portrait=mobile&&innerHeight>innerWidth;$('rotate').hidden=!portrait;if(portrait&&!wasPortrait){clear();send('BrowserVisibility','0');}else if(!portrait&&wasPortrait&&!document.hidden)send('BrowserVisibility','1');wasPortrait=portrait;}
 function background(){clear();send('BrowserVisibility','0');}
 window.addEventListener('blur',background);window.addEventListener('pagehide',background);
 window.addEventListener('focus',()=>{if(!document.hidden&&!wasPortrait)send('BrowserVisibility','1');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)background();else if(!wasPortrait)send('BrowserVisibility','1');});
 window.addEventListener('resize',viewport);window.addEventListener('orientationchange',viewport);
 return {state,clear,viewport,hide(){enabled=false;root.hidden=true;clear();}};
})();

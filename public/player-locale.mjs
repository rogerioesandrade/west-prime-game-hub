export function bindPlayerLocale(getFrame){
 const rows=[
 ['Voltar ao HUB','Back to HUB','Volver al HUB'],
 ['Simulador NR13 — Computador (Navegador) + Dispositivo Móvel (Celular/Tablet)','NR13 Simulator — Computer (Browser) + Mobile Device (Phone/Tablet)','Simulador NR13 — Computadora (Navegador) + Dispositivo Móvil (Celular/Tableta)'],
 ['Nova sessão · sem progresso salvo no navegador','New session · no progress saved in the browser','Nueva sesión · sin progreso guardado en el navegador'],
 ['Sessão atual · progresso não salvo no navegador','Current session · progress is not saved in the browser','Sesión actual · el progreso no se guarda en el navegador'],
 ['Jogar novamente','Play again','Volver a jugar'],['Tela cheia','Full screen','Pantalla completa'],
 ['Preparando o simulador…','Preparing the simulator…','Preparando el simulador…'],['Tentar novamente','Try again','Intentar de nuevo'],
 ['Voltar à biblioteca?','Return to the library?','¿Volver a la biblioteca?'],
 ['Esta sessão será encerrada. Ao voltar, o treinamento começará do início.','This session will end. When you return, the training will start from the beginning.','Esta sesión terminará. Al volver, la formación empezará desde el principio.'],
 ['Continuar jogando','Keep playing','Continuar jugando'],
 ['Armazenamento indisponível neste navegador','Storage is unavailable in this browser','Almacenamiento no disponible en este navegador'],
 ['O simulador ainda não está disponível. Tentando novamente…','The simulator is not available yet. Retrying…','El simulador aún no está disponible. Reintentando…'],
 ['Tela cheia indisponível. Use o celular na horizontal.','Full screen is unavailable. Use your device in landscape.','Pantalla completa no disponible. Use el dispositivo en horizontal.'],
 ['Não foi possível salvar. Tente novamente ou continue jogando.','Could not save. Try again or keep playing.','No se pudo guardar. Intente de nuevo o continúe jugando.']
 ];let col=0;
 function apply(){for(const root of document.querySelectorAll('.player-header,#leave-dialog,#loading')){const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode()){const row=rows.find(r=>r.includes(n.nodeValue.trim()));if(row&&n.nodeValue!==row[col])n.nodeValue=row[col];}}document.getElementById('fullscreen').setAttribute('aria-label',rows[5][col]);document.title=rows[1][col]+' | West Prime Game HUB';if(getFrame())getFrame().title=rows[1][col];}
 const observer=new MutationObserver(apply);for(const root of document.querySelectorAll('.player-header,#leave-dialog,#loading'))observer.observe(root,{childList:true,characterData:true,subtree:true});
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==getFrame()?.contentWindow||event.data?.type!=='wg-locale'||!['pt','en','es'].includes(event.data.locale))return;col=['pt','en','es'].indexOf(event.data.locale);document.documentElement.lang=event.data.locale;apply();});
}

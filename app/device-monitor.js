(()=>{
const {host,screenCanvases,screenVersion}=window.roomView;
const wrap=document.createElement('div');
wrap.className='scene-with-monitor';
const viewport=document.createElement('div');
viewport.className='scene-viewport';
const information=document.createElement('div');
information.className='scene-information';
host.before(wrap);
wrap.append(viewport,information);
viewport.append(host);
information.append(document.querySelector('.exchange-details'),document.querySelector('.scene-meta'));

const aside=document.createElement('aside');
aside.className='device-monitor';
aside.hidden=true;
aside.setAttribute('aria-label','Живой экран устройства');
aside.innerHTML='<div class="monitor-heading" tabindex="0" aria-label="Переместить окно стрелками" title="Перетащите окно за заголовок"><strong id="monitor-title"></strong><span class="monitor-live">LIVE</span><button type="button" id="monitor-close" aria-label="Закрыть экран">×</button></div><canvas id="monitor-canvas"></canvas><button type="button" class="monitor-resize" aria-label="Изменить размер окна" title="Потяните за угол или нажимайте стрелки"></button><p id="monitor-status" class="visually-hidden" role="status"></p>';
viewport.append(aside);
window.roomView.monitorElement=aside;
window.roomView.monitorLayoutVersion=0;
const canvas=aside.querySelector('canvas'),ctx=canvas.getContext('2d');
const heading=aside.querySelector('.monitor-heading');
const resize=aside.querySelector('.monitor-resize');
const names={laptop:'Ноутбук',phone:'Телефон',inside:'Комнатный датчик',outside:'Уличный датчик'};
let device=null,lastVersion=-1,placement=null,gesture=null;
const inset=8,minWidth=150,minHeight=106;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
function bounds(){
  return {x:aside.offsetLeft,y:aside.offsetTop,width:aside.offsetWidth,height:aside.offsetHeight};
}
function fitPlacement(){
  if(!placement||aside.hidden)return;
  const maxWidth=Math.max(1,viewport.clientWidth-2*inset);
  const maxHeight=Math.max(1,viewport.clientHeight-2*inset);
  const width=clamp(placement.width,Math.min(minWidth,maxWidth),maxWidth);
  const height=clamp(placement.height,Math.min(minHeight,maxHeight),maxHeight);
  const x=clamp(placement.x,inset,viewport.clientWidth-inset-width);
  const y=clamp(placement.y,inset,viewport.clientHeight-inset-height);
  Object.assign(aside.style,{left:x+'px',top:y+'px',right:'auto',width:width+'px',height:height+'px'});
  window.roomView.monitorLayoutVersion++;
}
function reposition(origin,dx,dy,resizing){
  if(resizing){
    const right=origin.x+origin.width;
    const maxWidth=right-inset;
    const maxHeight=viewport.clientHeight-origin.y-inset;
    const width=clamp(origin.width-dx,Math.min(minWidth,maxWidth),maxWidth);
    const height=clamp(origin.height+dy,Math.min(minHeight,maxHeight),maxHeight);
    placement={x:right-width,y:origin.y,width,height};
  }else placement={...origin,x:origin.x+dx,y:origin.y+dy};
  fitPlacement();
}
for(const control of [heading,resize]){
  const resizing=control===resize;
  control.addEventListener('pointerdown',event=>{
    if(event.button!==0||gesture||(!resizing&&event.target.closest('button')))return;
    event.preventDefault();
    control.focus({preventScroll:true});
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,origin:bounds()};
    control.setPointerCapture(event.pointerId);
    aside.classList.add('monitor-manipulating');
  });
  control.addEventListener('pointermove',event=>{
    if(gesture?.id!==event.pointerId)return;
    reposition(gesture.origin,event.clientX-gesture.x,event.clientY-gesture.y,resizing);
  });
  control.addEventListener('lostpointercapture',event=>{
    if(gesture?.id!==event.pointerId)return;
    gesture=null;
    aside.classList.remove('monitor-manipulating');
  });
  control.addEventListener('keydown',event=>{
    if(event.target!==control)return;
    const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if(!delta)return;
    event.preventDefault();
    const step=event.shiftKey?32:12;
    reposition(bounds(),delta[0]*step,delta[1]*step,resizing);
  });
}
new ResizeObserver(fitPlacement).observe(viewport);
window.openDeviceMonitor=id=>{
  if(!screenCanvases[id])return;
  device=id;
  aside.hidden=false;
  aside.dataset.device=id;
  document.getElementById('monitor-title').textContent=names[id];
  canvas.width=id==='phone'?320:640;
  canvas.height=id==='phone'?640:400;
  canvas.setAttribute('aria-label','Экран: '+names[id]);
  fitPlacement();
  lastVersion=-1;
  window.refreshDeviceMonitor();
};
window.closeDeviceMonitor=()=>{
  device=null;
  aside.hidden=true;
};
window.refreshDeviceMonitor=()=>{
  if(!device)return;
  const version=screenVersion(device);
  if(version===lastVersion)return;
  lastVersion=version;
  ctx.drawImage(screenCanvases[device],0,0,canvas.width,canvas.height);
  document.getElementById('monitor-status').textContent=Array.from(document.getElementById('session-'+device)?.children||[]).map(e=>e.textContent).filter(Boolean).join(' · ');
};
document.getElementById('monitor-close').onclick=()=>{
  window.closeDeviceMonitor();
  host.querySelector('canvas').focus({preventScroll:true});
};

const toolbar=document.querySelector('.scene-tools');
const fireSound=document.getElementById('fire-sound');
const enter=document.createElement('button');
enter.type='button';
enter.textContent='На весь экран';
enter.disabled=!document.fullscreenEnabled;
if(enter.disabled)enter.title='Браузер не поддерживает полноэкранный режим для этой страницы';
const feedback=document.createElement('span');
feedback.setAttribute('role','status');
toolbar.append(enter,feedback);

const exit=document.createElement('button');
exit.type='button';
exit.className='scene-fullscreen-exit';
exit.textContent='Выйти из полного экрана';
exit.hidden=true;
viewport.append(exit);
enter.onclick=async()=>{
  feedback.textContent='';
  try{
    await wrap.requestFullscreen();
  }catch{
    feedback.textContent='Не удалось развернуть сцену';
  }
};
exit.onclick=()=>document.exitFullscreen();
let wasFullscreen=false;
document.addEventListener('fullscreenchange',()=>{
  const active=document.fullscreenElement===wrap;
  exit.hidden=!active;
  if(active){
    viewport.append(fireSound);
    host.querySelector('canvas').focus({preventScroll:true});
  }else if(wasFullscreen){
    toolbar.insertBefore(fireSound,enter);
    enter.focus({preventScroll:true});
  }
  wasFullscreen=active;
});
})();

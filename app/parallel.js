(()=>{
const {scene,camera,host,devices}=window.roomView,T=THREE;
const names={laptop:'Ноутбук',phone:'Телефон',inside:'Комнатный датчик',outside:'Уличный датчик'};
const selected=window.demoSelection.chosen;
window.parallelMode=true;window.sessionScreens=true;
for(const id of Object.keys(names)){const el=document.createElement('div');el.hidden=true;el.id='session-'+id;el.innerHTML='<span class="screen-title">Bluetooth выключен</span><span class="screen-detail"></span>';document.body.append(el);}
const panel=document.createElement('section');panel.className='session-panel';document.querySelector('.selection-panel').after(panel);
const exchangeDetails=document.createElement('section');
exchangeDetails.className='exchange-details';
exchangeDetails.setAttribute('aria-labelledby','exchange-title');
exchangeDetails.innerHTML='<div class="exchange-heading"><h2 id="exchange-title">Подробности обмена</h2><span id="session-progress" class="exchange-progress"></span></div>';
const exchangeProgress=exchangeDetails.querySelector('.exchange-progress');
const hud=document.createElement('div');
hud.className='session-hud';
exchangeDetails.append(hud);
host.after(exchangeDetails);
let phase='select',running=false,elapsed=0,lastNow=0,tracks=[],graphics=[],duration=0,settings={};
const stepSeconds=3.2;
let lastState='',lastProjection='',lastPause='';
function screen(id,title,detail=''){const el=document.getElementById('session-'+id);el.querySelector('.screen-title').textContent=title;el.querySelector('.screen-detail').textContent=detail;}
function clear(){for(const g of graphics){scene.remove(g.line);g.line.geometry.dispose();g.line.material.dispose();g.label.remove();}graphics=[];tracks=[];running=false;elapsed=0;lastState=lastProjection=lastPause='';exchangeProgress.textContent='';hud.innerHTML='<p class="exchange-empty">Здесь появятся этапы после запуска анимации.</p>';for(const id of Object.keys(names))screen(id,selected.has(id)?'Bluetooth выключен':'Не участвует');}
function selection(){clear();phase='select';window.sessionActive=false;window.closeDeviceMonitor?.();const receivers=['laptop','phone'].filter(x=>selected.has(x));const valid=receivers.length>0&&selected.size>=2;document.getElementById('selection-status').textContent=selected.size&&!valid?'Выберите ноутбук или телефон и ещё одно устройство.':'';panel.innerHTML='<button id="confirm-devices" '+(valid?'':'disabled')+'>Подтвердить устройства</button>';document.getElementById('confirm-devices').onclick=questions;}
function questions(){phase='questions';window.sessionActive=false;window.closeDeviceMonitor?.();document.getElementById('selection-status').textContent='';const both=selected.has('laptop')&&selected.has('phone');const targets=['laptop','phone'].filter(x=>selected.has(x));panel.innerHTML=`<h2>Настройте связи</h2><form id="session-form">${both?'<label>Передача файлов<select id="file-mode"><option value="forward">report.pdf с ноутбука на телефон</option><option value="reverse">photo.jpg с телефона на ноутбук</option><option value="both">Файлы в обоих направлениях</option><option value="off">Только датчики</option></select></label>':''}${['inside','outside'].filter(x=>selected.has(x)).map(id=>`<label>${names[id]} — куда передавать температуру?<select id="target-${id}">${targets.map(t=>`<option value="${t}" ${t===(id==='inside'?'phone':'laptop')?'selected':''}>${names[t]}</option>`).join('')}</select></label>`).join('')}<label><input id="session-noise" type="checkbox"> Потеря пакета и повтор</label><details class="session-note"><summary>Условия подключения</summary><p>Первое подключение: сохранённых ключей нет. Для файлов выбраны устройства с поддержкой Object Push; для двух направлений — два независимых OBEX-сеанса и поддержка обеих ролей приложениями. Для датчика — приложение GATT и защищённая пользовательская характеристика с Notify.</p></details><button type="submit">Далее</button> <button type="button" id="back-selection">Изменить устройства</button><p id="form-error" role="alert"></p></form>`;
document.getElementById('back-selection').onclick=selection;document.getElementById('session-form').onsubmit=e=>{e.preventDefault();settings={file:both?document.getElementById('file-mode').value:'off',noise:document.getElementById('session-noise').checked,targets:{}};for(const id of ['inside','outside'])if(selected.has(id))settings.targets[id]=document.getElementById('target-'+id).value;if(settings.file==='off'&&!Object.keys(settings.targets).length){document.getElementById('form-error').textContent='Не выбрана ни одна связь. Выберите передачу файла или добавьте датчик.';return;}review();};}
function review(){phase='review';panel.innerHTML=`<h2>Проверьте сценарий</h2><p>${settings.file!=='off'?'Файлы: '+({forward:'ноутбук → телефон',reverse:'телефон → ноутбук',both:'ноутбук ↔ телефон'}[settings.file])+'. ':''}${Object.entries(settings.targets).map(([s,t])=>names[s]+' → '+names[t]).join('; ')}.</p><details class="session-note"><summary>Что покажет сценарий</summary><p>Включение Bluetooth → обнаружение → выбор «Подключить» → соединение → защита → поиск службы → подготовка → обмен → завершение. Все действия пользователя внутри анимации воспроизводятся автоматически.</p><p>Это один конкретный допустимый сценарий, а не универсальный порядок для любой ОС. Время замедлено, служебные обмены объединены. Параллельные приложения делят радиоэфир по времени.</p></details><button id="session-start">Запустить анимацию</button> <button id="back-questions">Назад</button>`;document.getElementById('back-questions').onclick=questions;document.getElementById('session-start').onclick=start;}
function local(label,explain){return {label,explain,dir:0,left:label,right:label};}
function buildTrack(kind,left,right,reverse=false,second=false){const stages=scenarios[kind].stages;const translate=text=>{if(kind==='ble'&&left==='laptop')return text.replace(/Телефон/g,'Ноутбук').replace(/телефон/g,'ноутбук');if(reverse)return text.replace(/Ноутбук|ноутбук|Телефон|телефон/g,s=>({Ноутбук:'Телефон',ноутбук:'телефон',Телефон:'Ноутбук',телефон:'ноутбук'}[s])).replaceAll('report.pdf','photo.jpg');return text;};
 const events=[];function push(stage,e,note=''){events.push({...e,stage:translate(stage),label:translate(e.label),explain:translate(e.explain),left:translate(e.left),right:translate(e.right),note:translate(note)});}
 if(!second){push('Включение Bluetooth',local('Bluetooth выключен','Начальное состояние: устройства ещё не обнаруживают друг друга.'));
 push('Включение Bluetooth',local('Пользователь включает Bluetooth',`${names[left]}: включение адаптера в настройках. ${names[right]}: ${kind==='ble'?'включение питания и режима подключения датчика':'включение Bluetooth и разрешение обнаружения'}. Это локальные действия, не радиопакеты.`));
 push('Начать поиск',local(kind==='ble'?'Открыть приложение датчика':'Добавить Bluetooth-устройство',kind==='ble'?'Приложение с разрешениями Bluetooth запускает LE-сканирование. Обычные настройки ОС не заменяют GATT-приложение.':'Пользователь открывает поиск устройств. Включённый Bluetooth сам по себе не гарантирует обнаружимость.'));
 }
 for(let i=second?3:0;i<5;i++){const st=stages[i];for(const e of st.messages)push(st.title,e,st.note);if(i===0)push('Подключение по выбору пользователя',local('Нажать «Подключить»',`В найденном списке выбран ${names[right]}. Только теперь начинается адресное подключение.`));}
 return {kind,left,right,reverse,second,events,push,translate,delivered:0};}
function start(){clear();phase='play';window.sessionActive=true;if(settings.file!=='off'){const reverse=settings.file==='reverse';tracks.push(buildTrack('classic',reverse?'phone':'laptop',reverse?'laptop':'phone',reverse));if(settings.file==='both')tracks.push(buildTrack('classic','phone','laptop',true,true));}for(const [sensor,target] of Object.entries(settings.targets))tracks.push(buildTrack('ble',target,sensor));
 const main=tracks.find(t=>t.kind==='classic'&&!t.second);for(const t of tracks.filter(t=>t.second)){const prefix=main.events.filter(e=>!['Поиск службы передачи файла','Подготовка передачи'].includes(e.stage));t.events.unshift(...prefix.map(e=>({...e,dir:0,label:'Общая связь: '+e.label,left:e.right,right:e.left}))); }
 const barrier=Math.max(...tracks.map(t=>t.events.length));for(const t of tracks){while(t.events.length<barrier)t.push('Ожидание готовности других связей',local('Связь готова','Приложение ждёт остальные выбранные соединения. Это правило демонстрации, а не требование Bluetooth.'));
 for(const e of transferMessages(t.kind,settings.noise)){const copy={...e};if(t.kind==='ble'&&t.right==='outside')copy.label=copy.label.replace(/23,(\d)/g,'7,$1');t.push(t.kind==='ble'?'Передача температуры':'Передача файла',copy,scenarios[t.kind].stages[5].note);}
 if(t.kind==='classic'){t.push('Завершение объекта',msg('OBEX: окончательный Success',-1,'Получатель подтверждает успешную передачу объекта на уровне приложения.','Файл отправлен','Файл сохранён'));t.push('Закрытие сеанса',msg('OBEX DISCONNECT; закрытие канала',1,'Закрывается этот сеанс. Общая связь BR/EDR сохраняется до завершения второго направления, если оно выбрано.','Сеанс закрыт','Файл сохранён'));}else for(const e of scenarios.ble.stages[6].messages)t.push('Пауза между событиями',e,scenarios.ble.stages[6].note);
 }
 const end=Math.max(...tracks.map(t=>t.events.length));for(const t of tracks){while(t.events.length<end)t.push('Ожидание',local('Обмен завершён','Результат сохранён; другие потоки продолжаются.'));t.push('Готово',local(t.kind==='classic'?'BR/EDR: соединение закрыто':'BLE: соединение сохранено',t.kind==='classic'?'Оба сеанса завершены. Контроллеры разрывают связь; при bonding ключ сохраняется.':'Датчик остаётся подключённым и может отправлять новые измерения в следующих событиях.'));}
 duration=(end+1)*stepSeconds;graphics=tracks.map((t,i)=>{const line=window.createSignalWire(i%2?0xffc77b:0x45deff);scene.add(line);const label=document.createElement('div');label.className='flow-label';host.append(label);return {line,label};});
 panel.innerHTML='<div class="session-controls"><button id="session-pause">Пауза</button> <button id="session-prev" aria-label="Предыдущее действие" title="Предыдущее действие">←</button> <button id="session-next" aria-label="Следующее действие" title="Следующее действие">→</button> <button id="session-restart">Сначала</button> <button id="session-edit">Настроить</button> <label>Скорость <select id="session-speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label></div>';
 document.getElementById('session-pause').onclick=()=>{if(elapsed>=duration)elapsed=0;running=!running;};document.getElementById('session-prev').onclick=()=>{running=false;elapsed=Math.max(0,(Math.floor(elapsed/stepSeconds)-1)*stepSeconds);};document.getElementById('session-next').onclick=()=>{running=false;elapsed=Math.min(duration,(Math.floor(elapsed/stepSeconds)+1)*stepSeconds);};document.getElementById('session-restart').onclick=()=>{elapsed=0;running=true;};document.getElementById('session-edit').onclick=()=>{clear();questions();};
 hud.innerHTML=tracks.map((t,i)=>`<article class="exchange-card" data-wire="${i%2?'amber':'cyan'}">
   <div class="exchange-card-top"><span class="exchange-protocol">${t.kind==='classic'?'Classic':'BLE'}</span><strong>${names[t.left]} ↔ ${names[t.right]}${t.second?' · обратный файл':''}</strong></div>
   <div class="exchange-stage" id="live-stage-${i}"></div>
   <h3 id="live-title-${i}"></h3>
   <p id="live-text-${i}"></p>
   <details><summary>Техническое пояснение</summary><p id="live-note-${i}"></p></details>
 </article>`).join('');
 running=true;lastNow=performance.now();renderSession();host.scrollIntoView({block:'start',behavior:'smooth'});}
function positionLabels(entries){
 if(!entries.length)return;
 const width=host.clientWidth,height=host.clientHeight,padding=8;
 const placed=[];
 const clamp=T.MathUtils.clamp;
 const monitor=window.roomView.monitorElement;
 let overlay;
 if(monitor&&!monitor.hidden){
  const area=host.getBoundingClientRect();
  const box=monitor.getBoundingClientRect();
  overlay={left:box.left-area.left,right:box.right-area.left,top:box.top-area.top,bottom:box.bottom-area.top};
  placed.push({x:overlay.left+box.width/2,y:overlay.bottom,w:box.width,h:box.height});
 }
 const sideSpace=overlay?Math.max(overlay.left,width-overlay.right)-2*padding:0;
 for(const {label} of entries)label.style.maxWidth=sideSpace>=112?Math.min(300,sideSpace)+'px':'';
 const sizes=entries.map(({label,point})=>({label,point,w:label.offsetWidth,h:label.offsetHeight}));
 for(const {label,point,w,h} of sizes){
  const x=clamp((point.x+1)*width/2,w/2+padding,width-w/2-padding);
  const y=clamp((1-point.y)*height/2,h+padding,height-padding);
  const columns=overlay?[x,overlay.left-w/2-padding,overlay.right+w/2+padding]:[x];
  let best={x,y,distance:Infinity};
  for(const center of columns){
    if(center<w/2+padding||center>width-w/2-padding)continue;
    const neighbors=placed.filter(box=>Math.abs(box.x-center)<(box.w+w)/2+padding);
    const candidates=[y,...neighbors.flatMap(box=>[box.y-box.h-padding,box.y+h+padding])];
    for(const bottom of candidates){
      if(bottom<h+padding||bottom>height-padding)continue;
      if(neighbors.some(box=>bottom>box.y-box.h-padding&&bottom-h<box.y+padding))continue;
      const distance=Math.hypot(center-x,bottom-y);
      if(distance<best.distance)best={x:center,y:bottom,distance};
    }
  }
  label.style.left=best.x+'px';
  label.style.top=best.y+'px';
  placed.push({x:best.x,y:best.y,w,h});
 }
}
function renderSession(){
 if(phase!=='play')return;
 const idx=Math.min(tracks[0].events.length-1,Math.floor(elapsed/stepSeconds));
 const f=(elapsed%stepSeconds)/stepSeconds;
 const state=idx+'|'+(f>.85)+'|'+(elapsed>=duration);
 const stateChanged=state!==lastState;
 const revision=window.roomView.layoutVersion;
 const monitor=window.roomView.monitorElement;
 const overlayDevice=monitor&&!monitor.hidden?monitor.dataset.device:'';
 const projection=[idx,revision,host.clientWidth,host.clientHeight,overlayDevice,window.roomView.monitorLayoutVersion,camera.matrixWorld?.elements.join(',')].join('|');
 const projectionChanged=projection!==lastProjection;
 const summaries={};
 for(const [i,t] of tracks.entries()){
   const e=t.events[idx],g=graphics[i];
   g.line.visible=e.dir!==0;
   if(g.line.visible){
     if(!g.route||g.layoutVersion!==revision){
       g.route=window.buildFlowRoute(T,devices,t.left,t.right,i);
       g.layoutVersion=revision;
     }
     g.line.update?.(g.route,f,e.dir,e.lost);
   }
   if(projectionChanged){
     g.label.hidden=!g.line.visible;
     if(g.line.visible){
       g.labelPoint=g.route[20].clone().project(camera);
       const {x,y,z}=g.labelPoint;
       g.label.hidden=Math.abs(z)>1||Math.abs(x)>1||Math.abs(y)>1;
       const text=(e.dir===1?names[t.left]+' → '+names[t.right]:names[t.right]+' → '+names[t.left])+' · '+e.label;
       if(g.label.textContent!==text)g.label.textContent=text;
     }
   }
   if(!stateChanged)continue;
   document.getElementById('live-stage-'+i).textContent=e.stage;
   document.getElementById('live-title-'+i).textContent=e.label;
   document.getElementById('live-text-'+i).textContent=e.explain;
   document.getElementById('live-note-'+i).textContent=e.note||'Локальные действия не передаются по радио. Направление линии относится к показанному служебному обмену.';
   (summaries[t.left]??=[]).push(e.left);
   (summaries[t.right]??=[]).push(e.right);
   const received=t.events.slice(0,idx+(f>.85?1:0)).findLast(v=>v.label.includes('ATT Notify:')&&!v.lost);
   if(received)summaries[t.left].push(received.label.replace('ATT Notify:','Температура:'));
   if(t.kind==='classic'&&t.events.slice(0,idx+1).some(v=>v.label==='OBEX: окончательный Success')){
     summaries[t.right].push(t.reverse?'photo.jpg сохранён':'report.pdf сохранён');
   }
 }
 if(projectionChanged){
   positionLabels(graphics.filter(g=>!g.label.hidden).map(g=>({label:g.label,point:g.labelPoint})));
   lastProjection=projection;
 }
 if(stateChanged){
   for(const [id,states] of Object.entries(summaries))screen(id,[...new Set(states)].slice(-2).join(' · '),names[id]);
   exchangeProgress.textContent=elapsed>=duration?'Завершено':`Шаг ${idx+1} / ${tracks[0].events.length}`;
   lastState=state;
 }
 const pause=running?'Пауза':elapsed>=duration?'Повторить':'Продолжить';
 if(lastPause!==pause){
   document.getElementById('session-pause').textContent=pause;
   lastPause=pause;
 }
}
function frame(now){requestAnimationFrame(frame);if(running&&!document.hidden){elapsed=Math.min(duration,elapsed+Math.min(.1,(now-lastNow)/1000)*Number(document.getElementById('session-speed').value));if(elapsed>=duration)running=false;}lastNow=now;renderSession();}
window.addEventListener('selectionchange',selection);document.addEventListener('keydown',e=>{if(phase==='play'&&e.code==='Space'&&!/INPUT|SELECT|BUTTON|TEXTAREA/.test(e.target.tagName)){e.preventDefault();document.getElementById('session-pause').click();}});selection();requestAnimationFrame(frame);
})();

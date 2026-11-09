'use strict';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const msg=(label,dir,explain,left,right,extra={})=>({label,dir,explain,left,right,...extra});
const scenarios={classic:{left:'Ноутбук',right:'Телефон',stages:[
{title:'Обнаружение устройств',description:'Ноутбук ищет доступные устройства. Телефон включён в режим обнаружения.',note:'Inquiry позволяет узнать адрес и параметры устройства. Ответ может содержать расширенные сведения. Соединения для передачи файла пока нет.',result:'Ноутбук знает, к какому телефону подключаться.',messages:[
msg('Inquiry — поиск устройств',1,'Ноутбук передаёт запрос обнаружения.','Поиск устройств','Inquiry scan'),
msg('Inquiry response / FHS',-1,'Телефон отвечает: сообщает адрес, класс устройства и сведения о своих часах.','Получает адрес','Отправляет сведения'),
msg('Телефон найден в списке устройств',0,'Пользователь выбирает найденный телефон. Это локальное действие на ноутбуке.','Телефон выбран','Доступен для подключения')]},
{title:'Установка соединения',description:'Ноутбук обращается к выбранному телефону. Устройства синхронизируются.',note:'Page адресован конкретному устройству. После обмена ответами контроллеры переходят к общему физическому каналу. Последовательность ID, FHS и ответов здесь сокращена.',result:'Создана связь BR/EDR для дальнейшего обмена.',messages:[
msg('Page — вызов выбранного устройства',1,'Начинается адресный вызов телефона.','Paging','Page scan'),
msg('Ответ на Page',-1,'Телефон отвечает на вызов.','Получает ответ','Ответ на вызов'),
msg('Синхронизация: FHS и ответы',1,'Контроллеры синхронизируются. Здесь объединены несколько служебных обменов.','Синхронизация','Синхронизация'),
msg('Соединение BR/EDR установлено',0,'В этом сценарии ноутбук — central, телефон — peripheral.','Central','Peripheral',{connected:true})]},
{title:'Сопряжение и шифрование',description:'Новые устройства подтверждают друг друга и настраивают защиту соединения.',note:'Здесь выбрано Secure Simple Pairing с числовым сравнением. Закрытые ключи не передаются по радио. Создание ключа связи и включение шифрования — разные процедуры. При повторном подключении можно использовать сохранённый ключ.',result:'Устройства сопряжены; обмен зашифрован.',messages:[
msg('SSP: возможности и открытые ключи',1,'Устройства обмениваются возможностями ввода-вывода и открытыми ключами.','Сопряжение SSP','Сопряжение SSP'),
msg('SSP: ответные данные',-1,'Обе стороны вычисляют общий секрет, не отправляя его по радио.','Вычисляет секрет','Вычисляет секрет'),
msg('Пользователь сверяет код: 482 719',0,'На обоих экранах один код. Пользователь подтверждает совпадение. Число приведено для примера.','Код подтверждён','Код подтверждён'),
msg('Ключ связи создан; шифрование включено',0,'После аутентификации контроллеры включают шифрование. Служебный обмен сокращён.','Шифрование включено','Шифрование включено',{secure:true})]},
{title:'Поиск службы передачи файла',description:'Ноутбук выясняет, поддерживает ли телефон приём файлов и как обратиться к службе.',note:'SDP — протокол поиска служб — возвращает их описание и параметры доступа. В примере телефон поддерживает приём файлов через Object Push: поддержка зависит от устройства и приложения. Нахождение устройства не означает, что на нём есть нужная служба. SDP может выполняться до сопряжения; здесь выбран другой допустимый порядок.',result:'Известны служба Object Push и параметры подключения.',messages:[
msg('SDP: запрос службы Object Push',1,'Ноутбук запрашивает запись о службе передачи объектов.','SDP-клиент','SDP-сервер'),
msg('SDP: описание и параметры службы',-1,'Телефон возвращает сведения о службе, включая параметры RFCOMM.','Читает параметры','Служба доступна'),
msg('Выбрана служба приёма файлов',0,'Приложение использует найденные параметры на следующем этапе.','Служба выбрана','Готов к запросу')]},
{title:'Подготовка передачи',description:'Приложения открывают сеанс передачи объекта. Получатель разрешает принять файл.',note:'В примере Object Push использует OBEX поверх RFCOMM и L2CAP. Транспортный канал и прикладной сеанс показаны отдельно. Разрешение пользователя — поведение выбранного примера, а не отдельный обязательный Bluetooth-пакет.',result:'Сеанс открыт, получатель готов принять файл.',messages:[
msg('L2CAP / RFCOMM: открыть канал',1,'Открывается транспортный канал. Несколько запросов и ответов объединены.','Открывает канал','Принимает канал'),
msg('OBEX CONNECT',1,'Ноутбук запрашивает открытие сеанса OBEX.','Запрос OBEX','Получает запрос'),
msg('OBEX: Success',-1,'Телефон подтверждает открытие прикладного сеанса.','Сеанс OBEX','Сеанс OBEX'),
msg('OBEX PUT: имя и размер файла',1,'Передаются сведения об объекте, например report.pdf.','Файл: report.pdf','Запрос приёма'),
msg('Пользователь разрешил приём',0,'Получатель соглашается принять файл.','Ожидает готовности','Приём разрешён')]},
{title:'Передача данных и смена каналов',description:'Данные идут по ACL-соединению. Обратная связь канального уровня позволяет повторить потерянный фрагмент.',note:'Файл сокращён до трёх условных фрагментов. Подтверждения ACL не являются ответами OBEX: обратная связь ARQ содержится на канальном уровне. При включённой помехе показаны потеря второго фрагмента, его повтор и обновление карты каналов.',result:'Все три условных фрагмента доставлены.',kind:'data',messages:[]},
{title:'Завершение передачи',description:'Телефон подтверждает получение объекта. Приложения закрывают сеанс, затем устройства разрывают связь.',note:'Сначала завершается передача OBEX, затем закрываются каналы. Физическое соединение после передачи можно сохранить, но в нашем сценарии оно разрывается. При bonding сохранённый ключ пригодится при следующем подключении.',result:'Файл получен, соединение закрыто.',messages:[
msg('OBEX: окончательный Success',-1,'Приложение телефона подтверждает завершение передачи объекта.','Передача завершена','Файл получен'),
msg('OBEX DISCONNECT; закрытие каналов',1,'Приложения закрывают сеанс и транспортные каналы.','Закрывает сеанс','Закрывает сеанс'),
msg('Разрыв связи BR/EDR',1,'Контроллер завершает соединение с другим устройством.','Отключается','Отключается'),
msg('Соединение закрыто',0,'Радиосвязь завершена. Полученный файл остаётся на телефоне.','Не подключён','report.pdf сохранён',{disconnected:true})]}
]},ble:{left:'Телефон',right:'Датчик температуры',stages:[
{title:'Advertising и сканирование',description:'Датчик сообщает о себе, телефон слушает эфир и находит его объявления.',note:'В примере используется обычная connectable-реклама ADV_IND. Датчик — advertiser, телефон — scanner, затем initiator. Первичные advertising-каналы: 37, 38 и 39. Запрашивать дополнительные данные через scan request в этом примере не нужно.',result:'Телефон обнаружил доступный для подключения датчик.',messages:[
msg('ADV_IND · канал 37',-1,'Датчик отправляет рекламу на первичном канале 37.','Сканирует эфир','Advertising',{channel:37}),
msg('ADV_IND · канал 38',-1,'Реклама передаётся на другом первичном канале. Ответ сканера не требуется.','Сканирует эфир','Advertising',{channel:38}),
msg('ADV_IND · канал 39',-1,'Третий первичный advertising-канал. Показан пример последовательности.','Сканирует эфир','Advertising',{channel:39}),
msg('Телефон выбрал найденный датчик',0,'Приложение выбирает датчик для подключения.','Initiator','Connectable advertiser')]},
{title:'Установка соединения',description:'Телефон отвечает на рекламу запросом и задаёт параметры соединения.',note:'CONNECT_IND содержит параметры для перехода к событиям соединения: интервал, карту каналов и другие поля. Это не Page из Classic. После подключения телефон имеет роль central, датчик — peripheral.',result:'Устройства обмениваются данными в событиях соединения.',messages:[
msg('ADV_IND — объявление датчика',-1,'Датчик снова передаёт доступную для подключения рекламу.','Initiator','Advertiser',{channel:37}),
msg('CONNECT_IND — параметры соединения',1,'Телефон передаёт запрос в ответ на рекламу.','Передаёт параметры','Получает параметры',{channel:37}),
msg('Первое событие: пакет central',1,'В согласованное время телефон начинает обмен на канале данных.','Central','Peripheral',{connected:true}),
msg('Первое событие: ответ peripheral',-1,'Датчик отвечает в событии соединения.','Central','Peripheral',{connected:true})]},
{title:'Сопряжение и защита',description:'В этом примере доступ к датчику защищён. Устройства выполняют сопряжение и включают шифрование.',note:'Показано LE Secure Connections с Just Works для датчика без экрана. При первом сопряжении этот метод не защищает от активной атаки посредника. SMP отвечает за сопряжение; шифрование включает канальный уровень. Открытые данные могут не требовать сопряжения.',result:'Создан ключ LTK и включено шифрование.',messages:[
msg('SMP Pairing Request',1,'Телефон начинает процедуру сопряжения.','SMP: запрос','Защищённый доступ'),
msg('SMP Pairing Response',-1,'Датчик сообщает возможности и требования безопасности.','Согласует защиту','SMP: ответ'),
msg('LE SC: открытые ключи и проверки',1,'Взаимный обмен криптографическими данными показан сокращённо.','Вычисляет ключ','Вычисляет ключ'),
msg('LTK создан; LL включает шифрование',0,'Стороны получают общий ключ, затем включают шифрование через служебный обмен LL.','Шифрование включено','Шифрование включено',{secure:true})]},
{title:'Поиск службы и характеристики',description:'Телефон выясняет, где в GATT находятся показания датчика.',note:'GATT организует данные в службы и характеристики, ATT выполняет операции доступа. Телефон — GATT-клиент, датчик — GATT-сервер. Здесь используется учебная пользовательская характеристика температуры; соответствие Health Thermometer Profile не предполагается.',result:'Найдены handles значения температуры и дескриптора CCCD.',messages:[
msg('ATT: поиск первичных служб',1,'Клиент запрашивает доступные службы.','GATT-клиент','GATT-сервер'),
msg('ATT: служба датчика найдена',-1,'Сервер возвращает диапазон атрибутов нужной службы.','Изучает службу','Возвращает службу'),
msg('ATT: поиск характеристики и CCCD',1,'Клиент ищет характеристику и её дескриптор. Несколько запросов объединены.','Ищет атрибуты','Читает таблицу'),
msg('ATT: handles и свойство Notify',-1,'Телефон получает адреса атрибутов и узнаёт о поддержке уведомлений.','Характеристика найдена','Notify поддерживается')]},
{title:'Подписка на уведомления',description:'Телефон разрешает датчику отправлять новые показания без запроса каждого значения.',note:'Клиент записывает 0x0001 в CCCD — настройку уведомлений характеристики — и включает notifications. Запись имеет ответ ATT. Само уведомление на следующем этапе подтверждения ATT не требует.',result:'Уведомления включены для этого клиента.',messages:[
msg('ATT Write Request: CCCD = 0x0001',1,'Телефон включает уведомления записью в CCCD.','Включает уведомления','Обрабатывает запись'),
msg('ATT Write Response',-1,'Датчик подтверждает запись. Это не подтверждение будущих показаний.','Подписка оформлена','Уведомления включены'),
msg('Датчик готов отправлять измерения',0,'Новое значение можно передать без отдельного Read Request.','Ждёт показаний','Готов к измерению')]},
{title:'Передача показаний',description:'В событии соединения датчик передаёт температуру. Пакеты канального уровня обеспечивают доставку.',note:'Central начинает событие, peripheral может передать ATT Handle Value Notification. Уведомление не требует ATT-ответа. ACL использует SN и NESN для подтверждения и повторов. Показания иллюстративны; карта данных содержит 37 каналов.',result:'Телефон получил последнее показание: 23,7 °C.',kind:'data',messages:[]},
{title:'Пауза между событиями',description:'Соединение сохраняется, но между событиями радиоблоки могут быть выключены.',note:'Это не отключение и не новый advertising. В согласованное время устройства снова выходят в эфир. Интервал соединения и другие параметры влияют на расход энергии. Здесь показано одно событие между двумя периодами сна.',result:'Датчик ждёт следующего события; соединение открыто.',messages:[
msg('Радиоблоки выключены: ожидание',0,'Данные переданы. Устройства ждут согласованного события.','Радио спит','Радио спит',{sleep:true}),
msg('Следующее событие: central → peripheral',1,'Наступило время следующего события. Телефон начинает обмен.','Радио включено','Радио включено'),
msg('Peripheral → central: ответ',-1,'Датчик отвечает. Если новых данных нет, возможен пустой пакет LL.','Событие соединения','Событие соединения'),
msg('До следующего события: сон',0,'Радиоблоки снова могут спать. Логическое соединение сохраняется.','Радио спит','Радио спит',{sleep:true})]}
]}};
function transferMessages(m,noisy){const ble=m==='ble',send=ble?-1:1,ack=-send;
const d=(n,ch,retry=false)=>msg(ble?`ATT Notify: 23,${4+n} °C${retry?' · повтор':''}`:`ACL: фрагмент ${n}${retry?' · повтор':''}`,send,retry?'Повторяется неподтверждённый пакет. Получатель обновит данные после доставки.':ble?'Датчик передаёт измерение в радиопакете.':'Отправитель передаёт очередную часть файла.',ble?'Приём показаний':'Передача файла',ble?'Передача показаний':'Приём файла',{channel:ch});
const a=(n,ch)=>msg(ble?'LL: подтверждение через SN / NESN':`ACL ARQ: фрагмент ${n} подтверждён`,ack,'Обратная связь находится на канальном уровне. Это не подтверждение приложения.',ble?'Показание принято':`Доставлено: ${n} из 3`,ble?'Доставка подтверждена':`Принято: ${n} из 3`,{channel:ch});
const out=ble?[msg('Начало события: пакет central',1,'Телефон открывает событие соединения. Затем датчик может ответить.','Central','Peripheral',{channel:2})]:[];
out.push(d(1,2),a(1,2));
if(ble)out.push(msg('Новое событие: пакет central',1,'Телефон открывает следующее событие на канале 12. Внутри события канал не меняется.','Central','Peripheral',{channel:12}));
if(noisy){const lost=d(2,12);lost.lost=true;lost.label+=' · потеря';lost.explain='На канале 12 помеха. Пакет не проходит проверку, получатель не принимает новые данные.';out.push(lost,msg('Нет подтверждения новой доставки',0,'Отправитель не получил подтверждения: второй пакет остаётся в очереди повтора.','Ожидание / повтор','Новые данные не приняты',{channel:12}),...(ble?[msg('Следующее событие: пакет central',1,'Телефон начинает новое событие; датчик повторит неподтверждённый пакет.','Central','Peripheral',{channel:12})]:[]),d(2,ble?12:20,true),a(2,ble?12:20),msg(ble?'LL_CHANNEL_MAP_IND — новая карта':'LMP_set_AFH — новая карта',1,'После оценки каналов central сообщает новую карту. Она применяется в согласованный момент.','Обновление карты','Получает карту',{mapUpdate:true}),msg('Применена карта без плохих каналов',0,'Каналы 10–15 исключены из учебной последовательности. Оценка качества и ожидание здесь ускорены.','Карта обновлена','Карта обновлена',{excluded:true}));}
else out.push(d(2,12),a(2,12));
if(ble)out.push(msg('Следующее событие: пакет central',1,'Следующее измерение передаётся в другом событии на выбранном канале.','Начало события','Радио включено',{channel:24}));
out.push(d(3,24),a(3,24));return out;}
let mode='classic',time=0,playing=false,noise=false,last=0,renderKey='',messageNodes=[],channelNodes=[];
const secondsPerMessage=2.8;
function stages(){return scenarios[mode].stages;}
function messages(i){return stages()[i].kind==='data'?transferMessages(mode,noise):stages()[i].messages;}
function lengths(){return stages().map((_,i)=>messages(i).length*secondsPerMessage);}
function total(){return lengths().reduce((a,b)=>a+b,0);}
function stageStart(i){return lengths().slice(0,i).reduce((a,b)=>a+b,0);}
function position(){let start=0,ls=lengths();for(let i=0;i<ls.length;i++){if(time<start+ls[i]||i===ls.length-1){const local=Math.max(0,Math.min(ls[i]-.0001,time-start));return {stage:i,index:Math.min(messages(i).length-1,Math.floor(local/secondsPerMessage)),fraction:Math.min(1,(local%secondsPerMessage)/secondsPerMessage)};}start+=ls[i];}}
function svg(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function buildNotes(){}
function buildScene(list){ $('laptop').hidden=mode!=='classic';$('sensor').hidden=mode!=='ble'; }
function setTime(v){if(v>=total()&&playing&&window.demoSelection&&window.demoSelection.pairs.length){window.demoSelection.advance();return;}time=Math.max(0,Math.min(total(),v));if(time>=total())playing=false;render();}
function choose(m){mode=m;populateDevices();time=0;playing=false;renderKey='';buildNotes();render();}
function render(){const p=position(),s=stages()[p.stage],list=messages(p.stage),e=list[p.index],key=`${mode}/${p.stage}/${noise}`;
if(key!==renderKey){renderKey=key; $('stage-note').textContent=s.note; $('stage-result').textContent='Результат: '+s.result; $('stage-messages').textContent=list.map(e=>(e.dir===1?'Слева направо: ':e.dir===-1?'Справа налево: ':'• ')+e.label).join('\n'); $('step-title').textContent=s.title;$('description').textContent=s.description;$('step-count').textContent=`Этап ${p.stage+1} из ${stages().length}`;
$('steps').replaceChildren(...stages().map((st,i)=>{const li=document.createElement('li'),b=document.createElement('button'),n=document.createElement('span'),label=document.createElement('span');n.className='number';n.textContent=String(i+1).padStart(2,'0');label.textContent=st.title;b.append(n,label);if(i===p.stage)b.setAttribute('aria-current','step');if(i<p.stage)b.className='done';b.onclick=()=>{playing=false;setTime(stageStart(i));};li.append(b);return li;}));buildScene(list);const count=mode==='classic'?79:40;channelNodes=Array.from({length:count},(_,i)=>{const c=document.createElement('div');c.className='channel';c.title=`Канал ${i}`;return c;});$('channels').replaceChildren(...channelNodes);$('channel-caption').textContent=mode==='classic'?'Classic: 79 каналов по 1 МГц':'BLE: 37 каналов данных + 3 advertising';}
$('classic').setAttribute('aria-selected',mode==='classic');$('ble').setAttribute('aria-selected',mode==='ble');$('left-name').textContent=$('device-left').value;$('right-name').textContent=$('device-right').value;document.querySelector('#laptop .device-caption').textContent=$('device-left').value;document.querySelector('#phone .device-caption').textContent=mode==='classic'?$('device-right').value:$('device-left').value;document.querySelector('#sensor .device-caption').textContent=$('device-right').value;$('left-state').textContent=e.left;$('right-state').textContent=e.right;
const reached=list.slice(0,p.index+1),connected=p.stage>=2||reached.some(x=>x.connected),secure=p.stage>=3||reached.some(x=>x.secure),disconnected=reached.some(x=>x.disconnected);$('link-state').textContent=disconnected?'Связь закрыта':e.sleep?'Соединение сохранено · сон':secure?'Шифрование включено':connected?'Соединение установлено':'Соединение ещё не установлено';
updateScene(p,e,list);
$('event-position').textContent=`Действие ${p.index+1} из ${list.length}`;$('event-prev').disabled=p.index===0;$('event-next').disabled=p.index===list.length-1;$('event-text').textContent=e.explain;$('play').textContent=playing?'Пауза':'Запустить цикл';$('seek').value=Math.round(time/total()*1000);$('prev').disabled=p.stage===0;$('next').disabled=p.stage===stages().length-1;
const format=v=>`${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`;$('clock').textContent=`${format(time)} / ${format(total())}`;
const showRadio=s.kind==='data'||mode==='ble'&&p.stage===0;$('radio').hidden=!showRadio;const excluded=reached.some(x=>x.excluded),ch=e.channel;
channelNodes.forEach((c,i)=>{const bad=noise&&s.kind==='data'&&i>=10&&i<=15;c.className='channel'+(mode==='ble'&&i>=37?' advert':'')+(bad?(excluded?' excluded':' bad'):'')+(i===ch?' active':'');});$('channel-now').textContent=ch===undefined?(excluded?'Карта обновлена':'Служебное действие'):`Текущий канал: ${ch}`;
$('noise-note').textContent=noise?'В этапе 6 появятся потеря пакета, повтор и обновление карты.':'Помеха выключена. Все пакеты доставляются с первой попытки.';
}
$('event-prev').onclick=()=>{const p=position();if(p.index>0){playing=false;setTime(stageStart(p.stage)+(p.index-1)*secondsPerMessage+.001);}};$('event-next').onclick=()=>{const p=position();if(p.index<messages(p.stage).length-1){playing=false;setTime(stageStart(p.stage)+(p.index+1)*secondsPerMessage+.001);}};$('classic').onclick=()=>choose('classic');$('ble').onclick=()=>choose('ble');$('play').onclick=()=>{if(!window.demoSelection.pairs.length)return;if(time>=total())time=0;playing=!playing;last=0;render();};$('prev').onclick=()=>{if(position().stage>0){playing=false;setTime(stageStart(position().stage-1));}};$('next').onclick=()=>{if(position().stage<stages().length-1){playing=false;setTime(stageStart(position().stage+1));}};$('reset').onclick=()=>{playing=false;setTime(0);};$('replay').onclick=()=>{time=stageStart(position().stage);playing=true;render();};$('seek').oninput=e=>setTime(Number(e.target.value)/1000*total());$('interference').onchange=e=>{const p=position(),offset=time-stageStart(p.stage);noise=e.target.checked;time=stageStart(p.stage)+(stages()[p.stage].kind==='data'?0:offset);renderKey='';buildNotes();render();};
document.addEventListener('keydown',e=>{if(/INPUT|SELECT|BUTTON|A|TEXTAREA/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.code==='Space'){e.preventDefault();$('play').click();}if(e.key==='ArrowRight'){e.preventDefault();$('next').click();}if(e.key==='ArrowLeft'){e.preventDefault();$('prev').click();}});document.addEventListener('visibilitychange',()=>{last=0;});
function buildScene(list){ $('laptop').hidden=mode!=='classic';$('sensor').hidden=mode!=='ble'; }
function updateScene(p,e,list){
 const isBle=mode==='ble', n=p.stage, i=p.index, busy=e.lost, done=n===6, transfer=n===5;
 $('scene').classList.toggle('ble-mode',isBle);
 $('scene').dataset.leftDevice=String($('device-left').selectedIndex);
 $('scene').dataset.rightDevice=String($('device-right').selectedIndex);
 const delivered = new Set();
 if(transfer&&!isBle) for(let j=0;j<=i;j++){const x=list[j], m=x.label.match(/^ACL: фрагмент (\d)/);if(m&&!x.lost&&(j<i||p.fraction>=.85))delivered.add(m[1]);}
 const progress=transfer?Math.round(delivered.size/3*100):done?100:0;
 const line=(a,b,c='')=>`<div class="screen-kicker">${a}</div><div class="screen-title">${b}</div><div class="screen-detail">${c}</div>`;
 const file=(action)=>line('BLUETOOTH',action,'report.pdf')+`<div class="screen-progress"><i style="width:${progress}%"></i></div><div class="screen-percent">${progress}%</div>`;
 let l='',r='',sensor='';
 if(!isBle){
  if(n===0){l=line('НАСТРОЙКИ','Поиск устройств','◉ Телефон поблизости');r=line('BLUETOOTH','Обнаружение','Доступен для поиска');}
  else if(n===1){l=line('ПОДКЛЮЧЕНИЕ','Телефон',i<3?'Подключение…':'Соединение установлено');r=line('BLUETOOTH','Ноутбук',i<3?'Устанавливается связь…':'Подключено');}
  else if(n===2){l=line('СОПРЯЖЕНИЕ','482 719','Сверьте код на телефоне');r=line('КОД СОПРЯЖЕНИЯ','482 719','Подтвердите совпадение');}
  else if(n===3){l=line('СЛУЖБЫ','Передача файла','Поиск службы Object Push');r=line('BLUETOOTH','Подключено','Поиск службы');}
  else if(n===4){l=line('ПЕРЕДАЧА ФАЙЛА','report.pdf','Подготовка к отправке');r=line('ВХОДЯЩИЙ ФАЙЛ','report.pdf',i===4?'Разрешено':'Запрос на получение');}
  else {l=file(done?'Отправлено':'Отправка');r=file(done?'Файл получен':busy?'Повтор пакета':'Получение');}
  $('laptop-screen').innerHTML=l;$('phone-screen').innerHTML=r;
 }else{
  if(n===0){l=line('BLUETOOTH','Поиск датчика','◉ Датчик температуры');sensor='ПОИСК';}
  else if(n===1){l=line('BLUETOOTH','Датчик температуры',i<2?'Подключение…':'Подключено');sensor='СВЯЗЬ';}
  else if(n===2){l=line('БЕЗОПАСНОСТЬ','Сопряжение','Настройка защищённого соединения');sensor='ЗАЩИТА';}
  else if(n===3){l=line('ДАТЧИК','Служба температуры','Поиск характеристики');sensor='GATT';}
  else if(n===4){l=line('ДАТЧИК','Уведомления','Подписка на показания');sensor='ГОТОВ';}
  else if(n===5){let t='—';for(let j=0;j<=i;j++){let x=list[j];if(x.label.includes('Notify:')&&!x.lost&&(j<i||p.fraction>=.85)){let m=x.label.match(/23,\d/);if(m)t=m[0];}}l=line('ТЕМПЕРАТУРА',t==='—'?'Ожидание…':t+' °C',busy?'Помеха · повтор передачи':'Датчик подключён');sensor=[...list.slice(0,i+1)].reverse().find(x=>x.label.includes('Notify:'))?.label.match(/23,\d/)?.[0]||'23,5';}
  else{l=line('ДАТЧИК','Ожидание','Соединение сохранено');sensor='СОН';}
  $('phone-screen').innerHTML=l;$('sensor-screen').textContent=sensor;
 }
 $('scene-label').textContent=e.lost&&p.fraction>=.45?'Помеха · пакет потерян':e.excluded?'Карта каналов обновлена':e.label;
 const packet=$('packet'),signal=$('signal'),moving=e.dir!==0;
 const pos=Math.max(0,Math.min(1,p.fraction/.85));
 const isPair=n===2, isAck=/подтверждён|подтверждение через|response|ответ|success|описание и параметры|служба датчика найдена|handles и свойство/i.test(e.label);
 const status=e.lost?(pos>=.52?'Пакет потерян':'Помеха'):e.label.includes('повтор')?'Повтор':isAck?'Ответ':transfer?'Данные':isPair?'Сопряжение':n===0?'Поиск':'Обмен';
 signal.classList.toggle('local',!moving); signal.classList.toggle('lost',!!e.lost);signal.classList.toggle('pairing',isPair);signal.classList.toggle('ack',isAck);signal.classList.toggle('active',playing);
 packet.style.left=(e.dir===1?pos:1-pos)*100+'%';packet.style.opacity=moving&&(!e.lost||pos<.52)?'1':'0';
 $('packet-text').textContent=e.lost?'Помеха':e.label.includes('повтор')?'Повтор':isAck?'Ответ':transfer?'Данные':isPair?'Сопряжение':n===0?'Поиск':'Запрос';$('packet-icon').textContent=e.lost?'!':e.label.includes('повтор')?'↻':isAck?'✓':isPair?'◇':transfer?'▤':'→';
 $('scene').classList.toggle('receive-left',moving&&!e.lost&&pos>=.85&&e.dir===-1);$('scene').classList.toggle('receive-right',moving&&!e.lost&&pos>=.85&&e.dir===1);$('scene').classList.toggle('searching',n===0&&playing);$('scene').classList.toggle('packet-lost',!!e.lost&&pos>=.52);
 const badge=$('pair-badge'), secureNow=e.secure || (isPair&&i===list.length-1);
 badge.style.opacity=isPair&&!moving?'1':'0';$('pair-icon').textContent=secureNow?'✓':'◇';$('pair-text').textContent=secureNow?'Защита настроена':mode==='classic'?'Сверка кода':'Создание ключа';
 $('scene').classList.toggle('sleeping',!!e.sleep);$('scene').classList.toggle('transmitting',moving&&playing);
}
const deviceChoices={classic:[['Ноутбук Анны','Ноутбук Бориса'],['Телефон Анны','Телефон Бориса']],ble:[['Телефон Анны','Телефон Бориса'],['Датчик гостиной','Датчик кабинета']]};
function populateDevices(){deviceChoices[mode].forEach((options,i)=>{const select=$(i?'device-right':'device-left');select.replaceChildren(...options.map(name=>{const o=document.createElement('option');o.value=name;o.textContent=name;return o;}));});}
for(const id of ['device-left','device-right']) $(id).onchange=()=>{playing=false;time=0;renderKey='';render();};
populateDevices();
const themeButton=$('theme-toggle');let storedTheme;try{storedTheme=localStorage.getItem('bluetooth-theme')}catch{};
function setTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';themeButton.textContent=dark?'Светлая тема':'Тёмная тема';themeButton.setAttribute('aria-pressed',String(dark));try{localStorage.setItem('bluetooth-theme',dark?'dark':'light')}catch{}}
setTheme(storedTheme==='dark');themeButton.onclick=()=>setTheme(document.documentElement.dataset.theme!=='dark');
window.demoSelection=(()=>{const chosen=new Set();
 function update(){playing=false;time=0;document.querySelector('.demonstration').classList.add('awaiting-selection');document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(chosen.has(b.dataset.device))));$('play').disabled=true;window.dispatchEvent(new Event('selectionchange'));}
 function toggle(id){if(!['laptop','phone','inside','outside'].includes(id))return;chosen.has(id)?chosen.delete(id):chosen.add(id);update();}
 document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>toggle(b.dataset.device)));
 return {chosen,toggle,get pairs(){return [];},get current(){return null;},init:update};})();
window.demoSelection.init();
function tick(now){if(playing&&last&&!document.hidden)setTime(time+Math.min(.1,(now-last)/1000)*Number($('speed').value));last=now;requestAnimationFrame(tick);}buildNotes();render();requestAnimationFrame(tick);



(() => {
 const scene = document.getElementById('scene');
 const signal = document.getElementById('signal');
 const devices = [...scene.querySelectorAll('.device')];
 const active = () => scene.classList.contains('ble-mode') ? [document.getElementById('phone'), document.getElementById('sensor')] : [document.getElementById('laptop'), document.getElementById('phone')];
 function updateLine() {
   const [left,right] = active(), box = scene.getBoundingClientRect(), a = left.getBoundingClientRect(), b = right.getBoundingClientRect();
   const x1 = a.left + a.width * .8 - box.left, x2 = b.left + b.width * .2 - box.left;
   signal.style.left = x1 + 'px'; signal.style.width = Math.max(12, x2-x1) + 'px';
 }
 function move(el, x) {
   const box = scene.getBoundingClientRect(), width = el.getBoundingClientRect().width;
   const [left,right] = active(), other = el === left ? right : left;
   const o = other.getBoundingClientRect();
   const min = el === right ? o.right - box.left + 12 : 4;
   const max = el === left ? o.left - box.left - width - 12 : box.width - width - 4;
   el.style.left = Math.max(min, Math.min(max, x)) / box.width * 100 + '%';
   el.style.right = 'auto'; updateLine();
 }
 devices.forEach(el => {
   el.tabIndex = 0; el.setAttribute('aria-label', 'Устройство: перемещайте стрелками влево и вправо');
   el.addEventListener('pointerdown', e => { if(e.button !== 0) return; el.setPointerCapture(e.pointerId); el.classList.add('dragging'); el._offset = e.clientX - el.getBoundingClientRect().left; });
   el.addEventListener('pointermove', e => { if(el.hasPointerCapture(e.pointerId)) move(el, e.clientX - scene.getBoundingClientRect().left - el._offset); });
   el.addEventListener('pointerup', () => el.classList.remove('dragging'));
   el.addEventListener('pointercancel', () => el.classList.remove('dragging'));
   el.addEventListener('keydown', e => { if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); e.stopPropagation(); move(el, el.getBoundingClientRect().left - scene.getBoundingClientRect().left + (e.key === 'ArrowLeft' ? -10 : 10)); });
 });
 for(const id of ['classic','ble']) document.getElementById(id).addEventListener('click', () => { devices.forEach(el => { el.style.left = ''; el.style.right = ''; }); requestAnimationFrame(updateLine); });
 new ResizeObserver(updateLine).observe(scene);
 requestAnimationFrame(updateLine);
})();

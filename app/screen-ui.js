(()=>{window.drawDeviceScreen=(c,w,h,title,heading,detail)=>{
 const mobile=title==='ТЕЛЕФОН',desktop=title==='НОУТБУК',off=/выключен|Не участвует|Выберите устройства/.test(heading);
 function box(x,y,ww,hh,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,ww,hh,r);c.fill();}
 function text(s,x,y,size,color='#ecf1f8',weight=400){c.fillStyle=color;c.font=`${weight} ${size}px Segoe UI`;c.fillText(s,x,y);}
 function lines(s,size,maxWidth){
  c.font=`600 ${size}px Segoe UI`;
  const out=[];
  let row='';
  for(const word of s.split(/\s+/)){
   const next=row?row+' '+word:word;
   if(c.measureText(next).width<=maxWidth){row=next;continue;}
   if(row)out.push(row);
   row='';
   for(const ch of word){
    if(row&&c.measureText(row+ch).width>maxWidth){out.push(row);row='';}
    row+=ch;
   }
  }
  if(row)out.push(row);
  return out;
 }
 function paragraph(s,x,y,maxWidth,maxHeight,size,color='#e7eef8'){let rows;do{rows=lines(s,size,maxWidth);if(rows.length*size*1.36<=maxHeight)break;size--;}while(size>10);c.fillStyle=color;c.font=`600 ${size}px Segoe UI`;rows.forEach((row,i)=>c.fillText(row,x,y+i*size*1.36));return rows.length*size*1.36;}
 c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#182b4d');bg.addColorStop(.55,'#102139');bg.addColorStop(1,'#235263');c.fillStyle=bg;c.fillRect(0,0,w,h);
 if(desktop){
  c.fillStyle='#34819a';c.beginPath();c.ellipse(w*.85,h*.75,w*.43,h*.65,-.5,0,Math.PI*2);c.fill();
  box(22,24,w-44,h-76,12,'#152234');box(22,24,w-44,34,12,'#22334a');text('▦  Параметры',38,47,14,'#e4edf8',600);text('−   □   ×',w-104,47,13,'#a9bdd3');
  box(33,70,112,h-134,8,'#1b2b40');text('Устройство',44,91,13,'#94aac3');box(39,104,100,32,7,'#29445e');text('ᛒ  Bluetooth',47,125,13,'#b8e3fb',600);text('▤  Файлы',47,157,13,'#a6b7ca');text('◉  Сеть',47,188,13,'#a6b7ca');
  const x=165,ww=w-x-44;text('Bluetooth и устройства',x,91,20,'#f1f5fb',600);text('Параметры подключения',x,113,12,'#91a7bd');box(x,128,ww,43,8,'#21364c');text('Bluetooth',x+12,154,15,'#eaf3fc',600);box(x+ww-52,140,38,18,9,off?'#526273':'#3295bd');box(x+ww-(off?49:32),143,12,12,6,'#ecf6ff');
  box(x,181,ww,h-270,9,'#1a2e44');const used=paragraph(heading,x+14,208,ww-28,h-310,22);if(detail)text(detail,x+14,Math.min(h-100,218+used),13,'#92c8de');
  const m=heading.match(/(\d) из 3/);if(m){box(x+14,h-105,ww-28,4,2,'#354c60');box(x+14,h-105,(ww-28)*Number(m[1])/3,4,2,'#59c6e6');}
  box(0,h-39,w,39,0,'#101c2bdd');for(let i=0;i<4;i++)box(w*.39+i*32,h-28,18,18,4,['#64c8ed','#e9bd59','#7887d8','#49ac9d'][i]);text('◉  ▰  09:41',w-104,h-15,12,'#b4c6d9');
 }else if(mobile){
  const status='#e3edf3';
  text('9:41',23,31,15,status,600);
  for(let i=0;i<4;i++)box(w-83+i*4.5,29-(5+i*2),3,5+i*2,1,status);
  c.strokeStyle=status;c.lineWidth=1.6;c.lineCap='round';
  for(const radius of [4,7,10]){
   c.beginPath();c.arc(w-53,31,radius,-Math.PI*.76,-Math.PI*.24);c.stroke();
  }
  box(w-54,29,2,2,1,status);
  c.beginPath();c.roundRect(w-36,20,18,9,2);c.stroke();
  box(w-33.5,22.5,12,4,1,status);box(w-16.5,22.5,1.6,4,1,status);
  c.beginPath();c.moveTo(30,62);c.lineTo(24,68);c.lineTo(30,74);c.stroke();
  text('Bluetooth',47,76,25,'#f3f7fc',600);text('Подключения и обмен',23,104,14,'#a4bccd');
  box(16,128,w-32,71,18,'#223c56');box(28,144,39,39,12,'#267fa6');text('ᛒ',38,172,26,'#e6f5ff');text('Bluetooth',80,155,16,'#eff7ff',600);text(off?'Выключен':'Включён',80,179,13,'#9cc2d8');box(w-72,151,39,22,11,off?'#58697b':'#39a8cb');box(w-(off?68:51),154,16,16,8,'#f2f8fc');
  text('Текущее действие',24,237,12,'#9ab7ca',600);box(16,252,w-32,h-337,19,'#1d334c');box(30,267,34,34,10,'#31516d');text(/pdf|файл|фрагмент/i.test(heading)?'▤':'ᛒ',40,291,22,'#8ddbf4');const used=paragraph(heading,31,333,w-62,h-423,22);if(detail)paragraph(detail,31,Math.min(h-123,350+used),w-62,54,14,'#9fc3dc');
  text('Подключения · устройства · файлы',24,h-56,11,'#83a4bb');box(w*.35,h-19,w*.3,4,2,'#d7e8f4');
 }else{
  c.fillStyle='#a6b6a5';c.fillRect(0,0,w,h);text(title,22,42,23,'#263a31',600);c.fillStyle='#526b5c';c.fillRect(22,58,w-44,2);paragraph(heading,22,110,w-44,h-160,48,'#173a2c');if(detail)text(detail,22,h-30,20,'#3a5747');
 }
};})();

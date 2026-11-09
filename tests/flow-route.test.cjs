const T=require('three'),route=require('../app/flow-route.js'),assert=require('node:assert/strict');const devices={};for(const [id,p] of Object.entries({laptop:[-.75,.975,.12],phone:[.85,.975,.12],inside:[.52,1.92,-2.12],outside:[-1.22,2.38,-2.43]})){const o=new T.Group();o.position.set(...p);devices[id]=o;}devices.outside.scale.setScalar(.56);for(const sensor of ['inside','outside','phone']){const points=route(T,devices,'laptop',sensor);assert.equal(points.length,41);assert(points.every(p=>[p.x,p.y,p.z].every(Number.isFinite)));assert(points.slice(0,4).every(p=>p.y<1.18),'route must leave through base, below laptop display');assert(Math.abs(points[0].x-devices.laptop.position.x)>.58);}console.log('PASS: finite routes attach to laptop base and avoid its screen.');

const {laptop,phone}=devices;
function addScreen(parent,x,y,z,w,h,d){
 const screen=new T.Mesh(new T.BoxGeometry(w,h,d));
 screen.position.set(x,y,z);
 parent.add(screen);
 return screen;
}
laptop.position.set(-.4,.975,.35);
phone.position.set(.6,.975,-.50);
const lid=new T.Group();
lid.position.set(0,.032,-.32);
lid.rotation.x=-.18;
laptop.add(lid);
laptop.userData.routeScreen=addScreen(lid,0,.36,.015,1.098,.688,.014);
const cradle=new T.Group();
cradle.position.set(0,.046,.006);
cradle.rotation.x=-.15;
phone.add(cradle);
const handset=new T.Group();
handset.position.y=-.046;
handset.scale.z=.40;
cradle.add(handset);
phone.userData.routeMount=handset;
phone.userData.routeScreen=addScreen(handset,0,.35,.045,.285,.576,.013);
for(const id of ['laptop','phone'])devices[id].userData.routeScreen.updateWorldMatrix(true,false);
const screens=['laptop','phone'].map(id=>new T.Box3().setFromObject(devices[id].userData.routeScreen));
for(const [from,to] of [['laptop','phone'],['phone','laptop'],['outside','laptop'],['phone','inside']]){
 const points=route(T,devices,from,to);
 for(let i=1;i<points.length;i++){
   const start=points[i-1],delta=points[i].clone().sub(start),length=delta.length();
   const segment=new T.Ray(start,delta.normalize());
   for(const screen of screens){
     const hit=segment.intersectBox(screen,new T.Vector3());
     assert(!screen.containsPoint(start)&&(!hit||hit.distanceTo(start)>length),from+' -> '+to);
   }
 }
}
console.log('PASS: diagonal links and reverse traffic avoid both display surfaces.');

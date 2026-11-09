(function(root){
function route(T,devices,from,to,index=0){
 const ray=new T.Ray(),direction=new T.Vector3(),hit=new T.Vector3();
 const boxes=[];
 for(const device of Object.values(devices)){
   const screen=device.userData.routeScreen;
   if(screen){
     screen.updateWorldMatrix(true,false);
     boxes.push(new T.Box3().setFromObject(screen).expandByScalar(.008));
   }
 }
 for(const {x,z,hx,hz,height} of root.SceneRules?.obstacles||[]){
   boxes.push(new T.Box3(new T.Vector3(x-hx,.97,z-hz),new T.Vector3(x+hx,.97+height,z+hz)));
 }

 function port(id,sign){
   const device=devices[id];
   if(id==='laptop')return {point:device.localToWorld(new T.Vector3(sign*.592,.012,.20)),exit:.22};
   if(id==='phone'){
     const mount=device.userData.routeMount||device;
     return {point:mount.localToWorld(new T.Vector3(sign*.155,.30,0)),exit:.14};
   }
   return {point:device.localToWorld(new T.Vector3(sign*.19,0,.025)),exit:.12};
 }
 function clear(points){
   for(let i=1;i<points.length;i++){
     const start=points[i-1];
     const length=direction.subVectors(points[i],start).length();
     if(length<1e-6)continue;
     ray.set(start,direction.multiplyScalar(1/length));
     for(const box of boxes)if(box.containsPoint(start)||(ray.intersectBox(box,hit)&&hit.distanceToSquared(start)<=length*length))return false;
   }
   return true;
 }

 const sign=devices[to].position.x<devices[from].position.x?-1:1;
 const sidePairs=[[sign,-sign],[sign,sign],[-sign,-sign],[-sign,sign]];
 const lane=index*.035;
 for(const frontBias of [.035,.20,.42]){
   for(const [aSign,bSign] of sidePairs){
     const a=port(from,aSign),b=port(to,bSign);
     const aControl=a.point.clone().lerp(b.point,.13);
     const bControl=b.point.clone().lerp(a.point,.13);
     aControl.x=a.point.x+aSign*a.exit;
     bControl.x=b.point.x+bSign*b.exit;
     aControl.y+=lane;
     bControl.y+=lane;
     aControl.z=Math.max(a.point.z-frontBias,aControl.z)+frontBias;
     bControl.z=Math.max(b.point.z-frontBias,bControl.z)+frontBias;
     const points=new T.CubicBezierCurve3(a.point,aControl,bControl,b.point).getPoints(40);
     if(clear(points))return points;
   }
 }

 const a=port(from,sign),b=port(to,-sign);
 const aSide=a.point.clone().add(new T.Vector3(sign*a.exit,0,0));
 const bSide=b.point.clone().add(new T.Vector3(-sign*b.exit,0,0));
 const above=Math.max(aSide.y,bSide.y,...boxes.map(box=>box.max.y))+.19+lane;
 const front=Math.max(aSide.z,bSide.z,...boxes.map(box=>box.max.z))+.25;
 const rise=aSide.clone().setY(above).setZ(front),fall=bSide.clone().setY(above).setZ(front);
 return new T.CatmullRomCurve3([a.point,aSide,rise,fall,bSide,b.point]).getPoints(40);
}
root.buildFlowRoute=route;if(typeof module!=='undefined')module.exports=route;
})(typeof window==='undefined'?globalThis:window);

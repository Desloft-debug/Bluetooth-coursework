(function(root){
const obstacles=[{x:1.4,z:.5,hx:.30,hz:.19,height:.365,name:'Кружка'},{x:-1.55,z:-.65,hx:.17,hz:.13,height:.18,name:'Книги'}];
function overlaps(x,z,h,a){return Math.abs(x-a.x)<h.x+a.hx+.035&&Math.abs(z-a.z)<h.z+a.hz+.035;}
function move(from,to,half,other){const desired={x:Math.max(-1.93+half.x,Math.min(1.93-half.x,to.x)),z:Math.max(-.93+half.z,Math.min(.93-half.z,to.z))};const blocks=other?[...obstacles,other]:obstacles;let last={...from};const n=Math.max(1,Math.ceil(Math.hypot(desired.x-from.x,desired.z-from.z)/.025));for(let i=1;i<=n;i++){const p={x:from.x+(desired.x-from.x)*i/n,z:from.z+(desired.z-from.z)*i/n};if(blocks.some(b=>overlaps(p.x,p.z,half,b)))break;last=p;}return last;}
function camera(p){return {x:Math.max(-4.15,Math.min(3.7,p.x)),y:Math.max(.65,Math.min(4.45,p.y)),z:Math.max(-1.65,Math.min(9.5,p.z))};}
root.SceneRules={obstacles,move,camera};if(typeof module!=='undefined')module.exports=root.SceneRules;
})(typeof window==='undefined'?globalThis:window);

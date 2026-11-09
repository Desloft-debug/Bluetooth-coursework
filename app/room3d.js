(()=>{
 const host=document.getElementById('scene'), T=THREE, G=BluetoothGraphics;
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
 renderer.domElement.className='room3d';renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Трёхмерная комната: перетаскивайте устройства по столу, поворачивайте камеру за фон.');host.prepend(renderer.domElement);
 const scene=new T.Scene();scene.background=new T.Color('#c5c8bd');scene.fog=new T.Fog('#c5c8bd',12,26);
 const roomFov=44;
 const camera=new T.PerspectiveCamera(roomFov,1,.1,100);let az=.08,el=.40,dist=7.65;const target=new T.Vector3(-.25,1.18,-.15);
 function resizeCamera(width,height){
   camera.aspect=width/height;
   const fit=Math.max(1,2.05/Math.max(.95,camera.aspect));
   camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(roomFov/2))*fit));
   camera.updateProjectionMatrix();
 }
 const mat=(color,rough=.6,metal=0)=>new T.MeshStandardMaterial({color,roughness:rough,metalness:metal,envMapIntensity:.12});
 function cube(parent,w,h,d,x,y,z,m,shadow=true){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=shadow;mesh.receiveShadow=true;if(m===wallMat){const pos=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(w<d?pos.getZ(i)+z:pos.getX(i)+x),pos.getY(i)+y);uv.needsUpdate=true;}parent.add(mesh);return mesh;}
 function rounded(parent,w,h,depth,r,m){const shape=new T.Shape();let x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);const geo=new T.ExtrudeGeometry(shape,{depth:Math.max(.001,depth-.008),bevelEnabled:true,bevelThickness:Math.min(.004,depth*.22),bevelSize:Math.min(.004,depth*.22),bevelSegments:3,curveSegments:8});geo.translate(0,0,-depth/2);const o=new T.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const textureLoader=new T.TextureLoader();let assetsLoaded=0,assetsFailed=0,assetsTotal=0;
 function pbr(material,id,repeatX,repeatY,strength=.25){
   for(const [suffix,slot] of [['Color','map'],['NormalGL','normalMap'],['Roughness','roughnessMap']]){
     assetsTotal++;
     const texture=textureLoader.load(SceneAssets[id+'_2K-JPG_'+suffix],()=>{assetsLoaded++;updateAssetStatus();},undefined,()=>{assetsFailed++;updateAssetStatus();});
     texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(repeatX,repeatY);texture.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());texture.colorSpace=slot==='map'?T.SRGBColorSpace:T.NoColorSpace;material[slot]=texture;
   }
   material.normalScale.set(strength,strength);material.bumpMap=null;material.needsUpdate=true;
 }
 function updateAssetStatus(){const label=document.getElementById('asset-status');if(assetsFailed)document.getElementById('graphics-info').open=true;if(label)label.textContent=assetsFailed?'Часть текстур не загрузилась':assetsLoaded===assetsTotal?'Материалы загружены · PBR / HDR':'Загрузка материалов…';}
 function softBox(parent,w,h,d,x,y,z,material,r=.06){const o=new T.Mesh(new G.RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 let seed=20261102;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
 const room=new T.Group();scene.add(room);const floorMat=mat('#a89b8d'),wallMat=mat('#ddd8c8'),wood=mat('#b99170',.46),side=mat('#453c35',.42,.25);
 pbr(wood,'oak_veneer_01',1.45,1.05,.24);wood.roughness=.95;wood.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=max(roughnessFactor,0.68);');};pbr(floorMat,'laminate_floor_02',5,4,.16);
 pbr(wallMat,'wallpaper_jacquard',.85,.84,.38);
 wallMat.roughness=1;
 wallMat.envMapIntensity=.055;

 const roomBounds={left:-4.8,right:4.28,back:-2.4,front:10.6};
 cube(room,9.08,.12,13,-.26,-.07,4.1,floorMat);
 cube(room,1.96,5,.12,-3.82,2.5,-2.4,wallMat);
 cube(room,5.04,5,.12,1.76,2.5,-2.4,wallMat);
 cube(room,2.08,1.56,.12,-1.8,.78,-2.4,wallMat);
 cube(room,2.08,1.65,.12,-1.8,4.175,-2.4,wallMat);
 for(const x of [roomBounds.left,roomBounds.right])cube(room,.12,5,13,x,2.5,4.1,wallMat);
 cube(room,9.08,5,.12,-.26,2.5,roomBounds.front,wallMat);
 const trim=mat('#dbcfbb',.72);
 for(const z of [-2.30,10.50]){cube(room,9.0,.15,.065,-.26,.075,z,trim);cube(room,9.0,.025,.079,-.26,.151,z,trim);}
 for(const x of [-4.70,4.18]){cube(room,.065,.15,12.86,x,.075,4.1,trim);cube(room,.079,.025,12.86,x,.151,4.1,trim);}
 const top=rounded(room,3.9,1.9,.11,.1,wood);top.rotation.x=-Math.PI/2;top.position.y=.92;
 const topUV=top.geometry.attributes.uv,topPos=top.geometry.attributes.position;
 for(let i=0;i<topUV.count;i++)topUV.setXY(i,(topPos.getX(i)+1.95)/3.9,(topPos.getY(i)+.95)/1.9);topUV.needsUpdate=true;
 const apron=mat('#302823',.48);for(const z of [-.78,.78])cube(room,3.5,.12,.055,0,.80,z,apron);
 for(const x of [-1.72,1.72])for(const z of [-.72,.72])cube(room,.09,.87,.09,x,.44,z,side);
 const rug=mat('#c3b1a0',1);pbr(rug,'dirty_carpet',3,2,.40);const carpet=cube(room,5.8,.018,4.3,-.06,.012,.36,rug,false);carpet.rotation.y=.035;
 const windowFrame=mat('#a7a89e',.42);for(const x of [-2.84,-.76])cube(room,.10,1.8,.12,x,2.45,-2.29,windowFrame);for(const y of [1.58,3.32])cube(room,2.1,.10,.12,-1.8,y,-2.29,windowFrame);
 const outsideMap=textureLoader.load(EveningAssets.view);outsideMap.colorSpace=T.SRGBColorSpace;outsideMap.anisotropy=8;
 const landscape=new T.Mesh(new T.PlaneGeometry(7.5,5.16),new T.MeshBasicMaterial({map:outsideMap,toneMapped:false,fog:false}));landscape.position.set(-1.8,1.5,-5.2);room.add(landscape);
 const skyMat=new T.MeshPhysicalMaterial({color:'#f2fbf9',transmission:.96,opacity:1,roughness:.025,metalness:0,ior:1.52,thickness:.014,attenuationColor:new T.Color('#e3f1e9'),attenuationDistance:10,envMapIntensity:.5,side:T.DoubleSide});
 const pane=new T.Mesh(new T.PlaneGeometry(1.95,1.65),skyMat);pane.position.set(-1.8,2.45,-2.215);room.add(pane);
 G.RectAreaLightUniformsLib.init();
 const windowFill=new T.RectAreaLight(0xc1d5f0,8.2,1.85,1.55);
 windowFill.position.set(-1.8,2.45,-2.195);
 windowFill.rotation.y=Math.PI;
 scene.add(windowFill);
 const windowBeam=new T.SpotLight(0xaac1e9,58,15,Math.PI*.25,.8,2);windowBeam.position.set(-2.88,4.16,-4.9);windowBeam.target.position.set(.45,.40,1.5);windowBeam.castShadow=true;windowBeam.shadow.mapSize.set(2048,2048);windowBeam.shadow.camera.near=.2;windowBeam.shadow.camera.far=15;windowBeam.shadow.bias=-.00008;windowBeam.shadow.normalBias=.005;windowBeam.shadow.focus=1;scene.add(windowBeam,windowBeam.target);
 const windowBounce=new T.RectAreaLight(0xc8bdac,1.55,1.42,.76);
 windowBounce.position.set(-.74,.979,-.06);
 windowBounce.rotation.x=Math.PI/2;
 scene.add(windowBounce);

 cube(room,.055,1.65,.035,-1.8,2.45,-2.19,windowFrame);cube(room,1.95,.055,.035,-1.8,2.45,-2.19,windowFrame);cube(room,2.35,.07,.28,-1.8,1.53,-2.19,windowFrame);const seal=mat('#454c4b',.86);for(const x of [-2.77,-.83])cube(room,.012,1.62,.018,x,2.45,-2.20,seal);const latch=softBox(room,.025,.13,.035,-.88,2.36,-2.13,mat('#b8bcbf',.25,.8),.008);
 const sash=mat('#dbd9ce',.3),gasket=mat('#303a3d',.85),bead=mat('#b8b9ae',.38);
 for(const x of [-2.73,-.87]){softBox(room,.045,1.57,.065,x,2.45,-2.17,sash,.006);cube(room,.009,1.54,.012,x+(x<-1.8?.026:-.026),2.45,-2.125,gasket);}
 for(const y of [1.68,3.23]){softBox(room,1.88,.045,.065,-1.8,y,-2.17,sash,.006);cube(room,1.82,.009,.012,-1.8,y+(y<2.45?.025:-.025),-2.125,gasket);}
 for(const x of [-2.82,-.78])for(const y of [1.85,3.0])softBox(room,.045,.12,.04,x,y,-2.15,bead,.008);
 const curtain=new T.MeshPhysicalMaterial({color:'#9da982',roughness:1,sheen:.25,sheenRoughness:.94,sheenColor:new T.Color('#c0c3a8'),side:T.DoubleSide});
 const curtainTop=3.48,curtainDepth=-1.84;
 const curtainPanels=[{x:-3.12,width:.72,phase:.35},{x:-.46,width:.68,phase:1.2}];
 for(const {x,width,phase} of curtainPanels){
   const geometry=new T.PlaneGeometry(1,1,80,40);
   const positions=geometry.attributes.position;
   const uv=geometry.attributes.uv;
   for(let i=0;i<positions.count;i++){
     const u=uv.getX(i),drop=1-uv.getY(i);
     const pleat=u*Math.PI*12+phase+.22*Math.sin(u*12+drop*3)+.32*drop;
     const hem=.039+.014*Math.sin(u*16+phase)+.007*Math.cos(u*30);
     const fold=Math.sin(pleat)*(.035+.027*drop)+.009*Math.cos(2*pleat);
     const lean=.026*Math.sin(drop*3.6+phase)*drop;
     positions.setXYZ(i,x+(u-.5)*width*(1+.10*drop)+lean,
       T.MathUtils.lerp(curtainTop,hem,drop),curtainDepth+fold+.018*Math.sin(drop*7+u*9)*drop);
   }
   geometry.computeVertexNormals();
   const cloth=new T.Mesh(geometry,curtain);
   cloth.castShadow=cloth.receiveShadow=true;
   room.add(cloth);
 }
 function cylinder(parent,r1,r2,h,x,y,z,m){let o=new T.Mesh(new T.CylinderGeometry(r1,r2,h,32),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const decor=new T.Group();scene.add(decor);
 const curtainMetal=mat('#685742',.58,.52);
 const rod=cylinder(decor,.018,.018,3.62,-1.79,3.54,curtainDepth,curtainMetal);rod.rotation.z=Math.PI/2;
 for(const x of [-3.54,-.04]){
   cube(decor,.046,.088,.026,x,3.54,-2.32,curtainMetal);
   cube(decor,.025,.024,.48,x,3.54,-2.08,curtainMetal);
   const finial=new T.Mesh(new T.SphereGeometry(.036,14,10),curtainMetal);
   finial.position.set(x,3.54,curtainDepth);decor.add(finial);
 }
 for(const {x,width,phase} of curtainPanels)for(let i=0;i<7;i++){
   const u=(i+.35)/6.7;
   const pleat=u*Math.PI*12+phase+.22*Math.sin(u*12);
   const fold=Math.sin(pleat)*.035+.009*Math.cos(2*pleat);
   const ring=new T.Mesh(new T.TorusGeometry(.044,.0045,8,20),curtainMetal);
   ring.position.set(x+(u-.5)*width,3.523,curtainDepth+fold*.48);
   ring.rotation.y=Math.PI/2;decor.add(ring);
 }

 const sofaFallback=new T.Group(),plantFallback=new T.Group();decor.add(sofaFallback,plantFallback);
 let modelCount=0;
 function loadModel(id,width,x,z,fallback,rotation=0){new G.GLTFLoader().parse(JSON.stringify(SceneModels[id]),'',gltf=>{const model=gltf.scene;model.updateMatrixWorld(true);let box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3());model.scale.setScalar(width/size.x);model.rotation.y=rotation;model.updateMatrixWorld(true);box.setFromObject(model);const center=box.getCenter(new T.Vector3());model.position.set(x-center.x,-box.min.y,z-center.z);model.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.envMapIntensity=.12;for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(m[key])m[key].anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}}});decor.add(model);if(fallback)fallback.visible=false;modelCount++;const status=document.getElementById('model-status');if(status)status.textContent='Модели: '+modelCount+'/6 · локальные';},error=>{console.error('Model loading failed',id,error);const status=document.getElementById('model-status');if(status){status.textContent='Не загрузилась модель '+id;document.getElementById('graphics-info').open=true;}});}

 const textile=new T.MeshPhysicalMaterial({color:'#728178',roughness:.95,sheen:.8,sheenColor:new T.Color('#9ca89b'),sheenRoughness:.8});pbr(textile,'Fabric030',3,2,.35);pbr(curtain,'terlenka',1.8,7,.42);
 softBox(sofaFallback,2.4,.38,.68,.1,.42,-1.73,textile);softBox(sofaFallback,2.4,.6,.17,.1,.77,-2.03,textile);
 for(let x of [-1.15,1.35])softBox(sofaFallback,.16,.5,.7,x,.62,-1.73,textile);
 for(let x of [-.6,.18,.94])softBox(sofaFallback,.72,.12,.61,x,.66,-1.72,textile);
 const cushion=rounded(sofaFallback,.46,.43,.16,.09,mat('#c9b18d',.95));cushion.position.set(-.65,.97,-1.93);cushion.rotation.z=.15;
 const brass=mat('#a58958',.56,.55),lampShade=mat('#e3cfab',.94);
 const lampX=-4.02,lampZ=2.12;
 cylinder(decor,.31,.33,.045,lampX,.025,lampZ,side);
 cylinder(decor,.025,.025,2.35,lampX,1.2,lampZ,brass);
 pbr(lampShade,'Fabric030',3,2,.17);
 lampShade.side=T.DoubleSide;
 const shade=new T.Mesh(new T.CylinderGeometry(.28,.48,.5,64,1,true),lampShade);
 shade.position.set(lampX,2.28,lampZ);
 shade.castShadow=true;
 decor.add(shade);
 const lamp=new T.PointLight('#ffcb96',7.05,5,2);
 lamp.position.set(lampX,2.02,lampZ);
 lamp.castShadow=true;
 lamp.shadow.mapSize.set(1024,1024);
 lamp.shadow.normalBias=.015;
 scene.add(lamp);
 lampShade.emissive=new T.Color('#b76c29');
 lampShade.emissiveIntensity=.10;
 cylinder(plantFallback,.23,.17,.38,-3.25,.22,-1.65,mat('#bca58b'));
 for(let i=0;i<14;i++){const leaf=new T.Mesh(new T.SphereGeometry(1,16,10),mat(i%2?'#435e45':'#6c8158'));leaf.scale.set(.13,.48,.07);leaf.position.set(-3.25+Math.sin(i*2.4)*.3,.85+random()*.45,-1.65+Math.cos(i*2.4)*.22);leaf.rotation.z=Math.sin(i)*.8;plantFallback.add(leaf);}
 const pictureX=1.92,pictureY=2.05,pictureW=2.05,pictureH=1.72;
 const frameMat=mat('#4c3827',.42),innerTrim=mat('#bda77d',.32,.55),mount=mat('#bdb4a0',.95);
 cube(decor,pictureW,pictureH,.065,pictureX,pictureY,-2.235,frameMat);
 cube(decor,pictureW-.09,pictureH-.09,.012,pictureX,pictureY,-2.194,innerTrim);
 cube(decor,pictureW-.12,pictureH-.12,.009,pictureX,pictureY,-2.182,mount);
 const photograph=textureLoader.load(LETIBuildingPhoto);photograph.colorSpace=T.SRGBColorSpace;photograph.anisotropy=8;
 const print=new T.Mesh(new T.PlaneGeometry(1.83,1.50),new T.MeshStandardMaterial({map:photograph,roughness:.92,metalness:0,envMapIntensity:.1}));print.position.set(pictureX,pictureY,-2.171);print.receiveShadow=true;decor.add(print);
 const galleryMetal=mat('#a28c60',.32,.7);const galleryY=pictureY+pictureH/2+.15;
 for(const dx of [-.62,.62]){cube(decor,.04,.10,.035,pictureX+dx,galleryY,-2.28,galleryMetal);const arm=cube(decor,.022,.022,.22,pictureX+dx,galleryY,-2.16,galleryMetal);}
 softBox(decor,1.65,.055,.09,pictureX,galleryY,-2.03,galleryMetal,.015);
 const diffuser=new T.MeshStandardMaterial({color:'#e9d2a5',emissive:'#ffd6a1',emissiveIntensity:.65,roughness:.7,envMapIntensity:.1});cube(decor,1.55,.009,.055,pictureX,galleryY-.029,-2.03,diffuser,false);
 const galleryFill=new T.RectAreaLight(0xffdfb6,2.2,1.55,.05);galleryFill.position.set(pictureX,galleryY-.04,-2.01);galleryFill.lookAt(pictureX,pictureY,-2.17);scene.add(galleryFill);
 const galleryBeam=new T.SpotLight(0xffdfb6,1.0,1.65,.78,.85,2);
 galleryBeam.position.set(pictureX,galleryY-.05,-1.98);
 galleryBeam.target.position.set(pictureX,pictureY+.20,-2.17);
 scene.add(galleryBeam,galleryBeam.target);
 const grainCanvas=document.createElement('canvas');
 grainCanvas.width=grainCanvas.height=256;
 const grainContext=grainCanvas.getContext('2d');
 grainContext.fillStyle='#888';
 grainContext.fillRect(0,0,256,256);
 for(let i=0;i<9500;i++){
   grainContext.fillStyle=i%2?'#eeeeee2b':'#22222232';
   grainContext.fillRect(random()*256,random()*256,1+random()*2,1+random());
 }
 const microGrain=new T.CanvasTexture(grainCanvas);
 microGrain.wrapS=microGrain.wrapT=T.RepeatWrapping;
 microGrain.repeat.set(3,3);
 const matte=(material,roughness,bump)=>{material.roughness=roughness;material.bumpMap=microGrain;material.bumpScale=bump;return material;};
 floorMat.roughness=.96;
 floorMat.onBeforeCompile=wood.onBeforeCompile;
 matte(trim,.72,.007);
 matte(sash,.64,.004);
 matte(apron,.76,.007);
 matte(frameMat,.66,.006);

 const hearth=new T.Group();
 hearth.position.set(4.20,0,-.24);
 hearth.rotation.y=-Math.PI/2;
 decor.add(hearth);
 const limestone=mat('#c2ac8d',1);
 pbr(limestone,'scuffed_cement',1.0,1.0,.64);
 const bevelStone=limestone.clone();
 bevelStone.color.set('#d5bc9d');
 const darkStone=limestone.clone();
 darkStone.color.set('#a58f76');
 const blackIron=mat('#312820',.83,.24);
 const mantel=matte(mat('#654633'),.78,.009);
 const firebrick=['#685044','#584236','#423831','#312923'].map(color=>{
   const material=darkStone.clone();
   material.color.set(color);
   return material;
 });
 function stoneBlock(w,h,d,x,y,z,material,radius){
   const block=softBox(hearth,w,h,d,x,y,z,material,radius);
   const vertices=block.geometry.attributes.position;
   for(let i=0;i<vertices.count;i++){
     const vx=vertices.getX(i),vy=vertices.getY(i),vz=vertices.getZ(i);
     const chip=Math.sin(vx*103+vy*75-vz*37+x*24+y*11)*Math.cos(vz*97-vy*113);
     vertices.setXYZ(i,vx+chip*.0035,vy+chip*.003,vz+chip*.004);
   }
   return block;
 }
 stoneBlock(2.14,.105,.64,0,.052,.30,limestone,.013);
 stoneBlock(2.02,.045,.58,0,.123,.29,bevelStone,.007);
 softBox(hearth,1.98,.86,.11,0,.56,.082,blackIron,.01);
 for(const x of [-.88,.88]){
   stoneBlock(.295,.86,.40,x,.60,.225,darkStone,.008);
   for(let course=0;course<3;course++){
     const courseStone=stoneBlock(.308+course*.004,.280,.438,x,.315+course*.283,.248+Math.sin(x*9+course*5)*.009,course===1?darkStone:limestone,.009);
     courseStone.rotation.z=.012*Math.sin(x*11+course*3);
   }
   stoneBlock(.36,.07,.47,x,.18,.246,bevelStone,.008);
   stoneBlock(.043,.73,.061,x-Math.sign(x)*.155,.58,.419,darkStone,.006);
   cube(hearth,.038,.65,.35,x-Math.sign(x)*.172,.54,.255,blackIron);
 }
 stoneBlock(2.06,.20,.45,0,1.10,.245,limestone,.012);
 stoneBlock(2.12,.047,.48,0,1.222,.25,bevelStone,.007);
 softBox(hearth,2.24,.085,.56,0,1.285,.28,mantel,.016);
 const brickBatches=firebrick.map(()=>[]);
 for(let row=0;row<6;row++)for(let col=0;col<8;col++){
   const x=(col-3.5)*.185+(row%2?.073:0);
   const tone=Math.min(3,Math.floor((row+(col%3)*.65)/2));
   const brick=stoneBlock(.179,.082,.029,x,.217+row*.088,.145+.005*Math.sin(row*5+col),firebrick[tone],.004);
   brick.rotation.z=.012*Math.sin(row*4+col);
   brick.updateMatrix();
   brickBatches[tone].push(brick.geometry.applyMatrix4(brick.matrix));
   hearth.remove(brick);
 }
 for(const [tone,parts] of brickBatches.entries()){
   const masonry=new T.Mesh(G.mergeGeometries(parts),firebrick[tone]);
   masonry.castShadow=masonry.receiveShadow=true;
   hearth.add(masonry);
   for(const part of parts)part.dispose();
 }
 softBox(hearth,1.42,.052,.35,0,.188,.293,blackIron,.013);
 const fireMedia=window.FireplaceMedia;
 function fireMediaUrl(base64,mime){
   const bytes=Uint8Array.from(atob(base64),char=>char.charCodeAt(0));
   return URL.createObjectURL(new Blob([bytes],{type:mime}));
 }
 const fireVideo=document.createElement('video');
 fireVideo.muted=true;
 fireVideo.loop=true;
 fireVideo.playsInline=true;
 fireVideo.defaultPlaybackRate=fireVideo.playbackRate=.5;
 const firePoster=textureLoader.load(fireMedia.poster);
 firePoster.colorSpace=T.SRGBColorSpace;
 const fireMaterial=new T.MeshBasicMaterial({map:firePoster,transparent:true,depthWrite:false,toneMapped:false});
 fireMaterial.onBeforeCompile=shader=>{
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
     #include <map_fragment>
     vec2 edge=min(vMapUv,1.0-vMapUv);
     float sideFade=smoothstep(0.0,0.14,edge.x);
     float verticalFade=smoothstep(0.0,0.07,edge.y);
     float luminance=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
     float logBed=(1.0-smoothstep(0.27,0.42,vMapUv.y))*smoothstep(0.04,0.20,edge.x);
     float flame=smoothstep(0.002,0.050,luminance);
     diffuseColor.a *= sideFade*verticalFade*max(flame,logBed);
   `);
 };
 const fireTexture=new T.VideoTexture(fireVideo);
 fireTexture.colorSpace=T.SRGBColorSpace;
 fireVideo.addEventListener('playing',()=>{
   fireMaterial.map=fireTexture;
   fireMaterial.needsUpdate=true;
   firePoster.dispose();
 },{once:true});
 fireVideo.src=fireMediaUrl(fireMedia.video,'video/webm');
 fireVideo.play().catch(()=>{});
 const fireFootage=new T.Mesh(new T.PlaneGeometry(1.12,.77),fireMaterial);
 fireFootage.position.set(0,.590,.334);
 fireFootage.name='Fireplace footage';
 hearth.add(fireFootage);
 const fireLight=new T.PointLight('#ff9a5d',.65,1.65,2);
 fireLight.position.set(0,.42,.375);hearth.add(fireLight);
 const fireBounce=new T.RectAreaLight('#ff9c62',2.18,1.06,.27);
 fireBounce.position.set(0,.43,.475);
 fireBounce.rotation.y=Math.PI;
 hearth.add(fireBounce);
 function updateFire(){
   const samples=fireMedia.light;
   const frame=(fireVideo.currentTime*fireMedia.fps)%samples.length;
   const index=Math.floor(frame);
   const flicker=T.MathUtils.lerp(samples[index],samples[(index+1)%samples.length],frame-index);
   fireLight.intensity=.67*flicker;
   fireBounce.intensity=2.18*flicker;
 }

 for(const [x,height] of [[-.71,.16],[-.56,.115]]){
   cylinder(hearth,.041,.044,.020,x,1.337,.32,blackIron);
   cylinder(hearth,.029,.030,height,x,1.347+height/2,.32,mat('#cfbea0',.86));
 }
 const bowl=new T.Mesh(new T.LatheGeometry([[0,0],[.052,0],[.102,.029],[.13,.063],[.131,.073],[.122,.071],[.094,.035],[0,.018]].map(([r,y])=>new T.Vector2(r,y)),32),matte(mat('#86765e'),.89,.009));
 bowl.position.set(.64,1.329,.33);bowl.castShadow=bowl.receiveShadow=true;hearth.add(bowl);

 const bookcase=new T.Group();
 bookcase.name='Bookshelves above fireplace';
 hearth.add(bookcase);
 const shelfOak=wood.clone();
 shelfOak.color.set('#a28161');
 shelfOak.roughness=.92;
 shelfOak.onBeforeCompile=wood.onBeforeCompile;
 const shelfLevels=[1.80,2.33,2.86];
 for(const y of shelfLevels)softBox(bookcase,2.08,.056,.41,0,y,.19,shelfOak,.007);
 for(const x of [-.99,.99]){
   softBox(bookcase,.038,1.20,.042,x,2.33,.010,blackIron,.005);
   for(const y of shelfLevels){
     softBox(bookcase,.037,.037,.36,x,y-.038,.168,blackIron,.004);
     cube(bookcase,.052,.075,.015,x,y-.08,-.012,blackIron);
   }
 }
 const bookMaterials=['#998c6d','#777f68','#864a3a','#c5b59b','#565a52','#ad8c65'].map(color=>matte(mat(color),.94,.0012));
 const paper=mat('#b9aa90',.94),bookGilt=mat('#b39a69',.73,.23);
 const bookParts=new Map();
 function shelfBook(x,y,w,h,d,tone,lean=0){
   const book=new T.Group();
   book.position.set(x,y+.028,.386-d/2);
   book.rotation.z=lean;
   softBox(book,w-.018,h-.018,d-.016,0,h/2,-.004,paper,.003);
   const cover=bookMaterials[tone];
   for(const side of [-1,1])softBox(book,.006,h,d,side*(w/2-.003),h/2,0,cover,.002);
   softBox(book,w,h,.017,0,h/2,d/2-.006,cover,.006);
   for(const band of [.13,.80])cube(book,w*.69,.004,.0015,0,h*band,d/2+.0035,bookGilt,false);
   if(tone%2===0)cube(book,w*.50,.022,.0015,0,h*.65,d/2+.0035,bookGilt,false);
   book.updateMatrix();
   for(const part of book.children){
     part.updateMatrix();
     if(!bookParts.has(part.material))bookParts.set(part.material,[]);
     const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry;
     if(geometry!==part.geometry)part.geometry.dispose();
     bookParts.get(part.material).push(geometry.applyMatrix4(part.matrix).applyMatrix4(book.matrix));
   }
 }
 for(const [row,y] of shelfLevels.slice(0,2).entries()){
   for(const [start,count] of [[-.86,row===0?8:5],[.12,row===0?5:7]]){
     let x=start;
     for(let i=0;i<count;i++){
       const phase=i*3.17+start*4+row*1.4;
       const width=.058+.042*(.5+.5*Math.sin(phase));
       const height=.25+.155*(.5+.5*Math.cos(phase*1.58));
       const depth=.19+.105*(.5+.5*Math.sin(phase*1.63));
       const lean=i===count-1?-.075:0;
       shelfBook(x+width/2,y,width,height,depth,(i+row*2+(start>0?3:0))%bookMaterials.length,lean);
       x+=width+.009;
     }
   }
 }
 for(const [material,parts] of bookParts){
   const batch=new T.Mesh(G.mergeGeometries(parts),material);
   batch.castShadow=batch.receiveShadow=true;
   bookcase.add(batch);
   for(const part of parts)part.dispose();
 }

 const sideTableX=-3.26,sideTableZ=2.24;
 const walnut=matte(mat('#74513b'),.78,.008);
 cylinder(decor,.39,.37,.075,sideTableX,.59,sideTableZ,walnut);
 for(let i=0;i<3;i++){
   const angle=i*Math.PI*2/3;
   cylinder(decor,.027,.042,.55,sideTableX+Math.cos(angle)*.24,.275,sideTableZ+Math.sin(angle)*.24,walnut);
 }
 function hardback(x,y,z,angle,color){
   const book=new T.Group();book.position.set(x,y,z);book.rotation.y=angle;decor.add(book);
   const cloth=matte(mat(color),.95,.005),paper=mat('#c5b699',.99);
   softBox(book,.29,.043,.20,0,.03,0,paper,.006);
   for(const height of [.007,.054])softBox(book,.31,.012,.218,0,height,0,cloth,.004);
   softBox(book,.026,.055,.218,-.148,.03,0,cloth,.009);
 }
 hardback(sideTableX-.09,.628,sideTableZ+.09,.23,'#635247');
 hardback(sideTableX-.06,.688,sideTableZ+.06,-.18,'#536259');
 const stoneware=matte(mat('#ab8264'),.87,.015);
 const vaseProfile=[[0,0],[.067,0],[.083,.03],[.107,.09],[.101,.16],[.067,.24],[.045,.30],[.043,.326],[.034,.327],[.033,.29],[.049,.23],[.068,.15],[0,.025]];
 const vase=new T.Mesh(new T.LatheGeometry(vaseProfile.map(([r,y])=>new T.Vector2(r,y)),44),stoneware);
 vase.position.set(sideTableX+.15,.628,sideTableZ-.13);
 vase.scale.z=.94;
 vase.castShadow=vase.receiveShadow=true;
 decor.add(vase);
 const stemMat=mat('#776247',.94),leafMat=mat('#9b8955',.97);
 for(let i=0;i<5;i++){
   const angle=i*2.4,length=.39+i*.028;
   const start=vase.position.clone().add(new T.Vector3(0,.26,0));
   const tip=start.clone().add(new T.Vector3(Math.cos(angle)*.16,length,Math.sin(angle)*.16));
   const stem=new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(start,start.clone().lerp(tip,.55).add(new T.Vector3(.024,0,0)),tip),12,.003,5,false),stemMat);
   decor.add(stem);
   for(let j=0;j<3;j++){
     const leaf=new T.Mesh(new T.SphereGeometry(1,10,6),leafMat);
     leaf.scale.set(.011,.033,.006);leaf.position.copy(start).lerp(tip,.65+j*.15);
     leaf.rotation.set(.42,angle,(j%2?-1:1)*.65);
     decor.add(leaf);
   }
 }
 const basketX=3.64,basketZ=1.19;
 const basketMat=matte(mat('#91734c'),.99,.012);
 const basketProfile=[[0,0],[.18,0],[.214,.035],[.25,.35],[.247,.37],[.226,.37],[.225,.35],[.19,.045],[0,.045]];
 const basket=new T.Mesh(new T.LatheGeometry(basketProfile.map(([r,y])=>new T.Vector2(r,y)),48),basketMat);
 basket.position.set(basketX,0,basketZ);basket.castShadow=basket.receiveShadow=true;decor.add(basket);
 for(let i=0;i<20;i++){
   const y=.04+i*.016,r=.214+(y-.035)*.11;
   const weave=new T.Mesh(new T.TorusGeometry(r,.006,6,48),i%3===0?walnut:basketMat);
   weave.rotation.x=Math.PI/2;weave.position.set(basketX,y,basketZ);decor.add(weave);
 }
 const throwMat=matte(mat('#687b75'),.99,.013);
 for(let i=0;i<3;i++){
   const fold=softBox(decor,.34,.055,.27,basketX-.01,.28+i*.047,basketZ,throwMat,.025);
   fold.rotation.y=.10+i*.04;
 }
 let catTail,restingCat;
 assetsTotal++;
 const catCoatTexture=textureLoader.load(CatCoatTexture,()=>{assetsLoaded++;updateAssetStatus();},undefined,()=>{assetsFailed++;updateAssetStatus();});
 catCoatTexture.flipY=false;
 catCoatTexture.wrapS=catCoatTexture.wrapT=T.RepeatWrapping;
 catCoatTexture.repeat.set(2.15,2.15);
 catCoatTexture.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
 function catFurMaterial(base){
   const material=new T.MeshPhysicalMaterial({
     name:base.name,map:base.map,color:'#f0dec5',bumpMap:catCoatTexture,bumpScale:.0036,
     roughness:.91,specularIntensity:.31,sheen:.36,sheenRoughness:.88,sheenColor:new T.Color('#b69f83')
   });
   material.onBeforeCompile=shader=>{
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', `
       #include <map_fragment>
       float coatFibre = smoothstep(.08,.92,texture2D(bumpMap,vBumpMapUv).r);
       diffuseColor.rgb *= mix(vec3(.52,.46,.39),vec3(1.19,1.18,1.16),coatFibre);
     `);
   };
   return material;
 }
 const catBytes=Uint8Array.from(atob(SleepingCatGLB),c=>c.charCodeAt(0));
 new G.GLTFLoader().parse(catBytes.buffer,'',g=>{
   const cat=g.scene;
   const bounds=new T.Box3().setFromObject(cat),size=bounds.getSize(new T.Vector3());
   cat.scale.setScalar(.60/Math.max(size.x,size.z));
   cat.rotation.y=-.44;
   cat.updateMatrixWorld(true);
   bounds.setFromObject(cat);
   const center=bounds.getCenter(new T.Vector3());
   cat.position.set(-3.31-center.x,.702-bounds.min.y,.82-center.z);
   const coats=new Map();
   cat.traverse(o=>{
     if(!o.isMesh)return;
     o.castShadow=o.receiveShadow=true;
     o.material.metalness=0;
     o.material.roughness=Math.max(o.material.roughness,.82);
     o.material.envMapIntensity=.08;
     if(o.material.map)o.material.map.anisotropy=8;
     const base=o.material;
     if(base.name==='Short tabby coat'||base.name==='Curled cat tail fur'){
       if(!coats.has(base))coats.set(base,catFurMaterial(base));
       o.material=coats.get(base);
     }
     if(o.name.startsWith('Separate_volumetric_wraparound_tail')){
       const positions=o.geometry.attributes.position;
       const original=new Float32Array(positions.array);
       const weights=new Float32Array(positions.count);
       positions.setUsage(T.DynamicDrawUsage);
       for(let i=0;i<positions.count;i++){
         weights[i]=T.MathUtils.smoothstep(positions.getX(i),-.25,.22)*T.MathUtils.smoothstep(positions.getZ(i),.22,.40);
       }
       catTail={positions,original,weights};
     }
   });
   decor.add(cat);
   restingCat={cat,y:cat.position.y,scale:cat.scale.y};
   window.roomView.catLoaded=true;
 },e=>console.error('Sleeping cat',e));
 function updateCat(now){
   if(restingCat){
     const breath=(1+Math.sin(now*.0021))*.5;
     restingCat.cat.scale.y=restingCat.scale*(1+.013*breath);
     restingCat.cat.position.y=restingCat.y+.0007*breath;
   }
   if(!catTail)return;
   const {positions,original,weights}=catTail;
   const cycle=(now*.001+1.4)%8.6;
   const wake=T.MathUtils.smoothstep(cycle,.22,.48)*(1-T.MathUtils.smoothstep(cycle,1.66,2.15));
   const twitch=Math.sin(cycle*10.6)*wake;
   const lift=Math.abs(twitch)*.056;
   for(let i=0;i<positions.count;i++)if(weights[i]>0){
     positions.setY(i,original[i*3+1]+lift*weights[i]);
     positions.setZ(i,original[i*3+2]+twitch*.057*weights[i]);
   }
   positions.needsUpdate=true;
 }
 for(let i=0;i<4;i++)softBox(decor,.29,.035,.22,-1.55,1.0+i*.037,-.65,mat(['#687e83','#b59a76','#aaa38e','#424b55'][i]));

 const glazeCanvas=document.createElement('canvas');
 glazeCanvas.width=glazeCanvas.height=256;
 const glazeContext=glazeCanvas.getContext('2d');
 glazeContext.fillStyle='#e8dcc3';
 glazeContext.fillRect(0,0,256,256);
 for(let i=0;i<960;i++){
   const x=random()*256,y=random()*256;
   glazeContext.fillStyle=i%11===0?'#795a3b37':'#9c785322';
   glazeContext.fillRect(x,y,.6+random()*1.15,.6+random()*1.15);
 }
 const glazeTexture=new T.CanvasTexture(glazeCanvas);
 glazeTexture.colorSpace=T.SRGBColorSpace;
 glazeTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const ceramic=new T.MeshPhysicalMaterial({map:glazeTexture,roughness:.40,clearcoat:.52,clearcoatRoughness:.24,bumpMap:microGrain,bumpScale:.00055});
 const mug=new T.Group();
 mug.name='Glazed stoneware mug';
 mug.position.set(1.4,.972,.5);
 mug.rotation.y=-.31;
 decor.add(mug);
 const glazedProfile=[
   [0,.016],[.100,.016],[.115,.017],[.126,.024],[.132,.038],[.135,.052],
   [.139,.073],[.141,.104],[.143,.148],[.144,.201],[.146,.252],
   [.147,.284],[.149,.298],[.149,.305],[.147,.310],[.143,.312],
   [.138,.311],[.135,.308],[.134,.303],[.135,.294],[.136,.284],
   [.134,.257],[.133,.213],[.132,.164],[.130,.118],[.127,.081],[.121,.061],
   [.110,.048],[.093,.043],[0,.042]
 ];
 const footProfile=[[.093,.016],[.098,.009],[.099,.004],[.103,0],[.112,0],[.118,.003],[.120,.011],[.121,.021]];
 for(const [profile,material] of [[glazedProfile,ceramic],[footProfile,mat('#aa9072',.91)]]){
   const part=new T.Mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),96),material);
   part.castShadow=part.receiveShadow=true;
   mug.add(part);
 }
 const handlePath=new T.CatmullRomCurve3([[.134,.261],[.186,.268],[.232,.246],[.251,.205],[.235,.153],[.191,.111],[.128,.104]].map(([x,y])=>new T.Vector3(x,y,0)));
 const handle=new T.Mesh(new T.TubeGeometry(handlePath,48,.017,14,false).scale(1,1,1.42),ceramic);
 handle.castShadow=handle.receiveShadow=true;
 mug.add(handle);

 const coffeeCanvas=document.createElement('canvas');
 coffeeCanvas.width=coffeeCanvas.height=256;
 const coffeeContext=coffeeCanvas.getContext('2d');
 const coffeeTone=coffeeContext.createRadialGradient(106,111,3,128,128,128);
 coffeeTone.addColorStop(0,'#37231a');coffeeTone.addColorStop(.73,'#271711');
 coffeeTone.addColorStop(.94,'#2e1a11');coffeeTone.addColorStop(.975,'#68412b');coffeeTone.addColorStop(1,'#44291a');
 coffeeContext.fillStyle=coffeeTone;
 coffeeContext.fillRect(0,0,256,256);
 for(let i=0;i<34;i++){
   const angle=random()*Math.PI*2,radius=114+random()*10;
   coffeeContext.beginPath();
   coffeeContext.arc(128+Math.cos(angle)*radius,128+Math.sin(angle)*radius,.65+random()*1.15,0,Math.PI*2);
   coffeeContext.fillStyle='#b2805566';coffeeContext.fill();
 }
 const coffeeTexture=new T.CanvasTexture(coffeeCanvas);
 coffeeTexture.colorSpace=T.SRGBColorSpace;
 const coffee=new T.Mesh(new T.CircleGeometry(.1347,80),new T.MeshPhysicalMaterial({map:coffeeTexture,roughness:.33,clearcoat:.16,clearcoatRoughness:.31}));
 coffee.rotation.x=-Math.PI/2;
 coffee.position.copy(mug.position).y+=.268;
 coffee.receiveShadow=true;
 decor.add(coffee);

 const steamWisps=[];
 const steamSide=new T.Vector3();
 const steamRows=48;
 const steamSources=[[0,0],[.078,0],[-.078,0],[0,.078],[0,-.078]];
 for(const [strand,[sourceX,sourceZ]] of steamSources.entries()){
   const geometry=new T.BufferGeometry();
   const positions=new Float32Array(steamRows*6);
   const uv=new Float32Array(steamRows*4);
   const indices=[];
   for(let row=0;row<steamRows;row++){
     uv.set([-1,row/(steamRows-1),1,row/(steamRows-1)],row*4);
     if(row<steamRows-1){const j=row*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
   }
   geometry.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));
   geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
   geometry.setIndex(indices);
   const material=new T.ShaderMaterial({
     transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,
     uniforms:{time:{value:0},phase:{value:strand*2.1},strength:{value:strand===0?.105:.031},primary:{value:strand===0?1:0}},
     vertexShader:`varying vec2 vUv;
       void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
     fragmentShader:`uniform float time,phase,strength,primary;
       varying vec2 vUv;
       float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
       float noise(vec2 p){
         vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
         return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+1.0),f.x),f.y);
       }
       void main(){
         float height=vUv.y;
         vec2 flow=vec2(vUv.x*2.0+phase,height*7.0-time*.75);
         float eddy=noise(flow);
         float center=(eddy-.5)*.48*height;
         float edge=1.0-smoothstep(.1,.94,abs(vUv.x-center));
         float fade=smoothstep(0.0,.14,height)*(1.0-smoothstep(mix(.19,.43,primary),mix(.72,1.0,primary),height));
         float density=.35+.65*noise(flow*2.1+eddy);
         gl_FragColor=vec4(.62,.65,.66,edge*edge*fade*density*strength);
       }`
   });
   const mesh=new T.Mesh(geometry,material);
   mesh.frustumCulled=false;
   scene.add(mesh);
   steamWisps.push({mesh,positions,phase:strand*2.1,height:strand===0?.53:.27,sourceX,sourceZ,main:strand===0});
 }
 function updateSteam(now){
   const time=now*.001;
   camera.getWorldDirection(steamSide);
   steamSide.cross(camera.up).normalize();
   for(const {mesh,positions,phase,height,sourceX,sourceZ,main} of steamWisps){
     for(let row=0;row<steamRows;row++){
       const rise=row/(steamRows-1);
       const curl=rise*11-time*.74+phase;
       const lift=rise*height;
       const gather=T.MathUtils.smoothstep(lift,.035,.195);
       const spread=gather*rise;
       const x=coffee.position.x+sourceX*(1-gather)+Math.sin(curl)*(.005+.053*spread)+Math.sin(curl*1.73)*.024*spread;
       const z=coffee.position.z+sourceZ*(1-gather)+Math.cos(curl*.91)*(.004+.039*spread);
       const y=coffee.position.y+.006+lift;
       const width=T.MathUtils.lerp(main?.110:.054,.014,gather)+.020*rise*rise;
       for(let edge=0;edge<2;edge++){
         const offset=width*(edge?1:-1),j=(row*2+edge)*3;
         positions[j]=x+steamSide.x*offset;
         positions[j+1]=y;
         positions[j+2]=z+steamSide.z*offset;
       }
     }
     mesh.geometry.attributes.position.needsUpdate=true;
     mesh.material.uniforms.time.value=time;
   }
 }
 for(const [x,z,rotation] of [[-.88,-1.40,.11],[.91,-1.33,-.07],[.75,1.68,Math.PI+.19]])loadModel('SchoolChair_01',.76,x,z,new T.Group(),rotation);
 loadModel('sofa_03',3.45,-3.49,.10,sofaFallback,Math.PI/2);
 loadModel('potted_plant_04',.62,-2.62,-1.39,plantFallback,.21);
 loadModel('modern_wooden_cabinet',2.1,1.9,-1.98);

 const hdrBytes=Uint8Array.from(atob(EveningAssets.hdr),c=>c.charCodeAt(0));
 const hdrInfo=new G.RGBELoader().parse(hdrBytes.buffer);const hdr=new T.DataTexture(hdrInfo.data,hdrInfo.width,hdrInfo.height,T.RGBAFormat,hdrInfo.type);hdr.colorSpace=T.LinearSRGBColorSpace;hdr.mapping=T.EquirectangularReflectionMapping;hdr.needsUpdate=true;hdr.flipY=true;
 const pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromEquirectangular(hdr);skyMat.envMap=env.texture;skyMat.needsUpdate=true;pmrem.dispose();hdr.dispose();
 const composer=new G.EffectComposer(renderer);if(renderer.capabilities.isWebGL2){const samples=Math.min(4,renderer.getContext().getParameter(renderer.getContext().MAX_SAMPLES));composer.renderTarget1.samples=samples;composer.renderTarget2.samples=samples;}const qualitySamples=composer.renderTarget1.samples;const ao=new G.SSAOPass(scene,camera,host.clientWidth,host.clientHeight,24);ao.kernelRadius=.15;ao.minDistance=.00015;ao.maxDistance=.012;composer.addPass(new G.RenderPass(scene,camera));composer.addPass(ao);const bloom=new G.UnrealBloomPass(new T.Vector2(host.clientWidth,host.clientHeight),.16,.35,.85);composer.addPass(bloom);
 const outline=new G.OutlinePass(new T.Vector2(host.clientWidth,host.clientHeight),scene,camera);
 outline.enabled=false;
 outline.edgeStrength=3.2;
 outline.edgeThickness=1.15;
 outline.visibleEdgeColor.set('#94ddd1');
 outline.hiddenEdgeColor.set(0x000000);
 const drawOutline=outline.render.bind(outline);
 outline.render=(...args)=>{
   const visible=pane.visible;
   pane.visible=false;
   try{drawOutline(...args);}finally{pane.visible=visible;}
 };
 composer.addPass(outline);
 composer.addPass(new G.OutputPass());const fxaa=new G.ShaderPass(G.FXAAShader);composer.addPass(fxaa);let useEffects=true,lastWidth=0,lastHeight=0,lastRatio=0;
 function renderScale(w,h){if(!useEffects)return Math.min(.85,Math.sqrt(1200000/Math.max(1,w*h)));const desired=Math.max(1,window.devicePixelRatio||1)*1.6;const pixelLimit=Math.sqrt(4500000/Math.max(1,w*h));return Math.max(1,Math.min(desired,2.5,pixelLimit));}
 function updateRoom(office){wallMat.color.set(office?'#bdccd0':'#fff0da');floorMat.color.set(office?'#b6b7b2':'#e2c7a9');wood.color.set(office?'#a6a7a4':'#d5b290');scene.background.set(office?'#a9bdc1':'#c5c8bd');lamp.intensity=7.05;}
 updateRoom(false);
 const laptop=new T.Group(),phone=new T.Group(),sensor=new T.Group(),outdoorSensor=new T.Group();scene.add(laptop,phone,sensor,outdoorSensor);outdoorSensor.position.set(-1.22,2.38,-2.43);laptop.position.set(-.75,.975,.12);phone.position.set(.85,.975,.12);sensor.position.set(.52,1.92,-2.12);
 const screenCanvas=(portrait=false)=>{let c=document.createElement('canvas');c.width=portrait?2048:4096;c.height=portrait?4096:2560;let tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=renderer.capabilities.getMaxAnisotropy();const ctx=c.getContext('2d');ctx.scale(6.4,6.4);return {c,ctx,tx,last:''}};const scrL=screenCanvas(),scrP=screenCanvas(true),scrS=screenCanvas(),scrOutside=screenCanvas();const idleSensor=document.createElement('span');idleSensor.id='sensor-idle';idleSensor.hidden=true;idleSensor.textContent='—';document.body.append(idleSensor);const idleDevice=document.createElement('span');idleDevice.id='device-idle';idleDevice.hidden=true;idleDevice.textContent='Выберите устройства';document.body.append(idleDevice);
 function paint(sc,source,title){const sourceEl=document.getElementById(source);const heading=sourceEl.querySelector('.screen-title')?.textContent||sourceEl.textContent||'',detail=sourceEl.querySelector('.screen-detail')?.textContent||'',key=heading+'|'+detail;if(sc.last===key)return;sc.last=key;const c=sc.ctx,w=sc.c.width/6.4,h=sc.c.height/6.4;window.drawDeviceScreen(c,w,h,title,heading,detail);sc.tx.needsUpdate=true;}
 function display(parent,w,h,sc,x,y,z,radius=0){
   let geometry;
   if(radius){
     const left=-w/2,right=w/2,bottom=-h/2,top=h/2,r=radius;
     const shape=new T.Shape();
     shape.moveTo(left+r,bottom);
     shape.lineTo(right-r,bottom);shape.quadraticCurveTo(right,bottom,right,bottom+r);
     shape.lineTo(right,top-r);shape.quadraticCurveTo(right,top,right-r,top);
     shape.lineTo(left+r,top);shape.quadraticCurveTo(left,top,left,top-r);
     shape.lineTo(left,bottom+r);shape.quadraticCurveTo(left,bottom,left+r,bottom);
     geometry=new T.ShapeGeometry(shape,12);
     const points=geometry.attributes.position,uv=geometry.attributes.uv;
     for(let i=0;i<uv.count;i++)uv.setXY(i,(points.getX(i)-left)/w,(points.getY(i)-bottom)/h);
   }else geometry=new T.PlaneGeometry(w,h);
   const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({map:sc.tx,toneMapped:false}));
   mesh.position.set(x,y,z);parent.add(mesh);
   return mesh;
 }
 function clear(g){while(g.children.length){let c=g.children[0];g.remove(c);c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material && !o.material.map)o.material.dispose();});}}
 function buildLaptop(){
 const alloy=matte(mat('#9ba3a5',.69,.42),.69,.00028);
 const black=mat('#181c21',.79);
 const key=matte(mat('#25292e'),.86,.00028);
 const trackSurface=mat('#929b9e',.76,.19);
 const deck=alloy.clone();
 deck.emissive.set('#568077');
 deck.emissiveIntensity=0;
 laptop.userData.deck=deck;
 const base=rounded(laptop,1.18,.73,.055,.045,deck);base.rotation.x=-Math.PI/2;base.position.y=.03;
 const lid=new T.Group();lid.position.set(0,.085,-.32);lid.rotation.x=-.18;laptop.add(lid);const shell=rounded(lid,1.14,.73,.045,.045,alloy);shell.position.y=.36;const bezel=rounded(lid,1.09,.68,.014,.025,black);bezel.position.set(0,.36,.03);display(lid,1.024,.64,scrL,0,.348,.041);
 laptop.userData.routeScreen=bezel;
 const keyTemplate=rounded(laptop,.065,.047,.012,.006,key);
 laptop.remove(keyTemplate);
 keyTemplate.geometry.rotateX(-Math.PI/2);
 const caps=[],glyphs=[];
 const atlas=document.createElement('canvas');
 atlas.width=512;atlas.height=256;
 const labels=atlas.getContext('2d');
 labels.fillStyle='#e5e9e7';labels.font='20px sans-serif';labels.textAlign='center';
 const rows=['1234567890−=','QWERTYUIOP[]','ASDFGHJKL;\\','ZXCVBNM,./↑↓'];
 for(let r=0;r<5;r++)for(let c=0;c<12;c++){
   if(r===4&&c>2&&c<8)continue;
   const z=-.22+r*.065,x=-.455+c*.082;
   if(r===4&&c===2){
     const space=rounded(laptop,.40,.047,.012,.006,key);
     space.rotation.x=-Math.PI/2;space.position.set(-.04,.068,z);
   }else caps.push(keyTemplate.geometry.clone().translate(x,.068,z));
   if(r>=4)continue;
   const left=4+c*40,top=4+r*40;
   labels.fillText(rows[r][c]||'·',left+16,top+23);
   const glyph=new T.PlaneGeometry(.035,.035).rotateX(-Math.PI/2).translate(x,.078,z);
   const uv=glyph.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,(left+uv.getX(i)*32)/atlas.width,(atlas.height-top-32+uv.getY(i)*32)/atlas.height);
   glyphs.push(glyph);
 }
 const keyCaps=new T.Mesh(G.mergeGeometries(caps),key);
 keyCaps.castShadow=keyCaps.receiveShadow=true;
 const keyGlyphs=new T.Mesh(G.mergeGeometries(glyphs),new T.MeshBasicMaterial({map:new T.CanvasTexture(atlas),transparent:true,depthWrite:false}));
 laptop.add(keyCaps,keyGlyphs);
 keyTemplate.geometry.dispose();
 for(const geometry of [...caps,...glyphs])geometry.dispose();
 const trackBorder=rounded(laptop,.354,.169,.004,.014,mat('#545e61',.8));trackBorder.rotation.x=-Math.PI/2;trackBorder.position.set(0,.055,.235);
 const track=rounded(laptop,.346,.161,.004,.012,trackSurface);track.rotation.x=-Math.PI/2;track.position.set(0,.056,.235);
 for(const x of [-.4,.4]){let hinge=cylinder(laptop,.026,.026,.17,x,.06,-.32,black);hinge.rotation.z=Math.PI/2;}
 for(const x of [-.48,.48])for(const z of [-.26,.27])cube(laptop,.08,.006,.04,x,.003,z,black);
 for(let i=0;i<3;i++)cube(laptop,.006,.016,.06,-.595,.035,-.18+i*.09,black);
 const webcam=new T.Mesh(new T.CircleGeometry(.005,24),mat('#263239',.44));webcam.position.set(0,.685,.041);lid.add(webcam);
 const speakerParts=[];
 for(const x of [-.54,.54])for(let i=0;i<18;i++){
   speakerParts.push(new T.BoxGeometry(.006,.002,.009).translate(x,.061,-.23+i*.023));
 }
 const speakers=new T.Mesh(G.mergeGeometries(speakerParts),black);
 speakers.receiveShadow=true;
 laptop.add(speakers);
 for(const part of speakerParts)part.dispose();
 const groove=rounded(laptop,.14,.007,.003,.002,black);groove.rotation.x=-Math.PI/2;groove.position.set(0,.057,.355);
 const chassis=new T.Group();
 for(const part of [...laptop.children])if(part!==lid)chassis.add(part);
 chassis.scale.y=.38;
 laptop.add(chassis);
 lid.position.y=.032;
 lid.scale.z=.40;
 laptop.userData.half={x:.61,z:.48};}
 function buildPhone(){
 const body=matte(mat('#566661'),.83,.00028);
 const edge=mat('#7a8a86',.65,.36);
 const black=mat('#101619',.72);
 const stand=mat('#626763',.90,.08);
 const dock=new T.Group();
 softBox(dock,.42,.025,.34,0,.0125,.015,stand,.008);
 const support=softBox(dock,.12,.29,.035,0,.17,-.046,stand,.01);support.rotation.x=-.21;
 softBox(dock,.36,.04,.08,0,.04,.065,stand,.012);
 dock.scale.z=.7;
 const back=rounded(phone,.31,.61,.045,.035,body);back.position.y=.35;
 const rim=rounded(phone,.302,.60,.025,.032,edge);rim.position.set(0,.35,.028);
 const glass=rounded(phone,.283,.582,.013,.027,black);glass.position.set(0,.35,.045);
 phone.userData.routeScreen=glass;
 display(phone,.258,.516,scrP,0,.35,.049,.015);
 const cameraSeat=new T.Mesh(new T.CircleGeometry(.007,28),mat('#171e23',.74));
 cameraSeat.position.set(0,.625,.048);phone.add(cameraSeat);
 const cameraDot=new T.Mesh(new T.CircleGeometry(.0038,24),mat('#293745',.39,.12));
 cameraDot.position.set(0,.625,.0494);phone.add(cameraDot);
 const cameraPlate=rounded(phone,.13,.13,.012,.025,edge);cameraPlate.position.set(-.07,.53,-.031);cameraPlate.rotation.y=Math.PI;for(const [x,y] of [[-.102,.56],[-.039,.50]]){const lens=new T.Mesh(new T.RingGeometry(.016,.024,32),black);lens.position.set(x,y,-.039);lens.rotation.y=Math.PI;phone.add(lens);const glassLens=new T.Mesh(new T.CircleGeometry(.016,32),mat('#172b38',.16,.3));glassLens.position.set(x,y,-.040);glassLens.rotation.y=Math.PI;phone.add(glassLens);}cube(phone,.012,.09,.02,.16,.43,0,edge);cube(phone,.012,.06,.02,-.16,.47,0,edge);
 const handset=new T.Group();
 for(const part of [...phone.children])handset.add(part);
 handset.scale.z=.40;
 const cradle=new T.Group();
 cradle.position.set(0,.046,.006);
 cradle.rotation.x=-.15;
 handset.position.y=-cradle.position.y;
 cradle.add(handset);
 phone.userData.routeMount=handset;
 phone.add(dock,cradle);
 phone.userData.half={x:.23,z:.19};}
 function buildSensor(target,screen,outdoor){
   clear(target);
   const shell=matte(mat(outdoor?'#a6957c':'#9c9b78'),.88,.00065);
   rounded(target,.38,.35,.055,.045,shell);
   const glass=rounded(target,.28,.20,.01,.014,mat('#3c4036',.57));glass.position.z=.035;
   target.userData.routeScreen=glass;
   display(target,.25,.16,screen,0,0,.043);
 }
 buildLaptop();buildPhone();buildSensor(sensor,scrS,false);buildSensor(outdoorSensor,scrOutside,true);
 const sensorLouver=matte(mat('#afa18a'),.88,.00085);
 for(let i=0;i<7;i++)softBox(outdoorSensor,.46,.025,.15,0,-.23-i*.035,0,sensorLouver);
 softBox(outdoorSensor,.49,.045,.17,0,.21,0,sensorLouver);outdoorSensor.scale.setScalar(.56);updateRoom(false);
 let deviceLayoutVersion=0;
 const deviceScreens={laptop:scrL,phone:scrP,inside:scrS,outside:scrOutside};
 window.roomView={scene,camera,host,screenCanvases:{laptop:scrL.c,phone:scrP.c,inside:scrS.c,outside:scrOutside.c},
   devices:{laptop,phone,inside:sensor,outside:outdoorSensor},get layoutVersion(){return deviceLayoutVersion;},
   screenVersion:id=>deviceScreens[id]?.tx.version};
 const deviceObjects={laptop,phone,inside:sensor,outside:outdoorSensor};
 const selectable=Object.values(deviceObjects);
 const canvas=renderer.domElement;
 function deviceHit(e){
   coords(e);
   const hit=ray.intersectObjects(selectable,true)[0];
   if(!hit)return null;
   let device=hit.object;
   while(device.parent!==scene)device=device.parent;
   return device;
 }
 function setHover(device){
   if((outline.selectedObjects[0]||null)===device)return;
   outline.selectedObjects=device?[device]:[];
   outline.enabled=!!device;
   laptop.userData.deck.emissiveIntensity=device===laptop?.17:0;
   canvas.classList.toggle('device-hovered',!!device);
 }
 const channelGeo=new T.BufferGeometry(), channelPos=new Float32Array(64*6*3), channelColors=new Float32Array(64*6*3);
 channelGeo.setAttribute('position',new T.BufferAttribute(channelPos,3));channelGeo.setAttribute('color',new T.BufferAttribute(channelColors,3));
 const channel=new T.Mesh(channelGeo,new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.9,depthTest:false,toneMapped:false,side:T.DoubleSide}));channel.renderOrder=5;channel.frustumCulled=false;scene.add(channel);
 const waves=[];for(let side=0;side<2;side++)for(let i=0;i<3;i++){const wave=new T.Mesh(new T.RingGeometry(.96,1,64,1,Math.PI*.18,Math.PI*.64),new T.MeshBasicMaterial({color:'#6ed9fa',transparent:true,opacity:.6,depthTest:false,side:T.DoubleSide,toneMapped:false}));wave.renderOrder=6;wave.frustumCulled=false;scene.add(wave);waves.push({wave,side,i});}let waveTime=0,lastFrame=0;
 const ray=new T.Raycaster(),mouse=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),-.975),point=new T.Vector3();let drag=null;
 function coords(e){let b=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2);ray.setFromCamera(mouse,camera);}
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus();setHover(null);const obj=deviceHit(e);if(obj){const id=Object.keys(deviceObjects).find(k=>deviceObjects[k]===obj);if(obj===laptop||obj===phone){ray.ray.intersectPlane(plane,point);drag={obj,id,startX:e.clientX,startY:e.clientY,dx:obj.position.x-point.x,dz:obj.position.z-point.z,moved:false};}else drag={id,startX:e.clientX,startY:e.clientY,sensor:true,moved:false};}else drag={x:e.clientX,y:e.clientY,az,el};renderer.domElement.setPointerCapture(e.pointerId)});
 renderer.domElement.addEventListener('pointermove',e=>{if(!drag){if(e.pointerType!=='touch')setHover(deviceHit(e));return;}if(drag.id&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;if(drag.sensor)return;if(drag.obj){coords(e);if(ray.ray.intersectPlane(plane,point)){const half=drag.obj.userData.half;let nx=T.MathUtils.clamp(point.x+drag.dx,-1.93+half.x,1.93-half.x),nz=T.MathUtils.clamp(point.z+drag.dz,-.93+half.z,.93-half.z),other=drag.obj===phone?laptop:phone;
 const occupied=other.userData.half;const allowed=SceneRules.move({x:drag.obj.position.x,z:drag.obj.position.z},{x:nx,z:nz},half,{x:other.position.x,z:other.position.z,hx:occupied.x,hz:occupied.z});if(drag.obj.position.x!==allowed.x||drag.obj.position.z!==allowed.z){drag.obj.position.x=allowed.x;drag.obj.position.z=allowed.z;deviceLayoutVersion++;}}}else{az=T.MathUtils.clamp(drag.az+(e.clientX-drag.x)*.006,-.85,.85);el=T.MathUtils.clamp(drag.el+(e.clientY-drag.y)*.005,.28,.95)}});renderer.domElement.addEventListener('pointerup',e=>{if(drag&&drag.id&&!drag.moved){if(window.sessionActive)window.openDeviceMonitor(drag.id);else window.demoSelection.toggle(drag.id);}drag=null;if(e.pointerType!=='touch')setHover(deviceHit(e));});canvas.addEventListener('pointerleave',()=>setHover(null));canvas.addEventListener('pointercancel',()=>{drag=null;setHover(null);});renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();dist=T.MathUtils.clamp(dist*Math.exp(e.deltaY*.001),3.8,8)},{passive:false});
 renderer.domElement.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')az=T.MathUtils.clamp(az-.1,-.85,.85);else if(e.key==='ArrowRight')az=T.MathUtils.clamp(az+.1,-.85,.85);else if(e.key==='ArrowUp')el=T.MathUtils.clamp(el-.08,.28,.95);else if(e.key==='ArrowDown')el=T.MathUtils.clamp(el+.08,.28,.95);else if(e.key==='Home'){az=.08;el=.40;dist=7.65;}else return;e.preventDefault();e.stopPropagation();});
 function animate(){requestAnimationFrame(animate);if(!useEffects&&document.hidden)return;let w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const ratio=renderScale(w,h);if(w!==lastWidth||h!==lastHeight||ratio!==lastRatio){lastWidth=w;lastHeight=h;lastRatio=ratio;renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);resizeCamera(w,h);composer.setPixelRatio(ratio);composer.setSize(w,h);fxaa.uniforms.resolution.value.set(1/(w*ratio),1/(h*ratio));}const boardText=document.getElementById('step-title').textContent+' · '+document.getElementById('scene-label').textContent;if(boardTitle.textContent!==boardText)boardTitle.textContent=boardText;if(window.sessionScreens){paint(scrL,'session-laptop','НОУТБУК');paint(scrP,'session-phone','ТЕЛЕФОН');paint(scrS,'session-inside','В ПОМЕЩЕНИИ');paint(scrOutside,'session-outside','НА УЛИЦЕ');}else{paint(scrL,'device-idle','BLUETOOTH');paint(scrP,'device-idle','BLUETOOTH');paint(scrS,'sensor-idle','В ПОМЕЩЕНИИ');paint(scrOutside,'sensor-idle','НА УЛИЦЕ');}const viewDist=dist*Math.max(1,.95/camera.aspect);camera.position.set(target.x+viewDist*Math.sin(az)*Math.cos(el),target.y+viewDist*Math.sin(el),target.z+viewDist*Math.cos(az)*Math.cos(el));const safeCamera=SceneRules.camera(camera.position);camera.position.set(safeCamera.x,safeCamera.y,safeCamera.z);camera.lookAt(target);
 let ble=host.classList.contains('ble-mode'),left=ble?phone:laptop,right=ble?(window.demoSelection.current==='outside'?outdoorSensor:sensor):phone,packet=document.getElementById('packet'),f=parseFloat(packet.style.left)/100,signal=document.getElementById('signal');
 const active=!!window.demoSelection.current&&packet.style.opacity==='1'&&Number.isFinite(f);channel.visible=active&&!window.parallelMode;
 if(active){const a=left.position.clone().add(new T.Vector3(0,.36,0)),b=right.position.clone().add(new T.Vector3(0,ble?0:.3,0));const tint=new T.Color(signal.classList.contains('lost')?'#ff995e':signal.classList.contains('ack')?'#70f3aa':'#72dcff');
 const view=new T.Vector3();camera.getWorldDirection(view);const tangent=b.clone().sub(a).normalize();const side=new T.Vector3().crossVectors(view,tangent).normalize().multiplyScalar(.012);const indices=[[0,-1],[0,1],[1,1],[0,-1],[1,1],[1,-1]];
 for(let i=0;i<64;i++)for(let j=0;j<6;j++){const t=(i+indices[j][0])/64,k=(i*6+j)*3,edge=indices[j][1];channelPos[k]=a.x+(b.x-a.x)*t+side.x*edge;channelPos[k+1]=a.y+(b.y-a.y)*t+Math.sin(t*Math.PI)*.32+side.y*edge;channelPos[k+2]=a.z+(b.z-a.z)*t+side.z*edge;const bright=Math.exp(-Math.pow((t-f)/.075,2));const intensity=.28+.72*bright;channelColors[k]=tint.r*intensity;channelColors[k+1]=tint.g*intensity;channelColors[k+2]=tint.b*intensity;}
  channelGeo.attributes.position.needsUpdate=true;channelGeo.attributes.color.needsUpdate=true;}
 const now=performance.now();if(lastFrame&&document.getElementById('play').textContent==='Пауза')waveTime+=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;
 for(const {wave,side,i} of waves){wave.visible=!window.parallelMode&&active&&document.getElementById('play').textContent==='Пауза';if(wave.visible){const source=side?right:left;wave.position.copy(source.position).add(new T.Vector3(0,side&&ble?.08:.42,.06));wave.quaternion.copy(camera.quaternion);wave.rotateZ(side?Math.PI:0);const phase=(waveTime*.7+i/3)%1;wave.scale.setScalar(.10+phase*.25);wave.material.opacity=(1-phase)*.7;wave.material.color.set(signal.classList.contains('lost')?'#ff995e':signal.classList.contains('ack')?'#70f3aa':'#72dcff');}}
 updateSteam(now);
 updateFire();
 updateCat(now);
 if(window.refreshDeviceMonitor)window.refreshDeviceMonitor();
 if(useEffects||outline.enabled)composer.render();else renderer.render(scene,camera);}
 const board=document.querySelector('.current-event');host.before(board);board.classList.add('signal-board');const boardTitle=document.createElement('strong');boardTitle.id='signal-board-title';board.prepend(boardTitle);
 const toolbar=document.createElement('div');toolbar.className='scene-tools';toolbar.innerHTML='<button type="button" id="camera-home">Вернуть камеру</button><label>Графика <select id="graphics-quality"><option value="quality">Качество</option><option value="eco">Экономный</option></select></label><button type="button" id="camera-close">Крупный план</button>';host.before(toolbar);document.getElementById('camera-home').onclick=()=>{az=.08;el=.40;dist=7.65;};document.getElementById('graphics-quality').onchange=e=>{useEffects=e.target.value!=='eco';lastRatio=0;ao.enabled=bloom.enabled=fxaa.enabled=useEffects;renderer.shadowMap.enabled=useEffects;for(const target of [composer.renderTarget1,composer.renderTarget2]){const samples=useEffects?qualitySamples:0;if(target.samples!==samples){target.samples=samples;target.dispose();}}scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});};
 const fireSound=document.createElement('button');
 fireSound.id='fire-sound';
 fireSound.type='button';
 fireSound.textContent='Звук камина';
 fireSound.setAttribute('aria-pressed','false');
 toolbar.append(fireSound);
 const fireAudio=new Audio();
 fireAudio.loop=true;
 fireAudio.volume=.64;
 fireAudio.addEventListener('error',()=>{
   fireSound.disabled=true;
   fireSound.setAttribute('aria-pressed','false');
   fireSound.title='Браузер не смог воспроизвести запись камина';
 });
 for(const event of ['play','pause','ended']){
   fireAudio.addEventListener(event,()=>fireSound.setAttribute('aria-pressed',String(!fireAudio.paused)));
 }
 fireSound.onclick=()=>{
   if(!fireAudio.paused){
     fireAudio.pause();
     return;
   }
   if(!fireAudio.src)fireAudio.src=fireMediaUrl(fireMedia.audio,'audio/ogg');
   fireAudio.play().catch(()=>{
     if(fireAudio.paused)fireSound.setAttribute('aria-pressed','false');
   });
   if(fireVideo.paused)fireVideo.play().catch(()=>{});
 };
 document.getElementById('camera-close').onclick=()=>{az=.08;el=.36;dist=3.8;};updateAssetStatus();
 animate();
})();

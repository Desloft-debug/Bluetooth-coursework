(()=>{const T=THREE;
window.createSignalWire=(color)=>{
 const count=41,geo=new T.BufferGeometry(),positions=new Float32Array(count*2*3),uv=new Float32Array(count*4),indices=[];
 for(let i=0;i<count;i++){uv.set([i/(count-1),-1,i/(count-1),1],i*4);if(i<count-1){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
 geo.setAttribute('position',new T.BufferAttribute(positions,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(indices);
 const material=new T.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false,uniforms:{tint:{value:new T.Color(color)},progress:{value:0},lost:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`uniform vec3 tint;uniform float progress;uniform float lost;varying vec2 vUv;void main(){float fade=smoothstep(0.0,.13,vUv.x)*smoothstep(0.0,.13,1.0-vUv.x);float y=abs(vUv.y);float core=exp(-y*y*150.0);float halo=exp(-y*y*5.0)*0.32;float pulse=exp(-pow((vUv.x-progress)/0.045,2.0));float spark=exp(-y*y*12.0)*pulse*1.8;vec3 color=mix(tint,vec3(1.0,0.96,0.83),pulse*.85);if(lost>.5)color=mix(color,vec3(1.0,.26,.06),.7);gl_FragColor=vec4(color*(.8+spark),fade*clamp(core*.95+halo+spark,0.0,1.0));}`});
 const mesh=new T.Mesh(geo,material);mesh.frustumCulled=false;mesh.renderOrder=15;
 const tangent=new T.Vector3(),side=new T.Vector3(),view=new T.Vector3(),previousView=new T.Vector3();
 let previousPoints;
 mesh.update=(points,f,dir,isLost)=>{
   material.uniforms.progress.value=isLost&&f>=.5?-2:dir===1?f:1-f;
   material.uniforms.lost.value=isLost?1:0;
   window.roomView.camera.getWorldDirection(view);
   if(previousPoints===points&&previousView.equals(view))return;
   previousPoints=points;
   previousView.copy(view);
   for(let i=0;i<count;i++){
     tangent.subVectors(points[Math.min(count-1,i+1)],points[Math.max(0,i-1)]).normalize();
     side.crossVectors(view,tangent).normalize().multiplyScalar(.065*(.18+.82*T.MathUtils.smoothstep(Math.min(i/(count-1),1-i/(count-1)),0,.15)));
     for(let j=0;j<2;j++){
       const sign=j?1:-1,k=(i*2+j)*3;
       positions[k]=points[i].x+side.x*sign;
       positions[k+1]=points[i].y+side.y*sign;
       positions[k+2]=points[i].z+side.z*sign;
     }
   }
   geo.attributes.position.needsUpdate=true;
 };
 return mesh;
};})();

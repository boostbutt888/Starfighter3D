import * as T from './vendor/three.module.js';
// Six pooled bursts, two draw calls; no per-frame meshes, textures or lights.
export function burstField(){
 const root=new T.Group(),count=2880,positions=new Float32Array(count*3),colors=new Float32Array(count*3),tails=new Float32Array(count*6),tailColors=new Float32Array(count*6);
 const seeds=[];for(let i=0;i<count;i++){const a=i*2.399963,y=1-2*((i%480)+.5)/480,r=Math.sqrt(1-y*y);seeds.push([Math.cos(a)*r,y,Math.sin(a)*r,.65+(i%23)/40]);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('color',new T.BufferAttribute(colors,3));
 const points=new T.Points(geo,new T.PointsMaterial({size:1.25,vertexColors:true,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));points.frustumCulled=false;root.add(points);
 const lineGeo=new T.BufferGeometry();lineGeo.setAttribute('position',new T.BufferAttribute(tails,3));lineGeo.setAttribute('color',new T.BufferAttribute(tailColors,3));const lines=new T.LineSegments(lineGeo,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.65,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));lines.frustumCulled=false;root.add(lines);
 const warm=[1,.6,.22];const palette=[[1,.68,.18],[.25,.7,1],[1,.3,.18],[.6,1,.45],[1,.6,.8],[1,.93,.68]];
 return {root,update(time,station=false){for(let i=0;i<count;i++){const k=Math.floor(i/480),phase=station?time-k*.45:((time-k*.48)%3.7+3.7)%3.7,active=phase>=0&&phase<2.7,age=Math.max(0,phase),v=seeds[i],speed=(station?90:23)*v[3],cx=station?Math.sin(k*2.4)*80:(k-2.5)*32,cy=station?Math.cos(k*1.7)*65:65+(k%3)*13,cz=station?Math.cos(k*2.4)*65:-150-(k%2)*35,fade=active?Math.max(0,1-age/2.7):0,c=station?warm:palette[k];
 for(let axis=0;axis<3;axis++){const base=axis===0?cx:axis===1?cy:cz,gravity=axis===1&&!station?4*age*age:0,value=base+v[axis]*speed*age-gravity;positions[i*3+axis]=value;colors[i*3+axis]=c[axis]*fade*(.6+.4*Math.sin(i+age*18)**2);tails[i*6+axis]=value;tails[i*6+3+axis]=value-v[axis]*speed*.07;tailColors[i*6+axis]=c[axis]*fade*.8;tailColors[i*6+3+axis]=0;}}geo.attributes.position.needsUpdate=true;geo.attributes.color.needsUpdate=true;lineGeo.attributes.position.needsUpdate=true;lineGeo.attributes.color.needsUpdate=true;}};
}

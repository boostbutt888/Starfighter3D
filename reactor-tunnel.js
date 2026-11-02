import {obstacleContact,tunnelSegmentZ,tunnelLayout} from './incursion-rules.js';
import * as T from './vendor/three.module.js';
// Lightweight, recyclable Death Star II interior corridor. All geometry is local to this mission.
export function createReactorTunnel(group){
 const steel=new T.MeshStandardMaterial({color:0x515c69,metalness:.68,roughness:.7,emissive:0x405569,emissiveIntensity:.38}),panel=new T.MeshStandardMaterial({color:0x89939c,metalness:.55,roughness:.7,emissive:0x52677b,emissiveIntensity:.28}),glow=new T.MeshBasicMaterial({color:0x42c8ff});
 // Triplanar world-space panel texture keeps the same texel scale on long walls and small hazards.
 if(typeof document!=='undefined'&&document.createElementNS){const map=new T.TextureLoader().load(new URL('assets/materials/death-star-hull-v2.jpg',import.meta.url).href);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;
  for(const m of [steel,panel]){m.map=map;m.bumpMap=map;m.bumpScale=.12;m.userData.travel={value:0};m.onBeforeCompile=shader=>{shader.uniforms.panelTravel=m.userData.travel;
   shader.vertexShader='varying vec3 vPanelPosition;varying vec3 vPanelNormal;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPanelPosition=(modelMatrix*vec4(position,1.)).xyz;vPanelNormal=normalize(mat3(modelMatrix)*normal);');
   shader.fragmentShader='uniform float panelTravel;varying vec3 vPanelPosition;varying vec3 vPanelNormal;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
vec3 panelWeights=pow(abs(normalize(vPanelNormal)),vec3(4.));panelWeights/=max(.001,panelWeights.x+panelWeights.y+panelWeights.z);
vec3 panelCoord=(vPanelPosition-vec3(0.,0.,panelTravel))*.11;
vec4 panelTexel=texture2D(map,panelCoord.yz)*panelWeights.x+texture2D(map,panelCoord.xz)*panelWeights.y+texture2D(map,panelCoord.xy)*panelWeights.z;
diffuseColor*=panelTexel;
#endif`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#ifdef USE_BUMPMAP
float panelHeight=dot(panelTexel.rgb,vec3(.299,.587,.114));normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(panelHeight),dFdy(panelHeight))*bumpScale,faceDirection);
#endif`);
  };m.customProgramCacheKey=()=> 'tunnel-world-panel-v3';}
 }
 const obstacles=[];const segments=[],length=64,count=14,halfWidth=25,ceiling=24,floor=-8;
 const geo=new T.BoxGeometry(1,1,1);
 function slab(parent,w,h,d,x,y,z,mat){const m=new T.Mesh(geo,mat);m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m}
 for(let i=0;i<count;i++){const seg=new T.Group();group.add(seg);segments.push(seg);slab(seg,2,32,length,halfWidth+1,8,0,steel);slab(seg,2,32,length,-halfWidth-1,8,0,steel);slab(seg,54,2,length,0,floor-1,0,steel);slab(seg,54,2,length,0,ceiling+1,0,steel);for(let z of [-27,0,27]){for(let x of [-24,24]){slab(seg,2,28,1.4,x,8,z,panel);slab(seg,1,1,3,x*.93,14,z,glow)}slab(seg,50,1.3,1.4,0,ceiling,z,panel);slab(seg,50,1.3,1.4,0,floor,z,panel)}}
 // Each recycled segment receives a fresh seeded layout; all apertures fit the Falcon.
 let layoutSeed=9317;
 function configure(seg,serial){seg.userData.serial=serial;const layout=tunnelLayout(serial,layoutSeed);for(let j=0;j<seg.userData.hazards.length;j++){const item=seg.userData.hazards[j],b=layout.boxes[j];item.mesh.visible=!!b;item.edge.visible=!!b;item.active=!!b;if(b){Object.assign(item,b);item.mesh.scale.set(b.w,b.h,b.d);item.mesh.position.set(b.x,b.y,b.z);item.edge.position.set(b.x,b.y,b.z);item.edge.scale.set(b.w+.08,b.h+.08,b.d+.08)}}const o=layout.opening;for(let j=0;j<4;j++){const lamp=seg.userData.guides[j];lamp.position.set(o.x+(j%2?1:-1)*o.w/2,o.y+(j<2?-1:1)*o.h/2,o.z+3)} }
 for(let i=0;i<count;i++){const seg=segments[i];
 const detailMat=new T.MeshStandardMaterial({color:0x8e9b9d,metalness:.4,roughness:.8}),details=new T.InstancedMesh(geo,detailMat,48),dummy=new T.Object3D();let n=0;
 for(const side of [-1,1])for(let j=0;j<8;j++){const z=-28+j*8;dummy.position.set(side*24.85,4+(j%3)*5,z);dummy.scale.set(.25,2.6,4.8);dummy.updateMatrix();details.setMatrixAt(n++,dummy.matrix);dummy.position.set(side*24.65,4+(j%3)*5,z);dummy.scale.set(.2,.18,4.2);dummy.updateMatrix();details.setMatrixAt(n++,dummy.matrix);dummy.position.set(side*24.55,5.1+(j%3)*5,z+1.8);dummy.scale.set(.25,.25,.25);dummy.updateMatrix();details.setMatrixAt(n++,dummy.matrix)}details.instanceMatrix.needsUpdate=true;seg.add(details);
 seg.userData.hazards=[];seg.userData.guides=[];
 for(let j=0;j<5;j++){const m=slab(seg,1,1,1,0,0,0,panel),edge=new T.LineSegments(new T.EdgesGeometry(geo),new T.LineBasicMaterial({color:0xc2c7b9})),item={segment:seg,mesh:m,edge,active:false};seg.add(edge);seg.userData.hazards.push(item);obstacles.push(item)}
 for(let j=0;j<4;j++)seg.userData.guides.push(slab(seg,.5,.5,1,0,0,0,glow));configure(seg,i);
 for(const side of [-1,1])for(let j=0;j<3;j++){const pipe=new T.Mesh(new T.CylinderGeometry(.65,.65,length,8),steel);pipe.rotation.x=Math.PI/2;pipe.position.set(side*(23-j*.7),2+j*7,0);seg.add(pipe);}
 // Continuous luminous rails give depth cues well beyond the enemy spawn range.
 for(const side of [-1,1])slab(seg,.2,.25,length,side*24,10,0,glow);
 }
 const tunnelFill=new T.HemisphereLight(0xd5ebff,0x6b7e8f,1.5);group.add(tunnelFill);
 const chamber=new T.Group();group.add(chamber);chamber.visible=false;chamber.position.set(0,8,-65);
 const shell=new T.Mesh(new T.SphereGeometry(185,48,24),new T.MeshStandardMaterial({color:0x252d34,metalness:.55,roughness:.9,side:T.BackSide}));chamber.add(shell);
 const ringGeo=new T.TorusGeometry(178,1.3,5,64);for(let y of [-110,-60,0,60,110]){const ring=new T.Mesh(ringGeo,panel);ring.rotation.x=Math.PI/2;ring.position.y=y;ring.scale.setScalar(Math.sqrt(1-(y/185)**2));chamber.add(ring)}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;slab(chamber,2,210,3,Math.cos(a)*145,0,Math.sin(a)*145,steel);for(let j=0;j<8;j++)slab(chamber,1.5,1,4,Math.cos(a)*144,-85+j*24,Math.sin(a)*144,glow)}
 const fill=new T.HemisphereLight(0xd2eaff,0x607080,2.3);chamber.add(fill);for(const x of [-55,55]){const l=new T.PointLight(0xc2e7ff,450,240,1);l.position.set(x,30,30);chamber.add(l)}
 const exit=new T.Mesh(new T.TorusGeometry(23,2,6,40),glow);exit.position.set(0,0,-150);chamber.add(exit);
 let leaving=false,exitTravel=0;let inChamber=false;function setChamber(on){inChamber=on;chamber.visible=on;for(const seg of segments)seg.visible=!on}
 let distance=0,altitude=0;
 function position(){for(let i=0;i<count;i++){const seg=segments[i],z=tunnelSegmentZ(distance,i,length,count);if(seg.userData.lastZ!==undefined&&z<seg.userData.lastZ-length*count/2)configure(seg,seg.userData.serial+count);seg.position.z=z;seg.userData.lastZ=z}}
 position();
 return {get region(){return Math.floor(distance/(length*count))},get distance(){return distance},get sandMap(){return null},startEscape(){leaving=true;exitTravel=0},setChamber,setVisible(on){group.visible=on},reset(){leaving=false;exitTravel=0;chamber.position.z=-65;group.visible=true;setChamber(false);distance=0;altitude=0;layoutSeed=Math.floor(Math.random()*0x7fffffff);for(let i=0;i<count;i++){segments[i].userData.lastZ=undefined;configure(segments[i],i)}position()},setAltitude(a){altitude=a},update(dt,speed){if(leaving&&inChamber){exitTravel+=dt*speed;chamber.position.z=-65+exitTravel;if(exitTravel>=224){setChamber(false);leaving=false}}distance+=dt*speed;for(const m of [steel,panel])if(m.userData.travel)m.userData.travel.value=distance;position()},contacts(p,half){const hits=[];if(inChamber)return hits;for(const b of obstacles){if(!b.active)continue;const hit=obstacleContact(p,half,{...b,z:b.z+b.segment.position.z});if(hit)hits.push(hit);}if(p.x-half.x< -halfWidth)hits.push({axis:'x',normal:1,depth:-halfWidth-(p.x-half.x)});if(p.x+half.x>halfWidth)hits.push({axis:'x',normal:-1,depth:p.x+half.x-halfWidth});if(p.y-half.y<floor)hits.push({axis:'y',normal:1,depth:floor-(p.y-half.y)});if(p.y+half.y>ceiling)hits.push({axis:'y',normal:-1,depth:p.y+half.y-ceiling});return hits}}
}

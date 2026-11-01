import * as T from './vendor/three.module.js';
// Original meshes, modeled against Lucasfilm's original-trilogy ship references.
const material=(color,metalness=.35,roughness=.62)=>new T.MeshStandardMaterial({color,metalness,roughness});
const paint=material(0xc6c5b9),light=material(0xe1ddd0),red=material(0x923b32),yellow=material(0xc39a46),frame=material(0x65717a,.65),steel=material(0x384047,.7),black=material(0x0a1017,.25),copper=material(0x805238,.45,.82),trim=material(0x513626,.4,.9);
const glass=new T.MeshPhysicalMaterial({color:0x132733,metalness:.6,roughness:.16,clearcoat:1});
const engineMat=new T.MeshBasicMaterial({color:0xff91c6,toneMapped:false});
// Shared, photo-detailed material atlas; triplanar UVs keep detail consistent on arbitrary hulls.
let surfaceMap=null;
if(typeof document!=='undefined'&&document.createElementNS){surfaceMap=new T.TextureLoader().load(new URL('assets/materials/ship-surfaces-v1.png',import.meta.url).href);surfaceMap.colorSpace=T.SRGBColorSpace;surfaceMap.anisotropy=8;}
const quadrants=new Map([[paint,[0,.5]],[light,[0,.5]],[red,[0,.5]],[yellow,[0,.5]],[frame,[.5,.5]],[steel,[.5,.5]],[copper,[0,0]],[trim,[0,0]]]);
for(const [m,offset] of quadrants){
 if(surfaceMap){m.map=surfaceMap;m.bumpMap=surfaceMap;m.bumpScale=offset[1]===0?.035:.02;}
 m.onBeforeCompile=shader=>{
  shader.uniforms.surfaceOffset={value:new T.Vector2(...offset)};
  shader.vertexShader='varying vec3 vHullPosition;varying vec3 vHullNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHullPosition=position;vHullNormal=normal;');
  shader.fragmentShader='varying vec3 vHullPosition;varying vec3 vHullNormal;uniform vec2 surfaceOffset;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
vec3 w=pow(abs(normalize(vHullNormal)),vec3(5.));w/=max(.001,w.x+w.y+w.z);
vec3 p=vHullPosition*${offset[1]==0?'0.21':'0.34'};
vec2 ax=surfaceOffset+.003+fract(p.zy)*.494;
vec2 ay=surfaceOffset+.003+fract(p.xz)*.494;
vec2 az=surfaceOffset+.003+fract(p.xy)*.494;
vec4 surfaceColor=texture2D(map,ax)*w.x+texture2D(map,ay)*w.y+texture2D(map,az)*w.z;
diffuseColor*=surfaceColor;
#endif`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#ifdef USE_BUMPMAP
float surfaceHeight=dot(surfaceColor.rgb,vec3(.299,.587,.114));
normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(surfaceHeight),dFdy(surfaceHeight))*bumpScale,faceDirection);
#endif`);
 };
 m.customProgramCacheKey=()=> 'atlas-triplanar-bump-'+offset.join(',');
}
paint.color.set(0xf0eee5);paint.metalness=.18;light.color.set(0xffffff);frame.color.set(0xf4f6f3);frame.metalness=.25;frame.roughness=.72;steel.color.set(0xc1c7c9);steel.metalness=.35;copper.color.set(0xf0d6b6);copper.metalness=.22;copper.roughness=.9;trim.color.set(0x967455);

const geomCache=new Map();function geometry(key,fn){if(!geomCache.has(key))geomCache.set(key,fn());return geomCache.get(key)}
function mesh(g,geo,mat,x=0,y=0,z=0){let o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
export function box(g,w,h,d,m,x=0,y=0,z=0){return mesh(g,geometry(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d)),m,x,y,z)}
export function sphere(g,r,m,x=0,y=0,z=0){return mesh(g,geometry(`s${r}`,()=>new T.SphereGeometry(r,20,14)),m,x,y,z)}
export function cylinder(g,r1,r2,len,m,x=0,y=0,z=0){let o=mesh(g,geometry(`c${r1},${r2},${len}`,()=>new T.CylinderGeometry(r1,r2,len,20)),m,x,y,z);o.rotation.x=Math.PI/2;return o}
function rod(g,a,b,r,m=frame){let av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);let o=mesh(g,geometry(`rod${r},${delta.length().toFixed(3)}`,()=>new T.CylinderGeometry(r,r,delta.length(),7)),m);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o}
function plate(g,points,thickness,m){let p=new T.Shape();p.moveTo(points[0][0],points[0][1]);for(let v of points.slice(1))p.lineTo(...v);p.closePath();let o=mesh(g,new T.ExtrudeGeometry(p,{depth:thickness,bevelEnabled:false}),m);return o}
// Lofted hull sections: z, half-width, half-height, vertical center.
function loft(g,sections,m,n=12){let pos=[],idx=[],uv=[];for(let [z,w,h,y] of sections)for(let j=0;j<n;j++){let a=j/n*Math.PI*2;pos.push(Math.cos(a)*w,y+Math.sin(a)*h,z);uv.push(j/n,z*.2)}for(let i=0;i<sections.length-1;i++)for(let j=0;j<n;j++){let a=i*n+j,b=i*n+(j+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c)}for(let end of [0,sections.length-1])for(let j=1;j<n-1;j++)idx.push(end*n,end*n+j+(end?0:1),end*n+j+(end?1:0));let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,m)}
function torus(g,r,t,m,x,y,z){return mesh(g,geometry(`t${r},${t}`,()=>new T.TorusGeometry(r,t,6,24)),m,x,y,z)}
function exhaust(g,x,y,z,r){cylinder(g,r*1.2,r*1.2,.22,steel,x,y,z);torus(g,r,.075,steel,x,y,z+.16);let o=cylinder(g,r*.78,r*.78,.04,engineMat,x,y,z+.17);g.userData.engines??=[];g.userData.engines.push(o);let halo=mesh(g,geometry('enginehalo',()=>new T.PlaneGeometry(1,1)),new T.MeshBasicMaterial({color:0xff4096,transparent:true,opacity:.17,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}),x,y,z+.2);halo.scale.set(r*3,r*3,1)}
function astromech(g,x,y,z){cylinder(g,.23,.23,.45,light,x,y,z).rotation.x=0;sphere(g,.24,frame,x,y+.22,z);box(g,.19,.13,.1,material(0x264b83),x,y+.28,z-.2);sphere(g,.045,black,x+.12,y+.24,z-.19)}
function canopy(g,sections){loft(g,sections,glass,8);let a=sections[0],b=sections.at(-1);for(let s of [-1,1])rod(g,[s*a[1]*.7,a[3]+a[2]*.7,a[0]],[s*b[1]*.7,b[3]+b[2]*.7,b[0]],.035,paint);for(let q of sections){let [z,w,h,y]=q;rod(g,[-w*.7,y+h*.7,z],[w*.7,y+h*.7,z],.035,paint)}}
function panels(g,x,y,z,w,d,m=steel){for(let i=0;i<4;i++)box(g,w/5,.025,d,m,x-w*.36+i*w*.24,y,z)}
function xwing(){let g=new T.Group();g.userData.muzzles=[];loft(g,[[-6.9,.07,.06,0],[-5.5,.23,.15,0],[-2.3,.46,.29,0],[.1,.63,.5,0],[2.4,.55,.43,0],[2.8,.4,.32,0]],paint,8);loft(g,[[-6.45,.06,.012,.13],[-3.4,.13,.012,.24],[-1.5,.16,.012,.3]],red,4);canopy(g,[[-1.7,.35,.08,.28],[-.8,.4,.43,.35],[.35,.4,.39,.35],[.8,.4,.08,.35]]);astromech(g,0,.6,1.15);panels(g,0,.52,2,.7,.8);for(let s of [-1,1])for(let u of [-1,1]){let w=new T.Group();g.add(w);w.position.set(s*.42,u*.18,1.2);w.rotation.z=s*u*.24;let wing=plate(w,[[s*.1,-1.35],[s*4.45,-.4],[s*4.45,.55],[s*.1,.85]],.12,paint);wing.rotation.x=Math.PI/2;wing.position.y=.06;let stripe=plate(w,[[s*2.3,-.88],[s*3.2,-.68],[s*3.2,.56],[s*2.3,.68]],.13,red);stripe.rotation.x=Math.PI/2;stripe.position.y=.065;for(let j=0;j<3;j++)box(w,.24,.018,.33,steel,s*(3.45+j*.29),.08,.22);cylinder(w,.41,.36,1.8,paint,s*.78,0,-.1);cylinder(w,.3,.32,1.5,steel,s*.78,0,1.05);cylinder(w,.32,.32,.06,black,s*.78,0,-1.03);for(let j=0;j<5;j++)torus(w,.32,.025,frame,s*.78,0,.5+j*.15);exhaust(w,s*.78,0,1.87,.25);cylinder(w,.13,.13,1.1,paint,s*4.45,0,-.15);cylinder(w,.055,.075,3.1,frame,s*4.45,0,-1.7);cylinder(w,.1,.1,.28,steel,s*4.45,0,-3.35);box(w,.45,.055,.24,paint,s*4.45,0,-2.5);g.userData.muzzles.push(new T.Vector3(s*.42+s*4.45*Math.cos(.24),u*.18+u*4.45*Math.sin(.24),-2.3))}return g}
function ywing(){let g=new T.Group();g.userData.muzzles=[];loft(g,[[-4.3,.6,.22,0],[-3.8,.95,.37,0],[-2.3,.9,.5,0],[-1.25,.5,.33,0],[-.8,.34,.24,0]],paint,8);loft(g,[[-4.3,.27,.025,.22],[-3.8,.32,.025,.38],[-2.8,.29,.025,.49]],yellow,4);canopy(g,[[-3.1,.53,.08,.3],[-2.65,.53,.35,.45],[-1.8,.36,.32,.4],[-1.5,.3,.05,.3]]);box(g,.85,.4,4,steel,0,-.03,1);box(g,4.4,.2,.7,paint,0,0,.45);astromech(g,0,.3,-.75);for(let i=0;i<6;i++){box(g,.62,.12,.18,frame,0,.3,-.25+i*.54);rod(g,[-.28,.4,i*.5],[.3,.4,i*.5+.5],.04,yellow)}for(let s of [-1,1]){for(let j=0;j<3;j++)rod(g,[s*(.16+j*.12),.26,-.5],[s*(.16+j*.12),.26,2.7],.025,j%2?copper:frame);cylinder(g,.6,.6,2.3,paint,s*2.45,0,-.8);let cap=sphere(g,.6,paint,s*2.45,0,-1.95);cap.scale.z=.45;torus(g,.6,.05,yellow,s*2.45,0,-1.5);cylinder(g,.36,.39,2.2,steel,s*2.45,0,1.3);for(let j=0;j<4;j++){let a=j*Math.PI/2+Math.PI/4,dx=Math.cos(a)*.47,dy=Math.sin(a)*.47;rod(g,[s*2.45+dx,dy,.1],[s*2.45+dx,dy,4],.065,paint)}torus(g,.66,.09,paint,s*2.45,0,4);torus(g,.53,.04,frame,s*2.45,0,4);exhaust(g,s*2.45,0,2.5,.29);cylinder(g,.065,.065,1.1,frame,s*.38,-.18,-4.45);g.userData.muzzles.push(new T.Vector3(s*.38,-.18,-5))}cylinder(g,.09,.09,1,steel,0,.8,-2.6);return g}
function awing(){let g=new T.Group();g.userData.muzzles=[];loft(g,[[-3.25,.25,.08,0],[-2.6,1.03,.2,0],[-1,1.55,.33,0],[1.9,1.45,.47,0],[2.4,.9,.38,0]],paint,8);for(let s of [-1,1]){loft(g,[[-3.15,.15,.02,.08],[-1.7,.32,.02,.31],[1.7,.34,.02,.48]],red,4).position.x=s*.46;cylinder(g,.48,.53,2.5,paint,s*1.02,0,1.5);exhaust(g,s*1.02,0,2.82,.39);let fin=plate(g,[[-.65,0],[.5,1.6],[1.2,1.6],[1.45,0]],.12,paint);fin.rotation.y=Math.PI/2;fin.position.set(s*1.28,.2,1.35);let mark=box(g,.14,.65,.3,red,s*1.28,1.12,.7);cylinder(g,.1,.1,1.85,steel,s*1.77,0,-.4);cylinder(g,.06,.08,1.2,frame,s*1.77,0,-1.8);g.userData.muzzles.push(new T.Vector3(s*1.77,0,-2.5))}canopy(g,[[-1.3,.42,.05,.33],[-.65,.48,.55,.4],[.65,.48,.48,.4],[1.2,.35,.05,.36]]);box(g,.9,.15,.65,steel,0,.48,1.65);return g}
export function falcon(){
 const g=new T.Group();g.name='YT-1300 Millennium Falcon · Endor';
 const hull=material(0xc9c5b9,.24,.87),dark=material(0x383b3b,.5,.82),patch=material(0x88857a,.3,.9);
 // Locally authored UV texture: radial armour, soot and mismatched replacement panels.
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=c.height=1024;const ctx=c.getContext('2d');
  ctx.fillStyle='#b8b5a9';ctx.fillRect(0,0,1024,1024);let seed=73;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<11000;i++){const v=80+Math.floor(rnd()*90);ctx.fillStyle=`rgba(${v},${v},${v-8},.12)`;ctx.fillRect(rnd()*1024,rnd()*1024,1+rnd()*4,1+rnd()*3)}
  for(let r=65;r<510;r+=43){for(let j=0;j<32;j++){const a=j*Math.PI/16;ctx.beginPath();ctx.arc(512,512,r,a+.008,a+Math.PI/16-.008);ctx.arc(512,512,r-40,a+Math.PI/16-.008,a+.008,true);ctx.closePath();ctx.fillStyle=j%11===0?'#714c43':j%7===0?'#77776f':`rgb(${167+j%5*6},${165+j%5*6},${153+j%5*6})`;ctx.fill();ctx.strokeStyle='#53534e';ctx.lineWidth=2;ctx.stroke()}}
  for(let i=0;i<90;i++){const x=rnd()*1024,z=rnd()*1024;ctx.fillStyle='rgba(28,25,21,.16)';ctx.fillRect(x,z,2+rnd()*8,5+rnd()*45)}
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;hull.map=map;hull.bumpMap=map;hull.bumpScale=.035;
 }
 // Flattened double saucer with planar UVs; no box-shaped mandibles.
 for(const sign of [-1,1]){const saucer=sphere(g,5.8,hull,0,sign*.12,0);saucer.scale.set(1,.145,.92);const pos=saucer.geometry.attributes.position;const uv=saucer.geometry.attributes.uv;const geo=saucer.geometry.clone();for(let i=0;i<pos.count;i++)geo.attributes.uv.setXY(i,pos.getX(i)/11.6+.5,pos.getZ(i)/11.6+.5);saucer.geometry=geo;}
 const rim=cylinder(g,5.63,5.63,.38,dark);rim.rotation.x=0;rim.scale.z=.92;
 for(const side of [-1,1]){
  const m=plate(g,[[side*1.15,2.3],[side*4.9,2.3],[side*4.15,8.2],[side*1.15,8.2]],.9,hull);m.rotation.x=-Math.PI/2;m.position.y=-.45;
  box(g,.26,.2,4.9,dark,side*1.3,.05,-5.5);
  for(let z=-7.6;z<-3;z+=.7)box(g,1.65,.025,.025,dark,side*2.8,.49,z);
  rod(g,[side*4.8,0,.4],[side*6.05,0,.4],.68,patch);const dock=torus(g,.65,.12,hull,side*6.05,0,.4);dock.rotation.y=Math.PI/2;
 }
 // Starboard cockpit corridor and framed cylindrical canopy, facing forward (-Z).
 rod(g,[3.6,.12,-1.4],[6.15,.12,-2.7],.62,hull);cylinder(g,.67,.62,2.5,hull,6.15,.12,-3.25);
 cylinder(g,.58,.58,.9,glass,6.15,.15,-4.6);torus(g,.59,.055,hull,6.15,.15,-5.05);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(g,[6.15+Math.cos(a)*.59,.15+Math.sin(a)*.59,-5.05],[6.15+Math.cos(a)*.59,.15+Math.sin(a)*.59,-4.15],.035,hull)}
 for(let y of [-1,1]){const turret=sphere(g,.86,patch,0,y,.1);turret.scale.y=.43;for(let x of [-.16,.16])for(let dy of [-.12,.12])cylinder(g,.045,.065,1.65,dark,x,y+dy,-.95)}
 for(let i=0;i<6;i++){const a=.22+i*Math.PI/5.8;const x=Math.cos(a)*3.6,z=Math.sin(a)*3.6;const fan=cylinder(g,.68,.68,.09,dark,x,.77,z);fan.rotation.x=0;for(let j=0;j<6;j++){const blade=box(g,1.1,.025,.065,patch,x,.83,z);blade.rotation.y=j*Math.PI/6}}
 cylinder(g,.23,.4,.7,dark,-2.8,1.05,-.5).rotation.x=0;
 const dish=new T.Mesh(new T.SphereGeometry(1.05,24,10,0,Math.PI*2,0,.9),hull);dish.position.set(-2.8,1.35,-.5);dish.rotation.x=-.45;g.add(dish);rod(g,[-2.8,1.45,-.5],[-2.8,2.45,-.9],.04,dark);
 const blue=new T.MeshBasicMaterial({color:0x8ddfff,toneMapped:false});
 const engine=new T.Mesh(new T.TorusGeometry(5.35,.18,6,36,Math.PI*.72),blue);engine.rotation.x=Math.PI/2;engine.rotation.z=Math.PI*.14;engine.scale.y=.92;engine.position.y=.02;g.add(engine);
 for(let i=0;i<34;i++){const a=i*Math.PI*2/34;if(Math.sin(a)<-.35)continue;const x=Math.cos(a)*5.65,z=Math.sin(a)*5.2;box(g,.22,.3,.3,patch,x,0,z)}
 g.userData.muzzles=[new T.Vector3(-2.8,.4,-8.2),new T.Vector3(2.8,.4,-8.2),new T.Vector3(0,1,-1.7)];g.userData.large=true;return g
}
export function fighter(type=0){let g; // Muzzles are defined in craft-local space, pointing toward -Z.
 g=[xwing,ywing,awing,falcon][type]();g.name=['T-65 X-wing','BTL-A4 Y-wing','RZ-1 A-wing','YT-1300 Millennium Falcon'][type];return g}

let solarMaterial;
function solar(){if(solarMaterial)return solarMaterial;let c=document.createElement('canvas');c.width=c.height=128;let x=c.getContext('2d');x.fillStyle='#101925';x.fillRect(0,0,128,128);for(let i=0;i<128;i+=4){x.fillStyle=i%16===0?'#374454':'#202c3a';x.fillRect(i,0,1,128)}for(let i=0;i<128;i+=16){x.fillStyle='#424c56';x.fillRect(0,i,128,1)}let tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,2);tex.colorSpace=T.SRGBColorSpace;solarMaterial=new T.MeshStandardMaterial({map:tex,color:0x8796aa,metalness:.3,roughness:.7,side:T.DoubleSide});return solarMaterial}
function wingPanel(g,vertices,center){let geo=new T.BufferGeometry(),positions=[],uv=[],idx=[];for(let v of vertices){positions.push(...v);uv.push(v[2]*.32,v[1]*.32)}for(let i=1;i<vertices.length-1;i++)idx.push(0,i,i+1);geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();mesh(g,geo,solar());for(let i=0;i<vertices.length;i++)rod(g,vertices[i],vertices[(i+1)%vertices.length],.075,frame);for(let v of vertices)rod(g,center,v,.045,frame)}
function viewport(g,x,y,z,r=.62){cylinder(g,r,r,.07,steel,x,y,z);let window=mesh(g,new T.CircleGeometry(r*.83,32),glass,x,y,z+.05);torus(g,r,.075,frame,x,y,z+.07);for(let i=0;i<8;i++){let a=i*Math.PI/4;rod(g,[x+Math.cos(a)*r*.22,y+Math.sin(a)*r*.22,z+.08],[x+Math.cos(a)*r*.91,y+Math.sin(a)*r*.91,z+.08],.035,frame)}cylinder(g,r*.23,r*.23,.06,frame,x,y,z+.1)}
export function tie(type='fighter'){let g=new T.Group();g.userData.type=type;g.userData.muzzles=[];let bomber=type==='bomber';if(bomber){for(let s of [-1,1]){cylinder(g,.78,.78,2.55,frame,s*.94,0,0);for(let z of [-1.14,.9])torus(g,.79,.06,steel,s*.94,0,z);cylinder(g,.62,.62,.08,black,s*.94,0,-1.32);box(g,.5,.2,1.5,steel,s*.94,.73,0)}viewport(g,.94,0,1.32,.68);cylinder(g,.68,.68,.1,steel,-.94,0,1.33);for(let i=0;i<6;i++){let a=i*Math.PI/3;cylinder(g,.12,.12,.15,black,-.94+Math.cos(a)*.35,Math.sin(a)*.35,1.42)}box(g,1.4,.5,.8,frame,0,0,0);g.userData.muzzles.push(new T.Vector3(.72,-.5,1.6),new T.Vector3(1.16,-.5,1.6))}else{sphere(g,.86,frame);viewport(g,0,0,.86,.64);cylinder(g,.55,.55,.1,steel,0,0,-.8);for(let y of [-.43,.43])box(g,.5,.13,.12,steel,0,y,-.75);box(g,3.65,.27,.43,frame);for(let s of [-1,1]){if(type!=='interceptor'){cylinder(g,.12,.12,.45,steel,s*.28,-.53,.67);g.userData.muzzles.push(new T.Vector3(s*.28,-.53,.95))}else box(g,.14,.12,.22,black,s*.28,-.53,.68)}}
for(let s of [-1,1]){let x=s*(bomber?2.6:1.95);if(type==='fighter'){let verts=[];for(let i=0;i<6;i++){let a=i*Math.PI/3;verts.push([x,Math.sin(a)*2.6,Math.cos(a)*1.95])}wingPanel(g,verts,[x,0,0]);cylinder(g,.3,.3,.15,frame,x,0,0).rotation.set(0,0,Math.PI/2)}else if(type==='interceptor'){
 wingPanel(g,[[x,-.62,-1.65],[x,.62,-1.65],[x,.62,.65],[x,-.62,.65]],[x,0,-.45]);
 for(let u of [-1,1]){const tipX=x-s*.64,tipY=u*1.9,tipZ=3.8;
  let verts=[[x,u*.62,-1.65],[tipX,tipY,-1.9],[tipX,tipY,tipZ],[x,u*.62,.65]];
  wingPanel(g,verts,[x,u*.62,-.4]);
  rod(g,[x,u*.62,-1.65],[tipX,tipY,tipZ],.055,frame);
  cylinder(g,.065,.1,.72,steel,tipX,tipY,tipZ-.1);cylinder(g,.045,.065,.5,frame,tipX,tipY,tipZ+.45);
  g.userData.muzzles.push(new T.Vector3(tipX,tipY,tipZ+.7));
  box(g,.27,.16,.5,frame,x-s*.05,u*.61,-.6);
 }
 }else{wingPanel(g,[[x,-.75,-1.65],[x,.75,-1.65],[x,.75,1.65],[x,-.75,1.65]],[x,0,0]);for(let u of [-1,1])wingPanel(g,[[x,u*.75,-1.65],[x-s*.65,u*1.75,-1.1],[x-s*.65,u*1.75,1.4],[x,u*.75,1.65]],[x,u*.75,0])}}
if(!bomber){let hatch=cylinder(g,.37,.37,.05,steel,0,.83,-.08);hatch.rotation.x=0;let rim=torus(g,.37,.035,frame,0,.86,-.08);rim.rotation.x=Math.PI/2;for(let side of [-1,1]){sphere(g,.085,new T.MeshBasicMaterial({color:0xc74336}),side*.24,-.1,-.84);for(let j=0;j<5;j++)box(g,.07,.3,.035,steel,side*(.64+j*.11),.12,-.35);for(let z of [-.22,.14])box(g,.5,.09,.13,steel,side*1.25,.16,z)}}
for(let i=0;i<8;i++){let a=i*Math.PI/4;sphere(g,.035,frame,(bomber?.94:0)+Math.cos(a)*.64,Math.sin(a)*.64,(bomber?1.32:.86)+.12)}
g.name={fighter:'TIE/ln fighter',interceptor:'TIE/IN interceptor',bomber:'TIE/sa bomber'}[type];return g}
function sail(g,z,length,width,height){let geo=new T.PlaneGeometry(width,length,18,16);let p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),v=p.getY(i);p.setXYZ(i,x,height-Math.pow(x/(width/2),2)*1.15+Math.sin(v/length*Math.PI)*.65,z+v)}geo.computeVertexNormals();let cloth=new T.MeshStandardMaterial({color:0xc7a38c,roughness:1,side:T.DoubleSide});if(surfaceMap){const tex=surfaceMap.clone();tex.repeat.set(.494,.494);tex.offset.set(.503,.003);tex.needsUpdate=true;cloth.map=tex;cloth.bumpMap=tex;cloth.bumpScale=.035;}let o=mesh(g,geo,cloth);o.userData.sail=true;for(let s of [-1,1])rod(g,[s*width/2,height-1.15,z-length/2],[s*width/2,height-1.15,z+length/2],.05,trim);for(let v of [-length/2,length/2]){rod(g,[-width/2,height-1.15,z+v],[0,height+.2,z+v],.055,trim);rod(g,[0,height+.2,z+v],[width/2,height-1.15,z+v],.055,trim)}for(let i=1;i<7;i++){let line=[];let x=-width/2+i*width/7;for(let j=0;j<12;j++){let v=-length/2+j/11*length;line.push(new T.Vector3(x,height-(x/(width/2))**2*1.15+Math.sin(v/length*Math.PI)*.65+.015,z+v))}let lineGeo=new T.BufferGeometry().setFromPoints(line);g.add(new T.Line(lineGeo,new T.LineBasicMaterial({color:0x733722,transparent:true,opacity:.6})))}}
function chinedHull(g){const sections=[[-17,.1,-.8],[-13,3.4,0],[-9,5.1,.3],[7,5.45,.4],[12,4.65,.2],[15,3.6,0]];const contour=[[.78,-2.2],[1,-.35],[.93,3.2],[.72,4],[-.72,4],[-.93,3.2],[-1,-.35],[-.78,-2.2]];let p=[],uv=[],idx=[];for(let [z,w,y]of sections)for(let i=0;i<8;i++){p.push(contour[i][0]*w,contour[i][1]+y,z);uv.push(i/8,z*.15)}for(let j=0;j<sections.length-1;j++)for(let i=0;i<8;i++){let a=j*8+i,b=j*8+(i+1)%8,c=a+8,d=b+8;idx.push(a,b,c,b,d,c)}for(let end of [0,5])for(let i=1;i<7;i++)idx.push(end*8,end*8+i+(end?0:1),end*8+i+(end?1:0));let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();let hull=mesh(g,geo,copper);hull.material.side=T.DoubleSide;box(g,8.5,.22,20,trim,0,4.2,1);return hull}
export function barge(){let g=new T.Group();g.name='The Khetanna';g.userData.turrets=[];chinedHull(g);for(let s of [-1,1]){for(let i=0;i<22;i++){let z=-10+i*1.02;let w=z<-7?4.5:5.05;box(g,.11,.9,.68,black,s*w,3.55,z);for(let j=0;j<3;j++)box(g,.14,.055,.72,trim,s*(w+.07),3.3+j*.25,z)}for(let y of [-.8,.05,.9,1.7]){let pts=[[-13,s*2.5],[-10,s*4.65],[7,s*5.3],[13,s*4.5]];for(let i=0;i<pts.length-1;i++)rod(g,[pts[i][1],y,pts[i][0]],[pts[i+1][1],y,pts[i+1][0]],.075,trim)}for(let z=-11;z<13;z+=1.1)rod(g,[s*4.8,4.05,z],[s*4.8,4.65,z],.045,frame);rod(g,[s*4.8,4.65,-11],[s*4.8,4.65,12],.045,frame)}box(g,7,.35,18,trim,0,4.45,1);for(let z=-7;z<11;z+=.5)box(g,6.7,.03,.04,copper,0,4.65,z);for(let z of [-5,7]){rod(g,[0,3,z],[0,12.3,z],.13,trim);for(let s of [-1,1])rod(g,[0,11.8,z],[s*4.8,4.5,z+2],.026,frame)}sail(g,-5,9,11,11.5);sail(g,7,10,12.8,12.2);loft(g,[[10,2.3,.1,4.5],[10.3,2.5,.7,4.9],[13.2,2.5,.7,4.9],[13.5,2,.1,4.5]],copper,8);box(g,4,.7,.08,black,0,5.2,13.4);for(let x=-1.5;x<=1.5;x+=.5)box(g,.055,.75,.1,trim,x,5.2,13.47);
for(let i=0;i<10;i++){let pivot=new T.Group(),s=i%2?1:-1,z=-8+Math.floor(i/2)*4;g.add(pivot);pivot.position.set(s*4.65,4.8,z);sphere(pivot,.43,steel,0,0,0).scale.y=.6;box(pivot,.9,.35,.8,frame,0,.2,0);for(let x of [-.15,.15])cylinder(pivot,.065,.1,1.8,steel,x,.35,.8);let lamp=sphere(pivot,.09,new T.MeshBasicMaterial({color:0xff5533,toneMapped:false}),0,.5,.3);g.userData.turrets.push({mesh:pivot,hp:5,fire:1+Math.random()*3,lamp})}for(let side of [-1,1])for(let z=-10;z<=12;z+=1.2){rod(g,[side*4.45,-1.4,z],[side*5.2,2.8,z],.055,trim);box(g,.14,.2,.36,copper,side*5.13,2.5,z)}
const core=box(g,2.3,.7,.12,new T.MeshStandardMaterial({color:0xd86e31,emissive:0xff8033,emissiveIntensity:1.2}),0,5.3,13.58);g.userData.core=core;
const shield=new T.Mesh(new T.SphereGeometry(3.4,24,16),new T.MeshBasicMaterial({color:0x76baff,transparent:true,opacity:0,wireframe:false,depthWrite:false}));shield.position.set(0,4.7,10.8);g.add(shield);g.userData.coreShield=shield;
g.userData.corePosition=new T.Vector3(0,4.8,11.5);g.userData.burstPosition=new T.Vector3(0,4.8,12);g.userData.beamPorts=[new T.Vector3(-3.2,4.5,13),new T.Vector3(3.2,4.5,13)];g.rotation.y=.42;return g}
export function animateEngines(g,t){g.traverse(o=>{if(o.material===engineMat)o.scale.setScalar(.94+Math.sin(t*37)*.06)})}
export function groundBattery(){const root=new T.Group();root.name='Imperial ground laser battery';let plinth=cylinder(root,2.5,3.1,1,steel,0,.5,0);plinth.rotation.x=0;box(root,3.3,.7,3.5,frame,0,1.1,0);for(let s of [-1,1]){box(root,.45,.85,4.1,steel,s*1.85,.7,0);box(root,.15,.35,1.4,red,s*2.1,1,0)}const head=new T.Group();head.position.y=1.75;root.add(head);sphere(head,1.05,frame,0,0,0).scale.y=.6;box(head,1.7,.65,1.6,steel,0,.3,0);let barrels=[];for(let x of [-.46,.46]){barrels.push(cylinder(head,.14,.2,3.3,frame,x,.45,1.5));cylinder(head,.2,.2,.24,steel,x,.45,3.2)}let lamp=sphere(head,.14,new T.MeshBasicMaterial({color:0x50ff73,toneMapped:false}),0,.77,.5);root.userData.head=head;root.userData.barrels=barrels;root.userData.lamp=lamp;root.userData.muzzles=[new T.Vector3(-.46,.45,3.4),new T.Vector3(.46,.45,3.4)];return root}
export function imperialMaterials(){return {frame,steel,black}}
export function vaderBoss(){const g=new T.Group();g.name='Darth Vader · TIE Advanced x1';g.userData.turrets=[];g.userData.muzzles=[];g.userData.breakupMeshes=[];
 loft(g,[[-2.7,1.12,.28,-.08],[-2.25,1.55,.44,0],[-.75,1.42,.48,0],[-.25,.78,.48,0]],frame,8);box(g,4.3,.27,1.9,steel,0,0,-.8);sphere(g,.96,frame,0,0,.28);viewport(g,0,0,1.21,.70);let hatch=cylinder(g,.38,.38,.09,steel,0,.95,.1);hatch.rotation.x=0;
 for(let side of [-1,1]){let x=side*3;wingPanel(g,[[x,-.62,-2.1],[x,.62,-2.1],[x,.62,1.3],[x,-.62,1.3]],[x,0,-.4]);for(let u of [-1,1])wingPanel(g,[[x,u*.62,-2.1],[x-side*.75,u*1.72,-1.8],[x-side*.75,u*1.72,1.0],[x,u*.62,1.3]],[x,u*.62,-.4]);box(g,1.25,.35,1.1,frame,side*2.1,0,-.55);for(let j=0;j<6;j++)box(g,.08,.24,.3,steel,side*(1.2+j*.12),.36,-1.1);sphere(g,.09,new T.MeshBasicMaterial({color:0xe35338}),side*.55,-.05,-2.72);cylinder(g,.065,.08,.65,steel,side*.3,-.54,1.1);g.userData.muzzles.push(new T.Vector3(side*.3,-.54,1.5));}
 const mounts=[];for(let side of [-1,1])for(let y of [-1.1,1.1])for(let z of [-1.3,.55])mounts.push([side*2.66,y,z]);for(let x of [-.58,.58])for(let y of [-.58,.58])for(let z of [-1.65,-.4])mounts.push([x,y,z]);
 for(const [x,y,z]of mounts){const pivot=new T.Group();pivot.position.set(x,y,z);g.add(pivot);sphere(pivot,.23,steel);box(pivot,.36,.22,.4,frame,0,.12,0);for(let dx of [-.08,.08])cylinder(pivot,.035,.055,.7,steel,dx,.15,.35);const lamp=sphere(pivot,.045,new T.MeshBasicMaterial({color:0xff6247}),0,.28,.1);g.userData.turrets.push({mesh:pivot,hp:5,fire:.8+Math.random()*2,lamp})}
 const core=sphere(g,.26,new T.MeshStandardMaterial({color:0x8d2521,emissive:0xff5035,emissiveIntensity:1.4}),0,0,1.32);g.userData.core=core;const shield=new T.Mesh(new T.SphereGeometry(1.05,24,16),new T.MeshBasicMaterial({color:0x76baff,transparent:true,opacity:0,depthWrite:false}));shield.position.z=.4;g.add(shield);g.userData.coreShield=shield;g.userData.corePosition=new T.Vector3(0,0,1.35);g.userData.burstPosition=new T.Vector3(0,-.35,1.45);g.userData.beamPorts=[new T.Vector3(-.55,-.38,1.35),new T.Vector3(.55,-.38,1.35)];return g}

// Film-miniature silhouette: tapered square tower, sloped head, paired stepped cannons.
let trenchMaterials=null;
export function trenchTurret(wall=false){const root=new T.Group();root.name=wall?'Death Star wall turbolaser':'Death Star XX-9 turbolaser tower';if(!trenchMaterials){const plate=frame.clone(),gunmetal=steel.clone();plate.color.set(0xcbd0d1);plate.emissive.set(0x687b8c);plate.emissiveIntensity=.28;plate.onBeforeCompile=frame.onBeforeCompile;plate.customProgramCacheKey=()=> 'trench-turret-plate';gunmetal.color.set(0x88939c);gunmetal.emissive.set(0x344a60);gunmetal.emissiveIntensity=.28;gunmetal.onBeforeCompile=steel.onBeforeCompile;trenchMaterials={plate,gunmetal}}const {plate,gunmetal}=trenchMaterials;
 function taper(parent,bottom,top,height,y,depthRatio=1){const geo=new T.BoxGeometry(bottom,height,bottom*depthRatio),p=geo.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>0){p.setX(i,p.getX(i)*top/bottom);p.setZ(i,p.getZ(i)*top/bottom)}geo.computeVertexNormals();const o=mesh(parent,geo,plate,0,y,0);o.userData.transientGeometry=true;return o}
 const h=wall?1.4:5.8;box(root,5.9,.3,5.9,gunmetal,0,.15,0);taper(root,5.2,3.9,h,h/2+.3);for(let side of [-1,1]){for(let y=.9;y<h;y+=1.15){box(root,.045,.06,3.8,gunmetal,side*(2.6-(y/h)*.65),y,0);box(root,3.8,.06,.045,gunmetal,0,y,side*(2.6-(y/h)*.65))}for(let y=1;y<h;y+=1.8)box(root,.13,.5,.85,plate,side*(2.58-(y/h)*.65),y,.55)}
 const collar=cylinder(root,1.7,1.7,.32,gunmetal,0,h+.45,0);collar.rotation.x=0;const head=new T.Group();head.position.y=h+.6;root.add(head);taper(head,4.4,3.65,2.8,1.15,.86);box(head,2.5,1.6,.18,black,0,1.35,1.96);const barrels=[];
 for(let x of [-.86,.86]){let gun=new T.Group();head.add(gun);gun.position.set(x,1.5,1.3);let breech=cylinder(gun,.52,.52,1.3,gunmetal,0,0,0);for(let [radius,length,z]of [[.32,1.3,.65],[.25,1.35,1.9],[.17,1.5,3.15]])cylinder(gun,radius,radius,length,gunmetal,0,0,z);for(let z of [.1,.7,1.35,2.1,2.65,3.55])cylinder(gun,z<1.4?.36:.23,z<1.4?.36:.23,.13,plate,0,0,z);cylinder(gun,.14,.19,.25,black,0,0,3.95);barrels.push(gun);for(let z of [-.8,-.4,0,.4])box(head,.35,.06,.16,gunmetal,x,2.57,z)}
 for(let side of [-1,1]){box(head,.07,1.4,1.3,gunmetal,side*2.01,1,-.4);for(let j=0;j<5;j++)box(head,.09,.07,.8,black,side*2.06,.65+j*.2,-.4);box(head,.9,.12,1.4,plate,side*.9,2.59,-.45)}
 const lamp=sphere(head,.075,new T.MeshBasicMaterial({color:0xff6847,toneMapped:false}),0,2.38,1.7);root.userData.head=head;root.userData.barrels=barrels;root.userData.lamp=lamp;root.userData.muzzles=[new T.Vector3(-.86,1.5,5.38),new T.Vector3(.86,1.5,5.38)];root.userData.wall=wall;return root}

export function reactorBoss(){
 const g=new T.Group();g.name='Death Star II main reactor · polar tower assembly';g.userData.turrets=[];g.userData.muzzles=[];
 const metal=material(0x777c7a,.6,.75),rib=material(0x303b40,.6,.72);if(surfaceMap){metal.map=surfaceMap;metal.bumpMap=surfaceMap;metal.bumpScale=.07;}
 // Opposing tapered towers suspend the compact central reactor inside an enormous void.
 for(const sign of [-1,1]){
  for(let i=0;i<7;i++){const y=sign*(3+i*1.8),r=1.3+i*.29;const tower=cylinder(g,r,r+.3,1.85,metal,0,y,0);tower.rotation.x=sign>0?0:Math.PI;const collar=cylinder(g,r+.35,r+.35,.22,rib,0,y,0);collar.rotation.x=0;for(let j=0;j<8;j++){const a=j*Math.PI/4;rod(g,[Math.cos(a)*r,y-.8,Math.sin(a)*r],[Math.cos(a)*(r+.26),y+.8,Math.sin(a)*(r+.26)],.07,rib)}}
  const regulator=cylinder(g,2.5,2.5,.6,metal,0,sign*3,0);regulator.rotation.x=0;
 }
 const hot=new T.MeshStandardMaterial({color:0xe3d8c4,emissive:0xffa75e,emissiveIntensity:.65,metalness:.4,roughness:.4});
 const core=sphere(g,1.7,hot);core.scale.y=.75;
 for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(g,[Math.cos(a)*2.2,-2.5,Math.sin(a)*2.2],[Math.cos(a)*2.2,2.5,Math.sin(a)*2.2],.12,metal)}
 for(let i=0;i<20;i++){const a=i*Math.PI/10,r=8.7,y=(i%2?1:-1)*4.5;const pivot=new T.Group();pivot.position.set(Math.cos(a)*r,y,Math.sin(a)*r);g.add(pivot);sphere(pivot,.6,rib);box(pivot,1.1,.55,.9,metal,0,.25,0);for(const x of [-.2,.2])cylinder(pivot,.09,.14,1.8,rib,x,.3,1);const lamp=sphere(pivot,.1,new T.MeshBasicMaterial({color:0xff4c32}),0,.6,.4);g.userData.turrets.push({mesh:pivot,hp:5,fire:1+Math.random()*2,lamp})}
 g.userData.core=core;g.userData.coreShield=sphere(g,2.4,new T.MeshBasicMaterial({color:0x66cfff,transparent:true,opacity:0,depthWrite:false}));g.userData.corePosition=new T.Vector3(0,0,1.8);g.userData.burstPosition=new T.Vector3();g.userData.beamPorts=[new T.Vector3(-2,0,2),new T.Vector3(2,0,2)];return g
}

import {boxContact} from './flight-contacts.js?v=9c';
import * as T from './vendor/three.module.js';
import {imperialMaterials} from './models.js?v=7a';
import {TRENCH_LENGTH as LENGTH,trenchRandom as random,trenchProfile,trenchSection} from './trench-layout.js';
export function createTrench(scene,renderer){const root=new T.Group();scene.add(root);const unit=new T.BoxGeometry(1,1,1),wedge=unit.clone();for(let i=0;i<wedge.attributes.position.count;i++)if(wedge.attributes.position.getY(i)>0)wedge.attributes.position.setX(i,wedge.attributes.position.getX(i)*.35);wedge.computeVertexNormals();const pipe=new T.CylinderGeometry(.5,.5,1,10);pipe.rotateX(Math.PI/2);
 const source=imperialMaterials().frame;
 const metal=(color)=>{const m=new T.MeshStandardMaterial({color,roughness:.86,metalness:.18,map:source.map,bumpMap:source.map,bumpScale:.018});m.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 vTrenchPosition;varying vec3 vTrenchNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
vTrenchPosition=(instanceMatrix*vec4(transformed,1.)).xyz;vTrenchNormal=normalize(mat3(instanceMatrix)*objectNormal);
#else
vTrenchPosition=transformed;vTrenchNormal=objectNormal;
#endif`);
  shader.fragmentShader='varying vec3 vTrenchPosition;varying vec3 vTrenchNormal;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
vec3 weight=pow(abs(normalize(vTrenchNormal)),vec3(5.));weight/=max(.001,weight.x+weight.y+weight.z);vec3 p=vTrenchPosition*.11;
vec3 weather=texture2D(map,vec2(.503)+fract(p.zy)*.494).rgb*weight.x+texture2D(map,vec2(.503)+fract(p.xz)*.494).rgb*weight.y+texture2D(map,vec2(.503)+fract(p.xy)*.494).rgb*weight.z;
diffuseColor.rgb*=mix(vec3(.87),weather,.42);
#endif`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#if defined(USE_BUMPMAP) && defined(USE_MAP)
float height=dot(weather,vec3(.299,.587,.114));normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(height),dFdy(height))*bumpScale,faceDirection);
#endif`);
 };m.customProgramCacheKey=()=> 'trench-neutral-plate-v8';return m};
 const materials={base:metal(0x81878a),plate:metal(0xb8bdbe),pale:metal(0xd0d1cc),dark:metal(0x434b50),edge:metal(0x929c9e),void:new T.MeshStandardMaterial({color:0x11171b,roughness:1}),red:new T.MeshBasicMaterial({color:0xc95e44,toneMapped:false}),white:new T.MeshBasicMaterial({color:0xc9d8d8,toneMapped:false})};
 const segments=[];let distance=0,furthest=5;
 function build(index){const layout=trenchSection(index),g=new T.Group();g.userData.index=index;g.userData.contacts=[];g.position.z=distance-index*LENGTH;root.add(g);const batches=new Map();
  function add(kind,material,w,h,d,x,y,z,rx=0,ry=0,rz=0){if(!['red','white','void'].includes(material)&&Math.max(w,h,d)>.5){const vertical=Math.abs(rx)>1;const hy=vertical?d/2:h/2,hz=vertical?h/2:d/2;g.userData.contacts.push({min:{x:x-w/2,y:y-hy,z:z-hz},max:{x:x+w/2,y:y+hy,z:z+hz}})}const key=kind+':'+material;if(!batches.has(key))batches.set(key,{kind,material,items:[]});batches.get(key).items.push({w,h,d,x,y,z,rx,ry,rz})}
  const box=(m,w,h,d,x,y,z)=>add('box',m,w,h,d,x,y,z);
  box('dark',64,2,LENGTH,0,-5,-80);
  // Contiguous structural walls. All relief stays outside the player’s flight envelope.
  for(const side of [-1,1]){box('base',5,layout.zone.height+12,LENGTH,side*34.5,layout.zone.height/2, -80);box('dark',180,3,LENGTH,side*125,layout.zone.height+4,-80)}
  for(const b of layout.bays){const s=b.side,z=-b.z,w=b.width,H=b.height,r=n=>random(b.seed+n),face=s*(32-b.relief/2),cap=H-3;
   // Large overlapping plates, deep seams and uneven top-edge architecture replace equal ribs.
   box(r(1)>.5?'plate':'base',b.relief,H*.52,w-.45,face,H*.24,z);
   box(r(2)>.4?'pale':'edge',b.relief*.7,H*.3,w*(.68+r(3)*.23),s*(31.7-b.relief*.25),H*.67,z+(r(4)-.5)*w*.15);
   box('dark',.28,.2,w-1,s*(31.7-b.relief),H*.5,z);
   box('edge',3.3,1.3,w*.82,s*31.2,cap,z);
   if(b.type==='buttress'||b.type==='citadel'){const n=b.type==='citadel'?3:2;for(let i=0;i<n;i++){const zz=z-w*.35+i*w*.7/Math.max(1,n-1);add('wedge','pale',3.4,H*.78,1.7+r(i)*1.3,s*30.2,H*.44,zz,0,s<0?Math.PI:0);box('dark',.12,H*.67,.5,s*28.45,H*.42,zz);box('edge',4.4,2.1,3.9,s*30,H*.12,zz)}}
   if(b.type==='recess'||b.type==='citadel'){const y=H*.46,ww=w*.68,hh=H*.43;box('void',.12,hh,ww,s*(31.3-b.relief),y,z);for(const offset of [-1,1]){box('edge',1.1,.6,ww+1,s*(30.9-b.relief),y+offset*hh/2,z);box('plate',1.1,hh,.6,s*(30.9-b.relief),y,z+offset*ww/2)}for(let i=0;i<5;i++){box('dark',.8,hh*.72,.6,s*(31-b.relief),y,z-ww*.42+i*ww*.21);box('pale',1,.65,1.6,s*(30.5-b.relief),y-hh*.35,z-ww*.4+i*ww*.2)}}
   if(b.type==='vents'){for(let j=0;j<2;j++){const yy=H*(.28+j*.31);box('void',.18,H*.2,w*.8,s*(31.4-b.relief),yy,z);for(let i=0;i<9;i++)box('edge',.7,.22,w*.76,s*(31.1-b.relief),yy-H*.085+i*H*.02,z)}}
   if(b.type==='pipes'){for(let i=0;i<4;i++){const yy=H*.24+i*2.3;add('pipe',i%2?'dark':'edge',.5+i*.12,.5+i*.12,w*.88,s*(30.8-b.relief),yy,z);for(let j=0;j<3;j++)box('pale',1.25,.18,.45,s*(30.6-b.relief),yy,z-w*.3+j*w*.3)}for(let i=0;i<2;i++)add('pipe','dark',.9,.9,H*.7,s*(31-b.relief),H*.47,z+(i?1:-1)*w*.3,Math.PI/2)}
   // Kitbashed machinery clusters: grouped at several scales, rather than isolated random cubes.
   for(let k=0;k<7;k++){const yy=4+r(20+k)*H*.6,zz=z+(r(30+k)-.5)*w*.7;box('dark',.6,2+r(k)*3,3+r(k+6)*5,s*(31-b.relief),yy,zz);for(let j=0;j<5;j++)box(j%3?'edge':'pale',.7+r(j+k)*.6,.35+r(j+40)*.65,.6+r(j+8)*1.4,s*(30.55-b.relief),yy-1+j*.55,zz+(r(j+22)-.5)*2.5)}
   // Small raised access skins and hairline joints supply the miniature’s layered panel scale.
   if(b.type!=='recess'&&b.type!=='citadel')for(let k=0;k<14;k++){const yy=2+r(100+k)*H*.76,zz=z+(r(130+k)-.5)*w*.85;box(k%3?'edge':'dark',.09,.7+r(170+k)*3,1+r(150+k)*4,s*(31.5-b.relief),yy,zz);if(k%4===0)box('pale',.15,.12,2.5,s*(31.4-b.relief),yy,zz)}
   if(r(9)>.62){box('dark',4,2,w*.47,s*29.9,-1.4,z);add('wedge','edge',3,2,w*.45,s*29.5,.2,z)}
   // The original miniature has a jagged city-like rim, not a uniform tunnel ceiling.
   const x=s*(36+r(6)*13);box('base',5+r(7)*9,2+r(8)*7,w*.4,x,H+3,z);box('plate',3,1.2,w*.5,x,H+7,z);if(r(10)>.62)add('wedge','edge',4,7+r(11)*8,4,s*(38+r(12)*9),H+9,z);
   if(r(13)>.72)box(r(14)>.8?'red':'white',.16,.2,.65,s*(30.35-b.relief),4+r(15)*H*.7,z+w*.25);
  }
  // Unequal floor islands and inset mechanical channels. No runway stripes or repeated lane lights.
  let z=0,row=0;while(z<LENGTH){const seed=index*201+row*17,depth=Math.min(LENGTH-z,9+random(seed)*16);let x=-32,col=0;while(x<31.99){const width=Math.min(32-x,7+random(seed+col*3+1)*12),cx=x+width/2,zz=-z-depth/2,h=.12+random(seed+col+2)*.38;box(random(seed+col+6)>.5?'plate':'base',width-.4,h,depth-.4,cx,-3.95+h/2,zz);if(random(seed+col+4)>.42){box('dark',width*.65,.12,depth*.62,cx,-3.73+h,zz);for(let j=0;j<3;j++)box('edge',.2,.16,depth*.5,cx-width*.24+j*.85,-3.58+h,zz)}if(Math.abs(cx)>21&&random(seed+col+8)>.5){box('edge',width*.6,1.1,depth*.6,cx,-3.05,zz);add('wedge','plate',width*.5,.8,depth*.5,cx,-2.1,zz)}x+=width;col++}z+=depth;row++}
  // Upper surface tiles remain visible at the horizon and as the fighter climbs out.
  for(let i=0;i<38;i++){const n=index*107+i*9,s=i%2?1:-1;box(i%3?'edge':'plate',4+random(n)*13,.3+random(n+1)*2.4,3+random(n+2)*11,s*(38+random(n+3)*75),layout.zone.height+6,-random(n+4)*LENGTH)}
  const matrix=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),scale=new T.Vector3(),euler=new T.Euler();for(const batch of batches.values()){const geometry=batch.kind==='wedge'?wedge:batch.kind==='pipe'?pipe:unit,mesh=new T.InstancedMesh(geometry,materials[batch.material],batch.items.length);for(let i=0;i<batch.items.length;i++){const a=batch.items[i];p.set(a.x,a.y,a.z);scale.set(a.w,a.h,a.d);q.setFromEuler(euler.set(a.rx,a.ry,a.rz));matrix.compose(p,q,scale);mesh.setMatrixAt(i,matrix)}mesh.castShadow=batch.material!=='void';mesh.receiveShadow=true;g.add(mesh)}return g;
 }
 for(let i=-1;i<=5;i++)segments.push(build(i));
 const stars=new Float32Array(900*3);for(let i=0;i<900;i++){const a=random(i*4)*Math.PI*2;stars.set([Math.cos(a)*800,100+random(i*4+1)*650,Math.sin(a)*800],i*3)}const starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.BufferAttribute(stars,3));root.add(new T.Points(starGeo,new T.PointsMaterial({color:0xdbe8ff,size:1.1,fog:false,transparent:true,opacity:.7,depthWrite:false})));
 const planetMap=new T.TextureLoader().load(new URL('assets/materials/ship-surfaces-v1.png',import.meta.url).href);planetMap.colorSpace=T.SRGBColorSpace;planetMap.repeat.set(.494,.494);planetMap.offset.set(.503,.503);
 function dispose(g){root.remove(g);g.traverse(o=>{if(o.isInstancedMesh)o.dispose()})}
 return {contacts(p,half){const hits=[];for(const g of segments){if(p.z<g.position.z-LENGTH-half.z||p.z>g.position.z+half.z)continue;for(const box of g.userData.contacts){if(p.x+half.x<box.min.x||p.x-half.x>box.max.x||p.y+half.y<box.min.y||p.y-half.y>box.max.y||p.z+half.z<box.min.z+g.position.z||p.z-half.z>box.max.z+g.position.z)continue;const hit=boxContact(p,half,box,g.position.z);if(hit)hits.push(hit)}}return hits},get region(){return trenchProfile(distance).name},get distance(){return distance},sandMap:planetMap,reset(){for(const g of segments)dispose(g);segments.length=0;distance=0;furthest=5;for(let i=-1;i<=5;i++)segments.push(build(i));this.setAltitude(0)},setAltitude(a){root.visible=a<.94;scene.fog.density=.0015*(1-a)},update(dt,speed){distance+=dt*speed;for(let i=0;i<segments.length;i++){const g=segments[i];g.position.z=distance-g.userData.index*LENGTH;if(g.position.z>LENGTH+60){dispose(g);segments[i]=build(++furthest)}}}};
}

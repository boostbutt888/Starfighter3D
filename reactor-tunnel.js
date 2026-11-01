import * as T from './vendor/three.module.js';
// Lightweight, recyclable Death Star II interior corridor. All geometry is local to this mission.
export function createReactorTunnel(group){
 const steel=new T.MeshStandardMaterial({color:0x515c69,metalness:.68,roughness:.48}),panel=new T.MeshStandardMaterial({color:0x89939c,metalness:.55,roughness:.6}),glow=new T.MeshBasicMaterial({color:0x42c8ff});
 const segments=[],length=42,count=10,halfWidth=25,ceiling=24,floor=-8;
 const geo=new T.BoxGeometry(1,1,1);
 function slab(parent,w,h,d,x,y,z,mat){const m=new T.Mesh(geo,mat);m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m}
 for(let i=0;i<count;i++){const seg=new T.Group();group.add(seg);segments.push(seg);slab(seg,2,32,length,halfWidth+1,8,0,steel);slab(seg,2,32,length,-halfWidth-1,8,0,steel);slab(seg,54,2,length,0,floor-1,0,steel);slab(seg,54,2,length,0,ceiling+1,0,steel);for(let z of [-18,0,18]){for(let x of [-24,24]){slab(seg,2,28,1.4,x,8,z,panel);slab(seg,1,1,3,x*.93,14,z,glow)}slab(seg,50,1.3,1.4,0,ceiling,z,panel);slab(seg,50,1.3,1.4,0,floor,z,panel)}}
 const chamber=new T.Group();group.add(chamber);chamber.visible=false;chamber.position.set(0,8,-65);
 const shell=new T.Mesh(new T.SphereGeometry(185,48,24),new T.MeshStandardMaterial({color:0x252d34,metalness:.55,roughness:.9,side:T.BackSide}));chamber.add(shell);
 const ringGeo=new T.TorusGeometry(178,1.3,5,64);for(let y of [-110,-60,0,60,110]){const ring=new T.Mesh(ringGeo,panel);ring.rotation.x=Math.PI/2;ring.position.y=y;ring.scale.setScalar(Math.sqrt(1-(y/185)**2));chamber.add(ring)}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;slab(chamber,2,210,3,Math.cos(a)*145,0,Math.sin(a)*145,steel);for(let j=0;j<8;j++)slab(chamber,1.5,1,4,Math.cos(a)*144,-85+j*24,Math.sin(a)*144,glow)}
 let inChamber=false;function setChamber(on){inChamber=on;chamber.visible=on;for(const seg of segments)seg.visible=!on}
 let distance=0,altitude=0;
 function position(){for(let i=0;i<count;i++)segments[i].position.z=-i*length+((distance%length)+length)%length}
 position();
 return {get region(){return Math.floor(distance/(length*count))},get distance(){return distance},get sandMap(){return null},setChamber,reset(){setChamber(false);distance=0;altitude=0;position()},setAltitude(a){altitude=a},update(dt,speed){distance+=dt*speed;position()},contacts(p,half){const hits=[];if(inChamber)return hits;if(p.x-half.x< -halfWidth)hits.push({axis:'x',normal:1,depth:-halfWidth-(p.x-half.x)});if(p.x+half.x>halfWidth)hits.push({axis:'x',normal:-1,depth:p.x+half.x-halfWidth});if(p.y-half.y<floor)hits.push({axis:'y',normal:1,depth:floor-(p.y-half.y)});if(p.y+half.y>ceiling)hits.push({axis:'y',normal:-1,depth:p.y+half.y-ceiling});return hits}}
}

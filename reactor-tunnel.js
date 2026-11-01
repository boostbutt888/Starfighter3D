import {obstacleContact} from './incursion-rules.js';
import * as T from './vendor/three.module.js';
// Lightweight, recyclable Death Star II interior corridor. All geometry is local to this mission.
export function createReactorTunnel(group){
 const steel=new T.MeshStandardMaterial({color:0x515c69,metalness:.68,roughness:.48}),panel=new T.MeshStandardMaterial({color:0x89939c,metalness:.55,roughness:.6}),glow=new T.MeshBasicMaterial({color:0x42c8ff});
 const obstacles=[];const segments=[],length=42,count=10,halfWidth=25,ceiling=24,floor=-8;
 const geo=new T.BoxGeometry(1,1,1);
 function slab(parent,w,h,d,x,y,z,mat){const m=new T.Mesh(geo,mat);m.scale.set(w,h,d);m.position.set(x,y,z);parent.add(m);return m}
 for(let i=0;i<count;i++){const seg=new T.Group();group.add(seg);segments.push(seg);slab(seg,2,32,length,halfWidth+1,8,0,steel);slab(seg,2,32,length,-halfWidth-1,8,0,steel);slab(seg,54,2,length,0,floor-1,0,steel);slab(seg,54,2,length,0,ceiling+1,0,steel);for(let z of [-18,0,18]){for(let x of [-24,24]){slab(seg,2,28,1.4,x,8,z,panel);slab(seg,1,1,3,x*.93,14,z,glow)}slab(seg,50,1.3,1.4,0,ceiling,z,panel);slab(seg,50,1.3,1.4,0,floor,z,panel)}}
 // Service pipes, alternating bridge decks and offset maintenance apertures.
 for(let i=0;i<count;i++){const seg=segments[i];const gapCenter=i%2?4:-4,gapWidth=34;
 function hazard(w,h,d,x,y,z){slab(seg,w,h,d,x,y,z,panel);obstacles.push({segment:seg,w,h,d,x,y,z});}
 const left=gapCenter-gapWidth/2,right=gapCenter+gapWidth/2;
 hazard(left+25,32,2,(-25+left)/2,8,-17);hazard(25-right,32,2,(25+right)/2,8,-17);
 hazard(46,3,4,0,i%2?19:-3,2);
 for(const side of [-1,1])for(let j=0;j<3;j++){const pipe=new T.Mesh(new T.CylinderGeometry(.65,.65,42,8),steel);pipe.rotation.x=Math.PI/2;pipe.position.set(side*(22-j*.8),5+j*4,0);seg.add(pipe);}
 for(let x=-18;x<20;x+=4)slab(seg,.5,.35,5,x,i%2?17.4:-1.4,2,glow);
 }
 const chamber=new T.Group();group.add(chamber);chamber.visible=false;chamber.position.set(0,8,-65);
 const shell=new T.Mesh(new T.SphereGeometry(185,48,24),new T.MeshStandardMaterial({color:0x252d34,metalness:.55,roughness:.9,side:T.BackSide}));chamber.add(shell);
 const ringGeo=new T.TorusGeometry(178,1.3,5,64);for(let y of [-110,-60,0,60,110]){const ring=new T.Mesh(ringGeo,panel);ring.rotation.x=Math.PI/2;ring.position.y=y;ring.scale.setScalar(Math.sqrt(1-(y/185)**2));chamber.add(ring)}
 for(let i=0;i<24;i++){const a=i*Math.PI/12;slab(chamber,2,210,3,Math.cos(a)*145,0,Math.sin(a)*145,steel);for(let j=0;j<8;j++)slab(chamber,1.5,1,4,Math.cos(a)*144,-85+j*24,Math.sin(a)*144,glow)}
 const fill=new T.HemisphereLight(0xd2eaff,0x607080,2.3);chamber.add(fill);for(const x of [-55,55]){const l=new T.PointLight(0xc2e7ff,450,240,1);l.position.set(x,30,30);chamber.add(l)}
 const exit=new T.Mesh(new T.TorusGeometry(23,2,6,40),glow);exit.position.set(0,0,-150);chamber.add(exit);
 let leaving=false,exitTravel=0;let inChamber=false;function setChamber(on){inChamber=on;chamber.visible=on;for(const seg of segments)seg.visible=!on}
 let distance=0,altitude=0;
 function position(){for(let i=0;i<count;i++)segments[i].position.z=((distance-i*length+length)%(length*count)+length*count)%(length*count)-length}
 position();
 return {get region(){return Math.floor(distance/(length*count))},get distance(){return distance},get sandMap(){return null},startEscape(){leaving=true;exitTravel=0},setChamber,setVisible(on){group.visible=on},reset(){leaving=false;exitTravel=0;chamber.position.z=-65;group.visible=true;setChamber(false);distance=0;altitude=0;position()},setAltitude(a){altitude=a},update(dt,speed){if(leaving&&inChamber){exitTravel+=dt*speed;chamber.position.z=-65+exitTravel;if(exitTravel>=224){setChamber(false);leaving=false}}distance+=dt*speed;position()},contacts(p,half){const hits=[];if(inChamber)return hits;for(const b of obstacles){const hit=obstacleContact(p,half,{...b,z:b.z+b.segment.position.z});if(hit)hits.push(hit);}if(p.x-half.x< -halfWidth)hits.push({axis:'x',normal:1,depth:-halfWidth-(p.x-half.x)});if(p.x+half.x>halfWidth)hits.push({axis:'x',normal:-1,depth:p.x+half.x-halfWidth});if(p.y-half.y<floor)hits.push({axis:'y',normal:1,depth:floor-(p.y-half.y)});if(p.y+half.y>ceiling)hits.push({axis:'y',normal:-1,depth:p.y+half.y-ceiling});return hits}}
}

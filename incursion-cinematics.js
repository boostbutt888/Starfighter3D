import * as T from './vendor/three.module.js';
const ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
export function createDeathStarII(){
 const root=new T.Group(),shell=new T.Group();root.add(shell);
 const grey=new T.MeshStandardMaterial({color:0x858c92,metalness:.45,roughness:.84,side:T.DoubleSide}),dark=new T.MeshStandardMaterial({color:0x343c45,metalness:.55,roughness:.8,side:T.DoubleSide}),glow=new T.MeshBasicMaterial({color:0x93d6f5});
 // Incomplete second station: a lunar sphere with a huge unfinished northern hemisphere.
 // Geometry is deliberately low-poly enough for mobile WebGL.
 const r=140,lat=64,lon=128,positions=[],indices=[],colors=[],uvs=[];
 for(let i=0;i<=lat;i++){const theta=i*Math.PI/lat;for(let j=0;j<=lon;j++){const phi=j*2*Math.PI/lon;const x=Math.sin(theta)*Math.cos(phi),y=Math.cos(theta),z=Math.sin(theta)*Math.sin(phi);const missing=(y>.18&&Math.sin(phi*5+theta*7)+Math.cos(phi*9-theta*4)>.12)||(y>.6&&x>.05);positions.push(r*x,r*y,r*z);uvs.push(j/lon,1-i/lat);const shade=.65+.3*Math.abs(Math.sin(i*2.7+j*1.1));colors.push(shade,shade,shade)}}
 for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){const p=i*(lon+1)+j;const y=Math.cos((i+.5)*Math.PI/lat),phi=(j+.5)*2*Math.PI/lon,missing=(y>.18&&Math.sin(phi*5+(i+.5)*Math.PI/lat*7)+Math.cos(phi*9-(i+.5)*Math.PI/lat*4)>.12)||(y>.6&&Math.cos(phi)>.05);if(!missing)indices.push(p,p+lon+1,p+1,p+1,p+lon+1,p+lon+2)}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();const surface=new T.Mesh(geo,new T.MeshStandardMaterial({color:0xb8bdc0,metalness:.28,roughness:.8,side:T.DoubleSide}));shell.add(surface);
 if(typeof document!=='undefined'&&document.createElementNS){const map=new T.TextureLoader().load(new URL('assets/materials/death-star-hull-v2.jpg',import.meta.url).href);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(4,2);map.anisotropy=4;surface.material.map=map;surface.material.bumpMap=map;surface.material.bumpScale=.45;}
 // Circumferential trenches and a concave superlaser bowl, with a raised rim.
 for(let y of [-72,-35,0,35,72]){const rr=Math.sqrt(r*r-y*y)+.15;const belt=new T.Mesh(new T.TorusGeometry(rr,.38,4,128),dark);belt.rotation.x=Math.PI/2;belt.position.y=y;shell.add(belt)}
 const rim=new T.Mesh(new T.TorusGeometry(25,1,8,64),grey);rim.position.set(-57,65,105);rim.rotation.x=-.8;shell.add(rim);

 const ring=new T.Mesh(new T.TorusGeometry(132,2,5,72),dark);ring.rotation.x=Math.PI/2;ring.position.y=-7;shell.add(ring);
 const dish=new T.Mesh(new T.SphereGeometry(25,24,12,0,Math.PI*2,0,Math.PI*.48),dark);dish.position.set(-57,65,105);dish.rotation.x=-.8;dish.material=dark.clone();dish.material.side=T.BackSide;shell.add(dish);
 const scaffold=new T.Group();shell.add(scaffold);
 const beamGeo=new T.BoxGeometry(1,1,1);for(let i=0;i<220;i++){const a=i*2.399963,rad=35+Math.sqrt(i/130)*100,y=40+Math.sin(i*3.1)*50;const b=new T.Mesh(beamGeo,i%4?grey:dark);b.position.set(Math.cos(a)*rad,y,Math.sin(a)*rad);b.scale.set(1.2,1.3,8+i%5*3);b.rotation.y=a;scaffold.add(b)}
 // Bright circular tunnel aperture on the visible near hemisphere.
 const aperture=new T.Mesh(new T.TorusGeometry(17,2,8,48),glow);aperture.position.set(0,-16,137);root.add(aperture);
 const key=new T.DirectionalLight(0xeaf1ff,2.5);key.position.set(-220,130,300);root.add(key);root.add(key.target);const fill=new T.HemisphereLight(0x7895b7,0x0e1724,.65);root.add(fill);
 return {root,shell,aperture,radius:r};
}
export class IncursionIntro{
 constructor(scene,camera){this.scene=scene;this.camera=camera;this.station=createDeathStarII();this.station.root.position.set(0,0,-560);this.station.root.visible=false;scene.add(this.station.root);this.active=false;this.time=0;}
 start(ship,caption,done){this.fogDensity=this.scene.fog?.density;if(this.scene.fog)this.scene.fog.density=0;this.ship=ship;this.caption=caption;this.done=done;this.time=0;this.active=true;this.station.root.visible=true;this.ship.visible=true;this.ship.scale.setScalar(1);this.caption('ENDOR SECTOR','DEATH STAR II · MOON-SIZED BATTLE STATION');}
 update(dt){if(!this.active)return;this.time+=dt;const t=this.time,u=ease(t/12);this.station.root.rotation.set(0,0,0);this.station.root.position.set(0,24,-5000+u*4890);this.ship.position.set(0,8,-10);this.ship.rotation.set(0,0,0);this.camera.position.set(14*(1-u),16,52);this.camera.lookAt(0,8,-500);if(t>7&&t<7+dt)this.caption('REACTOR ACCESS SHAFT','THE STATION FILLS THE SKY · ENTER THE TUNNEL');if(t>=12){if(this.scene.fog&&this.fogDensity!==undefined)this.scene.fog.density=this.fogDensity;this.active=false;this.station.root.visible=false;this.ship.position.set(0,8,8);this.camera.position.set(0,13,30);this.camera.lookAt(0,6,-35);this.done?.()}}

 reset(){if(this.scene.fog&&this.fogDensity!==undefined)this.scene.fog.density=this.fogDensity;this.active=false;this.station.root.visible=false;}
}

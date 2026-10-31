import * as T from './vendor/three.module.js';
export class TargetDisplay{
 constructor(marker,lead){this.marker=marker;this.lead=lead;}
 hide(){this.marker.style.display=this.lead.style.display='none'}
 update(target,aim,camera,width,height){if(!target){this.hide();return}camera.updateMatrixWorld();const center=target.position.clone().project(camera);if(center.z>1||center.z< -1){this.hide();return}let radius=target.radius||2.5;let right=target.position.clone().add(new T.Vector3(radius,0,0)).project(camera);let size=Math.max(24,Math.min(150,Math.abs(right.x-center.x)*width*1.15));const m=this.marker;m.style.display='block';m.style.left=((center.x*.5+.5)*width)+'px';m.style.top=((-center.y*.5+.5)*height)+'px';m.style.width=size+'px';m.style.height=size*.8+'px';m.classList.toggle('shielded',!!target.shielded);let p=aim.clone().project(camera);this.lead.style.display='block';this.lead.style.left=((p.x*.5+.5)*width)+'px';this.lead.style.top=((-p.y*.5+.5)*height)+'px';}
}

// Shared combat and spatial-audio rules.
export const HIT_DAMAGE={shielded:18,unshielded:30,beam:40,collision:40};
export const HIT_GRACE={rookie:.65,pilot:.48,ace:.36};
export function hitMotion(age){if(age<0||age>.46)return {pitch:0,yaw:0,roll:0};const decay=(1-age/.46)**2;return {pitch:Math.sin(age*67)*.075*decay,yaw:Math.sin(age*51)*.04*decay,roll:Math.sin(age*79)*.13*decay}}
export function tieProximity(position,listener,type='fighter'){const dx=position.x-listener.x,dy=position.y-listener.y,dz=position.z-listener.z,distance=Math.hypot(dx,dy,dz);const volume=.32/(1+(distance/24)**2)*(dz>12?Math.max(0,1-(dz-12)/45):1);return {volume:distance>220?0:volume,pan:Math.max(-.88,Math.min(.88,dx/36)),rate:(type==='interceptor'?1.12:type==='bomber'?.79:1)*(dz<0?1.09:.83),distance}}
export function trenchGunPlacement(serial){const wall=serial%4===1||serial%4===2,side=serial%4<2?1:-1;return {wall,side,x:wall?side*31:side*16,y:wall?(serial%3===0?17:10):-3.9,z:-165-(serial%2)*30}}

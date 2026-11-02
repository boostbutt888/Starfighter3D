// Pure gameplay calculations shared with regression tests.
export const PICKUP_TYPES={
 spread:{title:'SPREAD UPGRADED',icon:'P',color:0xffc353,css:'#ffc353'},
 laser:{title:'LASER UPGRADED',icon:'L',color:0x80f78c,css:'#80f78c'}
};
export function pickupInMagnetRange(p,s){let dx=p.x-s.x,dy=p.y-s.y,dz=p.z-s.z;return dz>-23.8&&dz<11.2&&dx*dx+dy*dy+(dz*.32)**2<9.8**2}
export function magnetStep(p,s,dt,age){const dx=s.x-p.x,dy=s.y-p.y,dz=s.z-p.z;let dist=Math.hypot(dx,dy,dz);if(dist===0)return {...s};let f=Math.min(1,(22+age*38)*dt/dist);return {x:p.x+dx*f,y:p.y+dy*f,z:p.z+dz*f}}
export function applyPickup(resources,kind){let next={...resources};if(kind==='spread'){next.spreadLevel=Math.min(6,next.spreadLevel+1);next.weapon=0}if(kind==='laser'){next.laserLevel=Math.min(4,next.laserLevel+1);next.weapon=1}return next}
export function segmentHitsSphere(a,b,p,r){let x=b.x-a.x,y=b.y-a.y,z=b.z-a.z;let len=x*x+y*y+z*z;let t=len?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y+(p.z-a.z)*z)/len)):0;return (a.x+x*t-p.x)**2+(a.y+y*t-p.y)**2+(a.z+z*t-p.z)**2<=r*r}
export function applyBombToBoss(turrets,commandHP){let live=turrets.filter(t=>t.hp>0);if(live.length){live.forEach(t=>t.hp=Math.max(0,t.hp-3));return commandHP}return Math.max(0,commandHP-22)}

export function groundIntercept(origin,target,speed=145,scrollSpeed=24){const dx=target.x-origin.x,dy=target.y-origin.y,dz=target.z-origin.z,a=scrollSpeed**2-speed**2,b=2*dz*scrollSpeed,c=dx*dx+dy*dy+dz*dz;const time=(-b-Math.sqrt(Math.max(0,b*b-4*a*c)))/(2*a);return {x:target.x,y:target.y,z:target.z+scrollSpeed*Math.max(0,time),time:Math.max(0,time)}}

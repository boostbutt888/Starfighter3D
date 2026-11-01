export const TUNNEL_SPEED=36; // +50% over the original 24 units/s
export const ESCAPE_SPEED=36; // +50% over the original, matching entry
export const ESCAPE_DURATION=36;
export function obstacleContact(p,half,b){
 if(Math.abs(p.z-b.z)>half.z+b.d/2)return null;
 const dx=half.x+b.w/2-Math.abs(p.x-b.x),dy=half.y+b.h/2-Math.abs(p.y-b.y);
 if(dx<=0||dy<=0)return null;
 return dx<dy?{axis:'x',normal:p.x<b.x?-1:1,depth:dx}:{axis:'y',normal:p.y<b.y?-1:1,depth:dy};
}

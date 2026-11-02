import {tierMultiplier} from './campaign.js?v=11';
export const TUNNEL_SPEED=36; // +50% over the original 24 units/s
export const ESCAPE_SPEED=36; // +50% over the original, matching entry
export const ESCAPE_DURATION=36;
export function obstacleContact(p,half,b){
 if(Math.abs(p.z-b.z)>half.z+b.d/2)return null;
 const dx=half.x+b.w/2-Math.abs(p.x-b.x),dy=half.y+b.h/2-Math.abs(p.y-b.y);
 if(dx<=0||dy<=0)return null;
 return dx<dy?{axis:'x',normal:p.x<b.x?-1:1,depth:dx}:{axis:'y',normal:p.y<b.y?-1:1,depth:dy};
}
export function tunnelSegmentZ(distance,index,length,count){const span=length*count;return length-((index*length-distance+length)%span+span)%span;}
export function tunnelLayout(serial,seed=1){
 let n=(Math.imul(serial+1,1597334677)^seed)>>>0;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 const kind=Math.floor(random()*5),width=kind===3?26:28+random()*8,height=kind===0?12:14+random()*6,cx=(random()-.5)*12,cy=kind===1?3:kind===2?13:5+random()*6;
 const left=cx-width/2,right=cx+width/2,bottom=cy-height/2,top=cy+height/2,d=kind===3?24:4;
 const boxes=[{w:left+25,h:32,d,x:(-25+left)/2,y:8,z:-12},{w:25-right,h:32,d,x:(25+right)/2,y:8,z:-12},{w:width,h:bottom+8,d,x:cx,y:(-8+bottom)/2,z:-12},{w:width,h:24-top,d,x:cx,y:(24+top)/2,z:-12}];
 const side=random()<.5?-1:1;boxes.push({w:17,h:2.8,d:5,x:side*16,y:kind%2?top+1.4:bottom-1.4,z:24});
 return {kind,boxes:boxes.filter(b=>b.w>.1&&b.h>.1),opening:{x:cx,y:cy,w:width,h:height,z:-12}};
}
// Difficulty adds 50 percentage points per tier relative to the previous escape speed.
export function escapeProfile(difficulty='rookie'){
 const multiplier=1.5*tierMultiplier(difficulty);
 const speed=ESCAPE_SPEED*multiplier;
 return {speed,duration:ESCAPE_SPEED*ESCAPE_DURATION/speed,multiplier};
}
export function yavinLandingPose(time){
 const u=Math.max(0,Math.min(1,time/10)),e=u*u*(3-2*u),angle=.95-e*1.35;
 return {ship:{x:0,y:22*(1-e)+1.5,z:15-e*72},camera:{x:Math.sin(angle)*(70-e*18),y:24-e*10,z:-45+Math.cos(angle)*(85-e*20)},look:{x:0,y:5-e*2,z:-20-e*37}};
}

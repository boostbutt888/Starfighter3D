import {stickVector} from './flight-contacts.js?v=9c';
export function installMobile({playing,onWeapon,onBomb,onFire}){const touch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;document.body.classList.toggle('touchDevice',touch);const stick=document.getElementById('flightStick'),thumb=document.getElementById('stickThumb'),vector={x:0,y:0};let active=null,origin=null;
 function reset(){active=null;vector.x=vector.y=0;thumb.style.transform='translate(-50%,-50%)';stick.classList.remove('held')}
 stick.addEventListener('pointerdown',e=>{if(!playing()||active!==null)return;e.preventDefault();active=e.pointerId;const bounds=stick.getBoundingClientRect();origin={x:bounds.left+bounds.width/2,y:bounds.top+bounds.height/2};stick.setPointerCapture(active);stick.classList.add('held');move(e)});
 function move(e){if(active!==e.pointerId)return;e.preventDefault();const v=stickVector(e.clientX-origin.x,e.clientY-origin.y);vector.x=v.x;vector.y=v.y;thumb.style.transform=`translate(calc(-50% + ${v.thumbX}px),calc(-50% + ${v.thumbY}px))`}
 stick.addEventListener('pointermove',move);for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,e=>{if(e.pointerId===active)reset()});window.addEventListener('blur',reset);document.addEventListener('visibilitychange',reset);
 document.getElementById('weaponButton').addEventListener('pointerdown',e=>{e.preventDefault();if(playing())onWeapon()});document.getElementById('autoFireButton').onclick=()=>{auto=!auto;updateAuto()};let auto=true;
 function updateAuto(){const b=document.getElementById('autoFireButton');b.textContent=auto?'AUTO FIRE ON':'AUTO FIRE OFF';b.setAttribute('aria-pressed',auto);onFire(auto)}updateAuto();
 async function fullscreen(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();await screen.orientation?.lock?.('landscape')}catch{}}
 document.getElementById('fullscreenButton').onclick=fullscreen;
 return {get enabled(){return document.body.classList.contains('touchDevice')},vector,get auto(){return auto},reset,fullscreen,launch(){reset();if(touch)fullscreen()},preview(){document.body.classList.add('touchDevice')}}}

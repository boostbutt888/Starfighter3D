// Sampled orchestral performance of the 1978 Battlestar Galactica theme.
import {TieFlybys} from './tie-audio.js';
import {THEME_BARS,THEME_ROOTS,themeEvents} from './bsg-theme.js';
const banks={string_ensemble_1:[48,60,72,84],french_horn:[48,55,60,67],trumpet:[60,67,72],trombone:[36,48,60],contrabass:[36,48],timpani:[36,43],orchestral_harp:[60,72]};
const noteName=n=>['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'][n%12]+(Math.floor(n/12)-1);
export class FlightAudio {
 constructor(){this.flybys=new TieFlybys();this.flybyVoices=this.flybys.voices;this.context=null;this.ready=false;this.musicEnabled=true;this.effectsEnabled=true;this.musicLevel=.85;this.effectsLevel=.5;try{const saved=JSON.parse(localStorage.getItem('starfighter-audio-v2')||'{}');if(Number.isFinite(saved.music))this.musicLevel=Math.max(0,Math.min(1,saved.music));if(Number.isFinite(saved.effects))this.effectsLevel=Math.max(0,Math.min(1,saved.effects));}catch{}this.buffers={};this.beat=0;this.nextBeat=0;this.wasActive=false;this.lastMode='menu';this.lastBoss=false;this.status='Click launch to enable audio';}
 setVolume(channel,value){const level=Math.max(0,Math.min(1,Number(value)||0));if(channel==='music')this.musicLevel=level;else this.effectsLevel=level;try{localStorage.setItem('starfighter-audio-v2',JSON.stringify({music:this.musicLevel,effects:this.effectsLevel}))}catch{}}
 async unlock(){if(!this.context){const A=window.AudioContext||window.webkitAudioContext;this.context=new A();const c=this.context;this.master=c.createDynamicsCompressor();this.master.threshold.value=-10;this.master.knee.value=16;this.master.ratio.value=5;this.master.connect(c.destination);this.music=c.createGain();this.music.gain.value=0;this.music.connect(this.master);this.fx=c.createGain();this.fx.gain.value=this.effectsLevel;this.fx.connect(this.master);this.reverb=c.createConvolver();const impulse=c.createBuffer(2,c.sampleRate*2.6,c.sampleRate);for(let ch=0;ch<2;ch++){let data=impulse.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2.8)*.25}this.reverb.buffer=impulse;const wet=c.createGain();wet.gain.value=.24;this.reverb.connect(wet).connect(this.music);this.lasers={rebel:this.makeBlaster(false),imperial:this.makeBlaster(true)};this.loading=this.loadSamples()}
 await this.context.resume();return this.loading;}
 async loadSamples(){this.status='Loading orchestra…';let done=0;const all=Object.entries(banks).flatMap(([name,notes])=>notes.map(n=>({name,n})));const results=await Promise.allSettled(all.map(async({name,n})=>{const response=await fetch(new URL(`assets/audio/${name}-${noteName(n)}.mp3`,import.meta.url));if(!response.ok)throw new Error('Instrument sample unavailable');const buffer=await this.context.decodeAudioData(await response.arrayBuffer());(this.buffers[name]??=[]).push({n,buffer});done++;this.status=`Orchestra ${done}/${all.length}`;}));this.ready=results.every(r=>r.status==='fulfilled');this.status=this.ready?'BSG 1978 · orchestra ready':'Some instruments unavailable';this.nextBeat=this.context.currentTime+.1;}
 note(inst,n,t,duration,volume,pan=0){let c=this.context,bank=this.buffers[inst];if(!bank?.length)return;let sample=bank.reduce((a,b)=>Math.abs(b.n-n)<Math.abs(a.n-n)?b:a);let src=c.createBufferSource();src.buffer=sample.buffer;src.playbackRate.value=2**((n-sample.n)/12);let g=c.createGain(),p=c.createStereoPanner();p.pan.value=pan;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+(inst==='string_ensemble_1'?.055:.018));g.gain.setValueAtTime(volume*.8,t+Math.max(.06,duration-.12));g.gain.exponentialRampToValueAtTime(.0001,t+duration+.18);src.connect(g).connect(p);p.connect(this.music);p.connect(this.reverb);src.start(t);src.stop(t+duration+.2);}
 percussion(t,intensity=1,crash=false){let c=this.context;let n=Math.ceil(c.sampleRate*(crash?1.5:.15));let buffer=c.createBuffer(1,n,c.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*(crash?.37:.035)));let src=c.createBufferSource();src.buffer=buffer;let filter=c.createBiquadFilter();filter.type='highpass';filter.frequency.value=crash?4000:1600;let g=c.createGain();g.gain.value=(crash?.17:.12)*intensity;src.connect(filter).connect(g).connect(this.music);g.connect(this.reverb);src.start(t);}
 makeBlaster(imperial){
 const c=this.context,duration=imperial?.24:.38,n=Math.floor(c.sampleRate*duration),buffer=c.createBuffer(1,n,c.sampleRate),data=buffer.getChannelData(0);
 let phase=0,modPhase=0,random=5,filtered=0;
 for(let i=0;i<n;i++){const t=i/c.sampleRate;
  const freq=imperial?1300*Math.exp(-t*19)+115:690*Math.exp(-t*10.8)+115+940*Math.exp(-t*115);
  phase+=2*Math.PI*freq/c.sampleRate;modPhase+=2*Math.PI*(imperial?145:93)/c.sampleRate;
  random=(random*1664525+1013904223)>>>0;const noise=random/4294967296*2-1;filtered=filtered*.68+noise*.32;
  const spring=Math.sin(phase+Math.sin(modPhase)*Math.exp(-t*14)*1.2)+.42*Math.sin(phase*2.071)+.23*Math.sin(phase*3.583)+.1*Math.sin(phase*5.417);
  const crack=(noise-filtered)*Math.exp(-t*190)*.52;
  const envelope=Math.min(1,t/.0007)*Math.exp(-t*(imperial?23:15));
  data[i]=Math.tanh((spring*.37+crack)*1.25)*envelope;
 }
 return buffer;
 }

 laser(imperial=false,pan=0){if(!this.context||!this.effectsEnabled||this.context.state!=='running')return;const c=this.context,src=c.createBufferSource(),p=c.createStereoPanner(),g=c.createGain();src.buffer=this.lasers[imperial?'imperial':'rebel'];p.pan.value=Math.max(-.8,Math.min(.8,pan));g.gain.value=imperial?.23:.55;src.playbackRate.value=.96+Math.random()*.08;src.connect(g).connect(p);const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=imperial?6200:4900;p.connect(filter).connect(this.fx);if(!imperial){const delay=c.createDelay(.1),echo=c.createGain();delay.delayTime.value=.042;echo.gain.value=.11;filter.connect(delay).connect(echo).connect(this.fx)}src.start();}
 victory(){if(!this.context)return;this.beat=19*8;this.nextBeat=this.context.currentTime+.08;this.lastBoss=false;this.percussion(this.context.currentTime,1.1,true);}
 updateFlybys(enemies,listener,active){this.flybys.update(this.context,this.fx,enemies,listener,active&&this.effectsEnabled&&this.context?.state==='running')}
 effect(type='pickup'){if(!this.context||!this.effectsEnabled)return;let c=this.context,t=c.currentTime;if(type==='hit'){const length=Math.floor(c.sampleRate*.28),buffer=c.createBuffer(1,length,c.sampleRate),data=buffer.getChannelData(0);let low=0;for(let i=0;i<length;i++){const time=i/c.sampleRate;low=low*.78+(Math.random()*2-1)*.22;const thud=Math.sin(2*Math.PI*(105*time-110*time*time))*Math.exp(-time*22),metal=Math.sin(2*Math.PI*780*time+Math.sin(time*450)*3)*Math.exp(-time*34);data[i]=Math.tanh((low*.9+thud*.7+metal*.28)*1.3)*Math.min(1,time*1500)*Math.exp(-time*13)}const src=c.createBufferSource(),gain=c.createGain();src.buffer=buffer;gain.gain.value=.95;src.connect(gain).connect(this.fx);src.start();return}if(type==='hypercharge'||type==='hyperspace'){let duration=type==='hypercharge'?1.7:2.4,n=Math.floor(c.sampleRate*duration),buffer=c.createBuffer(1,n,c.sampleRate),data=buffer.getChannelData(0),phase=0,low=0;for(let i=0;i<n;i++){let u=i/n;low=low*.85+(Math.random()*2-1)*.15;phase+=2*Math.PI*(type==='hypercharge'?65+u*u*650:400*Math.exp(-u*6)+28)/c.sampleRate;data[i]=(low*.9+Math.sin(phase)*.15)*(type==='hypercharge'?Math.sin(u*Math.PI)*.65:Math.exp(-u*4)*Math.min(1,u*30))}let source=c.createBufferSource();source.buffer=buffer;source.connect(this.fx);source.start();return}if(type==='explosion'||type==='bomb'){let n=c.sampleRate*(type==='bomb'?1.5:.5),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let lp=0;for(let i=0;i<n;i++){let time=i/c.sampleRate;lp=lp*.8+(Math.random()*2-1)*.2;d[i]=(lp*.9+Math.sin(2*Math.PI*65*Math.exp(-time*1.5)*time)*.3)*Math.exp(-time*(type==='bomb'?3:9))}let src=c.createBufferSource();src.buffer=b;let g=c.createGain();g.gain.value=type==='bomb'?.8:.35;src.connect(g).connect(this.fx);src.start();return}for(let j=0;j<3;j++){let o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=[620,830,1240][j];g.gain.setValueAtTime(.08,t+j*.06);g.gain.exponentialRampToValueAtTime(.0001,t+j*.06+.18);o.connect(g).connect(this.fx);o.start(t+j*.06);o.stop(t+j*.06+.2)}}
 update(mode,elapsed,boss){if(!this.context)return;const c=this.context;this.fx.gain.setTargetAtTime(this.effectsEnabled&&mode!=='paused'?this.effectsLevel:0,c.currentTime,.05);let active=this.musicEnabled&&['menu','playing'].includes(mode);let build=Math.max(0,Math.min(1,(elapsed-53)/14));let level=mode==='menu'?.2:(boss?.78:.42+build*.28);this.music.gain.setTargetAtTime(active?level*this.musicLevel*1.5:0,c.currentTime,.18);if(!active){this.wasActive=false;return}if(!this.ready&&!Object.keys(this.buffers).length)return;if(!this.wasActive){this.nextBeat=c.currentTime+.08;this.wasActive=true}if(boss&&!this.lastBoss){this.percussion(c.currentTime,1.4,true);this.note('timpani',38,c.currentTime,1.3,.8);this.beat=10*8;this.nextBeat=c.currentTime+.1}this.lastBoss=boss;if(mode==='menu'&&this.lastMode!=='menu'){this.beat=0;this.lastBoss=false}this.lastMode=mode;let bpm=boss?116:100+build*10;let step=60/bpm/2;while(this.nextBeat<c.currentTime+.22){this.schedule(this.beat++,this.nextBeat,step,boss,build);this.nextBeat+=step} }
 schedule(beat,t,step,boss,build){
 const bar=Math.floor(beat/8)%THEME_BARS.length,b=beat%8,root=THEME_ROOTS[bar];
 const intensity=boss?1:.62+build*.38,quarter=step*2;
 if(b===0){
  // Horn fanfare first, trumpet statement, then the soaring string section.
  for(const e of themeEvents(bar)){if(e.note===null)continue;let start=t+e.at*quarter,duration=e.duration*quarter*.96;
   if(bar<10){this.note('french_horn',e.note,start,duration,.35*intensity,-.12);this.note('trombone',e.note-12,start,duration,.18*intensity,.18)}
   else if(bar<19){this.note('trumpet',e.note,start,duration,.26*intensity,.14);this.note('french_horn',e.note-12,start,duration,.23*intensity,-.22)}
   else{this.note('string_ensemble_1',e.note,start,duration,.24*intensity,-.35);this.note('french_horn',e.note-12,start,duration,.25*intensity,.1);if(boss)this.note('trumpet',e.note-12,start,duration,.13,.28)}
  }
  for(const n of [root+12,root+16,root+19])this.note('string_ensemble_1',n,t,quarter*3.9,.11*intensity,-.5);
  this.note('contrabass',root-12,t,quarter*3.8,.44*intensity,.18);
  this.note('trombone',root,t,quarter*3.5,.2*intensity,.35);
  this.note('timpani',root-12,t,1.4,.48*intensity);
  if([0,5,10,14,19,23,27,31].includes(bar))this.percussion(t,1,true);
 }
 if(b%2===0)this.note('string_ensemble_1',root+24+[0,7,4,7][Math.floor(b/2)],t,step*1.6,.075*intensity,.5);
 if((bar>=10&&bar<19)||boss){if(b===2||b===6)this.percussion(t,.6*intensity);if(b===3||b===7)this.percussion(t,.32*intensity)}
 if(b===4)this.note('timpani',root-5,t,.8,.29*intensity);
 if(build>.15&&b>=4){this.note('timpani',38,t,.3,build*(b-3)*.095);this.percussion(t,build*.2)}
 if(b===6&&bar%4===3)this.note('orchestral_harp',root+24,t,step*2,.12,.7);
 }

 get diagnostics(){return {status:this.status,ready:this.ready,samples:Object.values(this.buffers).reduce((a,b)=>a+b.length,0),context:this.context?.state,scheduledBeats:this.beat,music:this.musicEnabled,effects:this.effectsEnabled,boss:this.lastBoss,flybyVoices:this.flybyVoices.size}};
}

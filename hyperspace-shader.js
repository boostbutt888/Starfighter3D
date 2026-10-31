// Volumetric, longitudinal cloud flow. No tunnel mesh, sinusoidal rings or circular end cap.
export const hyperspaceVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export const hyperspaceFragment=`varying vec2 vUv;uniform float time;uniform float opacity;uniform float aspect;uniform sampler2D noiseMap;
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 uv=(i.xy+vec2(37.,17.)*i.z+f.xy+.5)/128.;float a=texture2D(noiseMap,uv).r,b=texture2D(noiseMap,uv+vec2(37.,17.)/128.).r;return mix(a,b,f.z);}
float cloud(vec3 p){return noise3(p)*.54+noise3(p*2.1+7.)*.30+noise3(p*4.3+17.)*.16;}
void main(){vec2 screen=(vUv-.5)*vec2(aspect,1.)*2.;vec3 ray=normalize(vec3(screen*.92,-1.45));vec3 col=vec3(.005,.015,.045);float trans=1.;
for(int i=0;i<20;i++){float depth=.35+float(i)*.85;vec3 p=ray*depth;float twist=p.z*.075+time*.12;mat2 turn=mat2(cos(twist),-sin(twist),sin(twist),cos(twist));p.xy=turn*p.xy;vec3 coord=vec3(p.xy*.92,p.z*.075-time*1.8);coord.xy+=vec2(sin(p.z*.15+time*.25),cos(p.z*.12-time*.2))*.45;float n=cloud(coord);float radial=length(p.xy);float shell=exp(-pow((radial-2.25)*.63,2.));float density=shell*pow(smoothstep(.28,.76,n),1.3)*.17+.007*n;vec3 light=mix(vec3(.045,.13,.32),vec3(.48,.69,1.),smoothstep(.35,.83,n));col+=trans*density*light*2.3;trans*=1.-density;}
float center=exp(-dot(screen,screen)*12.);col+=vec3(.19,.29,.43)*center;col=pow(col,vec3(.9));gl_FragColor=vec4(col,opacity);}
`;

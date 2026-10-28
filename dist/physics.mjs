// Units: millimetres for optics, metres for the scene, seconds for time.
export const sensors = {
 full: {name:'Vollformat',w:36,h:24,mp:24,baseISO:100,example:'Sony α7 · Canon EOS R · Nikon Z (Formatbeispiele)'},
 apsc: {name:'APS-C',w:23.5,h:15.6,mp:24,baseISO:100,example:'Fujifilm X · Sony α6000-Serie (Formatbeispiele)'},
 mft: {name:'Micro Four Thirds',w:17.3,h:13,mp:20,baseISO:100,example:'OM System · Panasonic Lumix G (Formatbeispiele)'},
 inch: {name:'1-Zoll-Typ',w:13.2,h:8.8,mp:20,baseISO:100,example:'Sony RX100-Serie (Formatbeispiel, kein Zollmaß der Diagonale)'},
 phone: {name:'Smartphone',w:9.8,h:7.3,mp:24,baseISO:100,example:'Generisches Smartphone-Format · ƒ/1.8 fest · Brennweite frei zum Lernen'},
 medium: {name:'Mittelformat',w:43.8,h:32.9,mp:100,baseISO:100,example:'Fujifilm GFX · Hasselblad X (Formatbeispiele)'}
};
export const apertures=[1.4,2,2.8,4,5.6,8,11,16,22];
export const shutters=[8000,6400,5000,4000,3200,2500,2000,1600,1250,1000,800,640,500,400,320,250,200,160,125,100,80,60,50,40,30,25,20,15,13,10,8,6,5,4,3,2.5,2,1.6,1.3,1].map(n=>1/n).concat([1.3,1.6,2]);
export const focalStops=[2,2.8,4,6.8,8.8,12,14,18,20,24,28,35,50,70,85,105,135,200];
export const isos=[100,200,400,800,1600,3200,6400,12800];
export const defaults={sensor:'full',body:'mirrorless',focal:50,aperture:4,time:1/125,iso:100,mode:'M',autoISO:false,autoFocus:false,autoWB:false,afTarget:'person',rayTargets:'person',ev:11,comp:0,nd:0,focus:5,subject:5,background:12,foreground:2.8,cameraBack:0,cameraX:0,subjectX:0,plantX:-1.2,ballX:.95,birdX:-.9,sculptureX:2,sculpture:9,speed:0,waveSpeed:3,ballSpeed:4,birdSpeed:7,ballDistance:6,birdDistance:8,wb:5500,temperature:5500,tripod:true,stabilization:true,grid:true,zebra:false,peaking:false,motion:false,portrait:false,mp:24,cocMode:'standard',matchFrame:false,scene:'courtyard',lampOn:false,windowsOn:false,lampX:-1.5,lampZ:3,lampEV:14};
export const actors={camera:{name:'Kamera',z:'cameraBack',x:'cameraX',min:-40,max:40},person:{name:'Person',z:'subject',x:'subjectX',min:-40,max:80},plant:{name:'Pflanze',z:'foreground',x:'plantX',min:-40,max:80},ball:{name:'Ball',z:'ballDistance',x:'ballX',min:-40,max:80},bird:{name:'Vogel',z:'birdDistance',x:'birdX',min:-40,max:80},sculpture:{name:'Skulptur',z:'sculpture',x:'sculptureX',min:-40,max:80},background:{name:'Hintergrund',z:'background',min:-40,max:80},lamp:{name:'Lampe',z:'lampZ',x:'lampX',min:-40,max:80}};
export function actorDistance(s,id){const a=actors[id]||actors.person;return id==='camera'?s.cameraBack:s[a.z]+s.cameraBack;}
export function moveActor(s,id,z,x){const a=actors[id];if(!a)return s;const next={...s,[a.z]:clamp(id==='camera'?-z:z,a.min,a.max)};if(a.x&&Number.isFinite(x))next[a.x]=clamp(x,-15,15);return next;}
export function incidentMultiplier(s,x,z,height=1){if(!s.lampOn)return 1;const dx=x-s.lampX,dz=z-s.lampZ,dy=height-2.8,d2=dx*dx+dz*dz+dy*dy;const cosine=(-.68*dy+.733*dz)/Math.sqrt(Math.max(d2,.01)),cone=clamp((cosine-.45)/.35,0,1)**2;return 1+2**(s.lampEV-s.ev)*cone/Math.max(d2,.25);}
export function meteredEV(s){const a=actors[s.afTarget]||actors.person;return s.ev+Math.log2(incidentMultiplier(s,a.x?s[a.x]:0,s[a.z],s.afTarget==='person'?.9:.6));}
export function atlasState(id,framing=true){const sensor=sensors[id];return {...defaults,sensor:id,mp:sensor.mp,focal:framing?35*sensor.w/36:35,mode:'A',aperture:4,autoFocus:true,matchFrame:framing,motion:false,waveSpeed:0};}
export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const nearest=(a,n)=>a.reduce((x,y)=>Math.abs(Math.log(y/n))<Math.abs(Math.log(x/n))?y:x);
export function crop(s){return Math.hypot(36,24)/Math.hypot(s.w,s.h);}
export function shutterText(t){return t>=1?`${Number(t.toFixed(1))} s`:`1/${Math.round(1/t)} s`;}
export function distanceText(m){return !Number.isFinite(m)||m>999?'∞':`${m.toFixed(m<10?2:1)} m`;}
export function effective(s){
 const out={...s};
 if(out.autoWB)out.wb=out.temperature;
 if(out.sensor==='phone')out.aperture=1.8;
 if(out.autoFocus)out.focus=clamp(actorDistance(out,out.afTarget),.3,150);
 const ev=meteredEV(out)-out.nd-out.comp,low=out.sensor==='phone'?1.8:1.4,high=out.sensor==='phone'?1.8:22;
 const idealISO=(N,t)=>100*N*N/(2**ev*t);
 if(out.mode==='P'){
  out.aperture=out.sensor==='phone'?1.8:4;
  const targetTime=Math.min(1/125,1/Math.max(125,out.focal*crop(sensors[out.sensor])*2));
  out.iso=clamp(idealISO(out.aperture,targetTime),100,12800);
  out.time=clamp(out.aperture**2/(2**ev*(out.iso/100)),1/8000,2);
 }else if(out.mode==='A'){
  if(out.autoISO)out.iso=clamp(idealISO(out.aperture,1/125),100,12800);
  out.time=clamp(out.aperture**2/(2**ev*(out.iso/100)),1/8000,2);
 }else if(out.mode==='S'){
  if(out.autoISO)out.iso=clamp(idealISO(low,out.time),100,12800);
  out.aperture=clamp(Math.sqrt(out.time*2**ev*(out.iso/100)),low,high);
 }else if(out.autoISO){out.iso=clamp(idealISO(out.aperture,out.time),100,12800);}
 return out;
}
export function metrics(input){
 const s=effective(input),sensor=sensors[s.sensor],f=s.focal,N=s.aperture,u=s.focus*1000;
 const diag=Math.hypot(sensor.w,sensor.h),mp=s.mp||sensor.mp;
 const pixel=Math.sqrt(sensor.w*sensor.h/(mp*1e6));
 const coc=s.cocMode==='pixel'?pixel*2:diag/1500;
 const H=f*f/(N*coc)+f;
 const h0=H-f;
 const near=h0*u/(h0+(u-f))/1000;
 const far=H>u?h0*u/(H-u)/1000:Infinity;
 const v=f*u/(u-f);
 const evCamera=Math.log2(N*N/s.time);
 const offset=s.ev+Math.log2(s.iso/100)-s.nd-evCamera;
 const physical=2**(s.ev-s.nd)*s.time/(N*N);
 const fov=2*Math.atan(sensor.w/(2*f))*180/Math.PI;
 const blurAt=(z)=>{const uz=Math.max(z,.05)*1000;return Math.abs(f*f*(uz-u)/(N*uz*(u-f)));};
 const airy=2.44*0.00055*N;
 // Educational equal-output noise proxy: not a calibrated sensor model.
 const photons=physical*(sensor.w*sensor.h)/(36*24);
 const noise=clamp(0.028/Math.sqrt(Math.max(photons,0.00001)),0.003,0.38);
 const motionMM=f*s.speed*s.time/Math.max(s.subject+s.cameraBack,0.1);
 return {s,sensor,crop:crop(sensor),equivalent:f*crop(sensor),coc,pixel,H:H/1000,near,far,v,offset,physical,fov,blurAt,airy,noise,motionMM,evCamera,apertureDiameter:f/N};
}
export function changeSensor(s,id){
 const prev=sensors[s.sensor],next=sensors[id];
 // Preserve horizontal framing. Diagonal-equivalent values remain separately labelled.
 const focal=s.matchFrame?s.focal*next.w/prev.w:s.focal;
 return {...s,sensor:id,mp:next.mp,focal:clamp(focal,2,200)};
}
// Two ideal thin groups with a physically separate iris. Paraxial construction,
// not a real lens prescription. Distances are from the principal planes.
export function cameraModel(input,{distance,pointHeight=.6}={}){
 const m=metrics(input),s=m.s,f=s.focal,d=.4*f,g=f+Math.sqrt(f*f-f*d),h=f*d/g;
 const stopFactor=1-d/(2*g),irisDiameter=m.apertureDiameter*stopFactor;
 const objectU=Math.max(distance??(s.subject+s.cameraBack),.3)*1000,firstDistance=objectU-h;
 const objectY=clamp(pointHeight*1000,-objectU*.12,objectU*.12);
 const sensorZ=d-h+m.v;
 const conjugateZ=d-h+f*objectU/(objectU-f);
 const rays=[-.5,0,.5].map(q=>{
  const irisY=q*irisDiameter;
  let angle=(irisY-objectY*stopFactor)/(firstDistance*stopFactor+d/2);
  const firstY=objectY+angle*firstDistance;
  angle-=firstY/g;
  const rearY=firstY+angle*d;
  angle-=rearY/g;
  return {firstY,irisY,rearY,angle,sensorY:rearY+angle*(sensorZ-d),imageY:rearY+angle*(conjugateZ-d)};
 });
 return {f,d,g,h,irisDiameter,entranceDiameter:m.apertureDiameter,sensorZ,conjugateZ,objectY,rays};
}
export function encodeState(s){return encodeURIComponent(JSON.stringify(Object.fromEntries(Object.entries(s).filter(([key,value])=>defaults[key]!==value))));}
export function decodeState(hash){
 try {const raw=JSON.parse(decodeURIComponent(hash.replace(/^#(?:s=)?/,''))),out={...defaults};
  for(const [k,v]of Object.entries(raw)){if(!(k in defaults)||typeof v!==typeof defaults[k])continue;if(typeof v==='number'&&!Number.isFinite(v))continue;out[k]=v;}
  if(!Object.hasOwn(sensors,out.sensor))out.sensor='full';
  const limits={focal:[2,200],aperture:[1.4,22],time:[1/8000,2],iso:[100,12800],ev:[3,16],comp:[-3,3],nd:[0,10],focus:[0.3,150],subject:[1.5,15],background:[6,40],foreground:[1,8],cameraBack:[0,8],cameraX:[-3,3],subjectX:[-3,3],plantX:[-3,3],ballX:[-3,3],birdX:[-3,3],sculptureX:[-3,3],sculpture:[2,25],speed:[0,12],waveSpeed:[0,12],ballSpeed:[0,12],birdSpeed:[0,12],ballDistance:[2,18],birdDistance:[2,25],wb:[2500,10000],temperature:[2500,10000],mp:[8,100]};
  for(const a of Object.values(actors)){limits[a.z]=[a.min,a.max];if(a.x)limits[a.x]=[-15,15];}limits.lampEV=[8,18];
  for(const[k,[a,b]]of Object.entries(limits))out[k]=clamp(out[k],a,b);
  if(!['M','A','S','P'].includes(out.mode))out.mode='M';
  if(!Object.hasOwn(actors,out.afTarget)||['camera','lamp'].includes(out.afTarget))out.afTarget='person';
  out.rayTargets=out.rayTargets.split(',').filter(x=>['person','plant','background'].includes(x)).slice(0,3).join(',')||'person';
  if(!['standard','pixel'].includes(out.cocMode))out.cocMode='standard';
  if(!['courtyard','night','studio'].includes(out.scene))out.scene='courtyard';
  if(!['mirrorless','dslr'].includes(out.body))out.body='mirrorless';
  return out;
 }catch{return {...defaults};}
}

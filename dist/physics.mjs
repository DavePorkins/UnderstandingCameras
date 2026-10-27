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
export const shutters=[1/8000,1/4000,1/2000,1/1000,1/500,1/250,1/125,1/60,1/30,1/15,1/8,1/4,1/2,1,2];
export const isos=[100,200,400,800,1600,3200,6400,12800];
export const defaults={sensor:'full',body:'mirrorless',focal:50,aperture:2.8,time:1/250,iso:100,mode:'M',ev:11,comp:0,nd:0,focus:5,subject:5,background:12,foreground:2.8,cameraBack:0,cameraX:0,subjectX:0,speed:1.5,wb:5500,temperature:5500,tripod:true,stabilization:true,grid:true,zebra:false,peaking:false,motion:false,portrait:false,mp:24,cocMode:'standard',matchFrame:true,scene:'courtyard'};
export const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export const nearest=(a,n)=>a.reduce((x,y)=>Math.abs(Math.log(y/n))<Math.abs(Math.log(x/n))?y:x);
export function crop(s){return Math.hypot(36,24)/Math.hypot(s.w,s.h);}
export function shutterText(t){return t>=1?`${Number(t.toFixed(1))} s`:`1/${Math.round(1/t)} s`;}
export function distanceText(m){return !Number.isFinite(m)||m>999?'∞':`${m.toFixed(m<10?2:1)} m`;}
export function effective(s){
 const out={...s};
 if(out.sensor==='phone')out.aperture=1.8;
 // EV100 is reflected scene brightness; ISO gain changes rendering, not photons.
 const target=out.ev+Math.log2(out.iso/100)-out.nd-out.comp;
 if(out.mode==='A')out.time=clamp(out.aperture**2/2**target,1/8000,2);
 if(out.mode==='S'&&out.sensor!=='phone')out.aperture=clamp(Math.sqrt(out.time*2**target),1.4,22);
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
 const blurAt=(z)=>{const uz=z*1000;return Math.abs(f*f*(uz-u)/(N*uz*(u-f)));};
 const airy=2.44*0.00055*N;
 // Educational equal-output noise proxy: not a calibrated sensor model.
 const photons=physical*(sensor.w*sensor.h)/(36*24);
 const noise=clamp(0.012/Math.sqrt(Math.max(photons,0.00001)),0.002,0.28);
 const motionMM=f*s.speed*s.time/Math.max(s.subject+s.cameraBack,0.1);
 return {s,sensor,crop:crop(sensor),equivalent:f*crop(sensor),coc,pixel,H:H/1000,near,far,v,offset,physical,fov,blurAt,airy,noise,motionMM,evCamera,apertureDiameter:f/N};
}
export function changeSensor(s,id){
 const prev=sensors[s.sensor],next=sensors[id];
 // Preserve horizontal framing. Diagonal-equivalent values remain separately labelled.
 const focal=s.matchFrame?s.focal*next.w/prev.w:s.focal;
 return {...s,sensor:id,mp:next.mp,focal:clamp(focal,2,200),aperture:id==='phone'?1.8:s.aperture};
}
export function encodeState(s){return encodeURIComponent(JSON.stringify(s));}
export function decodeState(hash){
 try {const raw=JSON.parse(decodeURIComponent(hash.replace(/^#(?:s=)?/,''))),out={...defaults};
  for(const [k,v]of Object.entries(raw)){if(!(k in defaults)||typeof v!==typeof defaults[k])continue;if(typeof v==='number'&&!Number.isFinite(v))continue;out[k]=v;}
  if(!Object.hasOwn(sensors,out.sensor))out.sensor='full';
  const limits={focal:[2,200],aperture:[1.4,22],time:[1/8000,2],iso:[100,12800],ev:[3,16],comp:[-3,3],nd:[0,10],focus:[0.3,80],subject:[1.5,15],background:[6,40],foreground:[1,8],cameraBack:[0,8],cameraX:[-3,3],subjectX:[-2,2],speed:[0,12],wb:[2500,10000],temperature:[2500,10000],mp:[8,100]};
  for(const[k,[a,b]]of Object.entries(limits))out[k]=clamp(out[k],a,b);
  if(!['M','A','S'].includes(out.mode))out.mode='M';
  if(!['standard','pixel'].includes(out.cocMode))out.cocMode='standard';
  if(!['courtyard','night','studio'].includes(out.scene))out.scene='courtyard';
  if(!['mirrorless','dslr'].includes(out.body))out.body='mirrorless';
  return out;
 }catch{return {...defaults};}
}

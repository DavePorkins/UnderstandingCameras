import {pupilPath} from './pupil.mjs';
import {metrics,clamp,distanceText,sensors,crop,incidentMultiplier,windowEmissionMultiplier,projectPoint} from './physics.mjs';
import {tr} from './i18n.mjs';
const C={ink:'#24483f',muted:'#798b7c',grid:'#dde5d6',teal:'#278b7b',amber:'#c38c39',coral:'#c56b53'};
function line(c,x1,y1,x2,y2,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();c.setLineDash([]);}
function label(c,t,x,y,size=12,color=C.ink,align='left'){c.font=`${size}px ${size<11?'ui-monospace,Consolas':'system-ui,sans-serif'}`;c.fillStyle=color;c.textAlign=align;c.fillText(tr(t),x,y);c.textAlign='left';}
function poly(c,pts,fill,stroke){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function circle(c,x,y,r,fill){c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);c.fillStyle=fill;c.fill();}
function rounded(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();}
function arrow(c,x,y,dir,color){poly(c,[[x,y],[x-dir*8,y-4],[x-dir*8,y+4]],color);}
function dimension(c,x1,x2,y,t,color=C.muted){line(c,x1,y,x2,y,color);arrow(c,x1,y,-1,color);arrow(c,x2,y,1,color);label(c,t,(x1+x2)/2,y-7,10,color,'center');}
const canvases=new Map();const pickingCanvases=new WeakMap();
const pickPalette=[[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255]],pickLabels=['person','plant','ball','bird','sculpture','background'];
export function pickColor(pixel){if(pixel[3]<40||pixel[0]+pixel[1]+pixel[2]<60)return null;let best=Infinity,index=-1;pickPalette.forEach((color,i)=>{const d=color.reduce((sum,v,j)=>sum+(v-pixel[j])**2,0);if(d<best){best=d;index=i;}});return pickLabels[index]||null;}
const linearLevels=Float64Array.from({length:256},(_,i)=>(i/255)**2.2),displayLevels=Uint8Array.from({length:65536},(_,i)=>Math.round(255*(i/65535)**(1/2.2)));let grainCache=new Float32Array(0);
function buffer(key,w,h){let cv=canvases.get(key);if(!cv){cv=document.createElement('canvas');canvases.set(key,cv);}if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}const c=cv.getContext('2d',{willReadFrequently:true});c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.filter='none';c.globalAlpha=1;c.globalCompositeOperation='source-over';return [cv,c];}
export function grainSample(index){let v=(index^0x9e3779b9)>>>0;v^=v>>>16;v=Math.imul(v,0x7feb352d);v^=v>>>15;v=Math.imul(v,0x846ca68b);v^=v>>>16;return (((v&255)+((v>>>8)&255)+((v>>>16)&255)+((v>>>24)&255))/255-2)*1.7320508075688772;}
export function armPose(s,t){const shoulder=[.20,-1.32],elbow=[.40,-1.37],length=.43,amplitude=.65,omega=s.waveSpeed/(length*amplitude),angle=-Math.PI/2+amplitude*Math.sin(t*omega);return {shoulder,elbow,wrist:[elbow[0]+length*Math.cos(angle),elbow[1]+length*Math.sin(angle)]};}
export function motionSmearPixels(s,speed,z,width){return speed*s.focal*s.time/Math.max(z+s.cameraBack,.1)/sensors[s.sensor].w*width;}
// Real scene positions shared by the cable, bulb housings and their optical spots.
export const stringLights=Array.from({length:9},(_,i)=>({x:(i-4)*1.3,height:3.2+((i-4)/4)**2*.35,color:['#ffe8a8','#ffba7c','#ccecf0'][i%3]}));
export function sceneObjects(s,t=0){
 const half=z=>Math.max(.05,(z+s.cameraBack)*sensors[s.sensor].w/s.focal/2);
 const travel=(v,z,x)=>{const span=2*half(z),left=s.cameraX-span/2;return v?left+(((x-left+t*v)%span)+span)%span:x;};
 const walkAmp=Math.max(.015,half(s.subject)-.35),walkPhase=Math.asin(clamp((s.subjectX-s.cameraX)/walkAmp,-1,1)),walkX=s.speed?s.cameraX+walkAmp*Math.sin(walkPhase+t*s.speed/walkAmp):s.subjectX,walkV=s.speed? s.speed*Math.cos(walkPhase+t*s.speed/walkAmp):0;
 const animatedHeight=(z,height,margin)=>{const d=Math.max(.15,z+s.cameraBack),range=d*sensors[s.sensor].h/s.focal,lo=1.15-.51*range+margin,hi=1.15+.49*range-margin;return lo<hi?clamp(height,lo,hi):1.15;};
 const birdY=s.birdSpeed?animatedHeight(s.birdDistance,2.6,.32):2.6;
 const bounce=s.ballSpeed?Math.abs(Math.sin(t*s.ballSpeed*.65))*1.15:0,ballV=s.ballSpeed*.65*1.15*Math.cos(t*s.ballSpeed*.65)*Math.sign(Math.sin(t*s.ballSpeed*.65)||1);
 return [
 {id:'wall',type:'wall',x:0,z:s.background,height:3.8},
 ...(s.bokehLights?[{id:'light-string',type:'light-string',x:0,z:s.background,height:3.6},{id:'points',type:'points',x:0,z:s.background,height:3.6}]:[]),
 {id:'tree-left',type:'tree',x:s.clearBackdrop?-9:-3.2,z:s.background-.5,height:3.5},
 {id:'tree-right',type:'tree',x:s.clearBackdrop?9:3.7,z:s.background-1,height:4},
 {id:'bench',type:'bench',x:-1.7,z:s.background-2,height:.8},
 {id:'sculpture',type:'sculpture',x:s.sculptureX,z:s.sculpture,height:1.9},
 {id:'person',type:'person',x:walkX,z:s.subject,height:1.75,speed:Math.abs(walkV)},
 ...(s.waveSpeed>0?[{id:'hand',type:'hand',x:walkX,z:s.subject,height:1.95,speed:Math.abs(walkV),waveSpeed:s.waveSpeed}]:[]),
 {id:'plant',type:'plant',x:s.plantX,z:s.foreground,height:1.05},
 {id:'ball',type:'ball',x:travel(s.ballSpeed*.35,s.ballDistance,s.ballX),z:s.ballDistance,y:s.ballSpeed?animatedHeight(s.ballDistance,bounce,.38):bounce,height:.36,speed:s.ballSpeed*.35,verticalSpeed:Math.abs(animatedHeight(s.ballDistance,bounce,.38)-bounce)>.001?0:ballV},
 {id:'bird',type:'bird',x:travel(s.birdSpeed,s.birdDistance,s.birdX),z:s.birdDistance,y:birdY,height:.6,width:.75,speed:s.birdSpeed},
 {id:'wings',type:'wings',x:travel(s.birdSpeed,s.birdDistance,s.birdX),z:s.birdDistance,y:birdY,height:.6,width:.75,speed:s.birdSpeed},
 ...(s.lampOn?[{id:'lamp',type:'lamp',x:s.lampX,z:s.lampZ,height:2.9}]:[])
 ];
 for(const obj of [...objects])if(['ball','bird','wings'].includes(obj.type)&&obj.speed){const span=2*half(obj.z),radius=obj.type==='ball'?.2:.4,left=s.cameraX-span/2,right=left+span;if(obj.x-radius<left)objects.push({...obj,x:obj.x+span,wrapped:true});if(obj.x+radius>right)objects.push({...obj,x:obj.x-span,wrapped:true});}return objects.sort((a,b)=>b.z-a.z);
}
export function drawPhoto(canvas,state,t=0,opts={}){
 const m=metrics(state),s=m.s,sensor=m.sensor,W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#e7ebdf';ctx.fillRect(0,0,W,H);
 const ratio=sensor.w/sensor.h;let w=W,h=W/ratio;if(h>H){h=H;w=H*ratio;}const x0=(W-w)/2,y0=(H-h)/2;
 // Work at a bounded raster size; blur and noise remain interactive on laptops.
 const rw=Math.round(Math.min(w,opts.rasterWidth||(s.motion||opts.fast?480:1100))),rh=Math.round(rw/ratio),scale=rw/w;
 const [cv,c]=buffer('photo',rw,rh),[layer,l]=buffer('layer',rw,rh),[illum,ic]=buffer('illumination',rw,rh);ic.fillStyle='#000';ic.fillRect(0,0,rw,rh);
 const k=rw*s.focal/sensor.w,cy=rh*.49;
 const project=(x,y,z)=>projectPoint(s,x,y,z,rw,rh);
 const night=s.scene==='night';
 let grad=c.createLinearGradient(0,0,0,rh);grad.addColorStop(0,night?'#263e50':s.scene==='studio'?'#cdc7b9':'#dce7d8');grad.addColorStop(.56,night?'#4c6264':'#dce2cc');grad.addColorStop(1,night?'#6c786e':'#b6c4a6');c.fillStyle=grad;c.fillRect(0,0,rw,rh);
 // A flat ground plane with real perspective projection.
 poly(c,[[0,cy],[rw,cy],[rw,rh],[0,rh]],night?'#788278':'#c5ceba');
 for(let z=-s.cameraBack+2;z<-s.cameraBack+55;z+=2){const a=project(-12,0,z),b=project(12,0,z);line(c,a[0],a[1],b[0],b[1],night?'#667467':'#b5c0ab',.6);}
 for(let x=-16;x<=16;x+=2){const a=project(x,0,-s.cameraBack+1),b=project(x,0,-s.cameraBack+60);line(c,a[0],a[1],b[0],b[1],night?'#667467':'#b3bfa7',.6);}
 if(s.lampOn){const gw=Math.ceil(rw/8),gh=Math.ceil(rh/8),[ground,gc]=buffer('ground-light',gw,gh),pixels=gc.createImageData(gw,gh);for(let yy=0;yy<gh;yy++)for(let xx=0;xx<gw;xx++){const yp=(yy+.5)*rh/gh,zz=1.15*k/Math.max(yp-cy,.001),xxWorld=((xx+.5)*rw/gw-rw/2)*zz/k+s.cameraX,idx=(yy*gw+xx)*4;pixels.data[idx]=yp>cy?Math.round(clamp(Math.log2(incidentMultiplier(s,xxWorld,zz-s.cameraBack,0))/16,0,1)*255):0;pixels.data[idx+3]=255;}gc.putImageData(pixels,0,0);ic.drawImage(ground,0,0,rw,rh);}
 const objList=sceneObjects(s,t);
 let pickCanvas=null,pickContext=null;if(!opts.clean&&opts.pickMap){pickCanvas=pickingCanvases.get(canvas);if(!pickCanvas){pickCanvas=document.createElement('canvas');pickingCanvases.set(canvas,pickCanvas);}if(pickCanvas.width!==rw||pickCanvas.height!==rh){pickCanvas.width=rw;pickCanvas.height=rh;}pickContext=pickCanvas.getContext('2d',{willReadFrequently:true});pickContext.clearRect(0,0,rw,rh);}
 const pickCodes={person:1,hand:1,plant:2,ball:3,bird:4,wings:4,sculpture:5,wall:6,'tree-left':6,'tree-right':6,bench:6};
 const boxes=[];
 for(const obj of objList){
  l.clearRect(0,0,rw,rh);l.filter='none';l.globalAlpha=1;
  const [px,py,q]=project(obj.x,obj.y||0,obj.z),size=obj.height*q;
  if(obj.z+s.cameraBack<=.15)continue;
  if(!['points','light-string'].includes(obj.type)&&(px+size<0||px-size>rw||py-size>rh||py<0))continue;
  l.save();l.translate(px,py);l.scale(q,q);
  if(obj.type==='points'){
   const radius=Math.max(.014,m.blurAt(obj.z+s.cameraBack)/sensor.w*rw/2/q),area=Math.max(.00045,radius*radius),alpha=Math.min(1,.018/area);
   for(const light of stringLights){l.save();l.translate(light.x,-light.height);const sign=obj.z+s.cameraBack>s.focus?-1:1;l.scale(sign,sign);pupilPath(l,0,0,radius,s);l.fillStyle=light.color;l.globalAlpha=alpha;l.fill();l.restore();}l.globalAlpha=1;
  }
  if(obj.type==='light-string'){
   l.beginPath();for(let i=0;i<stringLights.length;i++){const b=stringLights[i];i?l.lineTo(b.x,-b.height-.13):l.moveTo(b.x,-b.height-.13);}l.strokeStyle=night?'#a5ad96':'#536454';l.lineWidth=.018;l.stroke();for(const b of stringLights){line(l,b.x,-b.height-.13,b.x,-b.height,'#899578',.018);rounded(l,b.x-.035,-b.height-.045,.07,.07,.015,'#aaa18a');}
  }
  if(obj.type==='wall'){
   l.fillStyle=night?'#788276':'#c8c9b3';l.fillRect(-15,-3.8,30,3.8);
   l.fillStyle=night?'#565f52':'#d9d5bd';l.fillRect(-15,-3.84,30,.14);l.fillRect(-15,-.16,30,.16);
   for(let x=-13;x<=13;x+=1.6){
    rounded(l,x,-3.2,1.05,1.9,.05,s.windowsOn?(night?'#c6a970':'#abb69a'):night?'#3d535a':'#879e8a');
    l.fillStyle=s.windowsOn?(night?'#d7bd88':'#b9c0a4'):night?'#51626a':'#acc1aa';l.fillRect(x+.06,-3.12,.93,.83);
    line(l,x+.52,-3.2,x+.52,-1.3,'#e1ddc8',.045);line(l,x,-2.2,x+1.05,-2.2,'#e1ddc8',.045);
    l.fillStyle='#a9b39c';l.fillRect(x-.04,-1.25,1.13,.09);
   }
   for(let yy=-.9;yy<0;yy+=.23)line(l,-15,yy,15,yy,'#aeb59d',.015);
  }
  if(obj.type==='tree'){
   l.fillStyle='#776f54';l.fillRect(-.12,-2.7,.24,2.7);
   line(l,0,-1.5,-.65,-2.8,'#776f54',.1);line(l,0,-1.8,.6,-3,'#776f54',.08);
   const shapes=[[-.8,-2.8,.8],[.7,-2.9,.85],[-.3,-3.5,.9],[.3,-3.7,.75],[0,-2.6,.95]];
   shapes.forEach(([x,y,r],i)=>circle(l,x,y,r,['#70966e','#83a078','#96ad7d','#769970','#77976b'][i]));
   for(let i=0;i<45;i++){const a=i*2.3999,r=Math.sqrt(i/45)*1.15;circle(l,Math.cos(a)*r,-3+Math.sin(a)*r*.7,.06,'#a8bd8a');}
   l.globalAlpha=.15;l.beginPath();l.ellipse(.25,0,1.7,.13,0,0,7);l.fillStyle='#3c5139';l.fill();l.globalAlpha=1;
  }
  if(obj.type==='bench'){
   l.fillStyle='#525e50';l.fillRect(-.75,-.45,.065,.45);l.fillRect(.65,-.45,.065,.45);
   l.fillStyle='#9b8765';for(let y=-.82;y<-.4;y+=.12)l.fillRect(-.9,y,1.8,.085);
   l.fillRect(-.94,-.4,1.88,.12);
  }
  if(obj.type==='sculpture'){
   l.fillStyle='#adb7a2';l.fillRect(-.3,-.45,.6,.45);l.fillStyle='#8b9b85';l.fillRect(.2,-.45,.1,.45);
   l.lineWidth=.16;l.strokeStyle='#c29c61';l.beginPath();l.ellipse(0,-1.15,.43,.65,-.2,0,7);l.stroke();
   line(l,.04,-.53,.04,-.4,'#a48b59',.1);
  }
  if(obj.type==='person'){
   l.globalAlpha=.2;l.beginPath();l.ellipse(.1,0,.42,.07,0,0,7);l.fillStyle='#53624a';l.fill();l.globalAlpha=1;
   const leg=s.speed>0?Math.sin(t*s.speed*4)*.09:0;
   poly(l,[[-.21,-.82],[-.01,-.82],[-.06+leg,-.11],[-.21+leg,-.08]],'#485a53');
   poly(l,[[.02,-.82],[.2,-.82],[.24-leg,-.07],[.08-leg,-.09]],'#394e48');
   rounded(l,-.24+leg,-.1,.23,.09,.025,'#e9e7d8');rounded(l,.07-leg,-.09,.27,.09,.025,'#e9e7d8');
   rounded(l,-.26,-1.42,.52,.67,.08,'#c67a59');
   poly(l,[[-.23,-1.4],[-.36,-1.36],[-.43,-.85],[-.29,-.82],[-.13,-1.25]],'#b2644e');
   if(s.waveSpeed===0){poly(l,[[.23,-1.4],[.35,-1.33],[.43,-.9],[.29,-.84],[.15,-1.22]],'#d18b68');circle(l,.36,-.85,.075,'#ddba8f');}
   else {const pose=armPose(s,t);l.beginPath();l.moveTo(...pose.shoulder);l.lineTo(...pose.elbow);l.strokeStyle='#d18b68';l.lineWidth=.18;l.lineCap='round';l.lineJoin='round';l.stroke();circle(l,...pose.shoulder,.095,'#c67a59');}
   circle(l,-.36,-.82,.075,'#ddba8f');
   l.fillStyle='#deb993';l.fillRect(-.07,-1.52,.14,.17);circle(l,0,-1.59,.15,'#dfbd98');
   l.beginPath();l.arc(-.015,-1.64,.16,Math.PI,Math.PI*2.05);l.fillStyle='#514b38';l.fill();
   line(l,0,-1.36,0,-.78,'#edd0a4',.016);line(l,-.16,-.99,-.06,-.99,'#ab5d4b',.012);line(l,.07,-.99,.18,-.99,'#ab5d4b',.012);
   circle(l,-.055,-1.59,.009,'#564b3c');circle(l,.055,-1.59,.009,'#564b3c');line(l,-.035,-1.53,.04,-1.53,'#b07e62',.01);
  }
  if(obj.type==='hand'){
   const samples=Math.ceil(clamp(s.waveSpeed*s.time*q*1.5,1,36));
   const left=Math.max(0,Math.floor(px-q*.01)),top=Math.max(0,Math.floor(py-q*2)),right=Math.min(rw,Math.ceil(px+q*.89)),bottom=Math.min(rh,Math.ceil(py-q*1.15));
   if(right>left&&bottom>top){const[poseCanvas,pc]=buffer('hand-pose',right-left,bottom-top);l.setTransform(1,0,0,1,0,0);l.globalCompositeOperation='lighter';l.globalAlpha=1/samples;
    for(let sample=0;sample<samples;sample++){pc.clearRect(0,0,poseCanvas.width,poseCanvas.height);pc.save();pc.translate(px-left,py-top);pc.scale(q,q);const dt=samples===1?0:(sample/(samples-1)-.5)*s.time,pose=armPose(s,t+dt);pc.beginPath();pc.moveTo(...pose.elbow);pc.lineTo(...pose.wrist);pc.strokeStyle='#d18b68';pc.lineWidth=.16;pc.lineCap='round';pc.lineJoin='round';pc.stroke();circle(pc,...pose.wrist,.075,'#ddba8f');pc.restore();l.drawImage(poseCanvas,left,top);}
   }
  }
  if(obj.type==='lamp'){if(s.lampType==='spot'){line(l,0,-2.65,0,-.2,'#546862',.045);line(l,0,-.2,-.3,0,'#546862',.045);line(l,0,-.2,.3,0,'#546862',.045);rounded(l,-.16,-2.85,.4,.25,.04,'#546862');circle(l,.18,-2.72,.10,'#ead59a');}else{l.fillStyle='#546862';l.fillRect(-.04,-2.75,.08,2.75);l.fillRect(-.17,-.06,.34,.06);line(l,0,-2.76,.45,-2.76,'#546862',.075);rounded(l,.3,-2.83,.35,.12,.04,'#d9bd82');}}
  if(obj.type==='bird'){
   l.fillStyle='#526c68';l.beginPath();l.ellipse(0,0,.2,.065,-.1,0,7);l.fill();circle(l,.17,-.05,.06,'#405a56');poly(l,[[.22,-.06],[.31,-.045],[.22,-.015]],'#bd985b');poly(l,[[-.14,0],[-.32,-.04],[-.25,.08]],'#536d69');
  }
  if(obj.type==='wings'){
   const flap=Math.sin(t*s.birdSpeed*3)*.18;poly(l,[[-.02,0],[-.28,-.28+flap],[-.1,-.26+flap],[.1,0]],'#6b8179');poly(l,[[.02,0],[.26,-.23-flap],[.32,-.16-flap],[.12,.03]],'#738b7d');
  }
  if(obj.type==='plant'){
   l.globalAlpha=.17;l.beginPath();l.ellipse(.08,0,.4,.065,0,0,7);l.fillStyle='#425136';l.fill();l.globalAlpha=1;
   poly(l,[[-.29,-.48],[.29,-.48],[.22,0],[-.22,0]],'#bd8e67');l.fillStyle='#d3a47d';l.fillRect(-.31,-.5,.62,.09);
   for(let i=0;i<11;i++){const angle=(i-5)*.24,len=.4+(i%3)*.15;const xx=Math.sin(angle)*len,yy=-.43-Math.cos(angle)*len;line(l,0,-.43,xx,yy,'#638758',.025);l.save();l.translate(xx,yy);l.rotate(-angle);l.beginPath();l.ellipse(0,0,.08,.18,0,0,7);l.fillStyle=i%2?'#91a76f':'#6f935c';l.fill();l.restore();}
  }
  if(obj.type==='ball'){
   circle(l,0,-.18,.18,'#bfa258');l.save();l.beginPath();l.arc(0,-.18,.18,0,7);l.clip();line(l,-.19,-.13,.19,-.13,'#efe0ad',.035);line(l,-.08,-.38,.06,.04,'#847644',.02);l.restore();
  }
  l.restore();
  if(pickContext&&!['points','light-string'].includes(obj.type)){const[hit,hc]=buffer('pick-object',rw,rh);hc.drawImage(layer,0,0);hc.globalCompositeOperation='source-in';hc.fillStyle=`rgb(${(pickPalette[(pickCodes[obj.id]||0)-1]||[0,0,0]).join(',')})`;hc.fillRect(0,0,rw,rh);hc.globalCompositeOperation='source-over';pickContext.drawImage(hit,0,0);}
  let blur=obj.type==='points'?0:m.blurAt(obj.z+s.cameraBack)/sensor.w*rw/2;
  // Diffraction is displayed as a gentle whole-image softness, not an Airy PSF convolution.
  const diffraction=m.airy/sensor.w*rw*.2;
  blur=Math.sqrt(blur*blur+diffraction*diffraction);
  if(s.portrait&&s.sensor==='phone'&&obj.z>s.subject+1)blur=Math.max(blur,10);
  c.save();c.filter=blur>.35?`blur(${clamp(blur,0,36)}px)`:'none';
  const smear=motionSmearPixels(s,obj.speed||0,obj.z,rw);
  const verticalSmear=motionSmearPixels(s,obj.verticalSpeed||0,obj.z,rw);
  const copies=Math.hypot(smear,verticalSmear)>1?Math.min(19,Math.ceil(Math.hypot(smear,verticalSmear)/2)):1;
  if(copies===1)c.drawImage(layer,0,0);
  else {const[mv,mc]=buffer('movement',rw,rh);mc.globalCompositeOperation='lighter';mc.globalAlpha=1/copies;for(let n=0;n<copies;n++){const shift=(n/(copies-1)-.5)*Math.min(smear,rw);mc.drawImage(layer,shift,(n/(copies-1)-.5)*verticalSmear);}c.drawImage(mv,0,0);}
  c.restore();
  if(s.lampOn||s.windowsOn||s.bokehLights){const[mask,mc]=buffer('light-mask',rw,rh);mc.drawImage(layer,0,0);mc.globalCompositeOperation='source-in';const factor=obj.type==='points'?1+2**((s.bokehEV??6)-s.ev):incidentMultiplier(s,obj.x,obj.z,obj.height*.5),encoded=Math.round(clamp(Math.log2(factor)/16,0,1)*255);mc.fillStyle=`rgb(${encoded},0,0)`;mc.fillRect(0,0,rw,rh);mc.globalCompositeOperation='source-over';
  if(obj.type==='wall'&&s.windowsOn){mc.save();mc.translate(px,py);mc.scale(q,q);const e=Math.round(clamp(Math.log2(windowEmissionMultiplier(s))/16,0,1)*255);mc.fillStyle=`rgb(${e},0,0)`;for(let xx=-13;xx<=13;xx+=1.6)mc.fillRect(xx,-3.2,1.05,1.9);mc.restore();}
  if(obj.type==='lamp'){mc.save();mc.translate(px,py);mc.scale(q,q);mc.fillStyle=`rgb(${Math.round(clamp((s.lampEV+1-s.ev)/16,0,1)*255)},0,0)`;if(s.lampType==='spot')mc.fillRect(-.13,-2.82,.35,.2);else mc.fillRect(.3,-2.83,.35,.12);mc.restore();}
  ic.save();ic.filter=`blur(${clamp(blur,0,36)}px)`;ic.drawImage(mask,0,0);ic.restore();}
  if(!['wall','lamp','points','light-string'].includes(obj.type)){const bw=(obj.width||obj.height*.6)*q;boxes.push({id:obj.id,x:x0+(px-bw/2)/scale,y:y0+(py-(obj.id==='bird'||obj.id==='wings'?.4*q:size))/scale,w:bw/scale,h:(obj.id==='bird'||obj.id==='wings'?.65*q:size)/scale,z:obj.z+s.cameraBack,sharp:m.blurAt(obj.z+s.cameraBack)<=m.coc});}
 }
 if(!s.tripod){const smear=s.time*s.focal*m.crop*(s.stabilization?.15:1)*2; if(smear>1){const[sh,sc]=buffer('shake',rw,rh);sc.drawImage(cv,0,0);c.globalAlpha=.35;c.drawImage(sh,Math.min(18,smear),Math.min(9,smear*.3));c.globalAlpha=1;}}
 // Fixed sRGB display model with physically directed exposure and photon-noise proxy.
 const lighting=s.lampOn||s.windowsOn||s.bokehLights?ic.getImageData(0,0,rw,rh).data:null;if(grainCache.length!==rw*rh)grainCache=Float32Array.from({length:rw*rh},(_,i)=>grainSample(i));
 const data=c.getImageData(0,0,rw,rh),a=data.data,gain=2**clamp(m.offset,-12,10),balance=Math.log(s.wb/s.temperature);
 const gains=[Math.exp(balance*.65),1,Math.exp(-balance*.65)];
 for(let i=0;i<a.length;i+=4){
  const n=grainCache[i>>>2]*m.noise,illumination=lighting?2**(lighting[i]/255*16):1;
  for(let j=0;j<3;j++){let v=linearLevels[a[i+j]]*illumination;v=(v+n*Math.sqrt(Math.max(v,.001))*.55)*gain*gains[j];a[i+j]=displayLevels[Math.round(clamp(v,0,1)*65535)];}
 }
 c.putImageData(data,0,0);
 if(s.zebra){c.strokeStyle='#da5e4888';c.lineWidth=2;for(let yy=0;yy<rh;yy+=10){for(let xx=0;xx<rw;xx+=10){const i=(yy*rw+xx)*4;if(Math.max(a[i],a[i+1],a[i+2])>=254)line(c,xx,yy,xx+7,yy-7,'#e3554499',2);}}}
 ctx.drawImage(cv,x0,y0,w,h);
 if(s.grid&&!opts.clean){for(const fr of[1/3,2/3]){line(ctx,x0+w*fr,y0,x0+w*fr,y0+h,'#fff9',1);line(ctx,x0,y0+h*fr,x0+w,y0+h*fr,'#fff9',1);}}
 if(s.peaking&&!opts.clean){for(const b of boxes)if(b.sharp){ctx.strokeStyle='#d5f69a';ctx.lineWidth=1.5;ctx.strokeRect(b.x,b.y,b.w,b.h);}}
 if(!opts.clean){const bx=boxes.find(b=>b.id==='person');if(bx){const cx=bx.x+bx.w/2,yy=bx.y+bx.h*.25;ctx.strokeStyle='#f6fbdfcc';ctx.lineWidth=1;ctx.strokeRect(cx-13,yy-13,26,26);}}
 if(s.portrait&&s.sensor==='phone'&&!opts.clean)label(ctx,'PORTRÄTEFFEKT · KÜNSTLICHE TIEFENMASKE',x0+14,y0+h-16,9,'#fffbe7');
 const pickState={...state};
 return {boxes,imageRect:{x:x0,y:y0,w,h},pickAt:opts.clean?null:(x,y)=>{if(!pickContext){const offscreen=document.createElement('canvas');offscreen.width=W;offscreen.height=H;return drawPhoto(offscreen,pickState,t,{pickMap:true}).pickAt(x,y);}const xx=Math.floor((x-x0)*scale),yy=Math.floor((y-y0)*scale);if(xx<0||yy<0||xx>=rw||yy>=rh)return null;const pixel=pickContext.getImageData(xx,yy,1,1).data;return pickColor(pixel);}};
}
function base(canvas){const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;c.clearRect(0,0,W,H);c.fillStyle='#f5f6ed';c.fillRect(0,0,W,H);for(let x=20;x<W;x+=25)for(let y=20;y<H;y+=25)circle(c,x,y,.65,'#dbe1d2');return {c,W,H};}
export function drawSensors(canvas,state){
 const {c,W,H}=base(canvas),m=metrics(state),scale=Math.min(W/130,H/63),cx=W*.28,cy=H*.48;
 const order=['medium','full','apsc','mft','inch','phone'],colors=['#d5ddc6','#b6cbb3','#91b59e','#729f89','#4e8877','#266b5b'];
 label(c,'RELATIVE SENSORFLÄCHEN',W*.05,H*.09,18,C.muted);
 order.forEach((id,i)=>{const s=sensors[id],x=cx-s.w*scale/2,y=cy-s.h*scale/2;c.fillStyle=colors[i];c.fillRect(x,y,s.w*scale,s.h*scale);c.strokeStyle=id===state.sensor?'#bf8b35':'#fff9';c.lineWidth=id===state.sensor?3:1;c.strokeRect(x,y,s.w*scale,s.h*scale);});
 order.forEach((id,i)=>{const s=sensors[id],yy=H*.20+i*H*.095;c.fillStyle=colors[i];c.fillRect(W*.54,yy-13,18,18);label(c,s.name,W*.575,yy,20,id===state.sensor?C.teal:C.ink);label(c,`${s.w} × ${s.h} mm`,W*.94,yy,18,C.muted,'right');});
 label(c,`${m.sensor.name} · ${m.s.mp} MP`,W*.05,H*.83,24,C.teal);label(c,`Pixelabstand ${(m.pixel*1000).toFixed(2)} µm · Crop ${m.crop.toFixed(2)}×`,W*.05,H*.89,19,C.muted);
 label(c,'Größen sind maßstäblich; Beschriftungen stehen außerhalb der Flächen.',W*.05,H*.96,16,C.muted);
}

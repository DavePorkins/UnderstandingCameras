import {metrics,clamp,distanceText,sensors,crop} from './physics.mjs';
const C={ink:'#24483f',muted:'#798b7c',grid:'#dde5d6',teal:'#278b7b',amber:'#c38c39',coral:'#c56b53'};
function line(c,x1,y1,x2,y2,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();c.setLineDash([]);}
function label(c,t,x,y,size=12,color=C.ink,align='left'){c.font=`${size}px ${size<11?'ui-monospace,Consolas':'system-ui,sans-serif'}`;c.fillStyle=color;c.textAlign=align;c.fillText(t,x,y);c.textAlign='left';}
function poly(c,pts,fill,stroke){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function circle(c,x,y,r,fill){c.beginPath();c.arc(x,y,Math.max(0,r),0,Math.PI*2);c.fillStyle=fill;c.fill();}
function rounded(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();}
function arrow(c,x,y,dir,color){poly(c,[[x,y],[x-dir*8,y-4],[x-dir*8,y+4]],color);}
function dimension(c,x1,x2,y,t,color=C.muted){line(c,x1,y,x2,y,color);arrow(c,x1,y,-1,color);arrow(c,x2,y,1,color);label(c,t,(x1+x2)/2,y-7,10,color,'center');}
const canvases=new Map();
function buffer(key,w,h){let cv=canvases.get(key);if(!cv){cv=document.createElement('canvas');canvases.set(key,cv);}if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}const c=cv.getContext('2d',{willReadFrequently:true});c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.filter='none';c.globalAlpha=1;c.globalCompositeOperation='source-over';return [cv,c];}
export function sceneObjects(s,t=0){return [
 {id:'wall',type:'wall',x:0,z:s.background,height:3.8},
 {id:'tree-left',type:'tree',x:-3.2,z:s.background-.5,height:3.5},
 {id:'tree-right',type:'tree',x:3.7,z:s.background-1,height:4},
 {id:'bench',type:'bench',x:-1.7,z:s.background-2,height:.8},
 {id:'sculpture',type:'sculpture',x:2,z:Math.max(s.subject+2,s.background-3),height:1.9},
 {id:'person',type:'person',x:s.subjectX+(s.motion?Math.sin(t*s.speed*.4)*.6:0),z:s.subject,height:1.75,moving:true},
 {id:'plant',type:'plant',x:-1.2,z:s.foreground,height:1.05},
 {id:'ball',type:'ball',x:s.subjectX+.95+(s.motion?Math.sin(t*s.speed*.6)*.5:0),z:s.subject+.6,height:.35,moving:true},
 ].sort((a,b)=>b.z-a.z);}
export function drawPhoto(canvas,state,t=0,opts={}){
 const m=metrics(state),s=m.s,sensor=m.sensor,W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#e7ebdf';ctx.fillRect(0,0,W,H);
 const ratio=sensor.w/sensor.h;let w=W,h=W/ratio;if(h>H){h=H;w=H*ratio;}const x0=(W-w)/2,y0=(H-h)/2;
 // Work at a bounded raster size; blur and noise remain interactive on laptops.
 const rw=Math.round(Math.min(w,1100)),rh=Math.round(rw/ratio),scale=rw/w;
 const [cv,c]=buffer('photo',rw,rh),[layer,l]=buffer('layer',rw,rh);
 const k=rw*s.focal/sensor.w,cy=rh*.49;
 const project=(x,y,z)=>{const d=Math.max(z+s.cameraBack,.15);return [rw/2+(x-s.cameraX)*k/d,cy+(1.15-y)*k/d,k/d];};
 const night=s.scene==='night';
 let grad=c.createLinearGradient(0,0,0,rh);grad.addColorStop(0,night?'#263e50':s.scene==='studio'?'#cdc7b9':'#dce7d8');grad.addColorStop(.56,night?'#4c6264':'#dce2cc');grad.addColorStop(1,night?'#6c786e':'#b6c4a6');c.fillStyle=grad;c.fillRect(0,0,rw,rh);
 // A flat ground plane with real perspective projection.
 poly(c,[[0,cy],[rw,cy],[rw,rh],[0,rh]],night?'#788278':'#c5ceba');
 for(let z=2;z<55;z+=2){const a=project(-12,0,z),b=project(12,0,z);line(c,a[0],a[1],b[0],b[1],night?'#667467':'#b5c0ab',.6);}
 for(let x=-16;x<=16;x+=2){const a=project(x,0,1),b=project(x,0,60);line(c,a[0],a[1],b[0],b[1],night?'#667467':'#b3bfa7',.6);}
 const objList=sceneObjects(s,t);
 const boxes=[];
 for(const obj of objList){
  l.clearRect(0,0,rw,rh);l.filter='none';l.globalAlpha=1;
  const [px,py,q]=project(obj.x,0,obj.z),size=obj.height*q;
  if(px+size<0||px-size>rw||py-size>rh||py<0)continue;
  l.save();l.translate(px,py);l.scale(q,q);
  if(obj.type==='wall'){
   l.fillStyle=night?'#788276':'#c8c9b3';l.fillRect(-15,-3.8,30,3.8);
   l.fillStyle=night?'#565f52':'#d9d5bd';l.fillRect(-15,-3.84,30,.14);l.fillRect(-15,-.16,30,.16);
   for(let x=-13;x<=13;x+=1.6){
    rounded(l,x,-3.2,1.05,1.9,.05,night?'#d4b77e':'#879e8a');
    l.fillStyle=night?'#c8bd91':'#acc1aa';l.fillRect(x+.06,-3.12,.93,.83);
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
   const leg=s.motion&&s.speed>0?Math.sin(t*s.speed*4)*.09:0;
   poly(l,[[-.21,-.82],[-.01,-.82],[-.06+leg,-.11],[-.21+leg,-.08]],'#485a53');
   poly(l,[[.02,-.82],[.2,-.82],[.24-leg,-.07],[.08-leg,-.09]],'#394e48');
   rounded(l,-.24+leg,-.1,.23,.09,.025,'#e9e7d8');rounded(l,.07-leg,-.09,.27,.09,.025,'#e9e7d8');
   rounded(l,-.26,-1.42,.52,.67,.08,'#c67a59');
   poly(l,[[-.23,-1.4],[-.36,-1.36],[-.43,-.85],[-.29,-.82],[-.13,-1.25]],'#b2644e');
   poly(l,[[.23,-1.4],[.35,-1.33],[.43,-.9],[.29,-.84],[.15,-1.22]],'#d18b68');
   circle(l,-.36,-.82,.075,'#ddba8f');circle(l,.36,-.85,.075,'#ddba8f');
   l.fillStyle='#deb993';l.fillRect(-.07,-1.52,.14,.17);circle(l,0,-1.59,.15,'#dfbd98');
   l.beginPath();l.arc(-.015,-1.64,.16,Math.PI,Math.PI*2.05);l.fillStyle='#514b38';l.fill();
   line(l,0,-1.36,0,-.78,'#edd0a4',.016);line(l,-.16,-.99,-.06,-.99,'#ab5d4b',.012);line(l,.07,-.99,.18,-.99,'#ab5d4b',.012);
   circle(l,-.055,-1.59,.009,'#564b3c');circle(l,.055,-1.59,.009,'#564b3c');line(l,-.035,-1.53,.04,-1.53,'#b07e62',.01);
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
  let blur=m.blurAt(obj.z+s.cameraBack)/sensor.w*rw/2;
  // Diffraction is displayed as a gentle whole-image softness, not an Airy PSF convolution.
  const diffraction=Math.max(0,m.airy/m.pixel-2)*.09;
  blur=Math.sqrt(blur*blur+diffraction*diffraction);
  if(s.portrait&&s.sensor==='phone'&&obj.z>s.subject+1)blur=Math.max(blur,10);
  c.save();c.filter=`blur(${clamp(blur,0,36)}px)`;
  const smear=obj.moving?m.motionMM/sensor.w*rw:0;
  const copies=smear>1?Math.min(19,Math.ceil(smear/2)):1;
  if(copies===1)c.drawImage(layer,0,0);
  else {const[mv,mc]=buffer('movement',rw,rh);mc.globalCompositeOperation='lighter';mc.globalAlpha=1/copies;for(let n=0;n<copies;n++){const shift=(n/(copies-1)-.5)*Math.min(smear,rw);mc.drawImage(layer,shift,0);}c.drawImage(mv,0,0);}
  c.restore();
  if(obj.type!=='wall')boxes.push({id:obj.id,x:x0+(px-size*.3)/scale,y:y0+(py-size)/scale,w:size*.6/scale,h:size/scale,z:obj.z+s.cameraBack,sharp:m.blurAt(obj.z+s.cameraBack)<=m.coc});
 }
 if(!s.tripod){const smear=s.time*s.focal*m.crop*(s.stabilization?.15:1)*2; if(smear>1){const[sh,sc]=buffer('shake',rw,rh);sc.drawImage(cv,0,0);c.globalAlpha=.35;c.drawImage(sh,Math.min(18,smear),Math.min(9,smear*.3));c.globalAlpha=1;}}
 // Fixed sRGB display model with physically directed exposure and photon-noise proxy.
 const data=c.getImageData(0,0,rw,rh),a=data.data,gain=2**clamp(m.offset,-12,10),balance=Math.log(s.wb/s.temperature);
 const gains=[Math.exp(balance*.65),1,Math.exp(-balance*.65)];
 for(let i=0;i<a.length;i+=4){
  let rnd=((i*1664525+1013904223)>>>0)/4294967296; // Deterministic texture keeps A/B stable.
  const rnd2=(((i+73)*22695477+1)>>>0)/4294967296;
  const n=(rnd+rnd2-1)*m.noise;
  for(let j=0;j<3;j++){let v=(a[i+j]/255)**2.2;v=(v+n*Math.sqrt(Math.max(v,.001))*.55)*gain*gains[j];a[i+j]=Math.round(255*clamp(v,0,1)**(1/2.2));}
 }
 c.putImageData(data,0,0);
 if(s.zebra){c.strokeStyle='#da5e4888';c.lineWidth=2;for(let yy=0;yy<rh;yy+=10){for(let xx=0;xx<rw;xx+=10){const i=(yy*rw+xx)*4;if(Math.max(a[i],a[i+1],a[i+2])>=254)line(c,xx,yy,xx+7,yy-7,'#e3554499',2);}}}
 ctx.drawImage(cv,x0,y0,w,h);
 if(s.grid&&!opts.clean){for(const fr of[1/3,2/3]){line(ctx,x0+w*fr,y0,x0+w*fr,y0+h,'#fff9',1);line(ctx,x0,y0+h*fr,x0+w,y0+h*fr,'#fff9',1);}}
 if(s.peaking&&!opts.clean){for(const b of boxes)if(b.sharp){ctx.strokeStyle='#d5f69a';ctx.lineWidth=1.5;ctx.strokeRect(b.x,b.y,b.w,b.h);}}
 if(!opts.clean){const bx=boxes.find(b=>b.id==='person');if(bx){const cx=bx.x+bx.w/2,yy=bx.y+bx.h*.25;ctx.strokeStyle='#f6fbdfcc';ctx.lineWidth=1;ctx.strokeRect(cx-13,yy-13,26,26);}}
 if(s.portrait&&s.sensor==='phone'&&!opts.clean)label(ctx,'PORTRÄTEFFEKT · KÜNSTLICHE TIEFENMASKE',x0+14,y0+h-16,9,'#fffbe7');
 return {boxes,imageRect:{x:x0,y:y0,w,h}};
}
function base(canvas){const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height;c.clearRect(0,0,W,H);c.fillStyle='#f5f6ed';c.fillRect(0,0,W,H);for(let x=20;x<W;x+=25)for(let y=20;y<H;y+=25)circle(c,x,y,.65,'#dbe1d2');return {c,W,H};}
export function drawOptics(canvas,state){
 const {c,W,H}=base(canvas),m=metrics(state),s=m.s;const sx=W/1000,sy=H/600;c.save();c.scale(sx,sy);
 const cy=285,lx=475,sensorX=825,objX=90,top=cy-94;
 label(c,'VOM MOTIV ZUM SENSOR',36,65,12,C.muted);
 // Cutaway outlines show where the ideal optical model sits in a camera.
 c.strokeStyle='#b6c7b6';c.lineWidth=1.5;
 c.strokeRect(432,cy-131,106,262);
 c.beginPath();c.moveTo(538,cy-98);c.lineTo(645,cy-98);c.lineTo(645,cy-131);c.lineTo(875,cy-131);c.lineTo(875,cy+131);c.lineTo(645,cy+131);c.lineTo(645,cy+98);c.lineTo(538,cy+98);c.stroke();
 label(c,'Objektiv',485,cy-143,10,C.muted,'center');
 label(c,'Kameragehäuse · Aufnahme',747,cy-155,10,C.muted,'center');
 // Shutter curtains are fully retracted during the idealized exposure.
 rounded(c,790,cy-117,12,22,2,'#899c8b');rounded(c,790,cy+95,12,22,2,'#899c8b');
 if(s.body==='dslr'){line(c,647,cy-119,740,cy-119,'#819588',4);line(c,647,cy-89,724,cy+1,'#9eaea2',1,[4,5]);label(c,'Spiegel oben',692,cy-132,9,C.muted,'center');}
 const objectDistance=(s.subject+s.cameraBack)*1000,focusDistance=s.focus*1000;
 const vObj=s.focal*objectDistance/(objectDistance-s.focal),vFocus=m.v;
 const imageX=lx+(sensorX-lx)*vObj/vFocus;
 const iy=cy+(cy-top)*(imageX-lx)/(lx-objX);
 const aperture=clamp(m.apertureDiameter*3.2,8,155);
 line(c,35,cy,940,cy,'#aebcab',1,[5,6]);
 // Rays leave the object, pass the aperture and intersect on its conjugate image plane.
 for(const off of[-aperture/2,0,aperture/2]){
  const yy=cy+off,atSensor=yy+(iy-yy)*(sensorX-lx)/(imageX-lx);
  line(c,objX,top,lx,yy,off===0?'#d3a051':'#b88636',1.8);
  line(c,lx,yy,sensorX,atSensor,off===0?'#d3a051':'#b88636',1.8);
  if(Math.abs(imageX-sensorX)>1)line(c,sensorX,atSensor,imageX,iy,'#b88636',1,[3,4]);
 }
 poly(c,[[objX,cy],[objX,top],[objX-6,top+10],[objX,top-7],[objX+6,top+10],[objX,top]],C.coral);
 label(c,'Motivpunkt',objX,cy+30,12,C.coral,'center');label(c,distanceText(s.subject+s.cameraBack),objX,cy+49,10,C.muted,'center');
 // Lens principal plane; housing is a diagram, not a real optical prescription.
 c.beginPath();c.ellipse(lx,cy,17,119,0,0,7);c.fillStyle='#9ac6b540';c.fill();c.strokeStyle='#7ba797';c.lineWidth=2;c.stroke();
 c.fillStyle='#415f52';c.fillRect(lx-5,cy-124,10,124-aperture/2);c.fillRect(lx-5,cy+aperture/2,10,124-aperture/2);
 label(c,'Dünne Linse + Blende',lx,cy+153,12,C.ink,'center');label(c,`D = f / N = ${m.apertureDiameter.toFixed(1)} mm`,lx,cy+174,11,C.teal,'center');
 c.fillStyle='#387a69';c.fillRect(sensorX-3,cy-115,6,230);label(c,'Sensor',sensorX,cy-137,12,C.teal,'center');
 circle(c,imageX,iy,4,C.coral);label(c,'invertiertes Bild',imageX+13,iy+5,10,C.coral);
 const blur=m.blurAt(s.subject+s.cameraBack);const blurR=clamp(blur*850,2,35);circle(c,sensorX,iy,blurR,'#c77b5550');
 dimension(c,objX,lx,cy+98,`Gegenstandsweite u = ${distanceText(s.subject+s.cameraBack)}`);
 dimension(c,lx,sensorX,cy-182,`Bildweite v = ${vFocus.toFixed(2)} mm`,C.teal);
 // Sensor-plane detail separates focus error from visual compression of axial distances.
 rounded(c,665,440,290,118,8,'#e7eee1');label(c,'SENSORDETAIL · STARK VERGRÖSSERT',682,462,9,C.muted);
 circle(c,705,504,clamp(blur*900,2,30),'#be8b4670');circle(c,705,504,2,C.amber);
 label(c,`Unschärfekreis: ${(blur*1000).toFixed(1)} µm`,746,493,11,C.ink);label(c,`Schärfekriterium: ${(m.coc*1000).toFixed(1)} µm`,746,514,10,C.muted);
 label(c,blur<=m.coc?'innerhalb des Kriteriums':'größer als das Kriterium',746,535,10,blur<=m.coc?C.teal:C.coral);
 label(c,`Fokus: ${distanceText(s.focus)}  ·  1/f = 1/u + 1/v`,38,497,13,C.ink);
 label(c,'Axiale Abstände verkürzt; Strahlhöhen schematisch.',38,523,10,C.muted);
 label(c,'ISO ändert die Verstärkung nach dem Sensor, nicht diese Strahlen.',38,545,10,C.muted);
 if(s.body==='dslr')label(c,'DSLR: Während der Aufnahme ist der Spiegel hochgeklappt.',38,571,10,C.muted);
 c.restore();
}
export function drawSpace(canvas,state){
 const {c,W,H}=base(canvas),m=metrics(state),s=m.s;const margin=80,maxZ=Math.max(20,s.background+s.cameraBack+4,s.focus+3),scale=(W-margin*2)/maxZ,cy=H*.48;
 const map=z=>margin+z*scale;label(c,'RAUMPLAN · DRAUFSICHT',30,55,12,C.muted);
 const nf=map(Math.min(maxZ,m.near)),ff=map(Math.min(maxZ,m.far));c.fillStyle='#3c998619';c.fillRect(nf,90,Math.max(ff-nf,0),H-190);
 const fan=Math.min(220,Math.tan(m.fov*Math.PI/360)*(W-2*margin));poly(c,[[margin,cy],[W-margin,cy-fan],[W-margin,cy+fan]],'#bd913213');
 line(c,margin,cy,W-margin,cy-fan,'#c8a766',1,[5,4]);line(c,margin,cy,W-margin,cy+fan,'#c8a766',1,[5,4]);
 rounded(c,margin-27,cy-18,33,36,5,C.ink);rounded(c,margin+3,cy-11,14,22,3,C.teal);label(c,'Kamera',margin,cy+46,11,C.ink,'center');
 for(let z=0;z<=maxZ;z+=2){const x=map(z);line(c,x,H-80,x,H-74,C.muted);label(c,`${z} m`,x,H-55,10,C.muted,'center');}
 line(c,margin,H-80,W-margin,H-80,C.muted);
 const focus=map(s.focus);line(c,focus,90,focus,H-100,C.teal,2,[5,4]);label(c,'FOKUSEBENE',focus,77,10,C.teal,'center');
 const items=[{key:'foreground',z:s.foreground+s.cameraBack,y:cy-(-1.2-s.cameraX)*scale,color:'#7c9b64',name:'Pflanze'},{key:'subject',z:s.subject+s.cameraBack,y:cy-(s.subjectX-s.cameraX)*scale,color:C.coral,name:'Person'},{key:'background',z:s.background+s.cameraBack,y:cy-3.2*scale,color:'#899b85',name:'Hintergrund'}];
 const hits=[];items.forEach(o=>{const x=map(o.z);circle(c,x,o.y,15,o.color);circle(c,x,o.y,5,'#fff9');line(c,x,o.y+21,x,o.y+34,o.color);label(c,o.name,x,o.y+50,12,o.color,'center');label(c,distanceText(o.z),x,o.y+68,10,C.muted,'center');hits.push({key:o.key,x,y:o.y,z:o.z,scale,margin});});
 label(c,`Scharf erscheinend: ${distanceText(m.near)} bis ${distanceText(m.far)}`,30,H-20,12,C.teal);
 label(c,'Punkte ziehen: Abstand ändern · leere Stelle anklicken: fokussieren',W-25,H-20,10,C.muted,'right');
 return {hits,scale,margin,maxZ};
}
export function drawSensors(canvas,state){
 const {c,W,H}=base(canvas),m=metrics(state),scale=Math.min(W/115,H/67),cx=W*.37,cy=H*.53;
 label(c,'SENSORFLÄCHE · RELATIVE GRÖSSEN',30,55,12,C.muted);
 const order=['medium','full','apsc','mft','inch','phone'];const colors=['#d5ddc6','#b6cbb3','#91b59e','#729f89','#4e8877','#266b5b'];
 order.forEach((key,i)=>{const s=sensors[key],x=cx-s.w*scale/2,y=cy-s.h*scale/2;c.fillStyle=colors[i];c.fillRect(x,y,s.w*scale,s.h*scale);c.strokeStyle=key===state.sensor?'#bf8b35':'#fff9';c.lineWidth=key===state.sensor?3:1;c.strokeRect(x,y,s.w*scale,s.h*scale);label(c,s.name,x+5,y+13,9,i>3?'#edf4df':'#294b3d');});
 const tx=W*.7;label(c,m.sensor.name,tx,H*.25,24,C.ink);
 const lines=[`${m.sensor.w} × ${m.sensor.h} mm`,`${(m.sensor.w*m.sensor.h).toFixed(0)} mm² Sensorfläche`,`Crop-Faktor: ${m.crop.toFixed(2)}×`,`Reale Brennweite: ${m.s.focal.toFixed(1)} mm`,`KB-äquivalent (diagonal): ${m.equivalent.toFixed(0)} mm`,`Pixelabstand: ${(m.pixel*1000).toFixed(2)} µm bei ${m.s.mp} MP`];
 lines.forEach((t,i)=>label(c,t,tx,H*.33+i*27,12,i>2?C.teal:C.muted));
 label(c,'Die Gehäusegröße ist nicht die Sensorgröße.',30,H-62,12,C.ink);
 label(c,'Gleiche Blendenzahl + gleiche Zeit: ähnliche Belichtung pro Fläche; größere Fläche sammelt insgesamt mehr Licht.',30,H-36,10,C.muted);
}

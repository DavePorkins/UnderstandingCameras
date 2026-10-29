import {metrics,cameraModel,clamp,distanceText,shutterText,actors,actorDistance,nearest,apertures,shutters,focalStops,isos} from './physics.mjs';
import {tr} from './i18n.mjs';
import {drawIris,pupilSection} from './pupil.mjs';
export function diagramDragValue(key,start,dx,dy){if(key==='aperture')return clamp(start*2**(dy/70),1.4,22);if(key==='time')return nearest(shutters,clamp(start*2**(dy/35),1/8000,2));if(key==='iso')return nearest(isos,clamp(start*2**(-dy/35),100,12800));if(key==='focus')return clamp(start*2**(dx/100),.3,50);return clamp(start*2**(-dx/120),2,200);}
const lightColors={ink:'#2a3652',muted:'#68778f',teal:'#2a8b78',amber:'#bd8b37',coral:'#bf7055',line:'#cbd8c3'},darkColors={ink:'#edf2ff',muted:'#b9c7df',teal:'#72d0b8',amber:'#e7bc70',coral:'#e99e83',line:'#52655c'},colors={...lightColors};
let diagramDark=false,diagramMobile=false,diagramRatio=1,diagramMinFont=0;
const darkDiagramColors={'#f4f6eb':'#192821','#c06d55':'#efa68c','#739363':'#a9cd91','#6d8fa6':'#9bbfd9','#cbd8c3':'#52655c','#b8c7ae':'#52655c','#b59b62':'#cfb77e','#8c9a83':'#b5c3a8','#bc9d51':'#e3c77e','#e7eedf':'#263d32','#35594a':'#668c78','#e8efcf':'#d8e8bd','#d0e6d1':'#426851','#eeddbb':'#92743b','#d6c695':'#a18f58','#aab99d':'#6b8171'};
function diagramColor(value){return diagramDark?(darkDiagramColors[value.slice(0,7)]||value.slice(0,7))+value.slice(7):value;}
function stroke(c,points,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=diagramColor(color);c.lineWidth=width;c.stroke();c.setLineDash([]);}
function textAt(c,t,x,y,size,color=colors.ink,align='center'){c.fillStyle=diagramColor(color);c.font=`${Math.max(size,diagramMinFont,diagramMobile?10*diagramRatio:0)}px system-ui,sans-serif`;c.textAlign=align;c.fillText(tr(t),x,y);}
function dot(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=diagramColor(color);c.fill();}
function rect(c,x,y,w,h,color,r=0){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=diagramColor(color);c.fill();}
function setup(canvas){diagramDark=typeof document!=='undefined'&&document.documentElement.dataset.theme==='dark';diagramMobile=typeof document!=='undefined'&&document.documentElement.dataset.layout==='mobile';diagramMinFont=0;diagramRatio=canvas.width/Math.max(1,canvas.getBoundingClientRect().width);Object.assign(colors,diagramDark?darkColors:lightColors);const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,k=Math.min(W/900,H/520);c.clearRect(0,0,W,H);c.fillStyle=diagramColor('#f4f6eb');c.fillRect(0,0,W,H);return {c,W,H,k};}
export const raySubjects={person:{name:'Person',color:'#c06d55',height:.6},plant:{name:'Pflanze',color:'#739363',height:-.1},background:{name:'Hintergrund',color:'#6d8fa6',height:1.25}};
export function cutawayGeometry(W,H,state){
 const m=metrics(state),s=m.s,k=Math.min(W/900,H/520),cy=H*.35,half=Math.min(H*.19,W*.14);
 const front=W*clamp(.27-.045*Math.log2(s.focal/50),.17,.38),rear=W*(.51-clamp((m.v-s.focal)/s.focal,0,2)*.06),iris=front+(rear-front)*.52,sensor=W*.78,shutter=W*.72,gain=W*.875,ys=half/40,sensorHeight=m.sensor.h*ys;
 const parts=[{key:'focal',x:front,y:cy,w:34*k,h:half*2+16*k},{key:'aperture',x:iris,y:cy,w:34*k,h:half*2+16*k},{key:'focus',x:rear,y:cy,w:34*k,h:half*2+16*k},{key:'time',x:shutter,y:cy,w:30*k,h:half*2+16*k},{key:'iso',x:gain,y:cy,w:66*k,h:54*k}];
 return {front,rear,iris,sensor,shutter,gain,ys,cy,half,sensorHeight,parts,bodyRight:W*.975};
}
export function drawCutaway(canvas,state,{active='aperture',hovered=null}={}){
 const {c,W,H,k}=setup(canvas);c.fillStyle=diagramDark?'#29233e':'#f4f0ff';c.fillRect(0,0,W,H);const m=metrics(state),s=m.s,cam=cameraModel(state),g=cutawayGeometry(W,H,state),{front,rear,iris,sensor,shutter,gain,ys,cy,half,parts}=g,y=v=>cy-v*ys,font=20*k;
 textAt(c,'Objektiv',W*.38,H*.075,font,colors.muted);textAt(c,s.body==='dslr'?'DSLR · Spiegel hochgeklappt':'Kameragehäuse',W*.75,H*.075,font*.82,colors.muted);
 c.strokeStyle='#b9cbb1';c.lineWidth=2*k;c.strokeRect(front-25*k,cy-half-10*k,rear-front+50*k,2*half+20*k);c.beginPath();c.roundRect(rear+25*k,cy-half+5*k,g.bodyRight-rear-25*k,half*2-10*k,9*k);c.stroke();
 for(const p of parts){if(p.key===active)rect(c,p.x-p.w/2,p.y-p.h/2,p.w,p.h,p.key==='aperture'?'#eeddbb99':'#d0e6d183',6*k);if(p.key===hovered){rect(c,p.x-p.w/2,p.y-p.h/2,p.w,p.h,'#d6c69550',6*k);c.strokeStyle=colors.amber;c.lineWidth=1.7*k;c.strokeRect(p.x-p.w/2,p.y-p.h/2,p.w,p.h);}}
 stroke(c,[[W*.02,cy],[sensor,cy]],'#b8c7ae',k,[5*k,5*k]);
 const targets=s.rayTargets.split(',').filter(t=>raySubjects[t]&&actorDistance(s,t)>.15);
 c.save();c.beginPath();c.rect(0,H*.10,W,H*.49);c.clip();
 for(const id of targets){const meta=raySubjects[id],dist=actorDistance(s,id),opt=cameraModel(state,{distance:dist,pointHeight:meta.height}),ox=front-W*(.075+.11*Math.log(Math.max(dist,1))/Math.log(40)),oy=cy-clamp(meta.height,-1,2)*half*.8;
  for(const ray of opt.rays){stroke(c,[[ox,oy],[front,y(ray.firstY)],[iris,y(ray.irisY)],[rear,y(ray.rearY)],[sensor,y(ray.sensorY)]],meta.color,1.8*k);const ix=rear+(opt.conjugateZ-opt.d)/(opt.sensorZ-opt.d)*(sensor-rear);if(Math.abs(ix-sensor)>2*k&&ix<W*.97&&ix>rear)stroke(c,[[sensor,y(ray.sensorY)],[ix,y(ray.imageY)]],meta.color,k,[4*k,3*k]);}
  dot(c,ox,oy,4*k,meta.color);
 }
 c.restore();
 for(const[x,r]of[[front,half*.96],[rear,half*.82]]){c.beginPath();c.ellipse(x,cy,11*k,r,0,0,7);c.fillStyle='#86bea03b';c.fill();c.strokeStyle='#6aa58b';c.lineWidth=2*k;c.stroke();}
 const section=pupilSection(s),openingTop=clamp(section[1]*cam.irisDiameter*ys/2,1.5*k,half*.88),openingBottom=clamp(-section[0]*cam.irisDiameter*ys/2,1.5*k,half*.88);rect(c,iris-4*k,cy-half,8*k,half-openingTop,colors.ink);rect(c,iris-4*k,cy+openingBottom,8*k,half-openingBottom,colors.ink);
 const sh=g.sensorHeight;stroke(c,[[sensor,cy-sh/2],[sensor,cy+sh/2]],colors.teal,1.2*k);dot(c,sensor,cy-sh/2,2*k,colors.teal);dot(c,sensor,cy+sh/2,2*k,colors.teal);
 rect(c,shutter-8*k,cy-half+5*k,16*k,half*.33,'#303638');rect(c,shutter-8*k,cy+half-half*.33-5*k,16*k,half*.33,'#555b5e');for(let i=1;i<4;i++){stroke(c,[[shutter-8*k,cy-half+5*k+i*half*.08],[shutter+8*k,cy-half+5*k+i*half*.08]],'#d2dbc266',k);stroke(c,[[shutter-8*k,cy+half-5*k-i*half*.08],[shutter+8*k,cy+half-5*k-i*half*.08]],'#e7d2a966',k);}
 textAt(c,'Sensor',sensor,cy-sh/2-9*k,font*.8,colors.teal);
 for(const [i,p]of parts.entries())textAt(c,String(i+1),p.x,cy+half+26*k,font*.9,p.key==='aperture'?colors.amber:colors.teal);
 if(s.body==='dslr')stroke(c,[[rear+40*k,cy-half+15*k],[shutter-25*k,cy-half+15*k]],'#8c9e89',4*k);
 stroke(c,[[sensor+5*k,cy],[gain-37*k,cy]],'#91a58c',1.6*k);
 rect(c,gain-29*k,cy-20*k,58*k,40*k,'#e7eedf',5*k);c.strokeStyle='#799b87';c.lineWidth=1.5*k;c.strokeRect(gain-29*k,cy-20*k,58*k,40*k);
 for(let pin=-2;pin<=2;pin++){stroke(c,[[gain-36*k,cy+pin*7*k],[gain-29*k,cy+pin*7*k]],'#799b87',1.4*k);stroke(c,[[gain+29*k,cy+pin*7*k],[gain+36*k,cy+pin*7*k]],'#799b87',1.4*k);}
 textAt(c,'ISO',gain,diagramMobile?cy+3*diagramRatio:cy-5*k,13*k,colors.teal);if(!diagramMobile)textAt(c,`×${(s.iso/100).toFixed(0)}`,gain,cy+12*k,13*k,colors.teal);
 textAt(c,'Signal',gain,cy-30*k,13*k,colors.muted);
 const lower=H*.81,r=Math.min(H*.09,38*k);drawIris(c,W*.10,lower,r,s,{dark:diagramDark});
 textAt(c,`ƒ/${Number(s.aperture.toFixed(1))}`,W*.19,lower-font*.08,font,colors.amber,'left');textAt(c,`Pupille ${m.apertureDiameter.toFixed(1)} mm`,W*.19,lower+font*.9,font*.72,colors.muted,'left');

 const optics=targets.map(id=>({id,meta:raySubjects[id],opt:cameraModel(state,{distance:actorDistance(s,id),pointHeight:raySubjects[id].height})}));
 const largest=Math.max(.05,...optics.map(v=>Math.abs(v.opt.conjugateZ-v.opt.sensorZ))),lensX=W*.61,sx=W*.78,span=W*.095;
 textAt(c,'Fokuslage · vergrößert',W*.73,H*.655,font*.68,colors.muted);
 optics.forEach(({id,meta,opt},i)=>{const yy=H*(targets.length===1?.82:.72+i*.09),delta=opt.conjugateZ-opt.sensorZ,ix=sx+delta/largest*span,end=W*.90;
  stroke(c,[[sx,yy-11*k],[sx,yy+11*k]],colors.teal,k);
  for(const sign of[-1,1]){const y0=yy+sign*8*k,yend=yy+sign*8*k*(1-(end-lensX)/(ix-lensX));stroke(c,[[lensX,y0],[ix,yy],[end,yend]],meta.color,1.2*k);}
  dot(c,ix,yy,2*k,meta.color);textAt(c,meta.name,W*.53,yy+3*k,14*k,meta.color);
  const b=m.blurAt(actorDistance(s,id)),xx=W*.955;dot(c,xx,yy,clamp(b*90*k,1.2*k,9*k),meta.color+'77');c.beginPath();c.arc(xx,yy,clamp(m.coc*90*k,1.2*k,9*k),0,7);c.setLineDash([2*k,2*k]);c.strokeStyle=meta.color;c.lineWidth=k;c.stroke();c.setLineDash([]);
  textAt(c,`${delta>0?'+':''}${delta.toFixed(2)} mm`,W*.75,yy+20*k,12*k,colors.muted);
 });
 textAt(c,'Sensor',sx,H*.99,10*k,colors.teal);
 return {parts:[...parts,{key:'aperture',x:W*.10,y:lower,w:r*2,h:r*2}],width:W};
}
export function roomGeometry(W,H,state,bounds){
 const m=metrics(state),s=m.s,margin=W*.065,minZ=bounds?.minZ??Math.min(-9,-s.cameraBack-3,...Object.values(actors).filter(a=>a.z!=='cameraBack').map(a=>s[a.z]-3)),maxZ=bounds?.maxZ??Math.max(17,-s.cameraBack+4,...Object.values(actors).filter(a=>a.z!=='cameraBack').map(a=>s[a.z]+3),s.focus-s.cameraBack+2),scale=(W-2*margin)/(maxZ-minZ),cy=H*.42;
 const sideRange=Math.max(3,...Object.values(actors).filter(a=>a.x).map(a=>Math.abs(s[a.x]))),sideScale=bounds?.sideScale??Math.min(scale,H*.54/(2*sideRange));
 return {m,s,margin,minZ,maxZ,scale,cy,sideScale,x:z=>margin+(z-minZ)*scale,y:a=>cy+a*sideScale};
}
export function drawRoom(canvas,state,{selected='person',bounds}={}){
 const {c,W,H}=setup(canvas),k=W/900;diagramMinFont=11.5*diagramRatio;c.fillStyle=diagramDark?'#352337':'#fff0f6';c.fillRect(0,0,W,H);const layout=roomGeometry(W,H,state,bounds),{m,s,margin,minZ,maxZ,scale,cy,sideScale,x,y}=layout,camX=x(-s.cameraBack),camY=y(s.cameraX);
 const near=x(clamp(m.near-s.cameraBack,minZ,maxZ)),far=x(clamp(m.far-s.cameraBack,minZ,maxZ));rect(c,near,H*.08,Math.max(far-near,1),H*.7,'#399e801c');
 const focus=x(s.focus-s.cameraBack);stroke(c,[[focus,H*.06],[focus,H*.81]],colors.teal,2*k,[4*k,3*k]);
 const spread=Math.tan(m.fov*Math.PI/360)*(maxZ+s.cameraBack)*sideScale;stroke(c,[[W-margin,camY-spread],[camX,camY],[W-margin,camY+spread]],'#b59b62',1.3*k,[5*k,4*k]);
 if(s.lampOn){const lx=x(s.lampZ),ly=y(s.lampX);c.save();c.fillStyle='#dcb04e28';if(s.lampType==='spot'){const angle=s.lampAngle*Math.PI/180,length=7;c.beginPath();c.moveTo(lx,ly);for(const a of[angle-.5,angle+.5])c.lineTo(x(s.lampZ+Math.cos(a)*length),y(s.lampX+Math.sin(a)*length));c.closePath();c.fill();}else{const radius=clamp(Math.sqrt(2**(s.lampEV-s.ev)*4),1.5,12);c.translate(lx,ly);c.scale(scale,sideScale);const glow=c.createRadialGradient(0,0,0,0,0,radius);glow.addColorStop(0,'#d9ac3b44');glow.addColorStop(1,'#d9ac3b00');c.fillStyle=glow;c.beginPath();c.arc(0,0,radius,0,7);c.fill();}c.restore();}
 const hits=[];for(const [id,a]of Object.entries(actors)){if(id==='lamp'&&!s.lampOn)continue;const zz=id==='camera'?-s.cameraBack:s[a.z],xx=x(zz),yy=id==='background'?H*.16:y(a.x?s[a.x]:0),color=id==='person'?'#c06d55':id==='plant'?'#739363':id==='background'?'#6d8fa6':id==='ball'?'#bc9d51':id==='sculpture'?'#8c9a83':colors.teal;
  if(id===selected)dot(c,xx,yy,Math.max(19*k,16*diagramRatio),color+'35');
  if(id==='camera'){const icon=Math.max(k,.85*diagramRatio);rect(c,xx-16*icon,yy-12*icon,27*icon,24*icon,colors.ink,4*icon);rect(c,xx+9*icon,yy-7*icon,10*icon,14*icon,colors.teal,2*icon);}else{if(id==='background')stroke(c,[[xx,H*.1],[xx,H*.73]],'#9aad91',2*k);dot(c,xx,yy,Math.max(10*k,8*diagramRatio),color);dot(c,xx,yy,Math.max(3.5*k,3*diagramRatio),'#ffffef');}
  const up=id==='ball'||id==='sculpture'||id==='lamp',name=id==='lamp'?(s.lampType==='spot'?'Spot':'Laterne'):a.name;if(!diagramMobile||id===selected||id==='camera'||id==='background')textAt(c,name,xx,yy+(up?-32:28)*Math.max(k,.85*diagramRatio),17*k,color);hits.push({id,x:xx,y:yy,scale,margin,minZ});
 }
 textAt(c,'Links im Bild',margin,H*.07,12*k,colors.muted,'left');textAt(c,'Rechts im Bild',margin,H*.79,12*k,colors.muted,'left');
 stroke(c,[[margin,H*.89],[W-margin,H*.89]],'#aab99d',k);const tick=Math.max(5,Math.ceil((maxZ-minZ)/50)*5);for(let z=Math.ceil(minZ/tick)*tick;z<=maxZ;z+=tick){stroke(c,[[x(z),H*.89],[x(z),H*.91]],'#aab99d',k);textAt(c,`${z} m`,x(z),H*.99,15*k,colors.muted);}
 return {hits,scale,sideScale,margin,minZ,maxZ,cy};
}

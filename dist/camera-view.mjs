import {metrics,cameraModel,clamp,distanceText,shutterText,actors,actorDistance} from './physics.mjs';
const colors={ink:'#274b40',muted:'#7b8e7e',teal:'#2a8b78',amber:'#bd8b37',coral:'#bf7055',line:'#cbd8c3'};
function stroke(c,points,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();c.setLineDash([]);}
function textAt(c,t,x,y,size,color=colors.ink,align='center'){c.fillStyle=color;c.font=`${size}px system-ui,sans-serif`;c.textAlign=align;c.fillText(t,x,y);}
function dot(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=color;c.fill();}
function rect(c,x,y,w,h,color,r=0){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}
function setup(canvas){const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,k=W/900;c.clearRect(0,0,W,H);c.fillStyle='#f4f6eb';c.fillRect(0,0,W,H);return {c,W,H,k};}
export const raySubjects={person:{name:'Person',color:'#c06d55',height:.6},plant:{name:'Pflanze',color:'#739363',height:-.1},background:{name:'Hintergrund',color:'#6d8fa6',height:1.25}};
export function drawCutaway(canvas,state,{active='aperture'}={}){
 const {c,W,H,k}=setup(canvas),m=metrics(state),s=m.s,cam=cameraModel(state),cy=H*.35;
 const front=W*clamp(.27-.045*Math.log2(s.focal/50),.17,.38),rear=W*(.51-clamp((m.v-s.focal)/s.focal,0,2)*.06),iris=front+(rear-front)*.52,sensor=W*.80,shutter=W*.75,gain=W*.90;
 const half=Math.min(H*.19,W*.14),ys=half/(s.focal*.6+13),y=v=>cy-v*ys,font=20*k;
 textAt(c,'Objektiv',W*.38,H*.075,font,colors.muted);textAt(c,s.body==='dslr'?'DSLR · Spiegel hochgeklappt':'Kameragehäuse',W*.75,H*.075,font*.82,colors.muted);
 c.strokeStyle='#b9cbb1';c.lineWidth=2*k;c.strokeRect(front-25*k,cy-half-10*k,rear-front+50*k,2*half+20*k);c.beginPath();c.roundRect(rear+25*k,cy-half+5*k,W*.40,half*2-10*k,9*k);c.stroke();
 const parts=[{key:'focal',x:front,y:cy},{key:'aperture',x:iris,y:cy},{key:'focus',x:rear,y:cy},{key:'time',x:shutter,y:cy},{key:'iso',x:gain,y:cy}].map(p=>({...p,w:32*k,h:2*half+16*k}));
 for(const p of parts)if(p.key===active)rect(c,p.x-p.w/2,cy-half-8*k,p.w,half*2+16*k,p.key==='aperture'?'#eeddbb99':'#d0e6d183',6*k);
 stroke(c,[[W*.02,cy],[W*.96,cy]],'#b8c7ae',k,[5*k,5*k]);
 const targets=s.rayTargets.split(',').filter(t=>raySubjects[t]);
 for(const id of targets){const meta=raySubjects[id],dist=actorDistance(s,id),opt=cameraModel(state,{distance:dist,pointHeight:meta.height}),ox=front-W*(.075+.11*Math.log(Math.max(dist,1))/Math.log(40)),oy=cy-clamp(meta.height,-1,2)*half*.8;
  for(const ray of opt.rays){stroke(c,[[ox,oy],[front,y(ray.firstY)],[iris,y(ray.irisY)],[rear,y(ray.rearY)],[sensor,y(ray.sensorY)]],meta.color,1.8*k);const ix=rear+(opt.conjugateZ-opt.d)/(opt.sensorZ-opt.d)*(sensor-rear);if(Math.abs(ix-sensor)>2*k&&ix<W*.97&&ix>rear)stroke(c,[[sensor,y(ray.sensorY)],[ix,y(ray.imageY)]],meta.color,k,[4*k,3*k]);}
  dot(c,ox,oy,4*k,meta.color);
 }
 for(const[x,r]of[[front,half*.96],[rear,half*.82]]){c.beginPath();c.ellipse(x,cy,11*k,r,0,0,7);c.fillStyle='#86bea03b';c.fill();c.strokeStyle='#6aa58b';c.lineWidth=2*k;c.stroke();}
 const opening=clamp(cam.irisDiameter*ys/2,1.5*k,half*.88);rect(c,iris-4*k,cy-half,8*k,half-opening,colors.ink);rect(c,iris-4*k,cy+opening,8*k,half-opening,colors.ink);
 const sh=clamp(m.sensor.h*ys,half*.55,half*1.65);rect(c,sensor-4*k,cy-sh/2,8*k,sh,colors.teal);
 rect(c,shutter-5*k,cy-half+9*k,10*k,17*k,'#758c77');rect(c,shutter-5*k,cy+half-26*k,10*k,17*k,'#758c77');
 textAt(c,'Sensor',sensor,cy-half-16*k,font*.8,colors.teal);
 for(const [i,p]of parts.entries())textAt(c,String(i+1),p.x,cy+half+26*k,font*.9,p.key==='aperture'?colors.amber:colors.teal);
 if(s.body==='dslr')stroke(c,[[rear+40*k,cy-half+15*k],[shutter-25*k,cy-half+15*k]],'#8c9e89',4*k);
 stroke(c,[[sensor+8*k,cy],[gain-18*k,cy]],'#7a9f8a',2*k);
 const bars=1+Math.log2(s.iso/100);for(let n=0;n<6;n++)rect(c,gain-15*k+n*6*k,cy+12*k-(n+1)*4*k,4*k,(n+1)*4*k,n<bars?colors.teal:'#d5dfcc',k);
 const lower=H*.81,r=Math.min(H*.07,31*k);dot(c,W*.10,lower,r,'#35594a');dot(c,W*.10,lower,r*1.4/s.aperture,'#e8efcf');
 textAt(c,`ƒ/${Number(s.aperture.toFixed(1))}`,W*.19,lower-font*.08,font,colors.amber,'left');textAt(c,`Pupille ${m.apertureDiameter.toFixed(1)} mm`,W*.19,lower+font*.9,font*.72,colors.muted,'left');
 textAt(c,`${shutterText(s.time)} · ISO ${Math.round(s.iso)}`,W*.76,H*.65,font*.8,colors.muted);
 textAt(c,'Sensor-Lupe · Unschärfekreise vergrößert',W*.72,H*.73,font*.72,colors.muted);
 targets.forEach((id,i)=>{const meta=raySubjects[id],xx=W*(targets.length===1?.72:.51+i*.18),b=m.blurAt(actorDistance(s,id)),rad=clamp(b*260*k,1.5*k,23*k);dot(c,xx,H*.83,rad,meta.color+'80');c.beginPath();c.arc(xx,H*.83,clamp(m.coc*260*k,1.5*k,23*k),0,7);c.strokeStyle=meta.color;c.lineWidth=k;c.setLineDash([3*k,2*k]);c.stroke();c.setLineDash([]);textAt(c,`${meta.name} · ${(b*1000).toFixed(0)} µm`,xx,H*.96,font*.68,meta.color);});
 return {parts,width:W};
}
export function drawRoom(canvas,state,{selected='person',bounds}={}){
 const {c,W,H,k}=setup(canvas),m=metrics(state),s=m.s,margin=W*.065,minZ=bounds?.minZ??-9,maxZ=bounds?.maxZ??Math.max(17,s.background+2,s.birdDistance+2,s.sculpture+2,s.focus-s.cameraBack+2),scale=(W-2*margin)/(maxZ-minZ),cy=H*.44;
 const x=z=>margin+(z-minZ)*scale,y=a=>cy-a*scale,camX=x(-s.cameraBack),camY=y(s.cameraX);
 const near=x(clamp(m.near-s.cameraBack,minZ,maxZ)),far=x(clamp(m.far-s.cameraBack,minZ,maxZ));rect(c,near,H*.08,Math.max(far-near,1),H*.7,'#399e801c');
 const focus=x(s.focus-s.cameraBack);stroke(c,[[focus,H*.06],[focus,H*.81]],colors.teal,2*k,[4*k,3*k]);
 const spread=Math.tan(m.fov*Math.PI/360)*(W-margin-camX);stroke(c,[[W-margin,camY-spread],[camX,camY],[W-margin,camY+spread]],'#b59b62',1.3*k,[5*k,4*k]);
 const hits=[];for(const [id,a]of Object.entries(actors)){const zz=id==='camera'?-s.cameraBack:s[a.z],xx=x(zz),yy=clamp(id==='background'?H*.16:y(a.x?s[a.x]:0),H*.14,H*.67),color=id==='person'?'#c06d55':id==='plant'?'#739363':id==='background'?'#6d8fa6':id==='ball'?'#bc9d51':id==='sculpture'?'#8c9a83':colors.teal;
  if(id===selected)dot(c,xx,yy,19*k,color+'26');
  if(id==='camera'){rect(c,xx-16*k,yy-12*k,27*k,24*k,colors.ink,4*k);rect(c,xx+9*k,yy-7*k,10*k,14*k,colors.teal,2*k);}else{if(id==='background')stroke(c,[[xx,H*.1],[xx,H*.73]],'#9aad91',2*k);dot(c,xx,yy,10*k,color);dot(c,xx,yy,3.5*k,'#ffffef');}
  const up=id==='ball'||id==='sculpture';textAt(c,a.name,xx,yy+(up?-18:26)*k,17*k,color);hits.push({id,x:xx,y:yy,scale,margin,minZ});
 }
 stroke(c,[[margin,H*.89],[W-margin,H*.89]],'#aab99d',k);for(let z=-5;z<=maxZ;z+=5){stroke(c,[[x(z),H*.89],[x(z),H*.91]],'#aab99d',k);textAt(c,`${z} m`,x(z),H*.99,15*k,colors.muted);}
 return {hits,scale,margin,minZ,maxZ,cy};
}

import {metrics,cameraModel,clamp,distanceText,shutterText} from './physics.mjs';
const colors={ink:'#274b40',muted:'#7b8e7e',teal:'#2a8b78',amber:'#bd8b37',coral:'#bf7055',line:'#cbd8c3'};
function stroke(c,points,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();c.setLineDash([]);}
function textAt(c,t,x,y,size,color=colors.ink,align='center'){c.fillStyle=color;c.font=`${size}px system-ui,sans-serif`;c.textAlign=align;c.fillText(t,x,y);}
function dot(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,7);c.fillStyle=color;c.fill();}
function rect(c,x,y,w,h,color,r=0){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();}
function setup(canvas){const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,k=W/900;c.clearRect(0,0,W,H);c.fillStyle='#f4f6eb';c.fillRect(0,0,W,H);return {c,W,H,k};}
export function drawCutaway(canvas,state,{active='aperture',model=false}={}){
 const {c,W,H,k}=setup(canvas),m=metrics(state),s=m.s,cam=cameraModel(state);
 const cy=H*.44,front=W*clamp(.27-.045*Math.log2(s.focal/50),.17,.38),rear=W*(.51-clamp((m.v-s.focal)/s.focal,0,2)*.06),iris=front+(rear-front)*.52,sensor=W*.81,shutter=W*.755;
 const half=Math.min(H*.24,W*.15),yScale=half/(s.focal*.6+13),font=21*k;
 const y=v=>cy-v*yScale;
 const highlighted=(key,x,w)=>{if(active===key)rect(c,x,cy-half-14*k,w,half*2+28*k,key==='aperture'?'#efe0bd88':'#d2e7d17d',9*k);};
 textAt(c,model?'Ideale dünne Linse':'Objektiv · zwei ideale Linsengruppen',W*.365,H*.105,font*.83,colors.muted);
 textAt(c,s.body==='dslr'?'DSLR · Spiegel oben':'Kameragehäuse',W*.75,H*.105,font*.83,colors.muted);
 c.strokeStyle='#b9cbb1';c.lineWidth=2*k;c.strokeRect(front-28*k,cy-half-11*k,rear-front+56*k,half*2+22*k);
 c.beginPath();c.roundRect(rear+28*k,cy-half+12*k,W*.39,half*2-24*k,10*k);c.stroke();
 highlighted('focal',front-20*k,rear-front+40*k);highlighted('aperture',iris-17*k,34*k);highlighted('focus',rear-16*k,33*k);highlighted('time',shutter-15*k,28*k);highlighted('iso',sensor-12*k,42*k);
 stroke(c,[[W*.035,cy],[W*.94,cy]],'#b8c7ae',k,[5*k,5*k]);
 if(!model){
  // Light inside this generic lens follows the two-group paraxial model.
  const ox=W*.045,oy=cy-half*.7;
  for(const ray of cam.rays){
   stroke(c,[[ox,oy],[front,y(ray.firstY)],[iris,y(ray.irisY)],[rear,y(ray.rearY)],[sensor,y(ray.sensorY)]],colors.amber,2.2*k);
   const ix=rear+(cam.conjugateZ-cam.d)/(cam.sensorZ-cam.d)*(sensor-rear);
   if(Math.abs(ix-sensor)>2*k&&ix<W*.96&&ix>rear)stroke(c,[[sensor,y(ray.sensorY)],[ix,y(ray.imageY)]],colors.amber,1.3*k,[4*k,3*k]);
  }
  for(const [x,r]of[[front,half*.95],[rear,half*.82]]){c.beginPath();c.ellipse(x,cy,12*k,r,0,0,7);c.fillStyle='#78b99b44';c.fill();c.strokeStyle='#6aa58b';c.lineWidth=2*k;c.stroke();}
  const gap=clamp(cam.irisDiameter*yScale/2,2*k,half*.88);
  rect(c,iris-4*k,cy-half,8*k,half-gap,colors.ink);rect(c,iris-4*k,cy+gap,8*k,half-gap,colors.ink);
  dot(c,ox,oy,4*k,colors.coral);textAt(c,'Motivpunkt',ox,H*.15,font*.72,colors.coral);
  textAt(c,'1',front,cy+half+35*k,font,colors.teal);textAt(c,'2',iris,cy+half+35*k,font,colors.amber);textAt(c,'3',rear,cy+half+35*k,font,colors.teal);
 }else{
  // Equivalent principal plane and entrance pupil are an abstraction, not an iris position.
  const lx=W*.4,ox=W*.07,oy=cy-half*.75,u=s.focus*1000,z=(s.subject+s.cameraBack)*1000,vz=s.focal*z/(z-s.focal),ix=lx+(sensor-lx)*vz/m.v,iy=cy+(cy-oy)*(ix-lx)/(lx-ox),p=clamp(m.apertureDiameter*yScale/2,2*k,half*.9);
  for(const d of[-p,0,p]){const yy=cy+d,ys=yy+(iy-yy)*(sensor-lx)/(ix-lx);stroke(c,[[ox,oy],[lx,yy],[sensor,ys]],colors.amber,2*k);}
  c.beginPath();c.ellipse(lx,cy,13*k,half,0,0,7);c.fillStyle='#86bea04a';c.fill();c.strokeStyle=colors.teal;c.lineWidth=2*k;c.stroke();rect(c,lx-4*k,cy-half,8*k,half-p,colors.ink);rect(c,lx-4*k,cy+p,8*k,half-p,colors.ink);
  textAt(c,'Hauptebene + Eintrittspupille',lx,cy+half+35*k,font*.8,colors.teal);textAt(c,`v = ${m.v.toFixed(2)} mm`,W*.65,cy-half-22*k,font*.78,colors.teal);
 }
 const sh=clamp(m.sensor.h*yScale,half*.5,half*1.5);rect(c,sensor-4*k,cy-sh/2,8*k,sh,colors.teal);
 rect(c,shutter-5*k,cy-half+19*k,10*k,18*k,'#758c77');rect(c,shutter-5*k,cy+half-37*k,10*k,18*k,'#758c77');
 textAt(c,'4',shutter,cy+half+35*k,font,colors.muted);textAt(c,'Sensor',sensor,cy-half-18*k,font*.83,colors.teal);
 if(s.body==='dslr'){stroke(c,[[rear+48*k,cy-half+23*k],[shutter-30*k,cy-half+23*k]],'#8b9e87',5*k);}
 const lower=H*.84,r=Math.min(H*.08,33*k),cx=W*.12;
 dot(c,cx,lower,r,'#35594a');dot(c,cx,lower,r*1.4/s.aperture,'#e8efcf');
 textAt(c,`ƒ/${Number(s.aperture.toFixed(1))}`,W*.23,lower-font*.1,font,colors.amber,'left');
 textAt(c,`Pupille D = ${m.apertureDiameter.toFixed(1)} mm`,W*.23,lower+font*.9,font*.72,colors.muted,'left');
 textAt(c,shutterText(s.time),W*.57,lower-font*.1,font,colors.ink);textAt(c,'Verschlussdauer',W*.57,lower+font*.9,font*.7,colors.muted);
 const bars=1+Math.log2(s.iso/100);for(let n=0;n<8;n++)rect(c,W*.74+n*12*k,lower+14*k-(n+1)*5*k,8*k,(n+1)*5*k,n<bars?colors.teal:'#d5dfcc',2*k);
 textAt(c,`5 · ISO ${s.iso}`,W*.8,lower+font*1.4,font*.75,colors.teal);
 return {parts:[{key:'focal',x:front,y:cy},{key:'aperture',x:iris,y:cy},{key:'focus',x:rear,y:cy},{key:'time',x:shutter,y:cy},{key:'iso',x:sensor,y:cy}],width:W};
}
export function drawRoom(canvas,state){
 const {c,W,H,k}=setup(canvas),m=metrics(state),s=m.s,margin=W*.105,maxZ=Math.max(20,s.background+s.cameraBack+2,s.focus+2,s.birdDistance+s.cameraBack+2),scale=(W-2*margin)/maxZ,cy=H*.45;
 const x=z=>margin+z*scale,fy=cy-(s.subjectX-s.cameraX)*scale;
 const near=x(Math.min(m.near,maxZ)),far=x(Math.min(m.far,maxZ));rect(c,near,H*.08,Math.max(far-near,1),H*.72,'#399e8022');
 const spread=Math.tan(m.fov*Math.PI/360)*(W-2*margin);stroke(c,[[W-margin,cy-spread],[margin,cy],[W-margin,cy+spread]],'#ba9d5c',1.5*k,[5*k,5*k]);
 const focus=x(s.focus);stroke(c,[[focus,H*.06],[focus,H*.80]],colors.teal,2*k,[5*k,3*k]);
 rect(c,margin-24*k,cy-15*k,29*k,30*k,colors.ink,4*k);rect(c,margin+4*k,cy-9*k,12*k,18*k,colors.teal,3*k);
 const items=[{key:'foreground',z:s.foreground+s.cameraBack,y:cy-(-1.2-s.cameraX)*scale,name:'Pflanze',color:'#779666'}, {key:'subject',z:s.subject+s.cameraBack,y:fy,name:'Person',color:colors.coral},{key:'ballDistance',z:s.ballDistance+s.cameraBack,y:cy-(.95-s.cameraX)*scale,name:'Ball',color:'#bc9d51'},{key:'birdDistance',z:s.birdDistance+s.cameraBack,y:cy-(-.9-s.cameraX)*scale,name:'Vogel',color:'#658b82'},{key:'background',z:s.background+s.cameraBack,y:H*.19,name:'Hintergrund',color:'#8b9e7f'}];
 const hits=[];for(const item of items){const xx=x(item.z),yy=clamp(item.y,H*.13,H*.64);if(item.key==='background')stroke(c,[[xx,H*.10],[xx,H*.73]],'#9aad91',3*k);dot(c,xx,yy,12*k,item.color);dot(c,xx,yy,4*k,'#ffffef');const up=item.key==='ballDistance';textAt(c,item.name,xx,yy+(up?-19:29)*k,18*k,item.color);hits.push({...item,x:xx,y:yy,scale,margin});}
 const sculptureX=x(9+s.cameraBack);stroke(c,[[sculptureX,H*.68],[sculptureX,H*.75]],'#b3bda6',2*k);textAt(c,'Skulptur · fest',sculptureX,H*.81,14*k,colors.muted);
 const step=maxZ>26?10:5;stroke(c,[[margin,H*.88],[W-margin,H*.88]],'#aab99d',k);for(let z=0;z<=maxZ;z+=step){stroke(c,[[x(z),H*.88],[x(z),H*.9]],'#aab99d',k);textAt(c,`${z} m`,x(z),H*.98,16*k,colors.muted);}
 return {hits,scale,margin,maxZ};
}

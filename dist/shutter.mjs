import {shutterFrame} from './pupil.mjs';
import {shutterText,clamp} from './physics.mjs';
import {getLanguage} from './i18n.mjs';

// Presentation time is deliberately segmented. The actual curtain positions and
// per-row exposure still come from the unchanged physical shutterFrame model.
export function shutterTeachingFrame(progress,time,real=false){
 const p=clamp(progress,0,1),travel=.004,total=time+travel,a=Math.min(time,travel),b=Math.max(time,travel);
 let elapsed;
 if(real)elapsed=p*total;
 else if(time<=travel)elapsed=p*total;
 else elapsed=p<.35?travel*p/.35:p<.65?travel+(time-travel)*(p-.35)/.30:time+travel*(p-.65)/.35;
 const frame=shutterFrame(elapsed/total,time);
 const stage=elapsed<a?0:elapsed<b?1:2;
 return {...frame,progress:p,stage,short:time<travel,rowOn:frame.front>.5&&frame.rear<.5};
}

export function drawShutterLesson(canvas,state,progress,{real=false}={}){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,d=Math.min(W/720,H/400),dark=document.documentElement.dataset.theme==='dark',text=(de,en)=>getLanguage()==='en'?en:de,f=shutterTeachingFrame(progress,state.time,real),ink=dark?'#e1ece5':'#203e38',muted=dark?'#abc2b5':'#5e786b';
 c.fillStyle=dark?'#152920':'#f0f4e8';c.fillRect(0,0,W,H);
 const x=W*.28,y=H*.19,w=W*.44,h=H*.46,front='#303638',rear='#555b5e',light='#80c6a3';
 c.fillStyle=light;c.fillRect(x,y,w,h);
 c.fillStyle=front;c.fillRect(x,y+f.front*h,w,h*(1-f.front));
 c.fillStyle=rear;c.fillRect(x,y,w,h*f.rear);
 for(const [a,b]of [[f.front,1],[0,f.rear]]){c.save();c.beginPath();c.rect(x,y+a*h,w,(b-a)*h);c.clip();for(let i=0;i<12;i++){c.strokeStyle='#ffffff30';c.beginPath();c.moveTo(x,y+i*h/12);c.lineTo(x+w,y+i*h/12);c.stroke();}c.restore();}
 c.strokeStyle=ink;c.lineWidth=Math.max(1,d);c.strokeRect(x,y,w,h);
 const pixelRatio=W/Math.max(1,canvas.getBoundingClientRect().width);
 const label=(t,xx,yy,size=17,color=ink,max=W*.95)=>{c.fillStyle=color;c.font=Math.max(size*d,10.5*pixelRatio)+'px system-ui';c.textAlign='center';c.fillText(t,xx,yy,max);};
 label(text('1 · Erster Vorhang','1 · First curtain'),W*.13,H*.32,17,ink,W*.24);
 label(text('gibt Licht frei ↓','uncovers ↓'),W*.13,H*.40,15,muted,W*.24);
 label(text('2 · Zweiter Vorhang','2 · Second curtain'),W*.87,H*.32,17,ink,W*.24);
 label(text('deckt wieder ab ↓','covers again ↓'),W*.87,H*.40,15,muted,W*.24);
 const badge=(n,yy)=>{c.fillStyle='#fff';c.font='bold '+20*d+'px system-ui';c.textAlign='center';c.fillText(n,x+w*.5,yy);};if(f.front<.83)badge('1',y+f.front*h+(1-f.front)*h*.5+6*d);if(f.rear>.17)badge('2',y+f.rear*h*.5+6*d);
 c.strokeStyle='#f9df76';c.lineWidth=3*Math.max(.6,d);c.setLineDash([5*d,4*d]);c.beginPath();c.moveTo(x-10*d,y+h*.5);c.lineTo(x+w+10*d,y+h*.5);c.stroke();c.setLineDash([]);
 const title=progress>=1?text('Geschlossen: Die Aufnahme ist beendet','Closed: the exposure is complete'):f.short?text('Kurze Zeit: Ein schmaler Lichtspalt wandert ↓','Short exposure: a narrow light slit travels ↓'):f.stage===0?text('1 fährt herunter und gibt Licht frei','1 moves down and uncovers the sensor'):f.stage===1?text('Wartezeit: Der ganze Sensor erhält Licht','Waiting: the whole sensor receives light'):text('2 fährt herunter und deckt wieder ab','2 moves down and covers the sensor again');
 label(title,W*.5,H*.085,20);
 label(text('Grün = freier Sensor · Dunkel = lichtdichte Abdeckung','Green = exposed sensor · dark = opaque curtain'),W*.5,H*.73,16);
 label(f.rowOn?text('Gelbe Sensorzeile: bekommt gerade Licht','Yellow sensor row: receiving light'):f.front<=.5?text('Gelbe Sensorzeile: noch unter Vorhang 1','Yellow sensor row: still behind curtain 1'):text('Gelbe Sensorzeile: wieder unter Vorhang 2','Yellow sensor row: covered by curtain 2'),W*.5,H*.82,16);
 label(text('Zeit pro Sensorzeile: ','Exposure per sensor row: ')+shutterText(state.time),W*.5,H*.90,17);
 label(real?text('Reale Zeitverhältnisse','Real time proportions'):f.short?text('Gleichmäßige Zeitlupe: beide Vorhänge gleich schnell','Uniform slow motion: both curtains move at the same speed'):text('Lernzeitlupe: nur die Wartezeit ist verkürzt','Teaching slow motion: only the waiting time is compressed'),W*.5,H*.98,13,muted);
 return f;
}

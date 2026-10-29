import {shutterFrame} from './pupil.mjs';
import {shutterText,clamp} from './physics.mjs';
import {getLanguage} from './i18n.mjs';

// Presentation time is deliberately segmented. The actual curtain positions and
// per-row exposure still come from the unchanged physical shutterFrame model.
export function shutterTeachingFrame(progress,time,real=false){
 const p=clamp(progress,0,1),travel=.004,total=time+travel,a=Math.min(time,travel),b=Math.max(time,travel);
 let elapsed;
 if(real)elapsed=p*total;
 else if(Math.abs(a-b)<1e-10)elapsed=p<.5?a*p*2:a+(total-a)*(p-.5)*2;
 else elapsed=p<.3?a*p/.3:p<.7?a+(b-a)*(p-.3)/.4:b+(total-b)*(p-.7)/.3;
 const frame=shutterFrame(elapsed/total,time);
 const stage=elapsed<a?0:elapsed<b?1:2;
 return {...frame,progress:p,stage,short:time<travel,rowOn:frame.front>.5&&frame.rear<.5};
}

export function drawShutterLesson(canvas,state,progress,{real=false}={}){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,d=Math.min(W/640,H/360),dark=document.documentElement.dataset.theme==='dark',text=(de,en)=>getLanguage()==='en'?en:de,f=shutterTeachingFrame(progress,state.time,real),ink=dark?'#e1ece5':'#203e38',muted=dark?'#abc2b5':'#5e786b';
 c.fillStyle=dark?'#152920':'#f0f4e8';c.fillRect(0,0,W,H);
 const x=W*.28,y=H*.15,w=W*.44,h=H*.56;
 c.fillStyle='#69ba93';c.fillRect(x,y,w,h);
 c.fillStyle='#364c52';c.fillRect(x,y+f.front*h,w,h*(1-f.front));
 c.fillStyle='#ba8a47';c.fillRect(x,y,w,h*f.rear);
 for(const [a,b] of [[f.front,1],[0,f.rear]]){c.save();c.beginPath();c.rect(x,y+a*h,w,(b-a)*h);c.clip();for(let i=0;i<12;i++){c.strokeStyle='#ffffff40';c.beginPath();c.moveTo(x,y+i*h/12);c.lineTo(x+w,y+i*h/12);c.stroke();}c.restore();}
 c.strokeStyle=ink;c.lineWidth=Math.max(1,d);c.strokeRect(x,y,w,h);
 const label=(t,xx,yy,size=17,color=ink,max=W*.95)=>{c.fillStyle=color;c.font=size*d+'px system-ui';c.textAlign='center';c.fillText(t,xx,yy,max);};
 label(text('① Öffnen ↓','① Uncover ↓'),W*.13,H*.38,17,ink,W*.24);
 label(text('② Schließen ↓','② Cover ↓'),W*.87,H*.38,17,ink,W*.24);
 c.strokeStyle=f.rowOn?'#fff3a1':'#d7b85e';c.lineWidth=3*Math.max(.6,d);c.setLineDash([5*d,4*d]);c.beginPath();c.moveTo(x-12*d,y+h*.5);c.lineTo(x+w+12*d,y+h*.5);c.stroke();c.setLineDash([]);
 const titles=f.short?[text('① startet','① starts'),text('Beide Vorhänge wandern als Spalt','Both curtains travel as a slit'),text('② beendet die Belichtung','② finishes the exposure')]:[text('① gibt den Sensor frei','① uncovers the sensor'),text('Der Sensor ist ganz offen','The sensor is fully open'),text('② verdeckt den Sensor wieder','② covers the sensor again')];
 label(titles[f.stage],W/2,H*.08,20);
 label(f.rowOn?text('Mittlere Zeile: erhält Licht','Middle row: receiving light'):f.front<=.5?text('Mittlere Zeile: noch abgedeckt','Middle row: still covered'):text('Mittlere Zeile: wieder abgedeckt','Middle row: covered again'),W/2,H*.80,17,f.rowOn?'#b48222':ink);
 label(text('Belichtungsdauer dieser Zeile: ','This row’s exposure duration: ')+shutterText(state.time),W/2,H*.89,17);
 label(real?text('Reale Zeitverhältnisse · insgesamt ','Real time proportions · total ')+(f.total*1000).toFixed(2)+' ms':text('Lernzeitlupe: Phasen unterschiedlich gedehnt','Teaching slow motion: phases stretched separately'),W/2,H*.98,13,muted);
 return f;
}

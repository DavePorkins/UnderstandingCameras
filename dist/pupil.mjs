// Geometrical pupil model, centred on-axis. Not an aberration or diffraction PSF.
export const pupilShapes=['circle','iris','heart','bat'];
export function pupilOutline(shape='circle',blades=7,rounded=false){
 const n=Math.max(5,Math.min(11,Math.round(blades)||7));
 if(shape==='bat')return [[-1,0],[-.78,-.42],[-.53,-.18],[-.35,-.50],[-.18,-.22],[-.13,-.59],[0,-.38],[.13,-.59],[.18,-.22],[.35,-.50],[.53,-.18],[.78,-.42],[1,0],[.73,.06],[.51,.25],[.29,.21],[.12,.46],[0,.28],[-.12,.46],[-.29,.21],[-.51,.25],[-.73,.06]];
 if(shape==='heart')return Array.from({length:160},(_,i)=>{const t=i/160*Math.PI*2;return [Math.sin(t)**3,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17];});
 if(shape!=='iris')return Array.from({length:160},(_,i)=>[Math.cos(i*Math.PI/80),Math.sin(i*Math.PI/80)]);
 const pts=[];for(let i=0;i<n;i++){const a=(i/n-.25)*Math.PI*2,b=((i+1)/n-.25)*Math.PI*2;for(let j=0;j<16;j++){const t=j/16,x=Math.cos(a)*(1-t)+Math.cos(b)*t,y=Math.sin(a)*(1-t)+Math.sin(b)*t,r=Math.hypot(x,y),curve=rounded?.8:0;pts.push([x*(1-curve)+x/r*curve,y*(1-curve)+y/r*curve]);}}return pts;
}
export function polygonArea(points){return Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;}
export function pupilTransmission(s){return !s.pupilShape||s.pupilShape==='circle'?1:Math.min(1,polygonArea(pupilOutline(s.pupilShape,s.bladeCount,s.roundedBlades))/Math.PI);}
export function pupilSection(s){if(!s.pupilShape||s.pupilShape==='circle')return [-1,1];const pts=pupilOutline(s.pupilShape,s.bladeCount,s.roundedBlades),cross=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if(a[0]===0)cross.push(a[1]);if(a[0]*b[0]<0){const t=-a[0]/(b[0]-a[0]);cross.push(a[1]+t*(b[1]-a[1]));}}return cross.length?[-Math.max(...cross),-Math.min(...cross)]:[-1,1];}
export function pupilPath(c,x,y,r,s){const points=pupilOutline(s.pupilShape,s.bladeCount,s.roundedBlades);c.beginPath();points.forEach(([a,b],i)=>i?c.lineTo(x+a*r,y+b*r):c.moveTo(x+a*r,y+b*r));c.closePath();}
// Visible blade edges use exactly the contour used for the optical pupil.
// This is a schematic of the exposed blade surfaces, not a specific linkage.
export function irisBlades(s){
 const opening=Math.max(.025,Math.min(.91,1.4/s.aperture*.91)),outline=pupilOutline(s.pupilShape,s.bladeCount,s.roundedBlades),n=Math.max(5,Math.min(11,s.bladeCount||7)),twist=.16+(1-opening)*.85;
 return Array.from({length:n},(_,i)=>{const a=Math.round(i*outline.length/n),b=Math.round((i+1)*outline.length/n),edge=[];for(let j=a;j<=b;j++){const p=outline[j%outline.length];edge.push([p[0]*opening,p[1]*opening]);}return {edge,outerA:Math.atan2(edge[0][1],edge[0][0])+twist,outerB:Math.atan2(edge.at(-1)[1],edge.at(-1)[0])+twist,opening};});
}
export function drawIris(c,x,y,r,s,{dark=false}={}){
 c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
 c.fillStyle=dark?'#e4edca':'#f3f4d8';c.fillRect(x-r,y-r,2*r,2*r);
 if(['heart','bat'].includes(s.pupilShape)){c.fillStyle='#33483f';c.fillRect(x-r,y-r,2*r,2*r);pupilPath(c,x,y,r*irisBlades(s)[0].opening,s);c.fillStyle='#edf0d2';c.fill();}
 else for(const [i,blade]of irisBlades(s).entries()){
  c.beginPath();blade.edge.forEach(([a,b],j)=>j?c.lineTo(x+a*r,y+b*r):c.moveTo(x+a*r,y+b*r));
  c.lineTo(x+Math.cos(blade.outerB)*r,y+Math.sin(blade.outerB)*r);c.arc(x,y,r,blade.outerB,blade.outerA,true);c.closePath();
  c.fillStyle=i%2?(dark?'#4d6c60':'#688274'):(dark?'#355347':'#4d695c');c.fill();c.strokeStyle=dark?'#a1c2b0':'#a5bba9';c.lineWidth=Math.max(.8,r/170);c.stroke();
 }
 c.restore();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.lineWidth=r*.07;c.strokeStyle=dark?'#769b8b':'#31574b';c.stroke();
}
export function drawApertureLesson(canvas,s){
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,d=Math.min(W/640,H/300),dark=document.documentElement.dataset.theme==='dark',en=document.documentElement.lang==='en',r=Math.min(H*.30,W*.18);
 c.fillStyle=dark?'#192821':'#f4f6eb';c.fillRect(0,0,W,H);drawIris(c,W*.25,H*.43,r,s,{dark});
 c.save();c.translate(W*.75,H*.43);const sign=s.background+s.cameraBack>s.focus?-1:1;c.scale(sign,sign);pupilPath(c,0,0,r*.8,s);c.fillStyle='#edc271';c.fill();c.restore();c.fillStyle=dark?'#dce9e1':'#274b40';c.textAlign='center';c.font=16*d+'px system-ui';c.fillText(en?'Blade edges form the opening':'Lamellenkanten bilden die Öffnung',W*.25,H*.84,W*.47);c.fillText(en?'Same contour · may be inverted':'Dieselbe Kontur · ggf. umgekehrt',W*.75,H*.84,W*.47);c.font=26*d+'px system-ui';c.fillText('→',W*.5,H*.47);c.font=14*d+'px system-ui';c.fillText(en?'Schematic visible surfaces · not a model-specific mechanism':'Sichtbare Lamellenflächen · kein gerätespezifischer Mechanismus',W*.5,H*.98,W*.96);
}
export function shutterFrame(phase,time,travel=.004){const elapsed=Math.max(0,Math.min(1,phase))*(time+travel);return {elapsed,front:Math.max(0,Math.min(1,elapsed/travel)),rear:Math.max(0,Math.min(1,(elapsed-time)/travel)),total:time+travel,travel};}

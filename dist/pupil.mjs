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
export function drawIris(c,x,y,r,s,{dark=false}={}){
 const opening=Math.max(.025,Math.min(.91,1.4/s.aperture*.91));
 c.save();c.beginPath();c.arc(x,y,r,0,7);c.clip();c.fillStyle=dark?'#102520':'#263f38';c.fillRect(x-r,y-r,2*r,2*r);
 const blades=s.bladeCount||7;if(!['heart','bat'].includes(s.pupilShape))for(let i=0;i<blades;i++){const a=i/blades*Math.PI*2,b=(i+1)/blades*Math.PI*2;c.beginPath();c.moveTo(x+Math.cos(a)*r*opening,y+Math.sin(a)*r*opening);c.lineTo(x+Math.cos(b)*r*opening,y+Math.sin(b)*r*opening);c.lineTo(x+Math.cos(b+.8)*r*1.4,y+Math.sin(b+.8)*r*1.4);c.lineTo(x+Math.cos(a+.8)*r*1.4,y+Math.sin(a+.8)*r*1.4);c.closePath();c.fillStyle=i%2?(dark?'#416357':'#688274'):(dark?'#355347':'#536f61');c.fill();c.strokeStyle=dark?'#90b3a155':'#c0d1b055';c.lineWidth=Math.max(1,r/160);c.stroke();}
 pupilPath(c,x,y,r*opening,s);c.fillStyle=dark?'#e4edca':'#f3f4d8';c.fill();c.strokeStyle='#c8d9b8';c.lineWidth=Math.max(1,r/100);c.stroke();c.restore();c.beginPath();c.arc(x,y,r,0,7);c.lineWidth=r*.08;c.strokeStyle=dark?'#769b8b':'#31574b';c.stroke();
}
export function shutterFrame(phase,time,travel=.004){const elapsed=Math.max(0,Math.min(1,phase))*(time+travel);return {elapsed,front:Math.max(0,Math.min(1,elapsed/travel)),rear:Math.max(0,Math.min(1,(elapsed-time)/travel)),total:time+travel,travel};}

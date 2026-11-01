// Touch: a tap or vertical scroll never moves a slider. A deliberate horizontal
// drag changes the value relative to its starting point, without a track jump.
// Mouse clicks and keyboard controls retain native range behaviour.
export function initTouchRanges(root=document){
 let gesture=null;
 root.addEventListener('pointerdown',e=>{
  const range=e.target.closest?.('input[type=range]');
  if(e.pointerType!=='touch'||!range||range.disabled||!e.isPrimary)return;
  e.preventDefault();
  gesture={range,id:e.pointerId,x:e.clientX,y:e.clientY,value:Number(range.value),dragging:false};
  range.setPointerCapture(e.pointerId);
 },{capture:true,passive:false});
 root.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||g.id!==e.pointerId)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.dragging){
   if(Math.abs(dy)>8&&Math.abs(dy)>=Math.abs(dx)){gesture=null;return;}
   if(Math.abs(dx)<10||Math.abs(dx)<=Math.abs(dy)*1.25)return;
   g.dragging=true;g.range.focus({preventScroll:true});
  }
  e.preventDefault();
  const min=Number(g.range.min||0),max=Number(g.range.max||100),step=g.range.step==='any'?0:Number(g.range.step||1),width=Math.max(1,g.range.getBoundingClientRect().width-24);
  let value=Math.max(min,Math.min(max,g.value+dx/width*(max-min)));
  if(step)value=Math.max(min,Math.min(max,min+Math.round((value-min)/step)*step));
  const before=g.range.value;g.range.value=String(value);
  if(g.range.value!==before)g.range.dispatchEvent(new Event('input',{bubbles:true}));
 },{capture:true,passive:false});
 function finish(e){const g=gesture;if(!g||g.id!==e.pointerId)return;gesture=null;if(g.dragging&&e.type==='pointerup')g.range.dispatchEvent(new Event('change',{bubbles:true}));}
 root.addEventListener('pointerup',finish,true);root.addEventListener('pointercancel',finish,true);
}

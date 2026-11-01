// A separate hit surface keeps native range controls out of touch gestures.
// pan-y lets the browser scroll; only an intentional horizontal drag edits values.
export function initTouchRanges(root=document){
 let gesture=null;
 function prepare(scope=root){
  const ranges=scope.matches?.('input[type=range]')?[scope]:scope.querySelectorAll('input[type=range]');
  for(const range of ranges){
   if(range.parentElement?.classList.contains('touch-range'))continue;
   const wrap=document.createElement('span'),surface=document.createElement('span');
   wrap.className='touch-range';surface.className='touch-range-surface';
   surface.setAttribute('aria-hidden','true');
   range.before(wrap);wrap.append(range,surface);
   // Cancel label activation too: it would forward a synthetic click to the input.
   surface.addEventListener('click',e=>e.preventDefault());
  }
 }
 prepare();
 const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)prepare(node);});
 observer.observe(root,{childList:true,subtree:true});
 root.addEventListener('pointerdown',e=>{
  const surface=e.target.closest?.('.touch-range-surface');
  const range=surface?.parentElement.querySelector('input[type=range]');
  if(!range||range.disabled||!e.isPrimary||e.button>0)return;
  const touch=e.pointerType==='touch';
  gesture={range,surface,id:e.pointerId,x:e.clientX,y:e.clientY,value:Number(range.value),dragging:!touch,touch};
  surface.setPointerCapture(e.pointerId);
  if(!touch){e.preventDefault();range.focus({preventScroll:true});setValue(e);}
 },{capture:true,passive:false});
 function setValue(e){
  const g=gesture,range=g.range,rect=range.getBoundingClientRect();
  const min=Number(range.min||0),max=Number(range.max||100),step=range.step==='any'?0:Number(range.step||1),width=Math.max(1,rect.width-24);
  let value=g.touch?g.value+(e.clientX-g.x)/width*(max-min):min+(e.clientX-rect.left-12)/width*(max-min);
  value=Math.max(min,Math.min(max,value));
  if(step)value=Math.max(min,Math.min(max,min+Math.round((value-min)/step)*step));
  const before=range.value;range.value=String(value);
  if(range.value!==before)range.dispatchEvent(new Event('input',{bubbles:true}));
 }
 root.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||g.id!==e.pointerId)return;
  if(g.range.disabled||!g.range.isConnected){gesture=null;return;}
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.dragging){
   if(Math.abs(dy)>8&&Math.abs(dy)>=Math.abs(dx)){gesture=null;return;}
   if(Math.abs(dx)<10||Math.abs(dx)<=Math.abs(dy)*1.25)return;
   g.dragging=true;g.range.focus({preventScroll:true});
  }
  e.preventDefault();setValue(e);
 },{capture:true,passive:false});
 function finish(e){const g=gesture;if(!g||g.id!==e.pointerId)return;gesture=null;if(g.dragging&&e.type==='pointerup')g.range.dispatchEvent(new Event('change',{bubbles:true}));}
 root.addEventListener('pointerup',finish,true);root.addEventListener('pointercancel',finish,true);
}

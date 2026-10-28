import {translateDOM} from './i18n.mjs';

// One simulation, two independent layouts. Existing controls move; IDs and values stay intact.
export function initMobile({onResize,onControl,onRoomSelect,onSettings}){
 const byId=id=>document.getElementById(id),root=document.documentElement,lab=byId('page-lab'),desktop=lab.querySelector('.lab-layout');
 const shell=document.createElement('div');shell.id='mobile-shell';shell.hidden=true;
 shell.innerHTML=`<div id="mobile-preview"></div><div id="mobile-tabs" role="tablist" aria-label="Laborbereiche">${[['controls','Regler'],['camera','Kamera'],['room','Raum'],['light','Licht']].map(([key,label],i)=>`<button id="mobile-tab-${key}" role="tab" aria-controls="mobile-panel-${key}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-mobile-tab="${key}">${label}</button>`).join('')}</div><div id="mobile-task-host" hidden></div><div id="mobile-workarea">${['controls','camera','room','light'].map(key=>`<section id="mobile-panel-${key}" role="tabpanel" aria-labelledby="mobile-tab-${key}" ${key==='controls'?'':'hidden'}></section>`).join('')}</div>`;
 lab.append(shell);
 const lessonFilter=document.createElement('label');lessonFilter.id='mobile-lesson-filter';lessonFilter.className='check';lessonFilter.hidden=true;lessonFilter.innerHTML='<input id="mobile-all-controls" type="checkbox"> Alle Regler zeigen';byId('mobile-panel-controls').append(lessonFilter);lessonFilter.querySelector('input').onchange=e=>root.dataset.mobileAll=String(e.target.checked);
 const menu=document.createElement('dialog');menu.id='mobile-menu';menu.innerHTML=`<form method="dialog"><button class="close" aria-label="Schließen">×</button></form><h2>Ansicht & Menü</h2><div id="mobile-navigation"></div><div id="mobile-actions"></div><label class="field">Anordnung<select id="layout-mode"><option value="auto">Automatisch</option><option value="mobile">Mobil</option><option value="desktop">Desktop</option></select></label><label class="field mobile-only">Bildgröße<select id="mobile-image-size"><option value="normal">Normal</option><option value="compact">Kompakt</option><option value="large">Groß</option></select></label><p class="micro">Am Handy bleibt das Bild sichtbar. Tabs wechseln den Arbeitsbereich; darin kann gescrollt werden. Für gemeinsame Vorführungen eignet sich ein großer Bildschirm.</p>`;document.body.append(menu);
 const options=document.createElement('dialog');options.id='mobile-photo-options';options.innerHTML=`<form method="dialog"><button class="close" aria-label="Schließen">×</button></form><h2>Bildoptionen & Vergleich</h2><div id="mobile-photo-options-host"></div>`;document.body.append(options);
 const menuButton=document.createElement('button');menuButton.id='layout-menu';menuButton.textContent='☰';menuButton.setAttribute('aria-label','Ansicht & Menü');menuButton.title='Ansicht & Menü';document.querySelector('.tools').append(menuButton);menuButton.onclick=()=>menu.showModal();
 const photoOptionsButton=document.createElement('button');photoOptionsButton.id='mobile-photo-settings';photoOptionsButton.className='mobile-only';photoOptionsButton.textContent='⋯';photoOptionsButton.setAttribute('aria-label','Bildoptionen & Vergleich');document.querySelector('.viewer-panel .panel-title').append(photoOptionsButton);photoOptionsButton.onclick=()=>options.showModal();
 const configuration=document.createElement('details');configuration.id='mobile-configuration';configuration.innerHTML='<summary>Kamera & Format</summary>';
 const quick=document.createElement('div');quick.id='mobile-quick';quick.innerHTML=`<label class="field">Regler im Kameraschnitt<select id="mobile-quick-select">${[['focal','Brennweite'],['aperture','Blende'],['time','Belichtungszeit'],['iso','ISO'],['focus','Fokusdistanz']].map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><div id="mobile-quick-slot"></div>`;
 const roomQuick=document.createElement('div');roomQuick.id='mobile-room-quick';roomQuick.innerHTML='<p class="micro">Kamera und Motive ziehen. Motiv antippen, dann oben im Raum auf Fokussieren tippen.</p><div id="mobile-room-slots"></div>';
 const objectSelect=document.createElement('select');objectSelect.id='mobile-room-object';objectSelect.className='mobile-only';objectSelect.setAttribute('aria-label','Objekt im Raum');objectSelect.innerHTML=[['camera','Kamera'],['person','Person'],['plant','Pflanze'],['ball','Ball'],['bird','Vogel'],['sculpture','Skulptur'],['background','Hintergrund'],['lamp','Lampe']].map(([id,name])=>`<option value="${id}">${name}</option>`).join('');document.querySelector('.room-panel .panel-title').prepend(objectSelect);objectSelect.onchange=()=>onRoomSelect(objectSelect.value);
 const home=new Map(),quickHome=new Map();let active=false,tab='controls',selected='aperture',lastLesson=null,mode='auto';
 try{const stored=localStorage.getItem('camera.layout.v1');if(['auto','mobile','desktop'].includes(stored))mode=stored;}catch{}
 byId('layout-mode').value=mode;
 function move(el,parent,map=home){if(!map.has(el)){const mark=document.createComment('layout home');el.before(mark);map.set(el,mark);}parent.append(el);}
 function restore(map){for(const [el,mark]of map){mark.replaceWith(el);}map.clear();}
 function refresh(){translateDOM(shell);translateDOM(menu);translateDOM(options);requestAnimationFrame(onResize);}
 function placeQuick(){restore(quickHome);if(!active)return;if(tab==='camera'){const el=byId(selected).closest('.control');move(el,byId('mobile-quick-slot'),quickHome);byId('mobile-quick-select').value=selected;}if(tab==='room')for(const id of['focal','focus'])move(byId(id).closest('.control'),byId('mobile-room-slots'),quickHome);}
 function selectTab(next,focus=false){tab=next;for(const key of['controls','camera','room','light']){const button=byId('mobile-tab-'+key);button.setAttribute('aria-selected',String(key===tab));button.tabIndex=key===tab?0:-1;byId('mobile-panel-'+key).hidden=key!==tab;}placeQuick();byId('mobile-workarea').scrollTop=0;if(focus)byId('mobile-tab-'+tab).focus({preventScroll:true});refresh();}
 byId('mobile-tabs').onclick=e=>{const b=e.target.closest('[data-mobile-tab]');if(b)selectTab(b.dataset.mobileTab);};
 byId('mobile-tabs').onkeydown=e=>{const keys=['controls','camera','room','light'];let i=keys.indexOf(tab);if(e.key==='ArrowRight')i=(i+1)%4;else if(e.key==='ArrowLeft')i=(i+3)%4;else if(e.key==='Home')i=0;else if(e.key==='End')i=3;else return;e.preventDefault();selectTab(keys[i],true);};
 quick.querySelector('select').onchange=()=>{selected=quick.querySelector('select').value;onControl(selected);placeQuick();refresh();};
 function apply(){const automatic=matchMedia('(max-width: 900px), (max-height: 500px) and (pointer: coarse)').matches,next=mode==='mobile'||mode==='auto'&&automatic;if(next===active){onResize();return;}
  restore(quickHome);if(next){active=true;root.dataset.layout='mobile';shell.hidden=false;desktop.hidden=true;
   move(document.querySelector('.viewer-panel'),byId('mobile-preview'));
   move(document.querySelector('.controls'),byId('mobile-panel-controls'));
   move(document.querySelector('.camera-configuration'),configuration);byId('mobile-panel-controls').prepend(configuration);
   move(document.querySelector('.camera-panel'),byId('mobile-panel-camera'));byId('mobile-panel-camera').append(quick);
   move(document.querySelector('.room-panel'),byId('mobile-panel-room'));byId('mobile-panel-room').append(roomQuick);
   move(document.querySelector('.scene-panel'),byId('mobile-panel-light'));
   move(byId('active-experiment'),byId('mobile-task-host'));
   move(document.querySelector('.topbar nav'),byId('mobile-navigation'));
   for(const id of['reset','share','gallery-open','fullscreen','lesson-current'])move(byId(id),byId('mobile-actions'));
   for(const el of[document.querySelector('.viewer-toolbar'),byId('metrics'),byId('photo-help'),byId('snapshot'),byId('compare')])move(el,byId('mobile-photo-options-host'));
   selectTab(tab);
  }else{active=false;root.dataset.layout='desktop';restore(home);configuration.remove();quick.remove();roomQuick.remove();shell.hidden=true;desktop.hidden=false;if(options.open)options.close();}
  refresh();onResize();
 }
 byId('layout-mode').onchange=()=>{mode=byId('layout-mode').value;try{localStorage.setItem('camera.layout.v1',mode);}catch{}apply();};
 byId('mobile-image-size').onchange=()=>{root.dataset.mobileImage=byId('mobile-image-size').value;refresh();};
 for(const dialog of[menu,options])dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
 menu.addEventListener('click',e=>{if(e.target.closest('#mobile-navigation button,#mobile-actions button'))menu.close();},true);
 options.addEventListener('click',e=>{if(e.target.closest('#compare'))options.close();},true);
 window.addEventListener('resize',apply);apply();
 return {get active(){return active;},selectObject(id){objectSelect.value=id;},selectControl(key){if(selected===key)return;selected=key;if(active&&tab==='camera'){placeQuick();refresh();}},lessonChanged(lesson){byId('mobile-task-host').hidden=!lesson;lessonFilter.hidden=!lesson;root.dataset.lesson=lesson?.id||'';if(lesson?.id!==lastLesson){lastLesson=lesson?.id||null;root.dataset.mobileAll='false';lessonFilter.querySelector('input').checked=false;if(active&&lesson){configuration.open=lesson.id==='crop';onSettings(lesson.id==='phone'||lesson.id==='color'?'image':'base');selectTab(lesson.id==='perspective'||lesson.id==='focus'?'room':'controls');}}}};
}

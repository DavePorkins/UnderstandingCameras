import {sensors,defaults,apertures,shutters,isos,metrics,effective,changeSensor,clamp,nearest,shutterText,distanceText,encodeState,decodeState,crop} from './physics.mjs';
import {drawPhoto,drawSensors} from './renderer.mjs';
import {drawCutaway,drawRoom} from './camera-view.mjs';
import {lessons,learnPage,aboutPage} from './content.mjs';
const $=id=>document.getElementById(id);
let state=location.hash.startsWith('#s=')?decodeState(location.hash):{...defaults};
let saved=null,photoHit=null,spaceHit=null,cameraHit=null,drag=null,activeLesson=null,needsRender=true,activeControl='aperture',opticsMode='build',motionTarget='ballSpeed',simTime=0,lastTime=0,lastTick=performance.now();
const canvas=$('canvas'),cameraCanvas=$('camera-canvas'),spaceCanvas=$('space-canvas');
const help={
 focal:['Brennweite','Die reale Brennweite und der Sensor bestimmen den Bildwinkel. Bei festem Standpunkt ändert Zoomen den Ausschnitt, nicht die Perspektive. Die Objektivknöpfe sind generische Brennweiten ohne Bajonettmodell.'],
 aperture:['Blende','Kleine Blendenzahl = große Öffnung. Sie lässt mehr Licht durch und erzeugt größere Unschärfekreise außerhalb der Fokusebene. Am Smartphone ist die Modellblende fest.'],
 time:['Belichtungszeit','Längere Zeit sammelt mehr Licht. Bewegte Motive hinterlassen gleichzeitig längere Spuren. Ein Stativ stoppt keine Motivbewegung.'],
 iso:['ISO','ISO verändert die Signalverstärkung und Ausgabehelligkeit. Bei unveränderter Blende und Zeit trifft dadurch kein zusätzliches Licht auf den Sensor.'],
 focus:['Fokusdistanz','Eine Entfernung wird exakt auf die Sensorebene abgebildet. Der scharf erscheinende Bereich davor und dahinter hängt vom akzeptierten Unschärfekreis ab.'],
 ev:['Szenenhelligkeit','EV100 beschreibt hier die reflektierte Szenenhelligkeit. +1 EV bedeutet doppelt so viel verfügbares Licht. Kein Lux-Messwert einer realen Lampe.'],
 subject:['Motivabstand','Die Person bewegt sich im Raum. Kleine Aufnahmeabstände vergrößern den Abbildungsmaßstab und verringern häufig die Schärfentiefe.'],
 background:['Hintergrundabstand','Ein weit hinter der fokussierten Person liegender Hintergrund wird meist stärker unscharf. Er bleibt Teil derselben perspektivisch projizierten Szene.'],
 speed:['Motivbewegung','Angegebene Geschwindigkeit quer zur Blickrichtung. Die Unschärfelänge wird aus Geschwindigkeit, Abstand, Brennweite und Belichtungszeit berechnet; die Animation illustriert nur die Bewegung.'],
 cameraBack:['Kamerastandpunkt','Der Rückzug vergrößert den Abstand zu allen Objekten. Anders als Zoom verändert das ihre relativen Abbildungsgrößen und damit die Perspektive. Fokus danach gegebenenfalls neu setzen.'],
 comp:['Belichtungskorrektur','In A und S verschiebt die Korrektur den Zielwert der Automatik. In M mit festem ISO hat sie hier keine Wirkung.'],
 nd:['ND-Filter','Ein ideal neutraler Graufilter reduziert die Lichtmenge. 3 EV lassen ein Achtel des Lichts durch. In A wird die Belichtungszeit entsprechend länger.'],
 wb:['Weißabgleich','Gleicht die angenommene Lichtfarbe aus. Zum Neutralisieren hier denselben Kelvin-Wert wie die Lichtquelle wählen. Das Modell vereinfacht reale spektrale Farben stark.'],
 temperature:['Lichtfarbe','Die Farbtemperatur gehört zur Lichtquelle, der Weißabgleich zur Verarbeitung. 3200 K entspricht hier warmem Kunstlicht, 5500 K näherungsweise Tageslicht.'],
 mp:['Auflösung','Mehr Megapixel bei gleicher Sensorfläche bedeuten kleinere Pixel. Das ändert das strenge 2-Pixel-Schärfekriterium und die Beugung relativ zur Pixelgröße, nicht die geometrische Optik.'],
 foreground:['Vordergrund','Die Pflanze ist eine eigene Tiefenlage. Fokussiere im Aufnahmebild per Klick auf ein sichtbares Objekt oder nutze den Raumplan.'],
 cameraX:['Seitlicher Standpunkt','Verschiebt die Kamera seitlich, bei unveränderter Blickrichtung. Nahe und ferne Objekte verschieben sich unterschiedlich stark (Parallaxe).'],
 subjectX:['Motivposition','Verschiebt ausschließlich die Person seitlich im Raum. Die Abbildung reagiert auf reale Position und Abstand.']
};
const definitions=[
 {key:'focal',label:'Brennweite',min:2,max:200,step:.1,format:v=>`${v.toFixed(1).replace('.0','')} mm`,ends:['2 mm · weit','200 mm · eng']},
 {key:'aperture',label:'Blende',list:apertures,format:v=>`ƒ/${Number(v.toFixed(1))}`,ends:['offen','geschlossen'],color:'light'},
 {key:'time',label:'Belichtungszeit',list:shutters,format:shutterText,ends:['kurz','lang'],color:'light'},
 {key:'iso',label:'ISO',list:isos,format:v=>`${Math.round(v)}`,ends:['wenig Verstärkung','viel Verstärkung'],color:'light'},
 {key:'focus',label:'Fokusdistanz',min:.3,max:50,step:.1,format:distanceText,ends:['0,3 m','50 m'],color:'focus'},
 {key:'comp',label:'Belichtungskorrektur',min:-3,max:3,step:.3,format:v=>`${v>0?'+':''}${v.toFixed(1)} EV`,ends:['−3 EV','+3 EV'],area:'advanced'},
 {key:'nd',label:'ND-Filter',min:0,max:10,step:1,format:v=>`${v.toFixed(0)} EV`,ends:['kein ND','10 Stufen'],area:'advanced',color:'light'},
 {key:'wb',label:'Weißabgleich',min:2500,max:10000,step:100,format:v=>`${Math.round(v)} K`,ends:['2500 K','10000 K'],area:'advanced'},
 {key:'mp',label:'Auflösung',min:8,max:100,step:1,format:v=>`${Math.round(v)} MP`,ends:['8 MP','100 MP'],area:'advanced'},
 {key:'cameraBack',label:'Kamera zurück',min:0,max:8,step:.1,format:v=>`${v.toFixed(1)} m`,ends:['Startpunkt','8 m zurück'],area:'scene'},
 {key:'cameraX',label:'Kamera seitlich',min:-3,max:3,step:.1,format:v=>`${v.toFixed(1)} m`,ends:['links','rechts'],area:'advanced'},
 {key:'subjectX',label:'Person seitlich',min:-2,max:2,step:.1,format:v=>`${v.toFixed(1)} m`,ends:['links','rechts'],area:'advanced',color:'subject'},
 {key:'ev',label:'Szenenhelligkeit',min:3,max:16,step:.1,format:v=>`${v.toFixed(1)} EV₁₀₀`,ends:['dunkel','hell'],area:'scene',color:'light'},
 {key:'subject',label:'Person',min:1.5,max:15,step:.1,format:v=>`${v.toFixed(1)} m`,ends:['nah','fern'],area:'scene',color:'subject'},
 {key:'background',label:'Hintergrund',min:6,max:40,step:.5,format:v=>`${v.toFixed(1)} m`,ends:['6 m','40 m'],area:'scene'},
 {key:'foreground',label:'Pflanze',min:1,max:8,step:.1,format:v=>`${v.toFixed(1)} m`,ends:['1 m','8 m'],area:'scene'},
 {key:'temperature',label:'Lichtfarbe',min:2500,max:10000,step:100,format:v=>`${Math.round(v)} K`,ends:['warm','kühl'],area:'scene',color:'light'}
,{key:'ballDistance',label:'Ballabstand',min:2,max:18,step:.1,format:distanceText,ends:['2 m','18 m'],area:'advanced',color:'subject'},
 {key:'birdDistance',label:'Vogelabstand',min:2,max:25,step:.1,format:distanceText,ends:['2 m','25 m'],area:'advanced',color:'subject'}
];
Object.assign(help,{ballDistance:['Ballabstand','Der Ball hat einen eigenen, von der Person unabhängigen Abstand.'],birdDistance:['Vogelabstand','Der Vogel fliegt in einer eigenen Tiefenlage. Seine Flügel bewegen sich zusätzlich zum Flug.']});
function controlHTML(d){const min=d.list?0:d.min,max=d.list?d.list.length-1:d.max,step=d.list?1:d.step;return `<div class="control" data-color="${d.color||'focus'}"><div class="control-head"><label for="${d.key}">${d.label}<span id="auto-${d.key}"></span></label><output id="out-${d.key}" for="${d.key}"></output></div><input type="range" id="${d.key}" min="${min}" max="${max}" step="${step}" aria-describedby="help-${d.key}"><span class="sr-only" id="help-${d.key}">${help[d.key]?.[1]||''}</span><div class="control-ends"><span>${d.ends[0]}</span><span>${d.ends[1]}</span></div></div>`;}
$('main-controls').innerHTML=definitions.filter(d=>!d.area).map(controlHTML).join('');
$('advanced-controls').innerHTML=definitions.filter(d=>d.area==='advanced').map(controlHTML).join('');
$('scene-controls').innerHTML=definitions.filter(d=>d.area==='scene').map(controlHTML).join('');
$('sensor').innerHTML=Object.entries(sensors).map(([k,s])=>`<option value="${k}">${s.name} · ${s.w} × ${s.h} mm</option>`).join('');
$('page-learn').innerHTML=learnPage();$('page-about').innerHTML=aboutPage();
function atlasPage(){return `<div class="content-header"><p class="eyebrow">KAMERA-ATLAS</p><h1>Sechs Formate. Dieselbe Physik.</h1><p>Generische Formatprofile zum Vergleichen. Die genannten Kamerafamilien veranschaulichen die Größenklassen; wir emulieren keine konkreten Geräte oder Bajonette.</p></div><div class="atlas-grid">${Object.entries(sensors).map(([id,s])=>`<article class="panel atlas-card"><div class="sensor-illustration"><div class="sensor-chip" style="width:${s.w*3.1}px;height:${s.h*3.1}px">${s.w} × ${s.h}</div></div><p class="eyebrow">${id==='phone'?'RECHNERGESTÜTZTE FOTOGRAFIE':'DIGITALES SENSORFORMAT'}</p><h2>${s.name}</h2><p>${s.example}</p><dl><dt>Abmessungen</dt><dd>${s.w} × ${s.h} mm</dd><dt>Crop (diagonal)</dt><dd>${crop(s).toFixed(2)}×</dd><dt>Modellauflösung</dt><dd>${s.mp} MP</dd><dt>Fläche</dt><dd>${Math.round(s.w*s.h)} mm²</dd></dl><p>${id==='phone'?'Kurze reale Brennweite, feste Modellblende ƒ/1.8. Porträtunschärfe kann zusätzlich aus einer Softwaremaske entstehen.':id==='medium'?'Mehr Fläche als 36 × 24 mm. Der Begriff Mittelformat bezeichnet mehrere unterschiedliche Sensorgrößen.':id==='inch'?'„1 Zoll“ ist eine historische Formatbezeichnung und nicht die reale Sensordiagonale.':'Sensorgröße, Objektiv, Abstand und Ausgabe müssen für einen fairen Vergleich gemeinsam betrachtet werden.'}</p><button data-camera="${id}">Im Labor untersuchen ↗</button></article>`).join('')}</div><div class="article-layout"><article class="panel article"><h2>Bauart ist nicht Sensorformat.</h2><p>DSLR und spiegellose Kamera können gleich große Sensoren haben und während der Aufnahme dieselbe geometrische Abbildung erzeugen. Der Spiegel einer DSLR lenkt das Licht vor der Aufnahme zum optischen Sucher. Für die Aufnahme klappt er aus dem Strahlengang. Spiegellose Kameras speisen den elektronischen Sucher aus dem Sensorbild.</p><p>Kompaktkameras besitzen ein fest eingebautes Objektiv. Smartphones kombinieren meist mehrere feste Kameramodule mit Bildverarbeitung. Ein digitaler Zoom ist ein Ausschnitt oder eine rechnerische Rekonstruktion, keine Änderung der realen Brennweite.</p></article><article class="panel article"><h2>Wie vergleichen wir fair?</h2><p><b>Gleiche reale Brennweite:</b> zeigt den veränderten Bildwinkel. <b>Gleicher Ausschnitt bei gleichem Standpunkt:</b> benötigt eine andere reale Brennweite. <b>Gleiche Personengröße durch Standortwechsel:</b> verändert zusätzlich die Perspektive.</p><p>Bei gleichem Ausschnitt und gleicher Blendenzahl ergeben sich deshalb andere Schärfentiefe und andere gesamte Lichtmenge. Ein Crop-Faktor allein ist kein Qualitätsurteil. Der Pixelabstand aus unserem vereinfachten Profil ist kein gemessener Pixelpitch eines genannten Kameramodells.</p></article></div>`;}
$('page-atlas').innerHTML=atlasPage();
function explain(key){
 if(['focal','aperture','focus','time','iso'].includes(key))activeControl=key;
 if(help[key])$('control-explainer').innerHTML=`<b>${help[key][0]}</b><p>${help[key][1]}</p>`;
 document.querySelectorAll('#main-controls .control').forEach(el=>el.classList.toggle('is-active',el.querySelector('input')?.id===activeControl));
 document.querySelectorAll('[data-control]').forEach(b=>b.classList.toggle('active',b.dataset.control===activeControl));
 needsRender=true;
}
for(const id of['advanced','advanced-bottom'])$(id).onclick=()=>$('advanced-dialog').showModal();
$('sensors-open').onclick=()=>{$('advanced-dialog').close();$('sensor-dialog').showModal();drawSensors($('sensor-canvas'),state);};
function selectControl(key){explain(key);$(key)?.focus({preventScroll:true});update();}
document.querySelectorAll('[data-control]').forEach(b=>b.onclick=()=>selectControl(b.dataset.control));
definitions.forEach(d=>{const input=$(d.key);input.addEventListener('input',()=>{state[d.key]=d.list?d.list[Number(input.value)]:Number(input.value);explain(d.key);update();});input.addEventListener('focus',()=>explain(d.key));});
for(const key of['body','mode','cocMode'])$(key).addEventListener('change',()=>{state[key]=$(key).value;update();});
for(const key of['matchFrame','tripod','stabilization','portrait','grid','zebra','peaking','motion'])$(key).addEventListener('change',()=>{state[key]=$(key).checked;update();});
$('sensor').addEventListener('change',()=>{state=changeSensor(state,$('sensor').value);if(state.sensor==='phone'&&state.mode==='S')state.mode='M';update();});
$('scene').addEventListener('change',()=>{state.scene=$('scene').value;const p={courtyard:{ev:11,temperature:5500},night:{ev:5,temperature:3800},studio:{ev:9,temperature:3200}}[state.scene];Object.assign(state,p);update();});
document.querySelectorAll('[data-focal]').forEach(b=>b.addEventListener('click',()=>{state.focal=Number(b.dataset.focal);explain('focal');update();}));
function page(name){
 if(name==='lab'){$('library-dialog').close();return;}
 for(const p of $('library-dialog').querySelectorAll('.page'))p.hidden=p.id!==`page-${name}`;
 if(!$('library-dialog').open)$('library-dialog').showModal();
 $('library-dialog').scrollTop=0;
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.page)page(b.dataset.page);if(b.dataset.experiment)openLesson(b.dataset.experiment);if(b.dataset.camera){state=changeSensor(state,b.dataset.camera);if(state.sensor==='phone'&&state.mode==='S')state.mode='M';page('lab');update();}});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();page('lab');});
document.querySelectorAll('[data-optics]').forEach(b=>b.onclick=()=>{opticsMode=b.dataset.optics;update();});
$('lesson-current').onclick=()=>activeLesson&&openLesson(activeLesson.id);
const motionLabels={speed:'Person · Gehen',waveSpeed:'Hand · Winken',ballSpeed:'Balltempo',birdSpeed:'Flugtempo'};
document.querySelectorAll('[data-motion]').forEach(b=>b.onclick=()=>{motionTarget=b.dataset.motion;update();});
$('motion-speed').oninput=()=>{state[motionTarget]=Number($('motion-speed').value);update();};
function update(){
 const m=metrics(state),s=m.s;needsRender=true;
 for(const key of['sensor','body','mode','cocMode','scene'])$(key).value=state[key];
 $('body').disabled=state.sensor==='phone';$('mode').querySelector('[value=S]').disabled=state.sensor==='phone';$('camera-note').textContent=m.sensor.example;
 for(const d of definitions){const v=s[d.key],el=$(d.key);el.value=d.list?d.list.indexOf(nearest(d.list,v)):v;$(`out-${d.key}`).textContent=d.format(v);el.setAttribute('aria-valuetext',d.format(v));const auto=(d.key==='time'&&s.mode==='A')||(d.key==='aperture'&&(s.mode==='S'||s.sensor==='phone'));el.disabled=auto||(d.key==='comp'&&s.mode==='M');$(`auto-${d.key}`).textContent=auto?(s.sensor==='phone'&&d.key==='aperture'?'fest':'auto'):'';}
 for(const key of['matchFrame','tripod','stabilization','portrait','grid','zebra','peaking','motion'])$(key).checked=state[key];$('portrait').disabled=state.sensor!=='phone';
 document.querySelectorAll('[data-focal]').forEach(b=>b.classList.toggle('selected',Math.abs(Number(b.dataset.focal)-s.focal)<.5));
 document.querySelectorAll('[data-optics]').forEach(b=>b.classList.toggle('active',b.dataset.optics===opticsMode));
 document.querySelectorAll('[data-motion]').forEach(b=>b.classList.toggle('active',b.dataset.motion===motionTarget));
 $('motion-label').textContent=motionLabels[motionTarget];$('motion-speed').value=state[motionTarget];$('out-motion-speed').textContent=`${state[motionTarget].toFixed(1)} m/s`;
 $('photo-settings').innerHTML=`<span>${s.mode}</span><span>ƒ/${Number(s.aperture.toFixed(1))}</span><span>${shutterText(s.time)}</span><span>ISO ${s.iso}</span><span>${s.focal.toFixed(1).replace('.0','')} mm</span>`;
 $('metrics').innerHTML=`<div class="metric ${Math.abs(m.offset)>1?'warn':''}"><div class="label">BELICHTUNG</div><div class="value">${m.offset>=0?'+':''}${m.offset.toFixed(1)} EV</div><div class="sub">zur Szenenreferenz</div></div><div class="metric teal"><div class="label">SCHARF ERSCHEINEND</div><div class="value">${distanceText(m.near)} – ${distanceText(m.far)}</div><div class="sub">c = ${(m.coc*1000).toFixed(1)} µm</div></div><div class="metric"><div class="label">BILDWINKEL · HORIZONTAL</div><div class="value">${m.fov.toFixed(1)}°</div><div class="sub">${m.equivalent.toFixed(0)} mm KB-äquivalent (diagonal)</div></div><div class="metric"><div class="label">LICHT AM SENSOR · PRO FLÄCHE</div><div class="value">${m.physical.toFixed(m.physical<.1?3:2)}×</div><div class="sub">ISO-Verstärkung ${Math.round(s.iso/100)}×</div></div>`;
 const physical={focal:`<strong>${s.focal.toFixed(1)} mm:</strong> Die Linsengruppen bündeln das Licht. Die Brennweite verändert den Bildwinkel.`,aperture:`<strong>ƒ/${Number(s.aperture.toFixed(1))}:</strong> Die mechanische Blende liegt zwischen den Linsengruppen. D = f/N beschreibt die Eintrittspupille.`,focus:`<strong>Fokus ${distanceText(s.focus)}:</strong> Der Abstand der Optik zum Sensor bestimmt, welche Entfernung scharf abgebildet wird.`,time:`<strong>${shutterText(s.time)}:</strong> Der Verschluss gibt das Licht für diese Dauer frei. Die Blendenöffnung bleibt unverändert.`,iso:`<strong>ISO ${s.iso}:</strong> ${Math.round(s.iso/100)}× Modellverstärkung nach dem Sensor. Die Lichtstrahlen ändern sich dadurch nicht.`};
 $('camera-caption').innerHTML=opticsMode==='model'?'<strong>Abstraktes Dünnlinsenmodell.</strong> Hauptebene und Eintrittspupille sind hier zusammengelegt; das ist keine reale Bauteilanordnung.':physical[activeControl];
 $('room-summary').innerHTML=`<span>Fokus <strong>${distanceText(s.focus)}</strong></span><span>Schärfekriterium <strong>${(m.coc*1000).toFixed(1)} µm</strong></span><span>Abstände ab Kamera</span>`;
 let messages=[];if(m.blurAt(s.subject+s.cameraBack)>m.coc)messages.push('<span class="warning">Person außerhalb des Schärfebereichs.</span>');else messages.push('Person im Schärfebereich.');
 if(s.mode!=='M'&&Math.abs(m.offset-s.comp)>.15)messages.push('<span class="warning">Automatikgrenze erreicht.</span>');
 else if(s.sensor==='phone')messages.push('Smartphone: feste Blende.');
 else messages.push('Bewegungen einzeln einstellen; 0 = still.');
 $('insight').innerHTML=messages.join(' ');$('active-experiment').hidden=true;$('lesson-current').hidden=!activeLesson;if(activeLesson){$('lesson-current').textContent=`Versuch ${activeLesson.n}${activeLesson.check(s)?' ✓':''}`;$('lesson-current').title=activeLesson.goal;}
}

function lessonGuide(s){if(!activeLesson)return '';const l=activeLesson;return `<div class="active-experiment"><div><span class="eyebrow">EXPERIMENT ${l.n}</span><strong>${l.title}</strong><p>${l.goal}</p><span>${l.check(s)?'✓ Zielzustand erreicht. Vergleiche jetzt und begründe den Effekt.':'Verändere die Einstellungen und beobachte die Wirkung.'}</span></div><button data-experiment="${l.id}">Anleitung</button><button id="end-lesson">Beenden</button></div>`;}
document.addEventListener('click',e=>{if(e.target.id==='end-lesson'){activeLesson=null;update();}});
function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('visible'),3500);}
$('reset').addEventListener('click',()=>{state={...defaults};simTime=0;motionTarget='ballSpeed';opticsMode='build';activeLesson=null;history.replaceState(null,'',location.href.split('#')[0]);explain('aperture');update();toast('Ausgangseinstellungen wiederhergestellt.');});
$('focus-subject').addEventListener('click',()=>{state.focus=state.subject+state.cameraBack;update();toast(`Auf Person bei ${distanceText(state.focus)} fokussiert.`);});
$('share').addEventListener('click',async()=>{const url=location.href.split('#')[0]+'#s='+encodeState(state);history.replaceState(null,'',url);try{await navigator.clipboard.writeText(url);toast('Link mit deinen Einstellungen kopiert.');}catch{const d=$('lesson-dialog');$('lesson-content').innerHTML='<p class="eyebrow">VERSUCH TEILEN</p><h2>Dein reproduzierbarer Versuch</h2><p>Kopiere den folgenden Link. Er enthält die Kamera- und Szeneneinstellungen.</p><textarea id="share-url" rows="5" style="width:100%"></textarea>';$('share-url').value=url;d.showModal();$('share-url').select();}});
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#s=')){state=decodeState(location.hash);update();}});
$('snapshot').addEventListener('click',()=>{saved=structuredClone(state);$('compare').disabled=false;$('snapshot').textContent='A ersetzen';toast('Aufnahme A gespeichert. Verändere jetzt die Einstellungen für B.');});
function settingsText(s){const m=metrics(s),e=m.s;return `${m.sensor.name} · ${e.focal.toFixed(1)} mm · ƒ/${Number(e.aperture.toFixed(1))} · ${shutterText(e.time)} · ISO ${e.iso}<br>Fokus ${distanceText(e.focus)} · DOF ${distanceText(m.near)} – ${distanceText(m.far)}<br>Person ${distanceText(e.subject+e.cameraBack)} · Hintergrund ${distanceText(e.background+e.cameraBack)}<br>Licht ${m.physical.toFixed(2)}× · Abweichung ${m.offset.toFixed(1)} EV`;}
$('compare').addEventListener('click',()=>{if(!saved)return;drawPhoto($('compare-a'),saved,0,{clean:true});drawPhoto($('compare-b'),state,0,{clean:true});$('compare-a-caption').innerHTML='<strong>A · Gespeichert</strong><br>'+settingsText(saved);$('compare-b-caption').innerHTML='<strong>B · Aktuell</strong><br>'+settingsText(state);$('compare-dialog').showModal();});
$('download').addEventListener('click',()=>{render(simTime);canvas.toBlob(blob=>{if(!blob)return;const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fotolabor-aufnahme.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Aufnahmebild als PNG exportiert.');});});
function openLesson(id){const l=lessons.find(x=>x.id===id);if(!l)return;$('lesson-content').innerHTML=`<p class="eyebrow">EXPERIMENT ${l.n} · ${l.topic.toUpperCase()} · ${l.duration}</p><h2>${l.title}</h2><p>${l.intro}</p><ol>${l.steps.map(x=>`<li>${x}</li>`).join('')}</ol><div class="lesson-check"><strong>Denkfrage</strong><br>${l.question}</div><details><summary>Erklärung aufklappen</summary><p class="reveal">${l.answer}</p></details><p class="micro">Zielzustand: ${l.goal} Die Rückmeldung prüft die Einstellungen, nicht dein Verständnis.</p><div style="display:flex;gap:8px;margin-top:18px"><button id="start-lesson" class="primary">Mit Ausgangseinstellungen starten ↗</button><button id="resume-lesson" class="quiet">Im aktuellen Versuch bleiben</button></div>`;$('start-lesson').onclick=()=>{state={...defaults,...l.setup};activeLesson=l;page('lab');simTime=0;motionTarget=l.id==='motion'?'speed':'ballSpeed';explain(l.id==='iso'?'iso':'aperture');$('lesson-dialog').close();update();toast(`Experiment ${l.n} gestartet.`);};$('resume-lesson').onclick=()=>$('lesson-dialog').close();if(!$('lesson-dialog').open)$('lesson-dialog').showModal();}
function resize(){
 for(const cv of[canvas,cameraCanvas,spaceCanvas]){const box=cv.getBoundingClientRect();if(!box.width||!box.height)continue;const dpr=Math.min(window.devicePixelRatio||1,1.5),w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;needsRender=true;}}
}
for(const cv of[canvas,cameraCanvas,spaceCanvas])new ResizeObserver(resize).observe(cv);
function position(cv,e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height};}
canvas.addEventListener('pointerdown',e=>{const p=position(canvas,e);if(!photoHit)return;const hits=photoHit.boxes.filter(b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h);if(hits.length){state.focus=clamp(hits.sort((a,b)=>a.z-b.z)[0].z,.3,50);explain('focus');update();}});
spaceCanvas.addEventListener('pointerdown',e=>{if(!spaceHit)return;const p=position(spaceCanvas,e),hit=spaceHit.hits.find(h=>Math.hypot(h.x-p.x,h.y-p.y)<28);if(hit){drag=hit;spaceCanvas.setPointerCapture(e.pointerId);}else{state.focus=clamp((p.x-spaceHit.margin)/spaceHit.scale,.3,50);explain('focus');update();}});
spaceCanvas.addEventListener('pointermove',e=>{if(!drag)return;const p=position(spaceCanvas,e),d=definitions.find(x=>x.key===drag.key);state[drag.key]=Math.round(clamp((p.x-spaceHit.margin)/spaceHit.scale-state.cameraBack,d.min,d.max)*10)/10;update();});
spaceCanvas.addEventListener('pointerup',()=>drag=null);spaceCanvas.addEventListener('pointercancel',()=>drag=null);
cameraCanvas.addEventListener('pointerdown',e=>{if(!cameraHit)return;const p=position(cameraCanvas,e),part=cameraHit.parts.reduce((a,b)=>Math.abs(a.x-p.x)<Math.abs(b.x-p.x)?a:b);selectControl(part.key);});
function render(t,onlyPhoto=false){photoHit=drawPhoto(canvas,state,t);if(!onlyPhoto){cameraHit=drawCutaway(cameraCanvas,state,{active:activeControl,model:opticsMode==='model'});spaceHit=drawRoom(spaceCanvas,state);}}
function animate(now){const dt=Math.min((now-lastTick)/1000,.1);lastTick=now;const moving=state.motion&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches;if(moving)simTime+=dt;if(needsRender||(moving&&now-lastTime>80)){render(simTime,!needsRender);needsRender=false;lastTime=now;}requestAnimationFrame(animate);}
explain('aperture');

update();resize();requestAnimationFrame(animate);

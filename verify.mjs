import assert from 'node:assert/strict';
import {defaults,sensors,metrics,effective,changeSensor,decodeState,encodeState,cameraModel} from './dist/physics.mjs';
import {sceneObjects} from './dist/renderer.mjs';
import {lessons} from './dist/content.mjs';
const close=(a,b,eps=1e-9)=>assert.ok(a===b||Math.abs(a-b)<eps,`${a} != ${b}`);
let n=0;function test(name,fn){fn();console.log(`✓ ${name}`);n++;}
test('50 mm on 36 mm sensor gives 39.598° horizontal field of view',()=>close(metrics({...defaults,focal:50}).fov,39.597752709049864));
test('Thin lens image plane at 5 m is 50.505 mm for a 50 mm lens',()=>close(metrics(defaults).v,50.505050505050505));
test('Focus plane blur is zero; both DOF bounds meet the selected circle criterion',()=>{for(const sensor of Object.keys(sensors)){const m=metrics({...defaults,sensor});close(m.blurAt(defaults.focus),0);close(m.blurAt(m.near),m.coc);close(m.blurAt(m.far),m.coc);}});
test('Far DOF reaches infinity when focus reaches hyperfocal distance',()=>{const m=metrics(defaults),q=metrics({...defaults,focus:m.H});assert.equal(q.far,Infinity);});
test('One stop longer doubles photons; ISO alone does not alter them',()=>{const a=metrics(defaults),b=metrics({...defaults,time:defaults.time*2}),c=metrics({...defaults,iso:200});close(b.physical,a.physical*2);close(c.physical,a.physical);close(c.offset,a.offset+1);});
test('ND 3 attenuates photons by eight; A compensates with eight times longer exposure',()=>{close(metrics({...defaults,nd:3}).physical,metrics(defaults).physical/8);const a=effective({...defaults,mode:'A'}),b=effective({...defaults,mode:'A',nd:3});close(b.time,a.time*8);});
test('A and S meet target exposure within unconstrained ranges',()=>{for(const mode of['A','S'])for(const comp of[-1,0,1])close(metrics({...defaults,mode,comp}).offset,comp);});
test('Horizontal framing lock preserves FoV across all sensor formats',()=>{const a=metrics(defaults);for(const id of Object.keys(sensors))close(metrics(changeSensor(defaults,id)).fov,a.fov);});
test('Unlocked sensor change preserves real focal length',()=>close(changeSensor({...defaults,matchFrame:false},'apsc').focal,defaults.focal));
test('Stopping down broadens geometric DOF while increasing diffraction',()=>{const a=metrics({...defaults,aperture:2}),b=metrics({...defaults,aperture:11});assert.ok(b.near<a.near&&b.far>a.far&&b.airy>a.airy);});
test('Phone aperture is fixed, and a portrait mask does not alter optical DOF',()=>{const a=metrics({...defaults,sensor:'phone',focal:6.8}),b=metrics({...defaults,sensor:'phone',focal:6.8,portrait:true});assert.equal(a.s.aperture,1.8);close(a.near,b.near);close(a.far,b.far);});
test('Share state round trip and hostile/invalid hash bounds',()=>{assert.deepEqual(decodeState('#s='+encodeState(defaults)),defaults);assert.equal(decodeState('#s='+encodeURIComponent('{"focal":-30,"sensor":"unknown","mode":"BAD"}')).focal,2);assert.deepEqual(decodeState('#s=broken'),defaults);});
test('Two-group camera focuses all admitted rays on one sensor point',()=>{for(const focal of[6.8,24,50,135])for(const focus of[.5,5,20]){const c=cameraModel({...defaults,focal,focus,subject:focus});close(c.rays[0].sensorY,c.rays[2].sensorY,1e-8);assert.ok(c.irisDiameter<c.entranceDiameter);}});
test('ISO does not change two-group optical rays, and stopping down narrows the iris',()=>{assert.deepEqual(cameraModel(defaults),cameraModel({...defaults,iso:6400}));assert.ok(cameraModel({...defaults,aperture:11}).irisDiameter<cameraModel(defaults).irisDiameter);});
test('Moving the person changes neither sculpture nor ball/bird depth',()=>{const a=sceneObjects(defaults),b=sceneObjects({...defaults,subject:15,subjectX:2});for(const id of['sculpture','ball','bird'])assert.deepEqual(a.find(x=>x.id===id),b.find(x=>x.id===id));});
test('A waving hand has independent motion while the body stays still',()=>{const a=sceneObjects({...defaults,speed:0,waveSpeed:2});assert.equal(a.find(x=>x.id==='person').speed,0);assert.equal(a.find(x=>x.id==='hand').speed,2);assert.equal(sceneObjects({...defaults,waveSpeed:0}).some(x=>x.id==='hand'),false);});
test('Ball and bird move independently of the person',()=>{const a=sceneObjects(defaults,0),b=sceneObjects(defaults,.1);close(a.find(x=>x.id==='person').x,b.find(x=>x.id==='person').x);for(const id of['ball','bird'])assert.notEqual(a.find(x=>x.id===id).x,b.find(x=>x.id===id).x);});
test('Guided experiments start within a usable reference exposure',()=>{for(const l of lessons){const m=metrics({...defaults,...l.setup});assert.ok(Math.abs(m.offset)<.25,`${l.id}: ${m.offset} EV`);}});
for(const sensor of Object.keys(sensors))for(const focal of[2,24,50,85,200])for(const aperture of[1.4,2.8,11,22]){const m=metrics({...defaults,sensor,focal,aperture});assert.ok(m.near>0&&m.near<=defaults.focus&&m.far>=defaults.focus);assert.ok(Number.isFinite(m.physical)&&Number.isFinite(m.noise));}
console.log(`\n${n} physics checks + 120 parameter combinations passed.`);

"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ArrowCounterClockwise, Camera, DownloadSimple, FilmStrip, House, PersonSimpleWalk } from "@phosphor-icons/react";
import "./floorplan-tour.css";

type View = { label: string; position: [number, number, number]; target: [number, number, number] };
const views: View[] = [
  { label: "Exterior", position: [16, 11, 17], target: [0, 1.2, 0] },
  { label: "Entrada", position: [9, 2.4, 8], target: [1, 1.25, 0] },
  { label: "Sala", position: [7, 2.7, 4.7], target: [1.2, 1.1, 0.2] },
  { label: "Cocina", position: [-7, 2.8, 5.6], target: [-1.5, 1.1, -1] },
  { label: "Dormitorio", position: [6, 2.6, -5.3], target: [2, 1.1, -2.4] },
  { label: "Terraza", position: [-8, 2.8, -7], target: [-.3, .8, 2.2] },
];

const mat = (color: string, roughness = .72) => new THREE.MeshStandardMaterial({ color, roughness });
function box(group: THREE.Object3D, size: [number, number, number], pos: [number, number, number], material: THREE.Material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...pos); mesh.castShadow = cast; mesh.receiveShadow = true; group.add(mesh); return mesh;
}
function windowPanel(group: THREE.Group, pos: [number, number, number], size: [number, number], rotationY = 0) {
  const frame = mat("#5f615e", .5), glass = new THREE.MeshPhysicalMaterial({ color: "#9fc8d2", roughness: .1, metalness: .05, transparent: true, opacity: .72 });
  const holder = new THREE.Group(); holder.rotation.y = rotationY; holder.position.set(...pos); group.add(holder);
  box(holder, [size[0], .08, size[1]], [0, 0, 0], glass, false); box(holder, [size[0] + .12, .08, .08], [0, .0, -size[1] / 2], frame); box(holder, [size[0] + .12, .08, .08], [0, .0, size[1] / 2], frame); box(holder, [.08, .08, size[1]], [-size[0] / 2, 0, 0], frame); box(holder, [.08, .08, size[1]], [size[0] / 2, 0, 0], frame); return holder;
}
function makeFurniture(group: THREE.Group) {
  const wood = mat("#8d6441"), fabric = mat("#d8d2c6"), dark = mat("#253041"), green = mat("#567865");
  box(group, [3.1, .18, 1.2], [2.2, .45, .5], fabric); box(group, [3.1, .8, .18], [2.2, .8, 1.05], fabric); box(group, [1.9, .12, .85], [2.2, .1, .5], mat("#eee9df"));
  box(group, [2.8, .25, .7], [-1.5, 2.05, -3.25], mat("#faf8f1")); box(group, [2.8, .28, .18], [-1.5, 2.34, -3.48], wood);
  box(group, [2.4, .3, .75], [-.6, 2.25, -1.2], mat("#ded0bc")); box(group, [2.0, .12, .55], [-3.25, 1.65, 3.25], mat("#e8e2d7"));
  box(group, [2.4, .25, .55], [-.2, 2.25, 3.35], mat("#efe8db")); box(group, [2.4, .8, .18], [-.2, 2.65, 3.6], dark);
  for (const x of [-1.2, .8]) box(group, [.08, .08, .08], [x, .52, 1.55], wood);
  for (const p of [[-4.0,.35,2.8], [4.5,.35,3.1], [4.2,.35,-3.4]] as [number,number,number][]) { const pot = new THREE.Mesh(new THREE.CylinderGeometry(.22,.3,.35,16), wood); pot.position.set(...p); group.add(pot); const leaf = new THREE.Mesh(new THREE.SphereGeometry(.45,12,8), green); leaf.position.set(p[0],p[1]+.5,p[2]); leaf.scale.set(.8,1.2,.8); leaf.castShadow=true; group.add(leaf); }
}
function buildHouse() {
  const home = new THREE.Group(); const wall = mat("#f1eee7"), trim = mat("#5f615e"), floorMat = mat("#d6c5ad");
  box(home, [11.8,.18,9.2], [0,0,0], floorMat, false);
  // Outer envelope is intentionally open at the top so the interior remains visible in orbit mode.
  box(home, [11.8,3.9,.22], [0,2.0,-4.6], wall); box(home, [11.8,3.9,.22], [0,2.0,4.6], wall);
  box(home, [.22,3.9,9.2], [-5.8,2.0,0], wall); box(home, [.22,3.9,9.2], [5.8,2.0,0], wall);
  [[-2.6,-1.8],[2.1,-1.8],[-2.6,2.5],[3.9,1.9],[0,2.35]].forEach(([x,z],i)=>box(home, [.18,3.0,i===2?3.2:2.8], [x,1.55,z], trim));
  // Doors, glazing and the covered terrace make the home readable from outside.
  box(home, [1.3,2.3,.08], [5.68,.95,1.1], mat("#a77c56")); windowPanel(home, [5.7,2.25,-2.0], [2.2,2.0], Math.PI/2); windowPanel(home, [-2.2,2.25,4.55], [2.7,2.0]);
  box(home, [5.1,.18,2.8], [-.5,3.75,5.9], mat("#8b715b")); for (const x of [-2.5,-.5,1.5]) box(home, [.12,3.6,.12], [x,1.8,5.9], trim, false);
  box(home, [2.2, .12, 2.2],[-4.45,.17,3.25],mat("#b9a181")); box(home,[2.5,.08,2.5],[-4.45,.24,3.25],mat("#9b6d49"));
  makeFurniture(home); return home;
}
function createScene(canvas: HTMLCanvasElement) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color("#dce5e4");
  const camera = new THREE.PerspectiveCamera(58, canvas.clientWidth / canvas.clientHeight, .1, 100); camera.position.set(...views[0].position);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.add(new THREE.HemisphereLight("#fff8e9", "#7e8c9b", 2.1)); const sun = new THREE.DirectionalLight("#fff4dc", 3.2); sun.position.set(-5, 12, 7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); scene.add(sun);
  scene.add(buildHouse());
  const ground = box(scene, [44,.08,44], [0,-.15,0], mat("#b9c5bd"), false); ground.receiveShadow = true;
  const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(...views[0].target); controls.enableDamping=true; controls.dampingFactor=.07; controls.minDistance=2.2; controls.maxDistance=28; controls.maxPolarAngle=Math.PI*.49;
  const keys = new Set<string>(); let walking = false; let raf=0;
  const onKey = (event: KeyboardEvent) => { if (["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) { keys.add(event.key.toLowerCase()); event.preventDefault(); } };
  const onUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase()); window.addEventListener("keydown",onKey); window.addEventListener("keyup",onUp);
  const walk=()=>{ if(walking){const step=.075; const forward=new THREE.Vector3(); camera.getWorldDirection(forward); forward.y=0; forward.normalize(); const right=new THREE.Vector3().crossVectors(forward,camera.up).normalize(); if(keys.has("w")||keys.has("arrowup"))camera.position.addScaledVector(forward,step); if(keys.has("s")||keys.has("arrowdown"))camera.position.addScaledVector(forward,-step); if(keys.has("a")||keys.has("arrowleft"))camera.position.addScaledVector(right,-step); if(keys.has("d")||keys.has("arrowright"))camera.position.addScaledVector(right,step); camera.position.y=1.65; controls.target.copy(camera.position).add(forward); } controls.update(); renderer.render(scene,camera); raf=requestAnimationFrame(walk); }; walk();
  const resize=()=>{ const w=canvas.clientWidth,h=canvas.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false); }; window.addEventListener("resize",resize);
  return { camera, controls, renderer, setWalking:(value:boolean)=>{walking=value; controls.enabled=!value; if(value) canvas.requestPointerLock?.();}, dispose:()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("keydown",onKey); window.removeEventListener("keyup",onUp); controls.dispose(); renderer.dispose(); } };
}

export function FloorplanTour() {
  const canvasRef=useRef<HTMLCanvasElement>(null); const api=useRef<ReturnType<typeof createScene>>(null); const [active,setActive]=useState(0); const [walking,setWalking]=useState(false); const [recording,setRecording]=useState(false); const recorder=useRef<MediaRecorder|null>(null); const chunks=useRef<Blob[]>([]);
  useEffect(()=>{ if(!canvasRef.current)return; api.current=createScene(canvasRef.current); return()=>api.current?.dispose(); },[]);
  const setView=(i:number)=>{ setActive(i); setWalking(false); document.exitPointerLock?.(); const v=views[i]; if(!api.current)return; api.current.camera.position.set(...v.position); api.current.controls.target.set(...v.target); api.current.controls.update(); };
  const toggleWalk=()=>{const next=!walking; setWalking(next); api.current?.setWalking(next);};
  const capture=()=>{ if(!api.current)return; const a=document.createElement("a"); a.download=`casa-3d-${views[active].label.toLowerCase()}.png`; a.href=api.current.renderer.domElement.toDataURL("image/png"); a.click(); };
  const record=()=>{ if(!api.current)return; if(recording){ recorder.current?.stop(); setRecording(false); return; } chunks.current=[]; const stream=api.current.renderer.domElement.captureStream(30); const type=MediaRecorder.isTypeSupported("video/webm;codecs=vp9")?"video/webm;codecs=vp9":"video/webm"; const r=new MediaRecorder(stream,{mimeType:type}); recorder.current=r; r.ondataavailable=e=>e.data.size&&chunks.current.push(e.data); r.onstop=()=>{const a=document.createElement("a");a.download="tour-casa-conceptual.webm";a.href=URL.createObjectURL(new Blob(chunks.current,{type}));a.click();}; r.start(); setRecording(true); setTimeout(()=>{if(r.state==="recording")r.stop();setRecording(false)},18000); };
  return <section className="tour3d-section"><div className="tour3d-heading"><div><span className="tour3d-kicker">MODELO CONCEPTUAL · TYPE 01 & 04</span><h1>Entra. Recorre. Mira la casa completa.</h1><p>Una lectura espacial navegable del plano recibido. Orbita para ver el conjunto o activa caminar y usa <strong>W A S D</strong> para entrar a cada espacio.</p></div><div className="tour3d-badge"><House size={22}/><span>Casa completa<br/><small>una planta · escala visual aproximada</small></span></div></div><div className="tour3d-shell"><canvas ref={canvasRef} onClick={()=>walking&&api.current?.setWalking(true)} aria-label="Visor 3D navegable de la casa conceptual"/><div className="tour3d-hint">{walking ? "Caminar activo · W A S D · clic para capturar el cursor" : "Arrastra para orbitar · rueda para acercar"}</div><div className="tour3d-controls"><div className="tour3d-views">{views.map((v,i)=><button key={v.label} className={i===active&&!walking?"active":""} onClick={()=>setView(i)}>{v.label}</button>)}</div><div className="tour3d-actions"><button onClick={()=>setView(0)} title="Restablecer"><ArrowCounterClockwise size={19}/></button><button onClick={toggleWalk} className={walking?"active":""} title="Modo caminar"><PersonSimpleWalk size={19}/>{walking?" Caminar":" Entrar"}</button><button onClick={capture} title="Capturar ángulo"><Camera size={19}/></button><button onClick={record} className={recording?"recording":""} title="Grabar tour"><FilmStrip size={19}/>{recording?" Grabando…":" Video"}</button></div></div></div><p className="tour3d-note"><DownloadSimple size={16}/> Captura ángulos PNG y graba el recorrido como WebM desde el navegador. Esta versión es conceptual, no constructiva.</p></section>;
}

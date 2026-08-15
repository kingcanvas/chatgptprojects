"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type BlockType = "grass" | "soil" | "stone" | "sand" | "bark" | "wood" | "leaves" | "crystal" | "metal" | "rune" | "snow" | "copper" | "dark" | "core";
type CameraMode = "first" | "third" | "front";
type Quality = "low" | "balanced" | "high";
type BlockCoord = { x: number; y: number; z: number; type: BlockType };
type GameActions = { mine: () => void; place: () => void; jump: () => void; camera: () => void; look: (dx: number, dy: number) => void };

const WORLD_RADIUS = 18;
const SAVE_KEY = "shardstead:first-light:v1";
const texturePath = (name: string) => `/textures/${name}.png`;
const blockKey = (x: number, y: number, z: number) => `${x}|${y}|${z}`;

const BLOCK_LABELS: Record<BlockType, string> = {
  grass: "Meadow", soil: "Rich soil", stone: "Stone", sand: "Sun sand", bark: "Bark",
  wood: "Timber", leaves: "Leaves", crystal: "Rift crystal", metal: "Core metal",
  rune: "Rune stone", snow: "Snow", copper: "Copper ore", dark: "Rift rock", core: "World Core",
};

const HOTBAR: { type: BlockType; swatch: string }[] = [
  { type: "grass", swatch: "#638e37" }, { type: "stone", swatch: "#7a7d78" },
  { type: "wood", swatch: "#a66b32" }, { type: "crystal", swatch: "#8c5cff" },
  { type: "metal", swatch: "#334f50" },
];

const CAMERA_LABELS: Record<CameraMode, string> = { first: "First person", third: "Third person", front: "Front view" };

function hash2(x: number, z: number) {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function terrainHeight(x: number, z: number) {
  if (Math.abs(x) <= 6 && Math.abs(z) <= 6) return 2;
  const broad = Math.sin(x * 0.2) * 1.35 + Math.cos(z * 0.17) * 1.15;
  const detail = (hash2(x, z) - 0.5) * 1.25;
  return Math.max(0, Math.min(7, Math.floor(2.4 + broad + detail)));
}

function generateWorld() {
  const world = new Map<string, BlockType>();
  for (let x = -WORLD_RADIUS; x <= WORLD_RADIUS; x += 1) {
    for (let z = -WORLD_RADIUS; z <= WORLD_RADIUS; z += 1) {
      let height = terrainHeight(x, z);
      if (Math.max(Math.abs(x), Math.abs(z)) > WORLD_RADIUS - 2 && hash2(x + 9, z - 4) > 0.45) height = Math.max(0, height - 2);
      for (let y = -1; y <= height; y += 1) {
        let type: BlockType = "stone";
        if (y === height) type = height <= 1 ? "sand" : height >= 6 ? "snow" : "grass";
        else if (y >= height - 2) type = height <= 1 ? "sand" : "soil";
        else if (hash2(x * 3 + y, z * 5 - y) > 0.91) type = "copper";
        world.set(blockKey(x, y, z), type);
      }
    }
  }
  for (let x = -3; x <= 3; x += 1) {
    for (let z = -3; z <= 3; z += 1) {
      if (Math.abs(x) === 3 || Math.abs(z) === 3 || (x + z) % 2 === 0) world.set(blockKey(x, 3, z), "metal");
    }
  }
  for (const [x, z] of [[-3, -3], [-3, 3], [3, -3], [3, 3]]) {
    world.set(blockKey(x, 4, z), "rune");
    world.set(blockKey(x, 5, z), "crystal");
  }
  world.set(blockKey(0, 4, 0), "metal");
  world.set(blockKey(0, 5, 0), "core");
  world.set(blockKey(0, 6, 0), "crystal");
  for (let x = -WORLD_RADIUS + 2; x <= WORLD_RADIUS - 2; x += 1) {
    for (let z = -WORLD_RADIUS + 2; z <= WORLD_RADIUS - 2; z += 1) {
      if ((Math.abs(x) < 7 && Math.abs(z) < 7) || hash2(x + 44, z - 21) < 0.958) continue;
      const ground = terrainHeight(x, z);
      if (ground < 2 || ground > 5) continue;
      for (let y = ground + 1; y <= ground + 3; y += 1) world.set(blockKey(x, y, z), "bark");
      for (let ox = -1; ox <= 1; ox += 1) for (let oz = -1; oz <= 1; oz += 1) for (let oy = 3; oy <= 4; oy += 1) {
        if (Math.abs(ox) + Math.abs(oz) + (oy === 4 ? 1 : 0) <= 3) world.set(blockKey(x + ox, ground + oy, z + oz), "leaves");
      }
    }
  }
  return world;
}

function isTouchDevice() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

export default function ShardsteadGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef<BlockType>("grass");
  const pausedRef = useRef(true);
  const qualityRef = useRef<Quality>("balanced");
  const renderDistanceRef = useRef(62);
  const actionsRef = useRef<GameActions>({ mine: () => undefined, place: () => undefined, jump: () => undefined, camera: () => undefined, look: () => undefined });
  const applyGraphicsRef = useRef<() => void>(() => undefined);
  const moveInputRef = useRef({ x: 0, y: 0 });
  const dayRef = useRef<HTMLSpanElement>(null);

  const [intro, setIntro] = useState(true);
  const [paused, setPaused] = useState(true);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<BlockType>("grass");
  const [cameraMode, setCameraMode] = useState<CameraMode>("first");
  const [quality, setQuality] = useState<Quality>("balanced");
  const [renderDistance, setRenderDistance] = useState(62);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shards, setShards] = useState(0);
  const [message, setMessage] = useState("Find the glowing World Core");
  const [mobile] = useState(() => isTouchDevice());

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { qualityRef.current = quality; applyGraphicsRef.current(); }, [quality]);
  useEffect(() => { renderDistanceRef.current = renderDistance; applyGraphicsRef.current(); }, [renderDistance]);

  const begin = useCallback(() => {
    setIntro(false); setPaused(false);
    if (!isTouchDevice()) canvasRef.current?.requestPointerLock?.();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const canvas = document.createElement("canvas");
    canvas.className = "game-canvas";
    canvas.setAttribute("aria-label", "Shardstead 3D world");
    mount.appendChild(canvas); canvasRef.current = canvas;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x8ab5b0);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ab5b0);
    scene.fog = new THREE.FogExp2(0x8ab5b0, 0.018);
    const camera = new THREE.PerspectiveCamera(68, 1, 0.08, 180);
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster(); raycaster.far = 6;

    const hemi = new THREE.HemisphereLight(0xc8f5e7, 0x33402e, 2.15); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1c6, 2.35);
    sun.position.set(22, 31, 14); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -30; sun.shadow.camera.right = 30; sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30; scene.add(sun);

    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (name: string) => {
      const texture = textureLoader.load(texturePath(name));
      texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return texture;
    };
    const textures = {
      grassTop: loadTexture("grass-top"), grassSide: loadTexture("grass-side"), soil: loadTexture("soil"), stone: loadTexture("stone"),
      sand: loadTexture("sand"), bark: loadTexture("bark"), wood: loadTexture("wood-rings"), leaves: loadTexture("leaves"),
      crystal: loadTexture("rift-crystal"), metal: loadTexture("core-metal"), rune: loadTexture("rune-stone"), water: loadTexture("water"),
      snow: loadTexture("snow"), copper: loadTexture("copper-ore"), dark: loadTexture("dark-rock"), core: loadTexture("luminous-core"),
    };
    const material = (map: THREE.Texture, options: Partial<THREE.MeshLambertMaterialParameters> = {}) => new THREE.MeshLambertMaterial({ map, ...options });
    const grassSide = material(textures.grassSide); const soil = material(textures.soil);
    const blockMaterials: Record<BlockType, THREE.Material | THREE.Material[]> = {
      grass: [grassSide, grassSide, material(textures.grassTop), soil, grassSide, grassSide], soil,
      stone: material(textures.stone), sand: material(textures.sand),
      bark: [material(textures.bark), material(textures.bark), material(textures.wood), material(textures.wood), material(textures.bark), material(textures.bark)],
      wood: material(textures.wood), leaves: material(textures.leaves),
      crystal: material(textures.crystal, { emissive: new THREE.Color(0x4c1b78), emissiveMap: textures.crystal, emissiveIntensity: 0.42 }),
      metal: material(textures.metal), rune: material(textures.rune, { emissive: new THREE.Color(0x075a66), emissiveMap: textures.rune, emissiveIntensity: 0.26 }),
      snow: material(textures.snow), copper: material(textures.copper),
      dark: material(textures.dark, { emissive: new THREE.Color(0x401407), emissiveMap: textures.dark, emissiveIntensity: 0.18 }),
      core: material(textures.core, { emissive: new THREE.Color(0x9b4c08), emissiveMap: textures.core, emissiveIntensity: 0.78 }),
    };

    let world = generateWorld(); let restoredPosition: [number, number, number] | null = null; let restoredYaw = 0; let restoredShards = 0;
    try {
      const rawSave = window.localStorage.getItem(SAVE_KEY);
      if (rawSave) {
        const save = JSON.parse(rawSave) as { world?: [string, BlockType][]; position?: [number, number, number]; yaw?: number; shards?: number };
        if (Array.isArray(save.world) && save.world.length > 500) world = new Map(save.world);
        if (Array.isArray(save.position) && save.position.length === 3) restoredPosition = save.position;
        if (typeof save.yaw === "number") restoredYaw = save.yaw;
        if (typeof save.shards === "number") restoredShards = save.shards;
      }
    } catch { window.localStorage.removeItem(SAVE_KEY); }
    setShards(restoredShards);

    const worldGroup = new THREE.Group(); scene.add(worldGroup);
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); const matrix = new THREE.Matrix4(); const worldMeshes: THREE.InstancedMesh[] = [];
    const rebuildMeshes = () => {
      for (const mesh of worldMeshes) worldGroup.remove(mesh);
      worldMeshes.length = 0; const groups = new Map<BlockType, BlockCoord[]>();
      for (const [key, type] of world.entries()) { const [x, y, z] = key.split("|").map(Number); const list = groups.get(type) ?? []; list.push({ x, y, z, type }); groups.set(type, list); }
      for (const [type, blocks] of groups.entries()) {
        const mesh = new THREE.InstancedMesh(cubeGeometry, blockMaterials[type], blocks.length);
        mesh.userData.blocks = blocks; mesh.castShadow = type !== "leaves"; mesh.receiveShadow = true;
        blocks.forEach((block, index) => { matrix.makeTranslation(block.x, block.y, block.z); mesh.setMatrixAt(index, matrix); });
        mesh.instanceMatrix.needsUpdate = true; worldGroup.add(mesh); worldMeshes.push(mesh);
      }
    };
    rebuildMeshes();

    const waterMaterial = new THREE.MeshPhongMaterial({ map: textures.water, color: 0x67b9c8, transparent: true, opacity: 0.76, shininess: 92, side: THREE.DoubleSide });
    textures.water.repeat.set(12, 12);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_RADIUS * 2 + 5, WORLD_RADIUS * 2 + 5), waterMaterial);
    water.rotation.x = -Math.PI / 2; water.position.y = 1.42; water.receiveShadow = true; scene.add(water);
    const coreLight = new THREE.PointLight(0x48e5c2, 12, 16, 2); coreLight.position.set(0, 6.5, 0); scene.add(coreLight);

    const player = { position: new THREE.Vector3(...(restoredPosition ?? [0, 5.1, 9])), velocity: new THREE.Vector3(), yaw: restoredYaw, pitch: -0.08, onGround: false, mode: "first" as CameraMode };
    const keys = new Set<string>(); const forward = new THREE.Vector3(); const right = new THREE.Vector3(); const movement = new THREE.Vector3();
    const highestSolid = (x: number, z: number) => {
      const bx = Math.round(x); const bz = Math.round(z);
      for (let y = 20; y >= -1; y -= 1) { const type = world.get(blockKey(bx, y, bz)); if (type && type !== "leaves") return y + 0.5; }
      return -0.5;
    };
    const saveWorld = () => {
      try { window.localStorage.setItem(SAVE_KEY, JSON.stringify({ world: Array.from(world.entries()), position: player.position.toArray(), yaw: player.yaw, shards: restoredShards })); }
      catch { setMessage("Local save is full — keep exploring for now"); }
    };
    const updateCameraMode = () => {
      player.mode = player.mode === "first" ? "third" : player.mode === "third" ? "front" : "first";
      setCameraMode(player.mode); setMessage(CAMERA_LABELS[player.mode]);
    };
    const jump = () => { if (player.onGround && !pausedRef.current) { player.velocity.y = 7.4; player.onGround = false; } };
    const look = (dx: number, dy: number) => {
      if (pausedRef.current) return;
      player.yaw -= dx * 0.0022; player.pitch -= dy * 0.002;
      player.pitch = THREE.MathUtils.clamp(player.pitch, -1.42, 1.42);
    };
    const interact = (placing: boolean) => {
      if (pausedRef.current) return;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const hit = raycaster.intersectObjects(worldMeshes, false)[0];
      if (!hit || hit.instanceId === undefined || hit.instanceId === null) { setMessage("Nothing in reach"); return; }
      const block = (hit.object.userData.blocks as BlockCoord[])[hit.instanceId]; if (!block) return;
      if (!placing) {
        if (block.type === "core") { setMessage("The World Core cannot be mined"); return; }
        world.delete(blockKey(block.x, block.y, block.z));
        if (block.type === "crystal") { restoredShards += 1; setShards(restoredShards); setMessage("Rift shard recovered"); }
        else setMessage(`${BLOCK_LABELS[block.type]} collected`);
      } else {
        const normal = hit.face?.normal ?? new THREE.Vector3(0, 1, 0);
        const x = block.x + Math.round(normal.x); const y = block.y + Math.round(normal.y); const z = block.z + Math.round(normal.z);
        if (new THREE.Vector3(x, y, z).distanceTo(player.position) < 1.35) { setMessage("Step back before placing"); return; }
        world.set(blockKey(x, y, z), selectedRef.current); setMessage(`${BLOCK_LABELS[selectedRef.current]} placed`);
      }
      rebuildMeshes(); saveWorld();
    };
    actionsRef.current = { mine: () => interact(false), place: () => interact(true), jump, camera: updateCameraMode, look };
    applyGraphicsRef.current = () => {
      const preset = qualityRef.current; const maxRatio = preset === "low" ? 1 : preset === "balanced" ? 1.45 : 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxRatio)); renderer.shadowMap.enabled = preset !== "low"; sun.castShadow = preset !== "low";
      if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 1 / Math.max(28, renderDistanceRef.current * 1.08);
    };
    applyGraphicsRef.current();

    const resize = () => { const width = mount.clientWidth; const height = mount.clientHeight; renderer.setSize(width, height, false); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft"].includes(event.code)) keys.add(event.code);
      if (event.code === "Space") { event.preventDefault(); jump(); }
      if (event.code === "KeyF" || event.code === "F5") { event.preventDefault(); updateCameraMode(); }
      if (event.code.startsWith("Digit")) { const slot = Number(event.code.slice(5)) - 1; if (HOTBAR[slot]) setSelected(HOTBAR[slot].type); }
      if (event.code === "Escape") { setPaused(true); setSettingsOpen(false); }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code);
    const onMouseMove = (event: MouseEvent) => { if (document.pointerLockElement === canvas) look(event.movementX, event.movementY); };
    const onMouseDown = (event: MouseEvent) => {
      if (isTouchDevice()) return;
      if (document.pointerLockElement !== canvas) { canvas.requestPointerLock?.(); setPaused(false); return; }
      if (event.button === 0) interact(false); if (event.button === 2) interact(true);
    };
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onPointerLockChange = () => { const isLocked = document.pointerLockElement === canvas; setLocked(isLocked); if (!isLocked && !isTouchDevice()) setPaused(true); };
    const onVisibility = () => { if (document.hidden) saveWorld(); };
    window.addEventListener("resize", resize); window.addEventListener("keydown", onKeyDown); window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove); document.addEventListener("pointerlockchange", onPointerLockChange); document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("mousedown", onMouseDown); canvas.addEventListener("contextmenu", onContextMenu); resize();

    let frame = 0; let autosaveTimer = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate); const dt = Math.min(0.05, clock.getDelta()); const elapsed = clock.elapsedTime;
      if (!pausedRef.current) {
        const touch = moveInputRef.current;
        const forwardAmount = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0) - touch.y;
        const sideAmount = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + touch.x;
        forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)); right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
        movement.copy(forward).multiplyScalar(forwardAmount).addScaledVector(right, sideAmount); if (movement.lengthSq() > 1) movement.normalize();
        player.position.addScaledVector(movement, (keys.has("ShiftLeft") ? 7.2 : 4.6) * dt);
        player.position.x = THREE.MathUtils.clamp(player.position.x, -WORLD_RADIUS + 1, WORLD_RADIUS - 1);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -WORLD_RADIUS + 1, WORLD_RADIUS - 1);
        player.velocity.y -= 18.5 * dt; player.position.y += player.velocity.y * dt;
        const floor = highestSolid(player.position.x, player.position.z) + 1.25;
        if (player.position.y <= floor) { player.position.y = floor; player.velocity.y = 0; player.onGround = true; }
      }
      const lookDirection = new THREE.Vector3(-Math.sin(player.yaw) * Math.cos(player.pitch), Math.sin(player.pitch), -Math.cos(player.yaw) * Math.cos(player.pitch));
      const eye = player.position.clone().add(new THREE.Vector3(0, 0.48, 0));
      if (player.mode === "first") { camera.position.copy(eye); camera.lookAt(eye.clone().add(lookDirection)); }
      else {
        const offset = lookDirection.clone().multiplyScalar((player.mode === "third" ? -1 : 1) * 5.4); offset.y = player.mode === "third" ? 2.15 : 1.2;
        camera.position.lerp(eye.clone().add(offset), 0.18); camera.lookAt(eye.clone().addScaledVector(lookDirection, player.mode === "front" ? 1.4 : 4));
      }
      const dayCycle = (elapsed / 190) % 1; const sunAngle = dayCycle * Math.PI * 2;
      sun.position.set(Math.cos(sunAngle) * 28, 18 + Math.sin(sunAngle) * 17, 15);
      const daylight = THREE.MathUtils.clamp((sun.position.y + 4) / 28, 0.28, 1);
      sun.intensity = 2.35 * daylight; hemi.intensity = 1.2 + daylight; coreLight.intensity = 10 + Math.sin(elapsed * 2.1) * 2.4; water.position.y = 1.42 + Math.sin(elapsed * 0.55) * 0.025;
      if (dayRef.current) { const minutes = Math.floor(dayCycle * 1440); dayRef.current.textContent = `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`; }
      autosaveTimer += dt; if (autosaveTimer > 20) { saveWorld(); autosaveTimer = 0; }
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      window.cancelAnimationFrame(frame); saveWorld(); window.removeEventListener("resize", resize); window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("pointerlockchange", onPointerLockChange); document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("mousedown", onMouseDown); canvas.removeEventListener("contextmenu", onContextMenu); renderer.dispose(); cubeGeometry.dispose();
      Object.values(textures).forEach((texture) => texture.dispose()); mount.removeChild(canvas); canvasRef.current = null;
    };
  }, []);

  const handleLookStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.lastX = String(event.clientX); event.currentTarget.dataset.lastY = String(event.clientY);
  };
  const handleLookMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const lastX = Number(event.currentTarget.dataset.lastX ?? event.clientX); const lastY = Number(event.currentTarget.dataset.lastY ?? event.clientY);
    actionsRef.current.look((event.clientX - lastX) * 1.7, (event.clientY - lastY) * 1.7);
    event.currentTarget.dataset.lastX = String(event.clientX); event.currentTarget.dataset.lastY = String(event.clientY);
  };
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pad = event.currentTarget; if (event.type === "pointerdown") pad.setPointerCapture(event.pointerId);
    if (event.type === "pointerup" || event.type === "pointercancel") { moveInputRef.current = { x: 0, y: 0 }; pad.style.setProperty("--stick-x", "0px"); pad.style.setProperty("--stick-y", "0px"); return; }
    if (!pad.hasPointerCapture(event.pointerId)) return;
    const rect = pad.getBoundingClientRect(); const x = THREE.MathUtils.clamp((event.clientX - (rect.left + rect.width / 2)) / 42, -1, 1); const y = THREE.MathUtils.clamp((event.clientY - (rect.top + rect.height / 2)) / 42, -1, 1);
    moveInputRef.current = { x, y }; pad.style.setProperty("--stick-x", `${x * 32}px`); pad.style.setProperty("--stick-y", `${y * 32}px`);
  };
  const resume = () => { setPaused(false); setSettingsOpen(false); if (!mobile) canvasRef.current?.requestPointerLock?.(); };
  const resetWorld = () => { window.localStorage.removeItem(SAVE_KEY); window.location.reload(); };

  return (
    <main className="game-shell">
      <div ref={mountRef} className="game-stage" /><div className="sky-vignette" aria-hidden="true" /><div className="grain" aria-hidden="true" />
      <header className="top-hud">
        <div className="brand-lockup" aria-label="Shardstead"><span className="brand-rune">S</span><span><strong>SHARDSTEAD</strong><small>FIRST LIGHT · BUILD 001</small></span></div>
        <div className="world-readout"><span className="signal-dot" /><span>FRONTIER SEED 01</span><span className="divider" /><span ref={dayRef}>06:00</span></div>
        <button className="hud-button" type="button" onClick={() => { setPaused(true); setSettingsOpen(true); if (document.pointerLockElement) document.exitPointerLock(); }} aria-label="Open settings">SETTINGS</button>
      </header>
      <aside className="objective-card"><span className="eyebrow">FIRST AWAKENING</span><strong>Stabilize the World Core</strong><p>{message}</p><div className="objective-progress"><span style={{ width: `${Math.min(100, 28 + shards * 12)}%` }} /></div><small>{shards} / 6 rift shards recovered</small></aside>
      <div className="camera-chip">{CAMERA_LABELS[cameraMode]} · {mobile ? "CAM" : "F5"}</div><div className="crosshair" aria-hidden="true"><i /><i /></div>
      <nav className="hotbar" aria-label="Building materials">
        {HOTBAR.map((item, index) => <button type="button" key={item.type} className={selected === item.type ? "selected" : ""} onClick={() => setSelected(item.type)} aria-label={`Select ${BLOCK_LABELS[item.type]}`} aria-pressed={selected === item.type}><span className="slot-number">{index + 1}</span><span className="block-swatch" style={{ "--swatch": item.swatch } as React.CSSProperties} /><span className="slot-label">{BLOCK_LABELS[item.type]}</span></button>)}
      </nav>
      <div className="desktop-help"><span>WASD MOVE</span><span>SPACE JUMP</span><span>LEFT MINE</span><span>RIGHT BUILD</span><span>F5 CAMERA</span></div>
      <div className="mobile-controls" aria-label="Touch controls">
        <div className="move-pad" onPointerDown={handleMove} onPointerMove={handleMove} onPointerUp={handleMove} onPointerCancel={handleMove} aria-label="Move joystick"><span /></div>
        <div className="look-zone" onPointerDown={handleLookStart} onPointerMove={handleLookMove} aria-label="Drag to look" />
        <div className="action-cluster"><button type="button" onPointerDown={() => actionsRef.current.mine()} aria-label="Mine block">MINE</button><button type="button" onPointerDown={() => actionsRef.current.place()} aria-label="Place block">BUILD</button><button type="button" onPointerDown={() => actionsRef.current.jump()} aria-label="Jump">JUMP</button><button type="button" onPointerDown={() => actionsRef.current.camera()} aria-label="Change camera">CAM</button></div>
      </div>
      {intro && <section className="entry-screen" aria-labelledby="game-title"><div className="entry-panel"><div className="core-mark" aria-hidden="true"><span /></div><p className="eyebrow">AN OPEN-WORLD BUILDING ADVENTURE</p><h1 id="game-title">SHARDSTEAD</h1><p className="tagline">Wake the world. Shape what remains.</p><p className="entry-copy">Explore a fractured frontier, recover rift shards, and build a home around an ancient living core. Your world saves on this device.</p><button type="button" className="primary-button" onClick={begin}>ENTER THE FRONTIER</button><span className="input-note">{mobile ? "Touch controls enabled" : "Keyboard + mouse · Click to capture cursor"}</span></div><div className="version-stamp">ORIGINAL PROTOTYPE · AUGUST 2026</div></section>}
      {!intro && paused && <section className="pause-screen" aria-label={settingsOpen ? "Settings" : "Game paused"}><div className="pause-panel">{settingsOpen ? <><p className="eyebrow">DISPLAY & PERFORMANCE</p><h2>Render settings</h2><div className="setting-group"><label>Graphics preset</label><div className="segmented">{(["low", "balanced", "high"] as Quality[]).map((preset) => <button type="button" key={preset} className={quality === preset ? "active" : ""} onClick={() => setQuality(preset)}>{preset}</button>)}</div></div><div className="setting-group"><label htmlFor="render-distance">View distance <strong>{renderDistance}m</strong></label><input id="render-distance" type="range" min="34" max="96" step="2" value={renderDistance} onChange={(event) => setRenderDistance(Number(event.target.value))} /></div><p className="setting-help">Low disables dynamic shadows. High uses sharper rendering on powerful devices.</p><div className="pause-actions"><button type="button" className="primary-button" onClick={resume}>APPLY & RETURN</button><button type="button" className="danger-button" onClick={resetWorld}>RESET WORLD</button></div></> : <><p className="eyebrow">FRONTIER PAUSED</p><h2>Return to Shardstead</h2><p>Your world is saved locally as you build.</p><button type="button" className="primary-button" onClick={resume}>RESUME</button><button type="button" className="text-button" onClick={() => setSettingsOpen(true)}>RENDER SETTINGS</button></>}</div></section>}
      {!mobile && !intro && !paused && !locked && <button type="button" className="capture-prompt" onClick={resume}>CLICK TO CONTROL</button>}
    </main>
  );
}

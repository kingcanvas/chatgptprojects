"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createMossback, createPlayerRig, type Mossback } from "@/game/entities";
import {
  blockKey,
  CHUNK_SIZE,
  chunkKey,
  generateChunk,
  hash2,
  SEA_LEVEL,
  terrainHeight,
  type BlockCoord,
  type BlockType,
} from "@/game/world";

type CameraMode = "first" | "third" | "front";
type Quality = "low" | "balanced" | "high";
type GameActions = {
  mine: () => void;
  place: () => void;
  jump: () => void;
  camera: () => void;
  look: (dx: number, dy: number) => void;
};

const SAVE_KEY = "shardstead:streaming-world:v2";
const texturePath = (name: string) => `/textures/${name}.png`;
const CAMERA_LABELS: Record<CameraMode, string> = {
  first: "First person",
  third: "Third person",
  front: "Front view",
};
const BLOCK_LABELS: Record<BlockType, string> = {
  grass: "Meadow",
  soil: "Rich soil",
  stone: "Stone",
  sand: "Sun sand",
  bark: "Bark",
  wood: "Timber",
  leaves: "Leaves",
  crystal: "Rift crystal",
  metal: "Core metal",
  rune: "Rune stone",
  snow: "Snow",
  copper: "Copper ore",
  dark: "Rift rock",
  core: "World Core",
};
const HOTBAR: { type: BlockType; texture: string }[] = [
  { type: "grass", texture: "/textures/grass-top.png" },
  { type: "stone", texture: "/textures/stone.png" },
  { type: "wood", texture: "/textures/wood-rings.png" },
  { type: "crystal", texture: "/textures/rift-crystal.png" },
  { type: "metal", texture: "/textures/core-metal.png" },
];

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
  const applyGraphicsRef = useRef<() => void>(() => undefined);
  const moveInputRef = useRef({ x: 0, y: 0 });
  const dayRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const actionsRef = useRef<GameActions>({
    mine: () => undefined,
    place: () => undefined,
    jump: () => undefined,
    camera: () => undefined,
    look: () => undefined,
  });

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
    setIntro(false);
    setPaused(false);
    if (!isTouchDevice()) canvasRef.current?.requestPointerLock?.();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const canvas = document.createElement("canvas");
    canvas.className = "game-canvas";
    canvas.setAttribute("aria-label", "Shardstead infinite 3D world");
    mount.appendChild(canvas);
    canvasRef.current = canvas;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ab5b0);
    scene.fog = new THREE.FogExp2(0x8ab5b0, 0.017);
    const camera = new THREE.PerspectiveCamera(68, 1, 0.08, 190);
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    raycaster.far = 6;

    const hemi = new THREE.HemisphereLight(0xc8f5e7, 0x33402e, 2.15);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1c6, 2.35);
    sun.position.set(22, 31, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -34;
    sun.shadow.camera.right = 34;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -34;
    scene.add(sun, sun.target);

    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (name: string) => {
      const texture = textureLoader.load(texturePath(name));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return texture;
    };
    const textures = {
      grassTop: loadTexture("grass-top"), grassSide: loadTexture("grass-side"), soil: loadTexture("soil"), stone: loadTexture("stone"),
      sand: loadTexture("sand"), bark: loadTexture("bark"), wood: loadTexture("wood-rings"), leaves: loadTexture("leaves"),
      crystal: loadTexture("rift-crystal"), metal: loadTexture("core-metal"), rune: loadTexture("rune-stone"), water: loadTexture("water"),
      snow: loadTexture("snow"), copper: loadTexture("copper-ore"), dark: loadTexture("dark-rock"), core: loadTexture("luminous-core"),
    };
    const makeMaterial = (map: THREE.Texture, options: Partial<THREE.MeshLambertMaterialParameters> = {}) =>
      new THREE.MeshLambertMaterial({ map, ...options });
    const grassSide = makeMaterial(textures.grassSide);
    const soilMaterial = makeMaterial(textures.soil);
    const blockMaterials: Record<BlockType, THREE.Material | THREE.Material[]> = {
      grass: [grassSide, grassSide, makeMaterial(textures.grassTop), soilMaterial, grassSide, grassSide],
      soil: soilMaterial,
      stone: makeMaterial(textures.stone),
      sand: makeMaterial(textures.sand),
      bark: [makeMaterial(textures.bark), makeMaterial(textures.bark), makeMaterial(textures.wood), makeMaterial(textures.wood), makeMaterial(textures.bark), makeMaterial(textures.bark)],
      wood: makeMaterial(textures.wood),
      leaves: makeMaterial(textures.leaves),
      crystal: makeMaterial(textures.crystal, { emissive: new THREE.Color(0x4c1b78), emissiveMap: textures.crystal, emissiveIntensity: 0.42 }),
      metal: makeMaterial(textures.metal),
      rune: makeMaterial(textures.rune, { emissive: new THREE.Color(0x075a66), emissiveMap: textures.rune, emissiveIntensity: 0.26 }),
      snow: makeMaterial(textures.snow),
      copper: makeMaterial(textures.copper),
      dark: makeMaterial(textures.dark, { emissive: new THREE.Color(0x401407), emissiveMap: textures.dark, emissiveIntensity: 0.18 }),
      core: makeMaterial(textures.core, { emissive: new THREE.Color(0x9b4c08), emissiveMap: textures.core, emissiveIntensity: 0.78 }),
    };

    const edits = new Map<string, BlockType | null>();
    let restoredPosition: [number, number, number] | null = null;
    let restoredYaw = 0;
    let restoredShards = 0;
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (raw) {
        const save = JSON.parse(raw) as {
          edits?: [string, BlockType | null][];
          position?: [number, number, number];
          yaw?: number;
          shards?: number;
        };
        if (Array.isArray(save.edits)) for (const [key, value] of save.edits) edits.set(key, value);
        if (Array.isArray(save.position) && save.position.length === 3) restoredPosition = save.position;
        if (typeof save.yaw === "number") restoredYaw = save.yaw;
        if (typeof save.shards === "number") restoredShards = save.shards;
      }
    } catch {
      window.localStorage.removeItem(SAVE_KEY);
    }
    setShards(restoredShards);

    const player = {
      position: new THREE.Vector3(...(restoredPosition ?? [0, terrainHeight(0, 9) + 0.52, 9])),
      velocity: new THREE.Vector3(),
      yaw: restoredYaw,
      pitch: -0.08,
      onGround: false,
      mode: "first" as CameraMode,
    };
    const playerRig = createPlayerRig(textureLoader, renderer);
    scene.add(playerRig.root);

    const world = new Map<string, BlockType>();
    const loadedChunks = new Map<string, string[]>();
    const worldGroup = new THREE.Group();
    const creatureGroup = new THREE.Group();
    const creatures = new Map<string, Mossback>();
    scene.add(worldGroup, creatureGroup);
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const matrix = new THREE.Matrix4();
    const worldMeshes: THREE.InstancedMesh[] = [];

    const rebuildMeshes = () => {
      for (const mesh of worldMeshes) worldGroup.remove(mesh);
      worldMeshes.length = 0;
      const groups = new Map<BlockType, BlockCoord[]>();
      for (const [key, type] of world.entries()) {
        const [x, y, z] = key.split("|").map(Number);
        const list = groups.get(type) ?? [];
        list.push({ x, y, z, type });
        groups.set(type, list);
      }
      for (const [type, blocks] of groups.entries()) {
        const mesh = new THREE.InstancedMesh(cubeGeometry, blockMaterials[type], blocks.length);
        mesh.userData.blocks = blocks;
        mesh.castShadow = type !== "leaves";
        mesh.receiveShadow = true;
        blocks.forEach((block, index) => {
          matrix.makeTranslation(block.x, block.y, block.z);
          mesh.setMatrixAt(index, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        worldGroup.add(mesh);
        worldMeshes.push(mesh);
      }
    };

    const spawnCreatureForChunk = (cx: number, cz: number) => {
      const key = chunkKey(cx, cz);
      if (creatures.has(key) || Math.abs(cx) + Math.abs(cz) < 2 || hash2(cx * 41 + 5, cz * 37 - 2) < 0.53) return;
      const x = cx * CHUNK_SIZE + 2 + Math.floor(hash2(cx + 7, cz - 8) * 6);
      const z = cz * CHUNK_SIZE + 2 + Math.floor(hash2(cx - 5, cz + 4) * 6);
      if (terrainHeight(x, z) <= SEA_LEVEL) return;
      const creature = createMossback(`mossback-${key}`, key, textureLoader, renderer, x, terrainHeight(x, z) + 0.52, z);
      creature.heading = hash2(cx, cz) * Math.PI * 2;
      creatures.set(key, creature);
      creatureGroup.add(creature.root);
    };

    const streamWorld = (force = false) => {
      const centerX = Math.floor(player.position.x / CHUNK_SIZE);
      const centerZ = Math.floor(player.position.z / CHUNK_SIZE);
      const radius = isTouchDevice() ? 1 : Math.max(1, Math.min(3, Math.ceil(renderDistanceRef.current / 38)));
      const wanted = new Set<string>();
      let changed = false;
      for (let cx = centerX - radius; cx <= centerX + radius; cx += 1) {
        for (let cz = centerZ - radius; cz <= centerZ + radius; cz += 1) {
          const key = chunkKey(cx, cz);
          wanted.add(key);
          if (!loadedChunks.has(key)) {
            loadedChunks.set(key, generateChunk(cx, cz, world, edits));
            spawnCreatureForChunk(cx, cz);
            changed = true;
          }
        }
      }
      for (const [key, keys] of loadedChunks.entries()) {
        const [cx, cz] = key.split(",").map(Number);
        if (Math.abs(cx - centerX) <= radius + 1 && Math.abs(cz - centerZ) <= radius + 1) continue;
        for (const worldKey of keys) world.delete(worldKey);
        loadedChunks.delete(key);
        const creature = creatures.get(key);
        if (creature) {
          creatureGroup.remove(creature.root);
          creatures.delete(key);
        }
        changed = true;
      }
      if (changed || force) rebuildMeshes();
    };
    streamWorld(true);

    textures.water.repeat.set(24, 24);
    const waterMaterial = new THREE.MeshPhongMaterial({
      map: textures.water,
      color: 0x67b9c8,
      transparent: true,
      opacity: 0.74,
      shininess: 92,
      side: THREE.DoubleSide,
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = SEA_LEVEL + 0.42;
    water.receiveShadow = true;
    scene.add(water);
    const coreLight = new THREE.PointLight(0x48e5c2, 12, 17, 2);
    coreLight.position.set(0, 7.3, 0);
    scene.add(coreLight);

    const keys = new Set<string>();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const movement = new THREE.Vector3();
    const PLAYER_RADIUS = 0.31;
    const PLAYER_HEIGHT = 1.82;
    let swingUntil = 0;

    const isSolid = (type: BlockType | undefined) => Boolean(type);
    const collidesAt = (position: THREE.Vector3) => {
      const minX = Math.floor(position.x - PLAYER_RADIUS + 0.5);
      const maxX = Math.floor(position.x + PLAYER_RADIUS + 0.5);
      const minZ = Math.floor(position.z - PLAYER_RADIUS + 0.5);
      const maxZ = Math.floor(position.z + PLAYER_RADIUS + 0.5);
      const minY = Math.floor(position.y + 0.05 + 0.5);
      const maxY = Math.floor(position.y + PLAYER_HEIGHT - 0.05 + 0.5);
      for (let x = minX; x <= maxX; x += 1) for (let z = minZ; z <= maxZ; z += 1) for (let y = minY; y <= maxY; y += 1) {
        if (!isSolid(world.get(blockKey(x, y, z)))) continue;
        if (
          position.x + PLAYER_RADIUS > x - 0.5 && position.x - PLAYER_RADIUS < x + 0.5 &&
          position.z + PLAYER_RADIUS > z - 0.5 && position.z - PLAYER_RADIUS < z + 0.5 &&
          position.y + PLAYER_HEIGHT > y - 0.5 && position.y < y + 0.5
        ) return true;
      }
      return false;
    };

    const floorBelow = (position: THREE.Vector3) => {
      let best = -Infinity;
      const minX = Math.floor(position.x - PLAYER_RADIUS + 0.5);
      const maxX = Math.floor(position.x + PLAYER_RADIUS + 0.5);
      const minZ = Math.floor(position.z - PLAYER_RADIUS + 0.5);
      const maxZ = Math.floor(position.z + PLAYER_RADIUS + 0.5);
      const startY = Math.floor(position.y + 0.65);
      for (let x = minX; x <= maxX; x += 1) for (let z = minZ; z <= maxZ; z += 1) {
        for (let y = startY; y >= startY - 28; y -= 1) {
          if (!isSolid(world.get(blockKey(x, y, z)))) continue;
          const top = y + 0.5;
          if (top <= position.y + 0.18 && top > best) best = top;
          break;
        }
      }
      return best;
    };

    const saveWorld = () => {
      try {
        window.localStorage.setItem(SAVE_KEY, JSON.stringify({
          edits: Array.from(edits.entries()),
          position: player.position.toArray(),
          yaw: player.yaw,
          shards: restoredShards,
        }));
      } catch {
        setMessage("Local save is full — keep exploring for now");
      }
    };

    const updateCameraMode = () => {
      player.mode = player.mode === "first" ? "third" : player.mode === "third" ? "front" : "first";
      setCameraMode(player.mode);
      setMessage(`${CAMERA_LABELS[player.mode]} — explorer visible`);
    };
    const jump = () => {
      if (player.onGround && !pausedRef.current) {
        player.velocity.y = 7.1;
        player.onGround = false;
      }
    };
    const look = (dx: number, dy: number) => {
      if (pausedRef.current) return;
      player.yaw -= dx * 0.0022;
      player.pitch = THREE.MathUtils.clamp(player.pitch - dy * 0.002, -1.38, 1.38);
    };
    const removeCreature = (id: string) => {
      for (const [key, creature] of creatures.entries()) {
        if (creature.id !== id) continue;
        creature.health -= 1;
        swingUntil = clock.elapsedTime + 0.22;
        if (creature.health <= 0) {
          creatureGroup.remove(creature.root);
          creatures.delete(key);
          restoredShards += 1;
          setShards(restoredShards);
          setMessage("Mossback released a wild shard");
        } else {
          creature.heading += Math.PI;
          setMessage(`Mossback startled — it has ${creature.health} strength left`);
        }
        return true;
      }
      return false;
    };

    const interact = (placing: boolean) => {
      if (pausedRef.current) return;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      if (!placing) {
        const creatureHit = raycaster.intersectObject(creatureGroup, true)[0];
        if (creatureHit && creatureHit.distance <= 4.8) {
          const id = creatureHit.object.userData.creatureId as string | undefined;
          if (id && removeCreature(id)) return;
        }
      }
      const hit = raycaster.intersectObjects(worldMeshes, false)[0];
      if (!hit || hit.instanceId === undefined || hit.instanceId === null) {
        setMessage("Nothing in reach");
        return;
      }
      const block = (hit.object.userData.blocks as BlockCoord[])[hit.instanceId];
      if (!block) return;
      if (!placing) {
        if (block.type === "core") {
          setMessage("The World Core cannot be mined");
          return;
        }
        const key = blockKey(block.x, block.y, block.z);
        world.delete(key);
        edits.set(key, null);
        swingUntil = clock.elapsedTime + 0.22;
        if (block.type === "crystal") {
          restoredShards += 1;
          setShards(restoredShards);
          setMessage("Rift shard recovered");
        } else setMessage(`${BLOCK_LABELS[block.type]} collected`);
      } else {
        const normal = hit.face?.normal ?? new THREE.Vector3(0, 1, 0);
        const x = block.x + Math.round(normal.x);
        const y = block.y + Math.round(normal.y);
        const z = block.z + Math.round(normal.z);
        const key = blockKey(x, y, z);
        const previous = world.get(key);
        world.set(key, selectedRef.current);
        if (collidesAt(player.position)) {
          if (previous) world.set(key, previous); else world.delete(key);
          setMessage("You cannot place a block inside yourself");
          return;
        }
        edits.set(key, selectedRef.current);
        const ownerChunk = chunkKey(Math.floor(x / CHUNK_SIZE), Math.floor(z / CHUNK_SIZE));
        const chunkKeys = loadedChunks.get(ownerChunk);
        if (chunkKeys && !chunkKeys.includes(key)) chunkKeys.push(key);
        setMessage(`${BLOCK_LABELS[selectedRef.current]} placed`);
      }
      rebuildMeshes();
      saveWorld();
    };
    actionsRef.current = { mine: () => interact(false), place: () => interact(true), jump, camera: updateCameraMode, look };

    applyGraphicsRef.current = () => {
      const preset = qualityRef.current;
      const maxRatio = preset === "low" ? 0.9 : preset === "balanced" ? 1.35 : 1.9;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxRatio));
      renderer.shadowMap.enabled = preset !== "low";
      sun.castShadow = preset !== "low";
      if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 1 / Math.max(34, renderDistanceRef.current * 1.22);
    };
    applyGraphicsRef.current();

    let resizeFrame = 0;
    let orientationTimer = 0;
    const applySize = () => {
      resizeFrame = 0;
      const viewport = window.visualViewport;
      const width = Math.max(1, Math.round(viewport?.width ?? window.innerWidth));
      const height = Math.max(1, Math.round(viewport?.height ?? window.innerHeight));
      document.documentElement.style.setProperty("--game-width", `${width}px`);
      document.documentElement.style.setProperty("--game-height", `${height}px`);
      mount.style.width = `${width}px`;
      mount.style.height = `${height}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resize = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(applySize);
    };
    const orientationChange = () => {
      resize();
      window.clearTimeout(orientationTimer);
      orientationTimer = window.setTimeout(resize, 220);
    };
    const preventTouchPageMove = (event: TouchEvent) => event.preventDefault();
    const onKeyDown = (event: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft"].includes(event.code)) keys.add(event.code);
      if (event.code === "Space") { event.preventDefault(); jump(); }
      if (event.code === "KeyF" || event.code === "F5") { event.preventDefault(); updateCameraMode(); }
      if (event.code.startsWith("Digit")) {
        const slot = Number(event.code.slice(5)) - 1;
        if (HOTBAR[slot]) setSelected(HOTBAR[slot].type);
      }
      if (event.code === "Escape") { setPaused(true); setSettingsOpen(false); }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === canvas) look(event.movementX, event.movementY);
    };
    const onMouseDown = (event: MouseEvent) => {
      if (isTouchDevice()) return;
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock?.();
        setPaused(false);
        return;
      }
      if (event.button === 0) interact(false);
      if (event.button === 2) interact(true);
    };
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onPointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas;
      setLocked(isLocked);
      if (!isLocked && !isTouchDevice()) setPaused(true);
    };
    const onVisibility = () => { if (document.hidden) saveWorld(); };

    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", orientationChange);
    window.visualViewport?.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("scroll", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("touchmove", preventTouchPageMove, { passive: false });
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("contextmenu", onContextMenu);
    applySize();

    let frame = 0;
    let autosaveTimer = 0;
    let streamTimer = 0;
    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const elapsed = clock.elapsedTime;
      let isMoving = false;

      if (!pausedRef.current) {
        const touch = moveInputRef.current;
        const forwardAmount = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0) - touch.y;
        const sideAmount = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + touch.x;
        forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
        right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
        movement.copy(forward).multiplyScalar(forwardAmount).addScaledVector(right, sideAmount);
        if (movement.lengthSq() > 1) movement.normalize();
        isMoving = movement.lengthSq() > 0.01;
        const distance = (keys.has("ShiftLeft") ? 7.1 : 4.5) * dt;
        if (isMoving) {
          const nextX = player.position.clone();
          nextX.x += movement.x * distance;
          if (!collidesAt(nextX)) player.position.x = nextX.x;
          const nextZ = player.position.clone();
          nextZ.z += movement.z * distance;
          if (!collidesAt(nextZ)) player.position.z = nextZ.z;
        }

        const oldY = player.position.y;
        player.velocity.y -= 18.5 * dt;
        const nextY = player.position.clone();
        nextY.y += player.velocity.y * dt;
        if (player.velocity.y > 0) {
          if (collidesAt(nextY)) player.velocity.y = 0;
          else player.position.y = nextY.y;
        } else {
          const floor = floorBelow(player.position);
          if (Number.isFinite(floor) && nextY.y <= floor + 0.01 && oldY >= floor - 0.12) {
            player.position.y = floor + 0.01;
            player.velocity.y = 0;
            player.onGround = true;
          } else if (!collidesAt(nextY)) {
            player.position.y = nextY.y;
            player.onGround = false;
          } else {
            player.velocity.y = 0;
          }
        }
        if (player.position.y < -30) {
          player.position.set(0, terrainHeight(0, 9) + 0.52, 9);
          player.velocity.set(0, 0, 0);
          setMessage("The World Core pulled you back from the void");
        }
      }

      streamTimer += dt;
      if (streamTimer > 0.7) {
        streamWorld();
        streamTimer = 0;
      }

      for (const creature of creatures.values()) {
        if (elapsed > creature.turnAt) {
          creature.heading += (hash2(Math.floor(elapsed) + creature.root.position.x, creature.root.position.z) - 0.5) * 2.4;
          creature.turnAt = elapsed + 2.5 + hash2(creature.root.position.x, Math.floor(elapsed)) * 4;
        }
        const speed = 0.38 * dt;
        creature.root.position.x += Math.sin(creature.heading) * speed;
        creature.root.position.z += Math.cos(creature.heading) * speed;
        creature.root.position.y = terrainHeight(Math.round(creature.root.position.x), Math.round(creature.root.position.z)) + 0.52 + Math.sin(elapsed * 5 + creature.phase) * 0.025;
        creature.root.rotation.y = creature.heading;
      }

      playerRig.root.visible = player.mode !== "first";
      playerRig.root.position.copy(player.position);
      playerRig.root.rotation.y = player.yaw;
      const walk = isMoving && player.onGround ? Math.sin(elapsed * 9.5) * 0.65 : 0;
      playerRig.leftLeg.rotation.x = walk;
      playerRig.rightLeg.rotation.x = -walk;
      playerRig.leftArm.rotation.x = -walk * 0.8;
      playerRig.rightArm.rotation.x = elapsed < swingUntil ? -1.5 : walk * 0.8;

      const lookDirection = new THREE.Vector3(
        -Math.sin(player.yaw) * Math.cos(player.pitch),
        Math.sin(player.pitch),
        -Math.cos(player.yaw) * Math.cos(player.pitch),
      );
      const eye = player.position.clone().add(new THREE.Vector3(0, 1.62, 0));
      if (player.mode === "first") {
        camera.position.copy(eye);
        camera.lookAt(eye.clone().add(lookDirection));
      } else if (player.mode === "third") {
        const target = eye.clone().addScaledVector(lookDirection, -5.3).add(new THREE.Vector3(0, 1.55, 0));
        camera.position.lerp(target, 0.2);
        camera.lookAt(eye.clone().addScaledVector(lookDirection, 3.5));
      } else {
        const target = eye.clone().addScaledVector(lookDirection, 5.1).add(new THREE.Vector3(0, 0.8, 0));
        camera.position.lerp(target, 0.2);
        camera.lookAt(eye);
      }

      water.position.x = Math.round(player.position.x / 30) * 30;
      water.position.z = Math.round(player.position.z / 30) * 30;
      water.position.y = SEA_LEVEL + 0.42 + Math.sin(elapsed * 0.55) * 0.025;
      sun.position.set(player.position.x + 24, 24 + Math.sin(elapsed / 30) * 8, player.position.z + 14);
      sun.target.position.copy(player.position);
      const dayCycle = (elapsed / 190) % 1;
      const daylight = THREE.MathUtils.clamp((sun.position.y - 8) / 25, 0.3, 1);
      sun.intensity = 2.35 * daylight;
      hemi.intensity = 1.2 + daylight;
      coreLight.intensity = 10 + Math.sin(elapsed * 2.1) * 2.4;

      if (dayRef.current) {
        const minutes = Math.floor(dayCycle * 1440);
        dayRef.current.textContent = `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
      }
      if (coordsRef.current) coordsRef.current.textContent = `X ${Math.floor(player.position.x)} · Z ${Math.floor(player.position.z)}`;
      autosaveTimer += dt;
      if (autosaveTimer > 20) { saveWorld(); autosaveTimer = 0; }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(orientationTimer);
      saveWorld();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", orientationChange);
      window.visualViewport?.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("scroll", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchmove", preventTouchPageMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("contextmenu", onContextMenu);
      renderer.dispose();
      cubeGeometry.dispose();
      Object.values(textures).forEach((texture) => texture.dispose());
      mount.removeChild(canvas);
      canvasRef.current = null;
    };
  }, []);

  const stopTouch = (event: React.PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const pressAction = (event: React.PointerEvent<HTMLButtonElement>, action: keyof Pick<GameActions, "mine" | "place" | "jump" | "camera">) => {
    stopTouch(event);
    actionsRef.current[action]();
  };
  const handleLookStart = (event: React.PointerEvent<HTMLDivElement>) => {
    stopTouch(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.lastX = String(event.clientX);
    event.currentTarget.dataset.lastY = String(event.clientY);
  };
  const handleLookMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    stopTouch(event);
    const lastX = Number(event.currentTarget.dataset.lastX ?? event.clientX);
    const lastY = Number(event.currentTarget.dataset.lastY ?? event.clientY);
    actionsRef.current.look((event.clientX - lastX) * 1.65, (event.clientY - lastY) * 1.65);
    event.currentTarget.dataset.lastX = String(event.clientX);
    event.currentTarget.dataset.lastY = String(event.clientY);
  };
  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    stopTouch(event);
    const pad = event.currentTarget;
    if (event.type === "pointerdown") pad.setPointerCapture(event.pointerId);
    if (event.type === "pointerup" || event.type === "pointercancel") {
      moveInputRef.current = { x: 0, y: 0 };
      pad.style.setProperty("--stick-x", "0px");
      pad.style.setProperty("--stick-y", "0px");
      return;
    }
    if (!pad.hasPointerCapture(event.pointerId)) return;
    const rect = pad.getBoundingClientRect();
    const x = THREE.MathUtils.clamp((event.clientX - (rect.left + rect.width / 2)) / 42, -1, 1);
    const y = THREE.MathUtils.clamp((event.clientY - (rect.top + rect.height / 2)) / 42, -1, 1);
    moveInputRef.current = { x, y };
    pad.style.setProperty("--stick-x", `${x * 32}px`);
    pad.style.setProperty("--stick-y", `${y * 32}px`);
  };
  const resume = () => {
    setPaused(false);
    setSettingsOpen(false);
    if (!mobile) canvasRef.current?.requestPointerLock?.();
  };
  const resetWorld = () => {
    window.localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  };

  return (
    <main className="game-shell">
      <div ref={mountRef} className="game-stage" />
      <div className="sky-vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header className="top-hud">
        <div className="brand-lockup" aria-label="Shardstead">
          <span className="brand-rune">S</span>
          <span><strong>SHARDSTEAD</strong><small>WILDFRONT · BUILD 002</small></span>
        </div>
        <div className="world-readout">
          <span className="signal-dot" /><span>INFINITE FRONTIER</span><span className="divider" />
          <span ref={coordsRef}>X 0 · Z 9</span><span className="divider" /><span ref={dayRef}>06:00</span>
        </div>
        <button className="hud-button" type="button" onClick={() => { setPaused(true); setSettingsOpen(true); if (document.pointerLockElement) document.exitPointerLock(); }} aria-label="Open settings">SETTINGS</button>
      </header>
      <aside className="objective-card">
        <span className="eyebrow">WILDFRONT AWAKENING</span><strong>Explore beyond the World Core</strong><p>{message}</p>
        <div className="objective-progress"><span style={{ width: `${Math.min(100, 28 + shards * 12)}%` }} /></div><small>{shards} rift shards recovered</small>
      </aside>
      <div className="camera-chip">{CAMERA_LABELS[cameraMode]} · {mobile ? "CAM" : "F5"}</div>
      <div className="crosshair" aria-hidden="true"><i /><i /></div>
      <nav className="hotbar" aria-label="Building materials">
        {HOTBAR.map((item, index) => (
          <button
            type="button"
            key={item.type}
            className={selected === item.type ? "selected" : ""}
            onPointerDown={(event) => { stopTouch(event); setSelected(item.type); }}
            aria-label={`Select ${BLOCK_LABELS[item.type]}`}
            aria-pressed={selected === item.type}
          >
            <span className="slot-number">{index + 1}</span>
            <span className="block-swatch" style={{ "--texture": `url(${item.texture})` } as React.CSSProperties} />
            <span className="slot-label">{BLOCK_LABELS[item.type]}</span>
          </button>
        ))}
      </nav>
      <div className="desktop-help"><span>WASD MOVE</span><span>SPACE JUMP</span><span>LEFT ATTACK / MINE</span><span>RIGHT BUILD</span><span>F5 CAMERA</span></div>
      <div className="mobile-controls" aria-label="Touch controls">
        <div className="move-pad" onPointerDown={handleMove} onPointerMove={handleMove} onPointerUp={handleMove} onPointerCancel={handleMove} aria-label="Move joystick"><span /></div>
        <div className="look-zone" onPointerDown={handleLookStart} onPointerMove={handleLookMove} aria-label="Drag to look" />
        <div className="action-cluster">
          {(["mine", "place", "jump", "camera"] as const).map((action) => (
            <button key={action} type="button" onPointerDown={(event) => pressAction(event, action)} aria-label={action}>
              <span className={`control-icon icon-${action}`} aria-hidden="true" /><small>{action === "mine" ? "ATTACK" : action === "place" ? "BUILD" : action.toUpperCase()}</small>
            </button>
          ))}
        </div>
      </div>
      {intro && (
        <section className="entry-screen" aria-labelledby="game-title">
          <div className="entry-panel"><div className="core-mark" aria-hidden="true"><span /></div><p className="eyebrow">AN ENDLESS BUILDING ADVENTURE</p><h1 id="game-title">SHARDSTEAD</h1><p className="tagline">The frontier now grows with every step.</p><p className="entry-copy">Explore streaming landscapes, discover ruins and watchtowers, meet wild Mossbacks, and build anywhere. Your explorer and world changes save on this device.</p><button type="button" className="primary-button" onClick={begin}>ENTER THE WILDFRONT</button><span className="input-note">{mobile ? "Touch controls enabled · rotate any time" : "Keyboard + mouse · Click to capture cursor"}</span></div>
          <div className="version-stamp">ORIGINAL PROTOTYPE · BUILD 002</div>
        </section>
      )}
      {!intro && paused && (
        <section className="pause-screen" aria-label={settingsOpen ? "Settings" : "Game paused"}>
          <div className="pause-panel">
            {settingsOpen ? <><p className="eyebrow">DISPLAY & PERFORMANCE</p><h2>Render settings</h2><div className="setting-group"><label>Graphics preset</label><div className="segmented">{(["low", "balanced", "high"] as Quality[]).map((preset) => <button type="button" key={preset} className={quality === preset ? "active" : ""} onClick={() => setQuality(preset)}>{preset}</button>)}</div></div><div className="setting-group"><label htmlFor="render-distance">View distance <strong>{renderDistance}m</strong></label><input id="render-distance" type="range" min="34" max="96" step="2" value={renderDistance} onChange={(event) => setRenderDistance(Number(event.target.value))} /></div><p className="setting-help">Mobile streams a compact chunk ring for stable performance. Desktop loads farther terrain as view distance increases.</p><div className="pause-actions"><button type="button" className="primary-button" onClick={resume}>APPLY & RETURN</button><button type="button" className="danger-button" onClick={resetWorld}>RESET WORLD</button></div></> : <><p className="eyebrow">FRONTIER PAUSED</p><h2>Return to Shardstead</h2><p>Your position and every block change are saved locally.</p><button type="button" className="primary-button" onClick={resume}>RESUME</button><button type="button" className="text-button" onClick={() => setSettingsOpen(true)}>RENDER SETTINGS</button></>}
          </div>
        </section>
      )}
      {!mobile && !intro && !paused && !locked && <button type="button" className="capture-prompt" onClick={resume}>CLICK TO CONTROL</button>}
    </main>
  );
}

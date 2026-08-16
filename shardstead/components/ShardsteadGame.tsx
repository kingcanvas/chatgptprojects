"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { createMossback, createPlayerRig, createRiftWarden, createSettler, type Mossback, type RiftWarden, type Settler } from "@/game/entities";
import {
  BOSS_CHUNK,
  blockKey,
  CHUNK_SIZE,
  chunkKey,
  generateChunk,
  hash2,
  isOceanChunk,
  SEA_LEVEL,
  terrainHeight,
  VILLAGE_CHUNK,
  type BlockCoord,
  type BlockType,
} from "@/game/world";

type CameraMode = "first" | "third" | "front";
type Quality = "low" | "balanced" | "high";
type GameMode = "survival" | "creative";
type WorldMeta = { id: string; name: string; mode: GameMode; createdAt: number; updatedAt: number };
type Inventory = Partial<Record<BlockType, number>>;
type GameActions = {
  mine: () => void;
  mineStop: () => void;
  place: () => void;
  jump: () => void;
  camera: () => void;
  look: (dx: number, dy: number) => void;
};

const WORLDS_KEY = "shardstead:worlds:v1";
const SETTINGS_KEY = "shardstead:settings:v1";
const saveKey = (id: string) => `shardstead:world:${id}:v3`;
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
const INVENTORY_ITEMS: { type: BlockType; texture: string }[] = [
  { type: "grass", texture: "/textures/grass-top.png" },
  { type: "soil", texture: "/textures/soil.png" },
  { type: "stone", texture: "/textures/stone.png" },
  { type: "sand", texture: "/textures/sand.png" },
  { type: "wood", texture: "/textures/wood-rings.png" },
  { type: "bark", texture: "/textures/bark.png" },
  { type: "leaves", texture: "/textures/leaves.png" },
  { type: "crystal", texture: "/textures/rift-crystal.png" },
  { type: "metal", texture: "/textures/core-metal.png" },
  { type: "rune", texture: "/textures/rune-stone.png" },
  { type: "snow", texture: "/textures/snow.png" },
  { type: "copper", texture: "/textures/copper-ore.png" },
  { type: "dark", texture: "/textures/dark-rock.png" },
];
const HOTBAR = INVENTORY_ITEMS.slice(0, 9);
const STARTER_BLOCKS: Inventory = { grass: 24, stone: 18, wood: 12, crystal: 3, metal: 6 };
const HARDNESS: Record<BlockType, number> = { grass: .42, soil: .48, stone: 1.35, sand: .36, bark: .82, wood: .72, leaves: .28, crystal: 1.7, metal: 2.1, rune: 1.65, snow: .3, copper: 1.8, dark: 1.5, core: 999 };

function isTouchDevice() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

type GameViewport = { width: number; height: number };

function syncGameViewport(): GameViewport {
  const viewport = window.visualViewport;
  const inner = { width: window.innerWidth, height: window.innerHeight };
  const candidates = [
    viewport ? { width: viewport.width, height: viewport.height } : null,
    inner,
    { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
  ].filter((size): size is GameViewport => Boolean(size && size.width > 0 && size.height > 0));
  const landscape = inner.width > inner.height || window.matchMedia("(orientation: landscape)").matches;
  const size = candidates.find((candidate) => (candidate.width > candidate.height) === landscape) ?? inner;
  const measured = { width: Math.max(1, Math.round(size.width)), height: Math.max(1, Math.round(size.height)) };
  const root = document.documentElement;
  root.style.setProperty("--game-width", `${measured.width}px`);
  root.style.setProperty("--game-height", `${measured.height}px`);
  root.dataset.gameOrientation = measured.width > measured.height ? "landscape" : "portrait";
  root.dataset.gameTouch = String(isTouchDevice());
  return measured;
}

function ItemCube({ texture }: { texture: string }) {
  return <span className="item-cube" style={{ "--texture": `url(${texture})` } as React.CSSProperties}>{["front", "back", "right", "left", "top", "bottom"].map((face) => <i key={face} className={face} />)}</span>;
}

function loadWorlds(): WorldMeta[] {
  if (typeof window === "undefined") return [];
  try {
    let list = JSON.parse(localStorage.getItem(WORLDS_KEY) ?? "[]") as WorldMeta[];
    const legacy = localStorage.getItem("shardstead:streaming-world:v2");
    if (!list.length && legacy) {
      const meta: WorldMeta = { id: "legacy-wildfront", name: "Wildfront", mode: "survival", createdAt: Date.now(), updatedAt: Date.now() };
      localStorage.setItem(saveKey(meta.id), JSON.stringify({ ...JSON.parse(legacy), inventory: { grass: 24, stone: 18, wood: 12, crystal: 3, metal: 6 } }));
      list = [meta]; localStorage.setItem(WORLDS_KEY, JSON.stringify(list));
    }
    return list;
  } catch { return []; }
}

export default function ShardsteadGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef<BlockType>("grass");
  const pausedRef = useRef(true);
  const qualityRef = useRef<Quality>("balanced");
  const renderDistanceRef = useRef(2);
  const inventoryRef = useRef<Inventory>({});
  const modeRef = useRef<GameMode>("survival");
  const applyGraphicsRef = useRef<() => void>(() => undefined);
  const moveInputRef = useRef({ x: 0, y: 0 });
  const dayRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const actionsRef = useRef<GameActions>({
    mine: () => undefined,
    mineStop: () => undefined,
    place: () => undefined,
    jump: () => undefined,
    camera: () => undefined,
    look: () => undefined,
  });

  const [worlds, setWorlds] = useState<WorldMeta[]>([]);
  const [activeWorld, setActiveWorld] = useState<WorldMeta | null>(null);
  const [creating, setCreating] = useState(false);
  const [newWorldName, setNewWorldName] = useState("New Frontier");
  const [newMode, setNewMode] = useState<GameMode>("survival");
  const [intro, setIntro] = useState(true);
  const [paused, setPaused] = useState(true);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<BlockType>("grass");
  const [cameraMode, setCameraMode] = useState<CameraMode>("first");
  const [quality, setQuality] = useState<Quality>(() => { try { return typeof window === "undefined" ? "balanced" : JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}").quality ?? "balanced"; } catch { return "balanced"; } });
  const [renderDistance, setRenderDistance] = useState(() => { try { return typeof window === "undefined" ? 2 : JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}").renderChunks ?? 2; } catch { return 2; } });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventory, setInventory] = useState<Inventory>({});
  const [health, setHealth] = useState(20);
  const [food, setFood] = useState(20);
  const [breakProgress, setBreakProgress] = useState(0);
  const healthRef = useRef(20);
  const foodRef = useRef(20);
  const [, setShards] = useState(0);
  const [message, setMessage] = useState("Find the glowing World Core");
  const [npcDialogue, setNpcDialogue] = useState<{ name: string; text: string } | null>(null);
  const [bossStatus, setBossStatus] = useState<{ health: number; maxHealth: number } | null>(null);
  const [mobile] = useState(() => isTouchDevice());
  useEffect(() => { const timer = window.setTimeout(() => setWorlds(loadWorlds()), 0); return () => window.clearTimeout(timer); }, []);

  useEffect(() => {
    let frame = 0;
    let timers: number[] = [];
    const publishViewport = () => {
      const detail = syncGameViewport();
      window.dispatchEvent(new CustomEvent<GameViewport>("shardstead:viewport", { detail }));
    };
    const scheduleViewport = () => {
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      frame = window.requestAnimationFrame(publishViewport);
      timers = [80, 240, 650].map((delay) => window.setTimeout(publishViewport, delay));
    };
    const onVisibility = () => { if (!document.hidden) scheduleViewport(); };
    publishViewport();
    window.addEventListener("resize", scheduleViewport);
    window.addEventListener("orientationchange", scheduleViewport);
    window.addEventListener("pageshow", scheduleViewport);
    window.addEventListener("focus", scheduleViewport);
    window.visualViewport?.addEventListener("resize", scheduleViewport);
    window.visualViewport?.addEventListener("scroll", scheduleViewport);
    window.screen.orientation?.addEventListener?.("change", scheduleViewport);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", scheduleViewport);
      window.removeEventListener("orientationchange", scheduleViewport);
      window.removeEventListener("pageshow", scheduleViewport);
      window.removeEventListener("focus", scheduleViewport);
      window.visualViewport?.removeEventListener("resize", scheduleViewport);
      window.visualViewport?.removeEventListener("scroll", scheduleViewport);
      window.screen.orientation?.removeEventListener?.("change", scheduleViewport);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { qualityRef.current = quality; applyGraphicsRef.current(); }, [quality]);
  useEffect(() => { renderDistanceRef.current = renderDistance; applyGraphicsRef.current(); }, [renderDistance]);
  useEffect(() => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ quality, renderChunks: renderDistance })); } catch {} }, [quality, renderDistance]);

  const createWorld = () => {
    const meta: WorldMeta = { id: crypto.randomUUID(), name: newWorldName.trim() || "New Frontier", mode: newMode, createdAt: Date.now(), updatedAt: Date.now() };
    const next = [meta, ...worlds];
    localStorage.setItem(WORLDS_KEY, JSON.stringify(next));
    setWorlds(next); setActiveWorld(meta); setCreating(false); setIntro(true);
  };
  const deleteWorld = (world: WorldMeta) => {
    if (!window.confirm(`Delete ${world.name}? This cannot be undone.`)) return;
    const next = worlds.filter((item) => item.id !== world.id);
    localStorage.removeItem(saveKey(world.id)); localStorage.setItem(WORLDS_KEY, JSON.stringify(next)); setWorlds(next);
  };

  const begin = useCallback(() => {
    setIntro(false);
    setPaused(false);
    if (!isTouchDevice()) canvasRef.current?.requestPointerLock?.();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !activeWorld) return;
    modeRef.current = activeWorld.mode;

    const canvas = document.createElement("canvas");
    canvas.className = "game-canvas";
    canvas.setAttribute("aria-label", "Shardstead infinite 3D world");
    mount.appendChild(canvas);
    canvasRef.current = canvas;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ab5b0);
    scene.fog = new THREE.FogExp2(0x8ab5b0, 0.017);
    const camera = new THREE.PerspectiveCamera(68, 1, 0.08, 190);
    const composer = new EffectComposer(renderer);
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.48, 0.55, 0.78);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(bloom);
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
    const makeMaterial = (map: THREE.Texture, options: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
      new THREE.MeshStandardMaterial({ map, roughness: 0.84, metalness: 0.02, ...options });
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
      metal: makeMaterial(textures.metal, { roughness: 0.38, metalness: 0.72 }),
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
    let restoredBossDefeated = false;
    inventoryRef.current = {};
    healthRef.current = 20;
    foodRef.current = 20;
    try {
      const primaryKey = saveKey(activeWorld.id);
      const primary = window.localStorage.getItem(primaryKey);
      let raw = primary ?? window.localStorage.getItem(`${primaryKey}:backup`);
      if (primary) {
        try { JSON.parse(primary); }
        catch { raw = window.localStorage.getItem(`${primaryKey}:backup`); }
      }
      if (raw) {
        const save = JSON.parse(raw) as {
          edits?: [string, BlockType | null][];
          position?: [number, number, number];
          yaw?: number;
          shards?: number;
          inventory?: Inventory;
          health?: number;
          food?: number;
          starterRemoved?: boolean;
          bossDefeated?: boolean;
        };
        if (Array.isArray(save.edits)) for (const [key, value] of save.edits) edits.set(key, value);
        if (Array.isArray(save.position) && save.position.length === 3) restoredPosition = save.position;
        if (typeof save.yaw === "number") restoredYaw = save.yaw;
        if (typeof save.shards === "number") restoredShards = save.shards;
        inventoryRef.current = save.inventory ?? {};
        if (activeWorld.mode === "survival" && !save.starterRemoved) {
          for (const [type, amount] of Object.entries(STARTER_BLOCKS) as [BlockType, number][]) {
            inventoryRef.current[type] = Math.max(0, (inventoryRef.current[type] ?? 0) - amount);
          }
        }
        healthRef.current = THREE.MathUtils.clamp(save.health ?? 20, 0, 20);
        foodRef.current = THREE.MathUtils.clamp(save.food ?? 20, 0, 20);
        restoredBossDefeated = Boolean(save.bossDefeated);
      }
    } catch {
      window.localStorage.removeItem(saveKey(activeWorld.id));
    }
    setShards(restoredShards);
    setInventory({ ...inventoryRef.current });
    setHealth(healthRef.current);
    setFood(foodRef.current);

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
    camera.add(playerRig.firstPersonArm);
    scene.add(camera);

    const world = new Map<string, BlockType>();
    const loadedChunks = new Map<string, string[]>();
    const worldGroup = new THREE.Group();
    const creatureGroup = new THREE.Group();
    const settlerGroup = new THREE.Group();
    const bossGroup = new THREE.Group();
    const creatures = new Map<string, Mossback>();
    const settlers = new Map<string, Settler>();
    let warden: RiftWarden | null = null;
    let bossDefeated = restoredBossDefeated;
    scene.add(worldGroup, creatureGroup, settlerGroup, bossGroup);
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const matrix = new THREE.Matrix4();
    const worldMeshes: THREE.InstancedMesh[] = [];
    const placementMaterial = new THREE.MeshBasicMaterial({ color: 0x73e4c0, transparent: true, opacity: 0.24, wireframe: true, depthTest: false });
    const placementPreview = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.04, 1.04), placementMaterial);
    placementPreview.visible = false;
    placementPreview.renderOrder = 20;
    scene.add(placementPreview);
    const breakMaterial = new THREE.MeshBasicMaterial({ color: 0xe9f6ed, transparent: true, opacity: 0, wireframe: true, depthTest: false });
    const breakOverlay = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.06, 1.06, 3, 3, 3), breakMaterial);
    breakOverlay.visible = false; breakOverlay.renderOrder = 21; scene.add(breakOverlay);
    const oceanMeshes = new Map<string, THREE.Mesh>();
    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: textures.water }, uTime: { value: 0 }, uWaveStrength: { value: 0.12 }, uOpacity: { value: 0.78 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: `
        uniform float uTime; uniform float uWaveStrength; varying vec2 vUv; varying float vWave;
        void main(){ vUv=uv; vec3 p=position; float a=sin((p.x+uTime*1.7)*0.72); float b=cos((p.y-uTime*1.2)*0.91); float c=sin((p.x+p.y+uTime)*0.38); vWave=(a+b+c)/3.0; p.z+=vWave*uWaveStrength; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }
      `,
      fragmentShader: `
        uniform sampler2D uMap; uniform float uTime; uniform float uOpacity; varying vec2 vUv; varying float vWave;
        void main(){ vec2 uv1=vUv*3.0+vec2(uTime*.018,uTime*.011); vec2 uv2=vUv*4.5+vec2(-uTime*.012,uTime*.021); vec3 t1=texture2D(uMap,uv1).rgb; vec3 t2=texture2D(uMap,uv2).rgb; float crest=smoothstep(.18,.92,vWave*.5+.5); vec3 deep=vec3(.035,.30,.38); vec3 shallow=vec3(.16,.67,.72); vec3 color=mix(deep,shallow,(t1.r+t2.g)*.45); color+=crest*vec3(.23,.42,.39); gl_FragColor=vec4(color,uOpacity); }
      `,
    });

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

    const spawnStoryEntities = (cx: number, cz: number) => {
      const key = chunkKey(cx, cz);
      if (cx === VILLAGE_CHUNK.x && cz === VILLAGE_CHUNK.z && !Array.from(settlers.values()).some((settler) => settler.chunk === key)) {
        const centerX = cx * CHUNK_SIZE + 5;
        const centerZ = cz * CHUNK_SIZE + 5;
        const villagePeople = [["Mara", -2, 0], ["Orin", 2, 1]] as const;
        villagePeople.forEach(([name, offsetX, offsetZ], index) => {
          const id = `settler-${name.toLowerCase()}`;
          const x = centerX + offsetX;
          const z = centerZ + offsetZ;
          const settler = createSettler(id, key, name, textureLoader, renderer, x, terrainHeight(centerX, centerZ) + 0.52, z);
          settler.heading = index === 0 ? Math.PI : 0;
          settlers.set(id, settler); settlerGroup.add(settler.root);
        });
      }
      if (cx === BOSS_CHUNK.x && cz === BOSS_CHUNK.z && !bossDefeated && !warden) {
        const x = cx * CHUNK_SIZE + 5;
        const z = cz * CHUNK_SIZE + 5;
        const y = Math.max(terrainHeight(x, z), SEA_LEVEL + 1) + 0.52;
        warden = createRiftWarden("rift-warden", key, textureLoader, renderer, x, y, z);
        bossGroup.add(warden.root);
      }
    };

    const streamWorld = (force = false) => {
      const centerX = Math.floor(player.position.x / CHUNK_SIZE);
      const centerZ = Math.floor(player.position.z / CHUNK_SIZE);
      const radius = renderDistanceRef.current;
      const wanted = new Set<string>();
      let changed = false;
      for (let cx = centerX - radius; cx <= centerX + radius; cx += 1) {
        for (let cz = centerZ - radius; cz <= centerZ + radius; cz += 1) {
          const key = chunkKey(cx, cz);
          wanted.add(key);
          if (!loadedChunks.has(key)) {
            loadedChunks.set(key, generateChunk(cx, cz, world, edits));
            if (isOceanChunk(cx, cz)) {
              const water = new THREE.Mesh(new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, 12, 12), waterMaterial);
              water.rotation.x = -Math.PI / 2;
              water.position.set(cx * CHUNK_SIZE + CHUNK_SIZE / 2 - 0.5, SEA_LEVEL + 0.42, cz * CHUNK_SIZE + CHUNK_SIZE / 2 - 0.5);
              water.receiveShadow = true; oceanMeshes.set(key, water); worldGroup.add(water);
            }
            spawnCreatureForChunk(cx, cz);
            spawnStoryEntities(cx, cz);
            changed = true;
          }
        }
      }
      for (const [key, keys] of loadedChunks.entries()) {
        const [cx, cz] = key.split(",").map(Number);
        if (Math.abs(cx - centerX) <= radius + 1 && Math.abs(cz - centerZ) <= radius + 1) continue;
        for (const worldKey of keys) world.delete(worldKey);
        loadedChunks.delete(key);
        const ocean = oceanMeshes.get(key);
        if (ocean) { worldGroup.remove(ocean); ocean.geometry.dispose(); oceanMeshes.delete(key); }
        const creature = creatures.get(key);
        if (creature) {
          creatureGroup.remove(creature.root);
          creatures.delete(key);
        }
        for (const [id, settler] of settlers.entries()) if (settler.chunk === key) {
          settlerGroup.remove(settler.root); settlers.delete(id);
        }
        if (warden?.chunk === key) { bossGroup.remove(warden.root); warden = null; setBossStatus(null); }
        changed = true;
      }
      if (changed || force) rebuildMeshes();
    };
    streamWorld(true);

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
    let playerInWater = false;
    let miningActive = false;
    let miningTarget = "";
    let miningAmount = 0;
    let miningStage = 0;
    let hungerTimer = 0;
    let recoveryTimer = 0;
    let creatureDamageCooldown = 0;
    let bossHudVisible = false;

    const updateVitals = () => { setHealth(healthRef.current); setFood(foodRef.current); };
    const damagePlayer = (amount: number) => {
      if (activeWorld.mode !== "survival" || amount <= 0) return;
      healthRef.current = Math.max(0, healthRef.current - amount);
      if (healthRef.current === 0) {
        player.position.set(0, terrainHeight(0, 9) + 0.52, 9);
        player.velocity.set(0, 0, 0); healthRef.current = 20; foodRef.current = Math.max(8, foodRef.current);
        setMessage("You were returned to the World Core");
      }
      updateVitals();
    };

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
        const primaryKey = saveKey(activeWorld.id);
        const previous = window.localStorage.getItem(primaryKey);
        if (previous) window.localStorage.setItem(`${primaryKey}:backup`, previous);
        window.localStorage.setItem(primaryKey, JSON.stringify({
          edits: Array.from(edits.entries()),
          position: player.position.toArray(),
          yaw: player.yaw,
          shards: restoredShards,
          inventory: inventoryRef.current,
          health: healthRef.current,
          food: foodRef.current,
          starterRemoved: true,
          bossDefeated,
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
      if (activeWorld.mode === "creative" && !pausedRef.current) {
        player.velocity.y = 4.6;
        player.onGround = false;
      } else if (playerInWater && !pausedRef.current) {
        player.velocity.y = 3.15;
        player.onGround = false;
      } else if (player.onGround && !pausedRef.current) {
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
          if (activeWorld.mode === "survival") { foodRef.current = Math.min(20, foodRef.current + 4); updateVitals(); }
          setMessage("Mossback released a wild shard");
        } else {
          creature.heading += Math.PI;
          setMessage(`Mossback startled — it has ${creature.health} strength left`);
        }
        return true;
      }
      return false;
    };

    const talkToSettler = (id: string) => {
      const settler = settlers.get(id);
      if (!settler) return false;
      const text = settler.name === "Mara"
        ? "Welcome to Hearthcross. The Rift Warden waits southeast in a ring of black stone. Mine supplies before you challenge it."
        : "Hold the attack control to mine in Survival. The Warden's core opens between pulses—keep moving and watch your food.";
      stopMining();
      setNpcDialogue({ name: settler.name, text });
      setPaused(true);
      if (document.pointerLockElement) document.exitPointerLock();
      return true;
    };

    const damageBoss = (id: string) => {
      if (!warden || warden.id !== id) return false;
      warden.health = Math.max(0, warden.health - (activeWorld.mode === "creative" ? 5 : 1));
      swingUntil = clock.elapsedTime + 0.22;
      setBossStatus({ health: warden.health, maxHealth: warden.maxHealth });
      if (warden.health <= 0) {
        bossGroup.remove(warden.root);
        warden = null;
        bossDefeated = true;
        setBossStatus(null);
        restoredShards += 5;
        setShards(restoredShards);
        if (activeWorld.mode === "survival") {
          inventoryRef.current.crystal = (inventoryRef.current.crystal ?? 0) + 8;
          inventoryRef.current.metal = (inventoryRef.current.metal ?? 0) + 6;
          setInventory({ ...inventoryRef.current });
        }
        setMessage("Rift Warden defeated — its crystal hoard is yours");
        saveWorld();
      } else setMessage(`Rift Warden · ${warden.health}/${warden.maxHealth}`);
      return true;
    };

    const interact = (placing: boolean) => {
      if (pausedRef.current) return;
      swingUntil = clock.elapsedTime + 0.22;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      if (!placing) {
        const settlerHit = raycaster.intersectObject(settlerGroup, true)[0];
        if (settlerHit && settlerHit.distance <= 4.8) {
          const id = settlerHit.object.userData.settlerId as string | undefined;
          if (id && talkToSettler(id)) return;
        }
        const bossHit = raycaster.intersectObject(bossGroup, true)[0];
        if (bossHit && bossHit.distance <= 5.8) {
          const id = bossHit.object.userData.bossId as string | undefined;
          if (id && damageBoss(id)) return;
        }
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
        if (activeWorld.mode === "survival") {
          inventoryRef.current[block.type] = (inventoryRef.current[block.type] ?? 0) + 1;
          setInventory({ ...inventoryRef.current });
        }
        swingUntil = clock.elapsedTime + 0.22;
        if (block.type === "crystal") {
          restoredShards += 1;
          setShards(restoredShards);
          setMessage("Rift shard recovered");
        } else setMessage(`${BLOCK_LABELS[block.type]} collected`);
      } else {
        if (activeWorld.mode === "survival" && (inventoryRef.current[selectedRef.current] ?? 0) <= 0) {
          setMessage(`No ${BLOCK_LABELS[selectedRef.current]} in inventory`); return;
        }
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
        if (activeWorld.mode === "survival") {
          inventoryRef.current[selectedRef.current] = Math.max(0, (inventoryRef.current[selectedRef.current] ?? 0) - 1);
          setInventory({ ...inventoryRef.current });
        }
        const ownerChunk = chunkKey(Math.floor(x / CHUNK_SIZE), Math.floor(z / CHUNK_SIZE));
        const chunkKeys = loadedChunks.get(ownerChunk);
        if (chunkKeys && !chunkKeys.includes(key)) chunkKeys.push(key);
        setMessage(`${BLOCK_LABELS[selectedRef.current]} placed`);
      }
      rebuildMeshes();
      saveWorld();
    };
    const stopMining = () => {
      miningActive = false; miningTarget = ""; miningAmount = 0; miningStage = 0;
      breakOverlay.visible = false; setBreakProgress(0);
    };
    const startMining = () => {
      if (pausedRef.current) return;
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const settlerHit = raycaster.intersectObject(settlerGroup, true)[0];
      if (settlerHit && settlerHit.distance <= 4.8) {
        const id = settlerHit.object.userData.settlerId as string | undefined;
        if (id && talkToSettler(id)) return;
      }
      if (activeWorld.mode === "creative") interact(false);
      else miningActive = true;
    };
    actionsRef.current = { mine: startMining, mineStop: stopMining, place: () => interact(true), jump, camera: updateCameraMode, look };

    applyGraphicsRef.current = () => {
      const preset = qualityRef.current;
      const maxRatio = preset === "low" ? 0.85 : preset === "balanced" ? 1.3 : 1.8;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxRatio));
      renderer.shadowMap.enabled = preset !== "low";
      renderer.shadowMap.type = preset === "high" ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
      renderer.toneMappingExposure = preset === "high" ? 1.14 : preset === "low" ? 0.98 : 1.06;
      sun.castShadow = preset !== "low";
      sun.shadow.radius = preset === "high" ? 5 : 2;
      bloom.strength = preset === "high" ? 0.48 : 0;
      bloom.radius = preset === "high" ? 0.55 : 0;
      waterMaterial.uniforms.uWaveStrength.value = preset === "low" ? 0.045 : preset === "high" ? 0.24 : 0.12;
      waterMaterial.uniforms.uOpacity.value = preset === "low" ? 0.7 : 0.8;
      if (scene.fog instanceof THREE.FogExp2) scene.fog.density = 1 / Math.max(30, renderDistanceRef.current * CHUNK_SIZE * 1.25);
    };
    applyGraphicsRef.current();

    const applySize = ({ width, height }: GameViewport = syncGameViewport()) => {
      mount.style.width = `${width}px`;
      mount.style.height = `${height}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const onViewport = (event: Event) => {
      const detail = (event as CustomEvent<GameViewport>).detail;
      applySize(detail ?? syncGameViewport());
      moveInputRef.current = { x: 0, y: 0 };
      stopMining();
      const pad = document.querySelector<HTMLElement>(".move-pad");
      pad?.style.setProperty("--stick-x", "0px");
      pad?.style.setProperty("--stick-y", "0px");
    };
    const preventTouchPageMove = (event: TouchEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".inventory-screen,.pause-screen,.entry-screen,.dialogue-screen,.home-screen")) return;
      event.preventDefault();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "Space"].includes(event.code)) keys.add(event.code);
      if (event.code === "Space") { event.preventDefault(); jump(); }
      if (event.code === "KeyF" || event.code === "F5") { event.preventDefault(); updateCameraMode(); }
      if (event.code.startsWith("Digit")) {
        const slot = Number(event.code.slice(5)) - 1;
        if (HOTBAR[slot]) setSelected(HOTBAR[slot].type);
      }
      if (event.code === "Escape") { setPaused(true); setSettingsOpen(false); }
      if (event.code === "KeyE") {
        setInventoryOpen((open) => { setPaused(!open); return !open; });
      }
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
      if (event.button === 0) startMining();
      if (event.button === 2) interact(true);
    };
    const onMouseUp = (event: MouseEvent) => { if (event.button === 0) stopMining(); };
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onPointerLockChange = () => {
      const isLocked = document.pointerLockElement === canvas;
      setLocked(isLocked);
      if (!isLocked && !isTouchDevice()) { stopMining(); setPaused(true); }
    };
    const onVisibility = () => { if (document.hidden) { stopMining(); saveWorld(); } };

    window.addEventListener("shardstead:viewport", onViewport);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("touchmove", preventTouchPageMove, { passive: false });
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
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
      const currentOcean = oceanMeshes.has(chunkKey(Math.floor(player.position.x / CHUNK_SIZE), Math.floor(player.position.z / CHUNK_SIZE)));
      const waterSurface = SEA_LEVEL + 0.42 + Math.sin(elapsed * 0.55) * 0.025;
      playerInWater = currentOcean && player.position.y < waterSurface;

      if (!pausedRef.current) {
        const touch = moveInputRef.current;
        const forwardAmount = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0) - touch.y;
        const sideAmount = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0) + touch.x;
        forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
        right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
        movement.copy(forward).multiplyScalar(forwardAmount).addScaledVector(right, sideAmount);
        if (movement.lengthSq() > 1) movement.normalize();
        isMoving = movement.lengthSq() > 0.01;
        const creativeFlying = activeWorld.mode === "creative" && !playerInWater;
        const distance = (playerInWater ? 2.75 : creativeFlying ? 7.5 : keys.has("ShiftLeft") ? 7.1 : 4.5) * dt;
        if (isMoving) {
          const nextX = player.position.clone();
          nextX.x += movement.x * distance;
          if (!collidesAt(nextX)) player.position.x = nextX.x;
          const nextZ = player.position.clone();
          nextZ.z += movement.z * distance;
          if (!collidesAt(nextZ)) player.position.z = nextZ.z;
        }

        const oldY = player.position.y;
        if (creativeFlying) {
          const flightDirection = (keys.has("Space") ? 1 : 0) - (keys.has("ShiftLeft") ? 1 : 0);
          player.velocity.y = THREE.MathUtils.lerp(player.velocity.y, flightDirection * 5.5, Math.min(1, dt * 8));
          player.onGround = false;
        } else if (playerInWater) {
          const targetSink = keys.has("Space") ? 2.7 : -0.62;
          player.velocity.y = THREE.MathUtils.lerp(player.velocity.y, targetSink, Math.min(1, dt * 3.2));
          player.onGround = false;
        } else {
          player.velocity.y -= 18.5 * dt;
        }
        const nextY = player.position.clone();
        nextY.y += player.velocity.y * dt;
        if (player.velocity.y > 0) {
          if (collidesAt(nextY)) player.velocity.y = 0;
          else player.position.y = nextY.y;
        } else {
          const floor = floorBelow(player.position);
          if (Number.isFinite(floor) && nextY.y <= floor + 0.01 && oldY >= floor - 0.12) {
            const impactSpeed = -player.velocity.y;
            player.position.y = floor + 0.01;
            player.velocity.y = 0;
            player.onGround = true;
            if (impactSpeed > 10.5) damagePlayer(Math.min(10, Math.floor((impactSpeed - 8.5) / 2)));
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
        if (activeWorld.mode === "survival") {
          if (isMoving) hungerTimer += dt;
          recoveryTimer += dt;
          if (hungerTimer > 35) { hungerTimer = 0; foodRef.current = Math.max(0, foodRef.current - 1); updateVitals(); }
          if (recoveryTimer > 4) {
            recoveryTimer = 0;
            if (foodRef.current >= 18 && healthRef.current < 20) { healthRef.current = Math.min(20, healthRef.current + 1); foodRef.current -= 1; updateVitals(); }
            else if (foodRef.current === 0) damagePlayer(1);
          }
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
        if (activeWorld.mode === "survival" && elapsed > creatureDamageCooldown && creature.root.position.distanceTo(player.position) < 1.05) {
          creatureDamageCooldown = elapsed + 1.4; damagePlayer(1); creature.heading += Math.PI;
        }
      }

      for (const settler of settlers.values()) {
        const distanceHome = settler.root.position.distanceTo(settler.home);
        const distancePlayer = settler.root.position.distanceTo(player.position);
        if (distancePlayer < 4.5) {
          settler.heading = Math.atan2(player.position.x - settler.root.position.x, player.position.z - settler.root.position.z);
        } else {
          if (elapsed > settler.turnAt) {
            settler.heading += (hash2(Math.floor(elapsed) + settler.root.position.x, settler.root.position.z) - .5) * 1.8;
            settler.turnAt = elapsed + 3 + hash2(settler.root.position.z, Math.floor(elapsed)) * 3;
          }
          if (distanceHome > 4.2) settler.heading = Math.atan2(settler.home.x - settler.root.position.x, settler.home.z - settler.root.position.z);
          const speed = .24 * dt;
          settler.root.position.x += Math.sin(settler.heading) * speed;
          settler.root.position.z += Math.cos(settler.heading) * speed;
        }
        settler.root.position.y = settler.home.y + Math.sin(elapsed * 3 + settler.phase) * .015;
        settler.root.rotation.y = settler.heading;
        const step = distancePlayer < 4.5 ? 0 : Math.sin(elapsed * 6 + settler.phase) * .38;
        settler.leftArm.rotation.x = -step; settler.rightArm.rotation.x = step;
        settler.leftLeg.rotation.x = step; settler.rightLeg.rotation.x = -step;
      }

      if (warden) {
        const distance = warden.root.position.distanceTo(player.position);
        if (distance < 18) {
          if (!bossHudVisible) {
            bossHudVisible = true;
            setBossStatus({ health: warden.health, maxHealth: warden.maxHealth });
          }
          const heading = Math.atan2(player.position.x - warden.root.position.x, player.position.z - warden.root.position.z);
          warden.root.rotation.y = heading;
          if (!pausedRef.current && distance > 1.7) {
            const speed = .82 * dt;
            warden.root.position.x += Math.sin(heading) * speed;
            warden.root.position.z += Math.cos(heading) * speed;
            warden.root.position.y = Math.max(terrainHeight(Math.round(warden.root.position.x), Math.round(warden.root.position.z)), SEA_LEVEL + 1) + .52;
          }
          if (activeWorld.mode === "survival" && !pausedRef.current && distance < 2 && elapsed > creatureDamageCooldown) {
            creatureDamageCooldown = elapsed + 1.2; damagePlayer(3);
          }
          if (activeWorld.mode === "survival" && !pausedRef.current && distance < 6 && elapsed > warden.pulseAt) {
            warden.pulseAt = elapsed + 4.5; damagePlayer(2);
            player.velocity.y = Math.max(player.velocity.y, 4.2);
            setMessage("The Rift Warden released a shockwave");
          }
        } else if (bossHudVisible) { bossHudVisible = false; setBossStatus(null); }
        const pulse = 1 + Math.sin(elapsed * 3.6 + warden.phase) * .14;
        warden.core.scale.setScalar(pulse);
        warden.leftArm.rotation.x = Math.sin(elapsed * 2.1) * .28;
        warden.rightArm.rotation.x = -warden.leftArm.rotation.x;
      }

      playerRig.root.visible = player.mode !== "first";
      playerRig.firstPersonArm.visible = player.mode === "first";
      playerRig.root.position.copy(player.position);
      playerRig.root.rotation.y = player.yaw;
      const walk = isMoving && player.onGround ? Math.sin(elapsed * 9.5) * 0.65 : 0;
      playerRig.leftLeg.rotation.x = walk;
      playerRig.rightLeg.rotation.x = -walk;
      playerRig.leftArm.rotation.x = -walk * 0.8;
      playerRig.rightArm.rotation.x = elapsed < swingUntil ? -1.5 : walk * 0.8;
      const actionPhase = elapsed < swingUntil ? Math.sin(((swingUntil - elapsed) / 0.22) * Math.PI) : 0;
      playerRig.firstPersonArm.rotation.x = -0.22 - actionPhase * 1.15;
      playerRig.firstPersonArm.rotation.z = -0.12 - actionPhase * 0.35;

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

      if (miningActive && activeWorld.mode === "survival" && !pausedRef.current) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const bossHit = raycaster.intersectObject(bossGroup, true)[0];
        const creatureHit = raycaster.intersectObject(creatureGroup, true)[0];
        const blockHit = raycaster.intersectObjects(worldMeshes, false)[0];
        let targetKey = "";
        let required = .55;
        let targetBlock: BlockCoord | null = null;
        if (bossHit && bossHit.distance <= 5.8) {
          targetKey = `boss:${String(bossHit.object.userData.bossId ?? "")}`;
          required = .48;
        } else if (creatureHit && creatureHit.distance <= 4.8) {
          targetKey = `creature:${String(creatureHit.object.userData.creatureId ?? "")}`;
        } else if (blockHit && blockHit.instanceId !== undefined && blockHit.instanceId !== null) {
          targetBlock = (blockHit.object.userData.blocks as BlockCoord[])[blockHit.instanceId];
          targetKey = blockKey(targetBlock.x, targetBlock.y, targetBlock.z);
          required = HARDNESS[targetBlock.type];
        }
        if (!targetKey || required > 100) stopMining();
        else {
          if (targetKey !== miningTarget) { miningTarget = targetKey; miningAmount = 0; miningStage = 0; }
          miningAmount = Math.min(1, miningAmount + dt / required);
          const nextStage = Math.max(1, Math.ceil(miningAmount * 10));
          if (nextStage !== miningStage) { miningStage = nextStage; setBreakProgress(miningAmount); }
          swingUntil = elapsed + .12;
          if (targetBlock) {
            breakOverlay.position.set(targetBlock.x, targetBlock.y, targetBlock.z);
            breakMaterial.opacity = .16 + miningAmount * .68;
            breakMaterial.color.setHSL(.47, .58, .76 - miningAmount * .28);
            breakOverlay.visible = true;
          } else breakOverlay.visible = false;
          if (miningAmount >= 1) { interact(false); miningTarget = ""; miningAmount = 0; miningStage = 0; setBreakProgress(0); breakOverlay.visible = false; }
        }
      } else if (!miningActive) breakOverlay.visible = false;

      placementPreview.visible = false;
      if (!pausedRef.current) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const previewHit = raycaster.intersectObjects(worldMeshes, false)[0];
        if (previewHit && previewHit.instanceId !== undefined && previewHit.instanceId !== null) {
          const block = (previewHit.object.userData.blocks as BlockCoord[])[previewHit.instanceId];
          const normal = previewHit.face?.normal ?? new THREE.Vector3(0, 1, 0);
          const px = block.x + Math.round(normal.x), py = block.y + Math.round(normal.y), pz = block.z + Math.round(normal.z);
          placementPreview.position.set(px, py, pz);
          const previous = world.get(blockKey(px, py, pz));
          world.set(blockKey(px, py, pz), selectedRef.current);
          const valid = !previous && !collidesAt(player.position);
          if (previous) world.set(blockKey(px, py, pz), previous); else world.delete(blockKey(px, py, pz));
          placementMaterial.color.set(valid ? 0x73e4c0 : 0xf18b70);
          placementPreview.visible = true;
        }
      }

      waterMaterial.uniforms.uTime.value = elapsed;
      for (const water of oceanMeshes.values()) water.position.y = waterSurface;
      const underwater = currentOcean && camera.position.y < waterSurface;
      scene.background = new THREE.Color(underwater ? 0x164a55 : 0x8ab5b0);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.set(underwater ? 0x164a55 : 0x8ab5b0);
        scene.fog.density = underwater ? 0.075 : 1 / Math.max(30, renderDistanceRef.current * CHUNK_SIZE * 1.25);
      }
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
      if (qualityRef.current === "high") composer.render(); else renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      saveWorld();
      window.removeEventListener("shardstead:viewport", onViewport);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("touchmove", preventTouchPageMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("contextmenu", onContextMenu);
      renderer.dispose();
      composer.dispose();
      waterMaterial.dispose();
      cubeGeometry.dispose();
      placementPreview.geometry.dispose();
      placementMaterial.dispose();
      breakOverlay.geometry.dispose();
      breakMaterial.dispose();
      Object.values(textures).forEach((texture) => texture.dispose());
      mount.removeChild(canvas);
      canvasRef.current = null;
    };
  }, [activeWorld]);

  const stopTouch = (event: React.PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  const pressAction = (event: React.PointerEvent<HTMLButtonElement>, action: keyof Pick<GameActions, "mine" | "place" | "jump" | "camera">) => {
    stopTouch(event);
    if (action === "mine") event.currentTarget.setPointerCapture(event.pointerId);
    actionsRef.current[action]();
  };
  const releaseMine = (event: React.PointerEvent<HTMLButtonElement>) => { stopTouch(event); actionsRef.current.mineStop(); };
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
    if (activeWorld) window.localStorage.removeItem(saveKey(activeWorld.id));
    window.location.reload();
  };

  if (!activeWorld) return (
    <main className="home-screen">
      <section className="home-panel">
        <div className="core-mark" aria-hidden="true"><span /></div><p className="eyebrow">BUILD 007 · TRUEFRAME</p><h1>SHARDSTEAD</h1>
        <p className="tagline">Choose a world. Keep every frontier.</p>
        {creating ? <div className="world-creator">
          <label>World name<input value={newWorldName} maxLength={30} onChange={(e) => setNewWorldName(e.target.value)} /></label>
          <div className="mode-picker">{(["survival", "creative"] as GameMode[]).map((mode) => <button type="button" key={mode} className={newMode === mode ? "active" : ""} onClick={() => setNewMode(mode)}><strong>{mode}</strong><small>{mode === "survival" ? "Gather blocks and manage supplies" : "Unlimited building materials"}</small></button>)}</div>
          <div className="home-actions"><button type="button" className="text-button" onClick={() => setCreating(false)}>CANCEL</button><button type="button" className="primary-button" onClick={createWorld}>CREATE WORLD</button></div>
        </div> : <>
          <div className="world-list">{worlds.length ? worlds.map((world) => <article className="world-card" key={world.id}><div><strong>{world.name}</strong><span>{world.mode} · {new Date(world.updatedAt).toLocaleDateString()}</span></div><button type="button" className="primary-button" onClick={() => { setActiveWorld(world); setIntro(true); }}>LOAD</button><button type="button" className="danger-button" onClick={() => deleteWorld(world)}>DELETE</button></article>) : <p className="empty-worlds">No saved worlds yet. Create your first frontier.</p>}</div>
          <button type="button" className="primary-button new-world-button" onClick={() => setCreating(true)}>+ NEW WORLD</button>
        </>}
      </section>
    </main>
  );

  return (
    <main className="game-shell">
      <div ref={mountRef} className="game-stage" />
      <div className="sky-vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header className="top-hud">
        <div className="brand-lockup" aria-label="Shardstead">
          <span className="brand-rune">S</span>
          <span><strong>SHARDSTEAD</strong><small>{activeWorld.name.toUpperCase()} · {activeWorld.mode.toUpperCase()}</small></span>
        </div>
        <div className="world-readout">
          <span className="signal-dot" /><span>INFINITE FRONTIER</span><span className="divider" />
          <span ref={coordsRef}>X 0 · Z 9</span><span className="divider" /><span ref={dayRef}>06:00</span>
        </div>
        <button className="hud-button" type="button" onClick={() => { setPaused(true); setSettingsOpen(true); if (document.pointerLockElement) document.exitPointerLock(); }} aria-label="Open settings">SETTINGS</button>
      </header>
      <div className="camera-chip">{CAMERA_LABELS[cameraMode]} · {mobile ? "CAM" : "F5"}</div>
      <div className="crosshair" aria-hidden="true"><i /><i /></div>
      {breakProgress > 0 && <div className="break-progress" style={{ "--break": `${Math.round(breakProgress * 360)}deg` } as React.CSSProperties} aria-label={`Breaking ${Math.round(breakProgress * 100)} percent`} />}
      {activeWorld.mode === "survival" && <div className="survival-hud" aria-label={`Health ${health} of 20, food ${food} of 20`}><div className="vital-row health-row">{Array.from({ length: 10 }, (_, index) => <i key={index} className={health > index * 2 ? "filled" : ""}>♥</i>)}</div><div className="vital-row food-row">{Array.from({ length: 10 }, (_, index) => <i key={index} className={food > index * 2 ? "filled" : ""}>◆</i>)}</div></div>}
      {bossStatus && <div className="boss-hud" aria-label={`Rift Warden health ${bossStatus.health} of ${bossStatus.maxHealth}`}><strong>RIFT WARDEN</strong><span><i style={{ width: `${(bossStatus.health / bossStatus.maxHealth) * 100}%` }} /></span><small>{bossStatus.health} / {bossStatus.maxHealth}</small></div>}
      {!intro && !paused && <div className="status-toast" aria-live="polite">{message}</div>}
      <button type="button" className="inventory-toggle" onPointerDown={(event) => { stopTouch(event); setInventoryOpen(true); setPaused(true); }} aria-label="Open inventory">INV</button>
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
            {(activeWorld.mode === "creative" || (inventory[item.type] ?? 0) > 0) && <ItemCube texture={item.texture} />}
            {(activeWorld.mode === "creative" || (inventory[item.type] ?? 0) > 0) && <span className="item-count">{activeWorld.mode === "creative" ? "∞" : inventory[item.type] ?? 0}</span>}
            <span className="slot-label">{BLOCK_LABELS[item.type]}</span>
          </button>
        ))}
      </nav>
      <div className="desktop-help"><span>WASD MOVE</span><span>SPACE JUMP</span><span>E INVENTORY</span><span>LEFT ATTACK / MINE</span><span>RIGHT BUILD</span><span>F5 CAMERA</span></div>
      <div className="mobile-controls" aria-label="Touch controls">
        <div className="move-pad" onPointerDown={handleMove} onPointerMove={handleMove} onPointerUp={handleMove} onPointerCancel={handleMove} aria-label="Move joystick"><span /></div>
        <div className="look-zone" onPointerDown={handleLookStart} onPointerMove={handleLookMove} aria-label="Drag to look" />
        <div className="action-cluster">
          {(["mine", "place", "jump", "camera"] as const).map((action) => (
            <button key={action} type="button" onPointerDown={(event) => pressAction(event, action)} onPointerUp={action === "mine" ? releaseMine : undefined} onPointerCancel={action === "mine" ? releaseMine : undefined} onPointerLeave={action === "mine" ? releaseMine : undefined} aria-label={action}>
              <span className={`control-icon icon-${action}`} aria-hidden="true" /><small>{action === "mine" ? "ATTACK" : action === "place" ? "BUILD" : action.toUpperCase()}</small>
            </button>
          ))}
        </div>
      </div>
      {intro && (
        <section className="entry-screen" aria-labelledby="game-title">
          <div className="entry-panel"><div className="core-mark" aria-hidden="true"><span /></div><p className="eyebrow">{activeWorld.mode.toUpperCase()} WORLD</p><h1 id="game-title">{activeWorld.name}</h1><p className="tagline">The frontier grows with every step.</p><p className="entry-copy">Regional oceans, endless chunk streaming, structures, creatures, mining, building, and device-local saves.</p><button type="button" className="primary-button" onClick={begin}>ENTER WORLD</button><span className="input-note">{mobile ? "Touch controls enabled · rotate any time" : "Keyboard + mouse · Click to capture cursor"}</span></div>
          <div className="version-stamp">ORIGINAL PROTOTYPE · BUILD 007</div>
        </section>
      )}
      {!intro && paused && (
        <section className="pause-screen" aria-label={settingsOpen ? "Settings" : "Game paused"}>
          <div className="pause-panel">
            {settingsOpen ? <><p className="eyebrow">DISPLAY & PERFORMANCE</p><h2>Render settings</h2><div className="setting-group"><label>Graphics preset</label><div className="segmented">{(["low", "balanced", "high"] as Quality[]).map((preset) => <button type="button" key={preset} className={quality === preset ? "active" : ""} onClick={() => setQuality(preset)}>{preset === "high" ? "Cinematic" : preset}</button>)}</div></div><div className="setting-group"><label htmlFor="render-distance">Chunk distance <strong>{renderDistance} chunks</strong></label><input id="render-distance" type="range" min="1" max="5" step="1" value={renderDistance} onChange={(event) => setRenderDistance(Number(event.target.value))} /></div><p className="setting-help">Cinematic enables PBR materials, ACES color, soft high-quality shadows, stronger water displacement, and bloom. It creates a ray-traced-style look without claiming unsupported hardware ray tracing on mobile browsers.</p><div className="pause-actions"><button type="button" className="primary-button" onClick={resume}>APPLY & RETURN</button><button type="button" className="danger-button" onClick={resetWorld}>RESET WORLD</button></div></> : <><p className="eyebrow">FRONTIER PAUSED</p><h2>{activeWorld.name}</h2><p>Your position, inventory, and every block change are saved locally.</p><button type="button" className="primary-button" onClick={resume}>RESUME</button><button type="button" className="text-button" onClick={() => setInventoryOpen(true)}>INVENTORY</button><button type="button" className="text-button" onClick={() => setSettingsOpen(true)}>RENDER SETTINGS</button><button type="button" className="text-button" onClick={() => { setActiveWorld(null); setPaused(true); }}>SAVE & QUIT TO WORLDS</button></>}
          </div>
        </section>
      )}
      {inventoryOpen && <section className="inventory-screen" aria-label="Inventory"><div className="inventory-panel">
        <button type="button" className="inventory-close" aria-label="Close inventory" onPointerDown={(event) => { stopTouch(event); setInventoryOpen(false); setPaused(false); }}>×</button>
        <p className="eyebrow">{activeWorld.mode.toUpperCase()} INVENTORY</p><h2>Inventory</h2><div className="inventory-layout"><aside className="equipment-panel"><div className="armor-slots">{["HEAD", "BODY", "LEGS", "FEET"].map((slot) => <span key={slot}>{slot}</span>)}</div><div className="player-paperdoll"><b>◇</b><i /><strong>EXPLORER</strong></div></aside><div className="storage-panel"><div className="inventory-grid">{Array.from({ length: 27 }, (_, index) => { const item = INVENTORY_ITEMS[index]; const available = item && (activeWorld.mode === "creative" || (inventory[item.type] ?? 0) > 0); return <button type="button" key={index} disabled={!available} onClick={() => { if (item) setSelected(item.type); }}>{available && item ? <><ItemCube texture={item.texture} /><span>{activeWorld.mode === "creative" ? "∞" : inventory[item.type]}</span></> : null}</button>; })}</div><div className="inventory-hotbar-row">{Array.from({ length: 9 }, (_, index) => { const item = HOTBAR[index]; const available = item && (activeWorld.mode === "creative" || (inventory[item.type] ?? 0) > 0); return <button type="button" key={index} className={item?.type === selected ? "selected" : ""} disabled={!available} onClick={() => { if (item) setSelected(item.type); }}>{available && item ? <><ItemCube texture={item.texture} /><span>{activeWorld.mode === "creative" ? "∞" : inventory[item.type]}</span></> : null}</button>; })}</div></div></div><button type="button" className="primary-button inventory-return" onClick={() => { setInventoryOpen(false); setPaused(false); }}>RETURN TO WORLD</button></div></section>}
      {npcDialogue && <section className="dialogue-screen" aria-label={`Talking to ${npcDialogue.name}`}><div className="dialogue-panel"><p className="eyebrow">HEARTHCROSS SETTLER</p><h2>{npcDialogue.name}</h2><p>{npcDialogue.text}</p><button type="button" className="primary-button" onPointerDown={(event) => { stopTouch(event); setNpcDialogue(null); setPaused(false); }}>CONTINUE</button></div></section>}
      {!mobile && !intro && !paused && !locked && <button type="button" className="capture-prompt" onClick={resume}>CLICK TO CONTROL</button>}
    </main>
  );
}

import * as THREE from "three";

export type PlayerRig = {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  firstPersonArm: THREE.Group;
};

export type Mossback = {
  id: string;
  chunk: string;
  root: THREE.Group;
  health: number;
  heading: number;
  turnAt: number;
  phase: number;
};

export type Settler = {
  id: string;
  chunk: string;
  name: string;
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  home: THREE.Vector3;
  heading: number;
  turnAt: number;
  phase: number;
};

export type RiftWarden = {
  id: string;
  chunk: string;
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  core: THREE.Mesh;
  health: number;
  maxHealth: number;
  pulseAt: number;
  phase: number;
};

function preparedTexture(loader: THREE.TextureLoader, path: string, renderer: THREE.WebGLRenderer) {
  const texture = loader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function limb(material: THREE.Material, width: number, height: number, depth: number) {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.y = -height / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  pivot.add(mesh);
  return pivot;
}

export function createPlayerRig(loader: THREE.TextureLoader, renderer: THREE.WebGLRenderer): PlayerRig {
  const face = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/characters/player-face.png", renderer) });
  const cloth = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/characters/player-cloth.png", renderer) });
  const boots = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/characters/player-boots.png", renderer) });
  const armor = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/characters/player-armor.png", renderer) });
  const shardTexture = preparedTexture(loader, "/characters/player-shard.png", renderer);
  const shard = new THREE.MeshLambertMaterial({ map: shardTexture, emissive: new THREE.Color(0x2b8ba0), emissiveMap: shardTexture, emissiveIntensity: 0.46 });
  const gear = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/characters/player-gear.png", renderer) });

  const root = new THREE.Group();
  root.name = "Shardstead Explorer";
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.34), [cloth, cloth, armor, gear, cloth, cloth]);
  body.position.y = 1.05;
  body.castShadow = true;
  body.receiveShadow = true;
  root.add(body);

  const skin = new THREE.MeshLambertMaterial({ color: 0xc98e67 });
  const hair = new THREE.MeshLambertMaterial({ color: 0x202823 });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.54, 0.5), [hair, hair, hair, skin, face, hair]);
  head.position.y = 1.68;
  head.castShadow = true;
  root.add(head);

  const leftArm = limb(cloth, 0.22, 0.72, 0.26);
  const rightArm = limb(cloth, 0.22, 0.72, 0.26);
  leftArm.position.set(-0.47, 1.37, 0);
  rightArm.position.set(0.47, 1.37, 0);
  root.add(leftArm, rightArm);

  const leftLeg = limb(boots, 0.27, 0.72, 0.3);
  const rightLeg = limb(boots, 0.27, 0.72, 0.3);
  leftLeg.position.set(-0.18, 0.72, 0);
  rightLeg.position.set(0.18, 0.72, 0);
  root.add(leftLeg, rightLeg);

  const shoulderLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.42), armor);
  const shoulderRight = shoulderLeft.clone();
  shoulderLeft.position.set(-0.46, 1.34, 0);
  shoulderRight.position.set(0.46, 1.34, 0);
  shoulderLeft.castShadow = shoulderRight.castShadow = true;
  root.add(shoulderLeft, shoulderRight);

  const pendant = new THREE.Mesh(new THREE.OctahedronGeometry(0.095, 0), shard);
  pendant.position.set(0, 1.13, 0.23);
  pendant.castShadow = true;
  root.add(pendant);

  const hairCrown = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.16, 0.55), hair);
  hairCrown.position.set(0, 1.98, -0.01); hairCrown.castShadow = true; root.add(hairCrown);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.2), gear);
  pack.position.set(0, 1.1, -0.28); pack.castShadow = true; root.add(pack);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.38), gear);
  belt.position.set(0, 0.72, 0); root.add(belt);

  const firstPersonArm = new THREE.Group();
  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.72, 0.25), cloth);
  sleeve.position.y = -0.36; sleeve.rotation.x = -0.16; firstPersonArm.add(sleeve);
  const glove = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.27), gear);
  glove.position.y = -0.78; firstPersonArm.add(glove);
  firstPersonArm.position.set(0.52, -0.38, -0.72);

  return { root, leftArm, rightArm, leftLeg, rightLeg, firstPersonArm };
}

export function createMossback(
  id: string,
  chunk: string,
  loader: THREE.TextureLoader,
  renderer: THREE.WebGLRenderer,
  x: number,
  y: number,
  z: number,
): Mossback {
  const moss = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/creatures/mossback-moss.png", renderer) });
  const hide = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/creatures/mossback-hide.png", renderer) });
  const face = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/creatures/mossback-face.png", renderer) });
  const footTexture = preparedTexture(loader, "/creatures/mossback-feet.png", renderer);
  const feet = new THREE.MeshLambertMaterial({ map: footTexture });
  const shard = new THREE.MeshLambertMaterial({ map: footTexture, emissive: new THREE.Color(0x168f9d), emissiveMap: footTexture, emissiveIntensity: 0.42 });
  const root = new THREE.Group();
  root.position.set(x, y, z);
  root.userData.creatureId = id;

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.68, 0.72), [hide, hide, moss, hide, hide, hide]);
  body.position.y = 0.64;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData.creatureId = id;
  root.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.62, 0.58), [hide, hide, moss, hide, face, hide]);
  head.position.set(0, 0.68, 0.58);
  head.castShadow = true;
  head.userData.creatureId = id;
  root.add(head);
  for (const [px, pz] of [[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.26], [0.38, 0.26]]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.35, 0.25), feet);
    foot.position.set(px, 0.2, pz);
    foot.castShadow = true;
    foot.userData.creatureId = id;
    root.add(foot);
  }
  for (const px of [-0.27, 0.27]) {
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), shard);
    crystal.scale.set(0.68, 1.65, 0.68);
    crystal.position.set(px, 1.12, -0.08);
    crystal.castShadow = true;
    crystal.userData.creatureId = id;
    root.add(crystal);
  }
  return { id, chunk, root, health: 3, heading: 0, turnAt: 0, phase: Math.random() * Math.PI * 2 };
}

function markEntity(root: THREE.Object3D, key: "settlerId" | "bossId", id: string) {
  root.traverse((part) => { part.userData[key] = id; });
}

export function createSettler(
  id: string,
  chunk: string,
  name: string,
  loader: THREE.TextureLoader,
  renderer: THREE.WebGLRenderer,
  x: number,
  y: number,
  z: number,
): Settler {
  const face = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/npcs/settler-face.png", renderer) });
  const cloth = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/npcs/settler-cloth.png", renderer) });
  const apron = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/npcs/settler-apron.png", renderer) });
  const gear = new THREE.MeshLambertMaterial({ map: preparedTexture(loader, "/npcs/settler-gear.png", renderer) });
  const skin = new THREE.MeshLambertMaterial({ color: 0xb87958 });
  const root = new THREE.Group();
  root.position.set(x, y, z);
  root.name = name;

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.7, 0.34), [cloth, cloth, cloth, cloth, apron, gear]);
  body.position.y = 1.03; body.castShadow = true; root.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.52, 0.48), [skin, skin, cloth, skin, face, cloth]);
  head.position.y = 1.64; head.castShadow = true; root.add(head);
  const leftArm = limb(cloth, 0.2, 0.68, 0.23);
  const rightArm = limb(cloth, 0.2, 0.68, 0.23);
  leftArm.position.set(-0.43, 1.34, 0); rightArm.position.set(0.43, 1.34, 0); root.add(leftArm, rightArm);
  const leftLeg = limb(gear, 0.25, 0.66, 0.27);
  const rightLeg = limb(gear, 0.25, 0.66, 0.27);
  leftLeg.position.set(-0.16, 0.68, 0); rightLeg.position.set(0.16, 0.68, 0); root.add(leftLeg, rightLeg);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.69, 0.14, 0.37), apron);
  sash.position.set(0, 0.78, 0); root.add(sash);
  markEntity(root, "settlerId", id);
  return { id, chunk, name, root, leftArm, rightArm, leftLeg, rightLeg, home: new THREE.Vector3(x, y, z), heading: 0, turnAt: 0, phase: Math.random() * Math.PI * 2 };
}

export function createRiftWarden(
  id: string,
  chunk: string,
  loader: THREE.TextureLoader,
  renderer: THREE.WebGLRenderer,
  x: number,
  y: number,
  z: number,
): RiftWarden {
  const faceTexture = preparedTexture(loader, "/bosses/warden-face.png", renderer);
  const stone = new THREE.MeshStandardMaterial({ map: preparedTexture(loader, "/bosses/warden-stone.png", renderer), roughness: 0.82, metalness: 0.08 });
  const face = new THREE.MeshStandardMaterial({ map: faceTexture, emissive: new THREE.Color(0x4f1592), emissiveMap: faceTexture, emissiveIntensity: 0.55, roughness: 0.62 });
  const copper = new THREE.MeshStandardMaterial({ map: preparedTexture(loader, "/bosses/warden-copper.png", renderer), roughness: 0.43, metalness: 0.66 });
  const riftTexture = preparedTexture(loader, "/bosses/warden-rift.png", renderer);
  const rift = new THREE.MeshStandardMaterial({ map: riftTexture, emissive: new THREE.Color(0x5127d9), emissiveMap: riftTexture, emissiveIntensity: 1.2, roughness: 0.24 });
  const root = new THREE.Group();
  root.position.set(x, y, z); root.name = "Rift Warden";
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.38, 1.45, 0.72), [stone, stone, copper, stone, copper, stone]);
  torso.position.y = 1.75; torso.castShadow = true; root.add(torso);
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.86, 0.9), [stone, stone, stone, stone, face, stone]);
  head.position.y = 2.88; head.castShadow = true; root.add(head);
  const leftArm = limb(stone, 0.46, 1.36, 0.5);
  const rightArm = limb(stone, 0.46, 1.36, 0.5);
  leftArm.position.set(-0.96, 2.35, 0); rightArm.position.set(0.96, 2.35, 0); root.add(leftArm, rightArm);
  for (const px of [-0.38, 0.38]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.05, 0.55), stone);
    leg.position.set(px, 0.55, 0); leg.castShadow = true; root.add(leg);
  }
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), rift);
  core.position.set(0, 1.83, 0.47); core.castShadow = true; root.add(core);
  for (const px of [-0.82, 0.82]) {
    const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), rift);
    shard.scale.set(0.7, 1.8, 0.7); shard.position.set(px, 3.2, 0); root.add(shard);
  }
  markEntity(root, "bossId", id);
  return { id, chunk, root, leftArm, rightArm, core, health: 30, maxHealth: 30, pulseAt: 0, phase: Math.random() * Math.PI * 2 };
}

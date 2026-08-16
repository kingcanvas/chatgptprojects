import * as THREE from "three";

export type PlayerRig = {
  root: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
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

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), [face, face, face, face, face, face]);
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

  return { root, leftArm, rightArm, leftLeg, rightLeg };
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

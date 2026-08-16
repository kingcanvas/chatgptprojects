export type BlockType =
  | "grass"
  | "soil"
  | "stone"
  | "sand"
  | "bark"
  | "wood"
  | "leaves"
  | "crystal"
  | "metal"
  | "rune"
  | "snow"
  | "copper"
  | "dark"
  | "core";

export type BlockCoord = { x: number; y: number; z: number; type: BlockType };
export type Biome = "meadow" | "forest" | "shore" | "highland" | "rift";

export const CHUNK_SIZE = 10;
export const SEA_LEVEL = 2;
export const blockKey = (x: number, y: number, z: number) => `${x}|${y}|${z}`;
export const chunkKey = (x: number, z: number) => `${x},${z}`;

export function hash2(x: number, z: number) {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function valueNoise(x: number, z: number, scale: number, offset: number) {
  const sx = x / scale;
  const sz = z / scale;
  const x0 = Math.floor(sx);
  const z0 = Math.floor(sz);
  const tx = smooth(sx - x0);
  const tz = smooth(sz - z0);
  const a = hash2(x0 + offset, z0 - offset);
  const b = hash2(x0 + 1 + offset, z0 - offset);
  const c = hash2(x0 + offset, z0 + 1 - offset);
  const d = hash2(x0 + 1 + offset, z0 + 1 - offset);
  const top = a + (b - a) * tx;
  const bottom = c + (d - c) * tx;
  return top + (bottom - top) * tz;
}

export function biomeAt(x: number, z: number): Biome {
  const distance = Math.hypot(x, z);
  if (distance < 8) return "meadow";
  const rift = valueNoise(x, z, 48, 901);
  const moisture = valueNoise(x, z, 34, 119);
  const altitude = terrainHeight(x, z);
  if (rift > 0.78) return "rift";
  if (altitude <= SEA_LEVEL + 1) return "shore";
  if (altitude >= 8) return "highland";
  return moisture > 0.52 ? "forest" : "meadow";
}

export function terrainHeight(x: number, z: number) {
  if (Math.abs(x) <= 7 && Math.abs(z) <= 7) return 3;
  const continent = valueNoise(x, z, 128, 11) * 2 - 1;
  const hills = valueNoise(x, z, 29, 47) * 2 - 1;
  const detail = valueNoise(x, z, 11, 83) * 2 - 1;
  const ridge = Math.abs(valueNoise(x, z, 52, 207) * 2 - 1);
  const oceanBasin = continent < -0.28 ? (continent + 0.28) * 8 : 0;
  const height = 4.2 + continent * 4.8 + oceanBasin + hills * 2.2 + detail * 0.7 + ridge * 1.2;
  return Math.max(-3, Math.min(13, Math.floor(height)));
}

export function isOceanChunk(chunkX: number, chunkZ: number) {
  const sx = chunkX * CHUNK_SIZE;
  const sz = chunkZ * CHUNK_SIZE;
  let low = 0;
  for (const [ox, oz] of [[1, 1], [5, 1], [1, 5], [5, 5], [8, 8]]) if (terrainHeight(sx + ox, sz + oz) < SEA_LEVEL) low += 1;
  return low >= 2;
}

function setBlock(
  world: Map<string, BlockType>,
  keys: string[],
  edits: Map<string, BlockType | null>,
  x: number,
  y: number,
  z: number,
  type: BlockType,
) {
  const key = blockKey(x, y, z);
  keys.push(key);
  const edited = edits.get(key);
  if (edited === null) return;
  world.set(key, edited ?? type);
}

function addTree(
  world: Map<string, BlockType>,
  keys: string[],
  edits: Map<string, BlockType | null>,
  x: number,
  z: number,
  ground: number,
) {
  const height = 3 + Math.floor(hash2(x + 12, z - 31) * 3);
  for (let y = 1; y <= height; y += 1) setBlock(world, keys, edits, x, ground + y, z, "bark");
  for (let ox = -2; ox <= 2; ox += 1) {
    for (let oz = -2; oz <= 2; oz += 1) {
      for (let oy = height - 1; oy <= height + 1; oy += 1) {
        const distance = Math.abs(ox) + Math.abs(oz) + Math.abs(oy - height) * 1.4;
        if (distance <= 3.8 && !(ox === 0 && oz === 0 && oy <= height)) {
          setBlock(world, keys, edits, x + ox, ground + oy, z + oz, "leaves");
        }
      }
    }
  }
}

function addRuin(
  world: Map<string, BlockType>,
  keys: string[],
  edits: Map<string, BlockType | null>,
  x: number,
  z: number,
) {
  const ground = terrainHeight(x, z);
  for (let ox = -2; ox <= 2; ox += 1) {
    for (let oz = -2; oz <= 2; oz += 1) {
      if (Math.abs(ox) === 2 || Math.abs(oz) === 2 || (ox === 0 && oz === 0)) {
        setBlock(world, keys, edits, x + ox, ground + 1, z + oz, (ox + oz) % 3 === 0 ? "rune" : "stone");
      }
    }
  }
  for (const [ox, oz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
    const pillarHeight = 2 + Math.floor(hash2(x + ox, z + oz) * 3);
    for (let y = 2; y <= pillarHeight; y += 1) setBlock(world, keys, edits, x + ox, ground + y, z + oz, y === pillarHeight ? "rune" : "stone");
  }
  setBlock(world, keys, edits, x, ground + 2, z, "crystal");
}

function addWatchtower(
  world: Map<string, BlockType>,
  keys: string[],
  edits: Map<string, BlockType | null>,
  x: number,
  z: number,
) {
  const ground = terrainHeight(x, z);
  for (const [ox, oz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    for (let y = 1; y <= 5; y += 1) setBlock(world, keys, edits, x + ox, ground + y, z + oz, "bark");
  }
  for (let ox = -2; ox <= 2; ox += 1) for (let oz = -2; oz <= 2; oz += 1) {
    setBlock(world, keys, edits, x + ox, ground + 5, z + oz, "wood");
    if (Math.abs(ox) === 2 || Math.abs(oz) === 2) setBlock(world, keys, edits, x + ox, ground + 6, z + oz, "bark");
  }
  setBlock(world, keys, edits, x, ground + 6, z, "crystal");
}

function addRiftArch(
  world: Map<string, BlockType>,
  keys: string[],
  edits: Map<string, BlockType | null>,
  x: number,
  z: number,
) {
  const ground = terrainHeight(x, z);
  for (let y = 1; y <= 5; y += 1) {
    setBlock(world, keys, edits, x - 2, ground + y, z, y > 3 ? "crystal" : "dark");
    setBlock(world, keys, edits, x + 2, ground + y, z, y > 3 ? "crystal" : "dark");
  }
  for (let ox = -1; ox <= 1; ox += 1) setBlock(world, keys, edits, x + ox, ground + 6, z, ox === 0 ? "crystal" : "dark");
}

function addWorldCore(
  world: Map<string, BlockType>,
  keys: string[],
  edits: Map<string, BlockType | null>,
) {
  for (let x = -3; x <= 3; x += 1) for (let z = -3; z <= 3; z += 1) {
    if (Math.abs(x) === 3 || Math.abs(z) === 3 || (x + z) % 2 === 0) setBlock(world, keys, edits, x, 4, z, "metal");
  }
  for (const [x, z] of [[-3, -3], [-3, 3], [3, -3], [3, 3]]) {
    setBlock(world, keys, edits, x, 5, z, "rune");
    setBlock(world, keys, edits, x, 6, z, "crystal");
  }
  setBlock(world, keys, edits, 0, 5, 0, "metal");
  setBlock(world, keys, edits, 0, 6, 0, "core");
  setBlock(world, keys, edits, 0, 7, 0, "crystal");
}

export function generateChunk(
  chunkX: number,
  chunkZ: number,
  world: Map<string, BlockType>,
  edits: Map<string, BlockType | null>,
) {
  const keys: string[] = [];
  const startX = chunkX * CHUNK_SIZE;
  const startZ = chunkZ * CHUNK_SIZE;
  for (let x = startX; x < startX + CHUNK_SIZE; x += 1) {
    for (let z = startZ; z < startZ + CHUNK_SIZE; z += 1) {
      const height = terrainHeight(x, z);
      const biome = biomeAt(x, z);
      for (let y = Math.max(-3, height - 3); y <= height; y += 1) {
        let type: BlockType = "stone";
        if (y === height) type = biome === "shore" ? "sand" : biome === "highland" ? "snow" : biome === "rift" ? "dark" : "grass";
        else if (y >= height - 2) type = biome === "shore" ? "sand" : biome === "rift" ? "dark" : "soil";
        else if (hash2(x * 3 + y, z * 5 - y) > 0.91) type = "copper";
        setBlock(world, keys, edits, x, y, z, type);
      }
      const treeChance = biome === "forest" ? 0.965 : biome === "meadow" ? 0.992 : 2;
      if (height > SEA_LEVEL && hash2(x + 44, z - 21) > treeChance && Math.abs(x) + Math.abs(z) > 16) {
        addTree(world, keys, edits, x, z, height);
      }
      if (biome === "rift" && hash2(x - 8, z + 75) > 0.992) setBlock(world, keys, edits, x, height + 1, z, "crystal");
      if (biome === "highland" && hash2(x + 3, z + 9) > 0.994) setBlock(world, keys, edits, x, height + 1, z, "stone");
    }
  }

  if (chunkX === 0 && chunkZ === 0) addWorldCore(world, keys, edits);
  else {
    const roll = hash2(chunkX * 19 + 3, chunkZ * 23 - 8);
    const centerX = startX + 3 + Math.floor(hash2(chunkX, chunkZ) * 4);
    const centerZ = startZ + 3 + Math.floor(hash2(chunkX + 8, chunkZ - 4) * 4);
    if (roll > 0.93) addRiftArch(world, keys, edits, centerX, centerZ);
    else if (roll > 0.84) addWatchtower(world, keys, edits, centerX, centerZ);
    else if (roll > 0.72) addRuin(world, keys, edits, centerX, centerZ);
  }
  return keys;
}

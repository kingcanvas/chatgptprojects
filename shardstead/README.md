# Shardstead

Shardstead is an original 3D open-world building game in development for desktop and mobile browsers. The current playable milestone is **Riftfolk (Build 006)**.

## Play now

Open the current web build: **[Play Shardstead — Wildfront](https://shardstead-game.codexonsteroids.chatgpt.site)**

The same link works on desktop and mobile. Progress is saved locally in that browser.

## Playable now

- Procedurally generated voxel frontier with terrain, trees, shoreline, ore, and ruins
- Endless chunk streaming: new deterministic terrain generates as the player travels
- A true chunk-radius setting that controls generated terrain and persists between visits
- A multi-world home screen with create, load, delete, Survival, and Creative modes
- Persistent per-world player position, block edits, shards, game mode, and inventory
- A real inventory with code-rendered 3D block previews and Survival quantities
- Regional coastlines and oceans instead of a global water sheet beneath the world
- Animated shader water with moving texture currents and geometry waves
- Swimming physics with drag, gentle sinking, and Jump-to-rise controls
- Cinematic rendering with PBR materials, ACES color, soft shadows, stronger waves, and bloom
- Creative flight, placement validity previews, and rotating local save backups
- Survival worlds now begin with an empty inventory and require gathering every block
- A 27-slot inventory, nine-slot hotbar, equipment area, and mobile inventory control
- Persistent health and food meters with fall damage, creature contact damage, hunger, regeneration, and Mossback food recovery
- Hold-to-break mining with material hardness, block crack feedback, and a center progress ring; Creative remains instant
- Meadows, forests, highlands, shores, rift regions, ruins, watchtowers, and rift arches
- A glowing World Core landmark and first shard-recovery objective
- Mine blocks, collect rift shards, select materials, and place new blocks
- Desktop controls: WASD, mouse look, Space, Shift, number keys, left/right click, and F5/F camera cycling
- Mobile controls: virtual movement stick, drag-to-look, mine, build, jump, and camera buttons
- First-person, third-person, and front-facing camera modes
- A rebuilt original explorer with hair, armor, pack, belt, first-person arm, and action animations
- Wandering original Mossback creatures that can be encountered and attacked
- Hearthcross village with two animated, talkable settlers and custom character materials
- A southeast Rift Warden arena, 30-health boss fight, shockwave attacks, health bar, persistent victory, and survival loot
- Solid player collision with terrain, structures, trees, placed blocks, walls, and ceilings
- Standalone iPhone Home Screen support with safe-area-aware landscape controls, aligned hitboxes, and a viewport-contained inventory with an always-visible close control
- Low, Balanced, and High graphics presets plus adjustable view distance
- Device-local world and player saving
- Original hand-painted textures generated specifically for Shardstead

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

For a production check:

```bash
npm run build
npm run lint
```

## Project status

Riftfolk is a major playable milestone, not the finished game. The larger design, technical roadmap, content plan, PC/mobile targets, optimization tiers, and production phases are documented in [PLANS.md](./PLANS.md).

## Original assets

The production textures in `public/textures/` were created for this project and are not copied from Minecraft or another game. Generation details are recorded in [ASSET_PROVENANCE.md](./ASSET_PROVENANCE.md).

## License

No open-source license has been granted yet. Copyright remains with the repository owner unless a license is added later.

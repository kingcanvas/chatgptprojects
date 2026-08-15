# Shardstead

Shardstead is an original 3D open-world building game in development for desktop and mobile browsers. This repository currently contains **First Light**, the first playable prototype.

## Play now

Open the current web build: **[Play Shardstead — First Light](https://shardstead-game.codexonsteroids.chatgpt.site)**

The same link works on desktop and mobile. Progress is saved locally in that browser.

## Playable now

- Procedurally generated voxel frontier with terrain, trees, shoreline, ore, and ruins
- A glowing World Core landmark and first shard-recovery objective
- Mine blocks, collect rift shards, select materials, and place new blocks
- Desktop controls: WASD, mouse look, Space, Shift, number keys, left/right click, and F5/F camera cycling
- Mobile controls: virtual movement stick, drag-to-look, mine, build, jump, and camera buttons
- First-person, third-person, and front-facing camera modes
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

First Light is a foundation milestone, not the finished game. The larger design, technical roadmap, content plan, PC/mobile targets, optimization tiers, and production phases are documented in [PLANS.md](./PLANS.md).

## Original assets

The production textures in `public/textures/` were created for this project and are not copied from Minecraft or another game. Generation details are recorded in [ASSET_PROVENANCE.md](./ASSET_PROVENANCE.md).

## License

No open-source license has been granted yet. Copyright remains with the repository owner unless a license is added later.

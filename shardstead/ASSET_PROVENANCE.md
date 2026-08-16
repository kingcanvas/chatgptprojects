# Shardstead Asset Provenance

This file records where the visible game assets came from so future work can keep Shardstead original.

## Texture set v1 — First Light

- Created: August 15, 2026
- Method: ChatGPT image generation, followed by lossless atlas slicing into 16 square production textures
- Source atlas size: 1254 × 1254 PNG
- Production tile size: 256 × 256 PNG
- Usage: terrain, trees, ore, water, rift crystals, ruins, and the World Core
- Restrictions followed: no logos, labels, watermarks, Minecraft branding, copied game assets, or outside stock textures

### Exact generation prompt

> Use case: stylized-concept. Asset type: production texture atlas for a browser-based 3D voxel survival-building game. Primary request: Create one clean square 4-by-4 texture atlas containing exactly sixteen original seamless square material tiles, in this fixed reading order from left to right and top to bottom: Row 1: grass top, grass side with green turf along the upper edge, rich soil, weathered gray stone. Row 2: warm pale sand, rugged tree bark, cut wood rings, dense leafy foliage. Row 3: violet-cyan rift crystal, dark forged core metal with subtle geometric inlay, ancient rune stone with one abstract non-alphabetic glowing glyph motif, clear stylized blue water. Row 4: powdery snow, stone with copper ore veins, nearly black volcanic rock, luminous ancient core material glowing amber and teal. Scene/backdrop: none; the entire canvas is the atlas. Style/medium: polished hand-painted stylized fantasy voxel-game textures, crisp readable material shapes, original visual identity, suitable for cube faces viewed near and far. Composition/framing: perfectly orthographic front-facing square atlas; sixteen equal-size cells in an exact 4-by-4 grid; every cell fills its full area edge-to-edge; grid divisions align precisely at 25%, 50%, and 75% of width and height; no gutters. Lighting/mood: flat diffuse material lighting baked minimally into each tile, no directional cast shadows, vivid but earthy and cohesive. Color palette: moss and meadow greens, warm earth browns, slate grays, pale sand, restrained violet/cyan magic, amber/teal core light. Materials/textures: tileable edges within every cell; medium-frequency painted detail; avoid tiny noisy speckles; water should read as a surface material rather than a landscape. Constraints: exactly 16 tiles; square image; each cell independently usable as a repeating cube-face texture; no transparency; no perspective; no objects protruding across cell boundaries; no external frame. Avoid: text, letters, words, numbers, labels, legends, logos, signatures, watermarks, borders, gutters, grid lines, UI, icons, inventory slots, beveled tile frames, photorealism, Minecraft branding or copied game assets.

## Asset policy for future milestones

All new expressive art, textures, icons, models, sprites, and promotional images should be created specifically for Shardstead or documented here with an approved source and license. Simple interface geometry may remain CSS/code-native.

## Wildfront character atlas v1

- Created: August 15, 2026
- Method: ChatGPT built-in image generation, then atlas slicing into six production materials
- Source: `shardstead-player-atlas-v1.png`, 1254 × 1254
- Production assets: `public/characters/player-face.png`, `player-cloth.png`, `player-boots.png`, `player-armor.png`, `player-shard.png`, and `player-gear.png`

### Exact generation prompt

> Use case: stylized-concept. Asset type: production texture atlas for a blocky low-poly 3D explorer character in the original game Shardstead. Primary request: Create one square 4-by-4 UV-style texture atlas made of sixteen clean, equal-sized square cells. The atlas must provide distinct material panels usable for a blocky 3D character: head front with a simple original explorer face, head back, head left, head right, torso front, torso back, torso left, torso right, arm material front, arm material side, leg material front, leg material side, boot material, shoulder armor material, glowing shard accent material, and compact gear/belt material. Scene/backdrop: a perfectly square flat texture sheet only; no environment; every panel fills its assigned cell. Subject: an original rugged voxel-world explorer outfit, friendly and adventurous, not based on any existing game character. Style/medium: hand-painted stylized low-poly game texture, crisp flat orthographic material panels, controlled painterly detail, suitable for UV mapping onto cubes and rectangular prisms. Composition/framing: exact 4-by-4 grid, sixteen equally sized cells aligned edge-to-edge, viewed perfectly straight-on with zero perspective, each region centered and readable at small size. Lighting/mood: baked-lighting-free albedo-like textures, minimal directional shading, adventurous mystical mood. Color palette: deep moss green cloth, charcoal leather, muted aged copper hardware, small cyan-to-violet magical shard glow accents. Materials/textures: woven moss cloth, worn charcoal leather, softly oxidized copper, dark boots, crystalline cyan-violet accents; coherent scale across every cell. Constraints: exactly one square atlas image; exactly 4 columns and 4 rows; clean cell boundaries; all panels seamless enough at their outer edges for box-model UV use; face stays entirely within its cell; no overlapping parts; no perspective; no cast shadows; no external margin; no transparency required. Avoid: text, letters, numbers, labels, logos, watermarks, Minecraft branding, copied Minecraft skin layout, recognizable copyrighted characters, scenery, mockup presentation, paper texture, grid lines thicker than one pixel, ornate micro-detail, photorealism.

## Wildfront Mossback atlas v1

- Created: August 15, 2026
- Method: ChatGPT built-in image generation, then atlas slicing into four production materials
- Source: `shardstead-mossback-atlas-v1.png`, 1254 × 1254
- Production assets: `public/creatures/mossback-moss.png`, `mossback-hide.png`, `mossback-face.png`, and `mossback-feet.png`

### Exact generation prompt

> Use case: stylized-concept. Asset type: production-ready square texture atlas for a browser-based low-poly voxel game. Primary request: Create one original 2-by-2 texture atlas for a small creature named the Mossback. The canvas must be divided into four equal, perfectly aligned square quadrants with crisp straight boundaries and no gutters. Subject: an original non-human forest creature material set: mossy green hide/fur, warm tan underside, dark charcoal-brown feet, glowing amber eyes, and tiny cyan mineral shard growths. Quadrant layout: top-left = seamless top/body moss texture; top-right = seamless side hide texture with subtle moss-to-tan transition; bottom-left = flat face texture with two symmetrical amber eyes and a simple original creature muzzle pattern; bottom-right = shard-and-feet material tile combining tiny cyan crystal growth markings with dark foot material. Style/medium: flat orthographic hand-painted voxel-game texture tiles, clean low-resolution-inspired shapes, readable color blocking, mild natural variation, production game asset rather than a rendered creature. Composition/framing: exact square canvas, exact 2x2 grid, each tile front-facing and edge-to-edge, no perspective, no objects protruding across quadrant boundaries. Lighting/mood: neutral even diffuse lighting baked minimally into the textures. Color palette: moss green, olive, warm tan, charcoal brown, amber, restrained luminous cyan. Constraints: original design; tiles should work when mapped onto simple low-poly boxes; seamless or near-seamless material quadrants; crisp atlas alignment; no perspective scene; no full creature; no environment; no text; no letters; no numbers; no logo; no watermark; do not imitate or reproduce any Minecraft animal, mob, or texture. Avoid: photorealism, dramatic shadows, bevelled presentation, mockup frames, visible grid labels, borders, gutters, texture bleeding between quadrants.

## Wildfront control icon atlas v1

- Created: August 15, 2026
- Method: ChatGPT built-in image generation with transparent output, then atlas slicing
- Source: `shardstead-control-icons-v1.png`, 1254 × 1254
- Production assets: `public/ui/mine.png`, `place.png`, `jump.png`, and `camera.png`

### Exact generation prompt

> Use case: stylized-concept. Asset type: production game UI control-icon atlas for Shardstead. Primary request: Create exactly one square 2-by-2 icon atlas containing exactly four original game-control glyphs, one centered in each equal quadrant: top-left: a single diagonal pickaxe in mid-swing for mine/attack; top-right: two neatly stacked cubic blocks with one small plus symbol for place/build; bottom-left: one sturdy boot beneath a single bold upward arrow for jump; bottom-right: one simplified adventurer bust with one clean orbiting camera arc for camera mode. Scene/backdrop: one perfectly uniform flat near-black solid background (#070b12 appearance), easy to crop and remove; no texture, gradient, vignette, panel, frame, or divider lines. Style/medium: polished hand-painted fantasy survival-game UI glyphs; carved rune-metal material; chunky, readable silhouettes; pale ivory metal with restrained mint-cyan edge highlights and tiny cyan rune accents; subtle controlled internal shading only. Composition/framing: exact 2x2 grid logic; every glyph centered in its quadrant; generous equal padding from quadrant edges and center axes; equal apparent visual weight and scale; no overlap across quadrants. Constraints: exactly four glyphs and no extras; crisp isolated silhouettes; consistent perspective, material, stroke weight, lighting, and detail; readable at 64 pixels; original designs only; no text; no words; no letters; no numbers; no branding; no logo; no watermark; no overall atlas border; no quadrant borders; no copyrighted or recognizable game icon designs; do not imitate Minecraft icons. Avoid: realistic scene, hands, people beyond the simplified bust, duplicate tools, additional symbols, decorative particles, glow spilling far from glyph edges, drop shadows extending into adjacent quadrants.

# Shardstead Master Development Plan

## Document control

| Field | Value |
| --- | --- |
| Project | Shardstead |
| Document | Master game design and production plan |
| Plan version | 0.2 |
| Status | Pre-production |
| Platforms | PC and mobile web browsers |
| Delivery form | Browser game and installable Progressive Web App |
| Repository | kingcanvas/chatgptprojects |
| Project folder | shardstead |
| Last major expansion | August 2026 |

This document is the current source of truth for the Shardstead concept. It combines the game vision, system design, technical direction, content pipeline, performance targets, testing strategy, and production roadmap.

Anything labeled **Approved** comes directly from the project requirements already established. Anything labeled **Proposed** is a recommended direction that can still be changed before implementation.

---

## 1. Executive summary

Shardstead is an endless 3D sandbox game about shaping a growing world. Players explore procedurally generated land, gather resources, build freely, upgrade tools and systems, and develop a central World Core. There is no required ending. Players decide whether their world becomes a peaceful home, a technical megabase, an exploration network, a survival challenge, or a mixture of all four.

The game is designed from the start for:

- PC keyboard and mouse controls
- Mobile touchscreen controls
- First-person and third-person cameras
- Adjustable visual quality and render distance
- Short visits or long-running worlds
- Single-player first, with multiplayer considered later
- Original project-specific models, textures, icons, and visual assets
- A scalable world that remains practical on phones

The first goal is not to reproduce every feature of a mature sandbox game. The first goal is a small, polished foundation that proves terrain streaming, movement, building, saving, controls, and performance on both PC and mobile.

---

## 2. One-sentence pitch

Explore an endless world of fractured lands, build anywhere, and awaken a World Core that changes what your world can become.

## 3. Player promise

Every session should let the player do at least one of the following:

- Create something that remains in the world
- Discover something they have not seen before
- Improve a tool, ability, route, machine, or settlement
- Solve a self-chosen problem
- Prepare for a larger personal goal

The game should avoid forcing players into a single correct play style.

---

## 4. Approved requirements

The following requirements are already approved:

- The game name is Shardstead.
- The repository folder is **shardstead**.
- The game is a 3D sandbox.
- The world should support effectively endless play.
- Players should have broad freedom similar to the feeling of open sandbox games.
- Building and upgrades are central.
- PC and mobile are both first-class targets.
- PC must support an F5-style camera switch.
- Mobile must provide an equivalent on-screen camera switch.
- Graphics must include lower-performance and higher-quality options.
- Render distance and other expensive effects must be adjustable.
- Project-specific 3D content and images should be original creations made for Shardstead.
- The project begins with planning before full production.

---

## 5. Design pillars

### 5.1 Freedom with understandable rules

The player should be able to experiment freely, but the world must behave consistently. Materials, tools, machines, creatures, and environmental effects should follow rules the player can learn.

### 5.2 A world worth keeping

Saving must be reliable. Structures and discoveries must feel permanent. Updates should protect existing worlds whenever technically possible.

### 5.3 Progress without a forced ending

Progression should unlock possibilities instead of only increasing numbers. A higher level should give the player new ways to build, travel, automate, or explore.

### 5.4 Comfortable on every supported device

The game must be playable with a mouse and keyboard or touchscreen. Mobile is not a reduced afterthought. Performance settings, UI scale, safe areas, and touch ergonomics must be planned from the beginning.

### 5.5 Recognizable visual identity

Shardstead should not copy Minecraft models, textures, interface art, sounds, or branding. The World Core, glowing rifts, land shards, color language, silhouettes, and original materials should make screenshots recognizable as Shardstead.

### 5.6 Build the foundation before the content mountain

Terrain generation, controls, saving, performance, and building must be stable before large numbers of biomes, creatures, recipes, and decorations are added.

---

## 6. Target audience

### Primary audience

- Players who enjoy building and improving persistent worlds
- Players who enjoy exploration without a strict campaign
- Players who want a sandbox they can open quickly on a phone or PC
- Players who enjoy collecting, crafting, farming, or automation

### Secondary audience

- Creative builders who prefer no survival pressure
- Technical players who enjoy efficient machines and resource networks
- Completion-focused players who want discoveries and collections
- Friends who may eventually want shared worlds

### Age and complexity direction

**Proposed:** Keep the basic actions understandable for younger and casual players while allowing deeper optional systems for experienced players. The interface should explain the next useful action without prescribing a single goal.

---

## 7. Proposed game modes

Game modes allow different players to enjoy the same world systems without making every mechanic mandatory.

### 7.1 Journey mode

The proposed default mode.

- Normal gathering and crafting
- Environmental hazards
- Optional combat areas
- Forgiving recovery after defeat
- World Core progression
- Balanced building and exploration

### 7.2 Peaceful mode

- No hostile creature attacks
- Environmental danger reduced
- Full building, crafting, farming, exploration, and progression
- Rare combat materials available through alternate methods

### 7.3 Survival mode

- Stronger hazards and creatures
- More demanding resource management
- Optional hunger or energy systems
- More meaningful preparation and recovery
- Same building freedom, but higher risk

### 7.4 Creative mode

- Unlimited materials
- Flight
- Instant placement and removal
- Time and weather controls
- Full building catalog
- Optional structure export later

### 7.5 Custom mode

**Later feature.** Players can combine settings such as creature aggression, resource abundance, fall damage, time speed, keep-inventory behavior, and building restrictions.

---

## 8. Core gameplay loops

### 8.1 Thirty-second loop

1. Observe the nearby world.
2. Move, look, jump, or interact.
3. Gather, place, remove, or use an object.
4. Receive immediate visual and audio feedback.

### 8.2 Five-minute loop

1. Choose a small goal.
2. Gather nearby resources.
3. Craft, build, explore, or upgrade.
4. Save visible progress in the world.

Examples:

- Finish a wall
- Craft a better tool
- Reach a nearby ridge
- Plant a crop
- Repair a bridge
- Add storage

### 8.3 Thirty-minute loop

1. Prepare equipment and supplies.
2. Travel into a new area.
3. Discover materials, ruins, creatures, or a rift.
4. Return or establish an outpost.
5. Upgrade the home base or World Core.

### 8.4 Long-term loop

1. Expand the World Core.
2. Unlock new world possibilities.
3. Connect distant regions.
4. Build specialized settlements and infrastructure.
5. Pursue player-created megaprojects.

---

## 9. Player-created goals

Shardstead should support goals without requiring a quest marker.

Examples:

- Build a cliffside home
- Create a farming village
- Connect two shards with a bridge
- Collect every known material
- Map an entire region
- Create an automated resource line
- Restore an ancient ruin
- Build a railway or portal network
- Defeat a dangerous rift creature
- Reach the highest visible shard
- Build a city around the World Core

The game can suggest possibilities through discoveries, progression previews, and achievements, but it should not punish players for ignoring them.

---

## 10. World premise

**Proposed fiction:** The world was once connected by an ancient network of living cores. A mysterious fracture separated distant lands and created glowing rifts between them. The player discovers a dormant World Core and gradually restores its ability to stabilize terrain, open paths, and reveal new materials.

The story should remain light enough that players can invent their own world identity.

### Narrative principles

- Lore is discovered through places and objects rather than long forced scenes.
- The player remains free during most narrative moments.
- Ruins tell stories through layout, damage, tools, symbols, and stored items.
- No final story mission should permanently end the world.
- Large discoveries should unlock sandbox possibilities.

---

## 11. World structure

The world is divided into streamed regions built from smaller chunks.

### 11.1 Starting region

The starting region should include:

- A safe spawn area
- A dormant World Core
- Basic wood, stone, soil, and plant resources
- Water
- A visible landmark
- One shallow cave
- One small ruin or discovery
- Enough flat or gently sloped space to build

### 11.2 Main land

Large connected terrain supports normal travel, settlement building, farming, and caves.

### 11.3 Land shards

Land shards are unusual separated formations that can:

- Float above the world
- Appear beyond rifts
- Contain rare terrain rules
- Hold unique resources
- Encourage bridge, glider, portal, or climbing solutions

### 11.4 Rifts

Rifts are both visual identity and gameplay infrastructure.

Possible functions:

- Travel between distant places
- Unlock new biome families
- Trigger local weather or gravity changes
- Spawn temporary world events
- Reveal rare materials
- Connect player-built transport networks

### 11.5 World boundaries

The world should feel endless through deterministic generation. Technical limits may exist, but ordinary players should not encounter a visible wall during expected play.

---

## 12. Procedural generation plan

### 12.1 Deterministic seed

Each world has a seed that reproduces untouched terrain. Only player modifications and dynamic state need to be saved.

### 12.2 Chunk streaming

The engine should:

- Generate chunks around the player
- Prioritize chunks in the viewing direction
- Load nearby collision before distant decoration
- Unload chunks outside the active radius
- Keep recently visited chunks in a limited cache
- Save modified chunks before unloading
- Cancel obsolete generation work when the player changes direction

### 12.3 Generation stages

1. Seed and coordinate setup
2. Base elevation and large landforms
3. Biome selection
4. Surface material layers
5. Caves and underground spaces
6. Water and environmental features
7. Resource distribution
8. Vegetation and static decoration
9. Ruins and points of interest
10. Creature spawn zones
11. Navigation and collision preparation

### 12.4 Provisional chunk values

Exact numbers require device testing.

| Value | Initial experiment |
| --- | --- |
| Horizontal chunk width | 16 or 24 world units |
| Active vertical range | Variable by terrain profile |
| Mobile render radius | 3 to 6 chunks |
| PC render radius | 6 to 16 chunks |
| Collision radius | Smaller than visual radius when safe |
| Save granularity | Modified chunk plus entity records |

These are benchmark starting points, not permanent promises.

### 12.5 Generation quality requirements

- Starting locations must be playable.
- Required early resources must exist within a reasonable distance.
- Terrain should avoid excessive narrow spikes unless biome-specific.
- Caves must not destroy every usable building area.
- Points of interest must respect terrain and avoid impossible overlap.
- Different seeds should create meaningfully different worlds.

---

## 13. Proposed biome catalog

The first release should not attempt all biomes. This catalog defines long-term possibilities.

### 13.1 Greenreach

Proposed first biome.

- Rolling grassland
- Mixed trees
- Streams and ponds
- Stone outcrops
- Gentle weather
- Common starter resources

Purpose: Safe building, onboarding, and performance baseline.

### 13.2 Emberstep

- Warm red stone
- Dry grasses
- Canyons
- Heat vents
- Metal-rich caves
- Sparse shade

Purpose: Advanced metals and vertical exploration.

### 13.3 Frostveil

- Snow layers
- Ice formations
- Frozen lakes
- Strong wind
- Crystal caves
- Limited farming without preparation

Purpose: Weather preparation and rare crystals.

### 13.4 Mirelight

- Wetlands
- Giant roots
- Shallow water
- Fog
- Glowing plants
- Soft ground

Purpose: Alchemy materials, water travel, and unusual visibility.

### 13.5 Ashen Crown

- Volcanic rock
- Lava channels
- Ash weather
- High-value ores
- Dangerous heat zones

Purpose: Late-game materials and industrial power.

### 13.6 Skygarden shards

- Floating islands
- Large flowers
- Light materials
- Strong air currents
- Unique flying creatures

Purpose: Gliding, aerial building, and rare lightweight components.

### 13.7 Deepglass caverns

- Underground crystal structures
- Reflective minerals
- Low natural light
- Ancient machinery
- Large cave chambers

Purpose: Advanced energy systems and exploration danger.

### 13.8 Riftwild

- Unstable terrain
- Color-shifting sky
- Mixed biome fragments
- Temporary paths
- Rare core materials

Purpose: High-risk world events and major upgrades.

---

## 14. Terrain materials

Material categories should define behavior, not only appearance.

### Natural solids

- Soil
- Clay
- Sand
- Gravel
- Stone families
- Ore-bearing rock
- Ice
- Volcanic material

### Organic materials

- Wood families
- Bark
- Leaves
- Fibers
- Crops
- Fungi
- Resin

### Crafted materials

- Planks
- Bricks
- Glass
- Metal plates
- Reinforced stone
- Fabric
- Composite panels

### Core materials

- Rift crystal
- Stabilized shard
- Core alloy
- Charged glass
- Ancient components

### Material properties

Possible properties:

- Strength
- Tool requirement
- Weight
- Flammability
- Transparency
- Light emission
- Conductivity
- Weather resistance
- Sound profile
- Crafting value

Only properties used by real systems should be exposed to players.

---

## 15. World Core system

The World Core is the central progression system and visual landmark.

### 15.1 Core functions

- Marks the primary home location
- Saves world progression
- Unlocks new recipes and systems
- Stabilizes nearby rifts
- Provides previews of future upgrades
- Acts as an optional fast-travel anchor
- Changes appearance as it grows

### 15.2 Proposed Core tiers

#### Tier 0: Dormant

- Basic shelter and gathering
- Core discovery sequence
- Limited interface

#### Tier 1: Spark

- Basic crafting station
- Local map
- First storage upgrade
- One nearby rift signal

#### Tier 2: Anchor

- Stable portal to one discovered region
- Improved tools
- Basic farming support
- Building material scanner

#### Tier 3: Network

- Multiple travel anchors
- Automation components
- Weather prediction
- Larger map tools

#### Tier 4: Resonance

- Rare shard access
- Advanced transportation
- Environmental control in a limited radius
- Specialized Core modules

#### Tier 5: Shardstead

- Player-defined Core specialization
- Large-scale transport network
- Endgame building materials
- Ongoing world events rather than a final ending

### 15.3 Core specialization

**Proposed later feature:** The Core can emphasize one area without permanently locking out others.

- Builder path
- Explorer path
- Engineer path
- Cultivator path
- Guardian path

Specializations provide convenience and style, not mandatory class restrictions.

---

## 16. Progression philosophy

Progression should unlock verbs.

Weak progression:

- Tool does five percent more damage.

Stronger progression:

- Tool can shape a larger area.
- Glider allows crossing a canyon.
- Core upgrade reveals hidden rifts.
- New material allows moving platforms.
- Better map allows player markers and route planning.

### Progression layers

- Knowledge: Discover recipes and world information
- Equipment: Improve gathering and survival
- Construction: Unlock new building forms and materials
- Mobility: Reach new terrain
- Core: Expand world access and systems
- Infrastructure: Automate repeated work
- Expression: Unlock cosmetic and decorative options

---

## 17. Gathering and tool plan

### Tool families

- Hand or basic interaction
- Cutting tool
- Mining tool
- Digging tool
- Farming tool
- Construction tool
- Survey or scanning tool
- Core tool

### Tool upgrade dimensions

- Material tier
- Durability
- Action speed
- Area of effect
- Precision mode
- Special material interaction
- Optional module slot

### Tool feel requirements

- Immediate animation
- Clear target highlight
- Impact sound tied to material
- Small particles appropriate to quality settings
- Progress feedback for slow actions
- No accidental destruction through interface taps
- Mobile aim assistance that does not feel automatic

---

## 18. Building system

Building is a primary feature and must feel reliable before large content expansion.

### 18.1 Placement requirements

- Clear placement preview
- Valid and invalid placement colors
- Snap options
- Rotation controls
- Undo for recent creative-mode actions
- Protection against placing inside the player
- Touch-friendly distance and aim tolerance
- Consistent placement rules across devices

### 18.2 Building scales

- Terrain pieces
- Structural pieces
- Functional objects
- Decorations
- Machines
- Roads and transport

### 18.3 Structural approach

**Proposed:** Do not require realistic structural collapse in the first versions. Builders should not lose creations because of an unclear physics rule. Optional advanced structural systems can be evaluated later.

### 18.4 Shape library

Long-term pieces may include:

- Full block
- Half block
- Slab
- Stair
- Ramp
- Pillar
- Beam
- Wall
- Fence
- Door
- Window
- Roof family
- Curved decorative pieces

The first milestone only needs a small set that proves placement, collision, saving, and mobile controls.

### 18.5 Build modes

- Standard single placement
- Replace mode
- Paint or material swap
- Line placement
- Area placement
- Copy pattern
- Blueprint projection

Advanced modes are later features and must respect survival resource costs.

---

## 19. Crafting

### Crafting goals

- Recipes should be understandable.
- Common building should not require excessive menu time.
- The player should see why a recipe is locked.
- Mobile crafting should not require tiny drag targets.

### Crafting layers

1. Hand crafting
2. Basic workbench
3. Material processing
4. Specialized stations
5. Automated production
6. Core-assisted fabrication

### Recipe discovery

Proposed methods:

- Automatically learn simple recipes when finding key materials
- Discover advanced recipes in ruins
- Unlock Core recipes through upgrades
- Allow experimentation at selected stations
- Display missing ingredients without exposing undiscovered secrets

---

## 20. Inventory and storage

### Inventory goals

- Fast access to frequently used items
- Low friction on touchscreen
- Clear stacking rules
- Search and filters in large storage
- Protection against accidental deletion

### Proposed player inventory

- Hotbar
- Main backpack
- Equipment slots
- Tool slots
- Optional quick-access utility slot

### Storage progression

- Personal backpack upgrades
- Chests and cabinets
- Labeled storage
- Linked local storage
- Machine input and output containers
- Core network storage as a late-game convenience

### Sorting features

- Sort by type
- Sort by name
- Sort by quantity
- Favorites
- Lock item
- Quick transfer
- Deposit matching items

---

## 21. Movement and traversal

### Basic movement

- Walk
- Sprint
- Jump
- Crouch
- Swim
- Climb selected surfaces or ladders

### Advanced movement

- Glider
- Grapple tool
- Zipline
- Mine cart or rail
- Boat
- Rift travel
- Elevators and moving platforms

### Movement principles

- Movement must remain responsive at unstable mobile frame rates.
- Camera motion options must be adjustable.
- Fall risk should be readable.
- Advanced movement should open building possibilities.
- Touch controls should use forgiving jump and interaction zones.

---

## 22. Camera system

### PC camera cycle

F5 cycles:

1. First-person
2. Third-person behind
3. Third-person front

### Mobile camera cycle

An on-screen camera button performs the same cycle.

### Camera settings

- Field of view
- Look sensitivity
- Invert vertical look
- View bobbing
- Camera shake
- Third-person distance
- Third-person collision behavior
- Aim acceleration for touch

### Camera quality requirements

- Third-person camera should move inward when blocked by terrain.
- Camera changes should preserve player direction.
- Touch look must not activate while using UI controls.
- First-person held items should not block important targets.
- Photo mode may be considered later.

---

## 23. Survival and player condition

**Proposed direction:** Keep the default Journey mode focused on exploration and creation rather than constant meter maintenance.

Possible condition systems:

- Health
- Stamina or exertion
- Temperature in extreme biomes
- Breath underwater
- Temporary environmental effects

Hunger should be optional or slow-moving unless Survival mode is selected.

### Defeat and recovery

Proposed Journey behavior:

- Respawn at the World Core or a bed
- Keep essential tools
- Drop a recoverable pack containing ordinary items
- Mark the recovery location
- Prevent the pack from disappearing quickly

Creative and Peaceful modes can remove item loss.

---

## 24. Creatures

Creature design should support the world rather than exist only as combat targets.

### Creature roles

- Ambient wildlife
- Farmable creature
- Curious scavenger
- Territorial defender
- Predator
- Rift creature
- Large world-event creature

### Creature behavior goals

- Readable silhouettes
- Clear idle, alert, and attack states
- Limited pathfinding cost on mobile
- Spawn rules tied to biome and time
- Despawn or sleep rules outside active range
- No spawning inside protected player structures

### Initial creature scope

The first playable milestone does not require creatures. The first creature prototype should prove:

- Spawn and despawn
- Basic navigation
- Simple interaction
- Animation budget
- Save behavior when needed

---

## 25. Combat

Combat is proposed as optional in Peaceful mode and present in Journey or Survival.

### Combat principles

- Clear hit feedback
- Avoid tiny mobile targets
- No pay-to-win design
- Preparation and positioning matter
- Combat should not dominate building progression
- Enemy drops should have non-combat alternatives in Peaceful mode

### Possible equipment

- Melee tool or weapon
- Shield or guard tool
- Ranged tool
- Throwable utility
- Core-powered defensive device

### Mobile considerations

- Optional target assistance
- Large attack button
- Context-sensitive interact versus attack
- Adjustable button positions
- Avoid mandatory rapid multi-finger combinations

---

## 26. Farming and ecology

### Farming loop

1. Find seed or plant sample.
2. Prepare suitable ground.
3. Plant and maintain.
4. Harvest.
5. Use food, fiber, decoration, or crafting material.
6. Improve irrigation, protection, or automation.

### Environmental factors

- Soil type
- Water access
- Light
- Temperature
- Growth time
- Optional fertilizer

The first farming system should be simple and reliable. Complex genetics or seasonal simulation can be added only after the core loop is enjoyable.

### Ecology rules

- Renewable resources must exist.
- Trees and plants should regrow under understandable conditions.
- Aggressive harvesting should not permanently ruin a world without recovery options.
- Creature populations should use capped local budgets.

---

## 27. Automation and engineering

Automation is a long-term progression path.

### Proposed automation stages

#### Stage 1: Convenience

- Hopper or item transfer
- Simple switch
- Storage filters
- Basic processing station

#### Stage 2: Production

- Powered machines
- Conveyors or transfer pipes
- Automatic farming tools
- Resource processing chains

#### Stage 3: Logistics

- Long-distance transport
- Rail systems
- Core-linked storage
- Automated routing

#### Stage 4: World infrastructure

- Rift-powered networks
- Environmental controls
- Large moving structures if technically feasible

### Engineering principles

- Systems should be visible and debuggable.
- Players should understand why a machine stopped.
- Mobile interfaces must avoid dense unreadable wiring.
- Automation should reduce repeated work without making exploration meaningless.

---

## 28. Exploration and discovery

### Discovery types

- New biome
- Landmark
- Ruin
- Cave system
- Resource family
- Creature
- Rift
- Core fragment
- Environmental event

### Map progression

- Local unexplored fog
- Player markers
- Named locations
- Shared markers in future multiplayer
- Route lines
- Core signal hints
- Optional coordinates

### Points of interest

Points of interest should provide at least two of:

- Visual story
- Useful shelter
- Unique resource
- Recipe or knowledge
- Traversal challenge
- Building inspiration
- Connection to the World Core

---

## 29. Events and replayability

Events create change without ending the world.

### Possible local events

- Heavy storm
- Falling shard fragments
- Temporary rift opening
- Creature migration
- Crystal bloom
- Traveling merchant
- Ancient machine awakening

### Event rules

- Events should be announced clearly.
- Critical player structures should not be destroyed without opt-in risk.
- Events must scale to active device performance.
- Players should be able to ignore most events.
- Rewards should support multiple play styles.

---

## 30. Objectives, achievements, and collections

Objectives should teach or inspire rather than control the game.

### Objective categories

- First steps
- Building
- Exploration
- Farming
- Engineering
- Core progression
- Creature discovery
- Creative challenges

### Collections

- Material catalog
- Creature journal
- Biome atlas
- Ruin records
- Building set collection
- Core history fragments

Achievements should not require destructive or unhealthy play patterns.

---

## 31. Character and customization

### Character goals

- Read clearly in third-person
- Support original silhouette and animations
- Work at mobile rendering budgets
- Allow personal identity without affecting power

### Proposed customization

- Body preset
- Skin colors
- Hair or head style
- Outfit colors
- Backpack appearance
- Core emblem
- Cosmetic accessories

Character customization should use original Shardstead assets and avoid copying recognizable designs from other games.

---

## 32. PC controls

Default mapping is provisional and must be rebindable.

| Action | Proposed default |
| --- | --- |
| Move | WASD |
| Jump | Space |
| Sprint | Left Shift |
| Crouch | Left Control |
| Look | Mouse |
| Primary action | Left mouse |
| Secondary action | Right mouse |
| Hotbar selection | Number keys or mouse wheel |
| Inventory | E |
| Map | M |
| Camera cycle | F5 |
| Pause/settings | Escape |
| Drop item | Q with confirmation protection option |

### PC requirements

- Full key rebinding
- Mouse sensitivity
- Raw input evaluation
- Controller support considered after keyboard and touch are stable
- Browser shortcuts must be handled carefully

---

## 33. Mobile controls

### Proposed landscape layout

- Left thumb movement control
- Right-side swipe camera area
- Jump button
- Primary action button
- Secondary or context action button
- Hotbar
- Camera cycle button
- Inventory button
- Pause button

### Touch options

- Fixed or floating movement control
- Button size
- Button opacity
- Button position customization
- Camera sensitivity
- Aim acceleration
- Left-handed preset
- Tap or hold action behavior
- Haptic feedback toggle where supported

### Touch conflict rules

- UI touches never rotate the camera.
- Multi-touch must not cancel held movement unexpectedly.
- Opening a menu releases movement state.
- Edge gestures must respect device safe areas.
- Important actions require sufficiently large targets.

---

## 34. User interface structure

### In-game HUD

- Crosshair or target marker
- Hotbar
- Health or condition indicators when relevant
- Context action text
- Selected item
- Optional performance display

### Main menus

- Continue
- Worlds
- Create world
- Settings
- Character
- Credits
- Privacy and data

### World creation

- World name
- Seed
- Game mode
- Difficulty options
- Starting biome option if unlocked
- Experimental features warning

### Inventory interface

- Large touch targets
- Search when catalog becomes large
- Category filters
- Clear selected item panel
- Quick transfer
- Recipe access

### Settings groups

- Graphics
- Controls
- Audio
- Accessibility
- Gameplay
- Language
- Data and storage

---

## 35. Onboarding

Onboarding should teach through play.

### First ten minutes

1. Look and move.
2. Approach the dormant World Core.
3. Gather one basic material.
4. Craft or receive a basic tool.
5. Place and remove a world piece.
6. Activate the first Core function.
7. Choose a self-directed next step.

### Onboarding rules

- No long unskippable tutorial.
- Instructions disappear after demonstrated success.
- Players can reopen help.
- PC and mobile prompts use the correct control symbols.
- Returning players can skip the introduction.
- Creative mode gets a shorter building-focused introduction.

---

## 36. Accessibility

Accessibility is part of the foundation.

### Visual

- UI scale
- Text scale
- High-contrast interface mode
- Colorblind-safe status indicators
- Avoid color-only information
- Reduced flashing
- Adjustable screen shake
- Adjustable camera bobbing
- Subtitle and caption support

### Motor

- Full PC remapping
- Touch layout customization
- Hold versus toggle options
- Sprint toggle
- Crouch toggle
- Interaction aim assistance
- Adjustable timing for hold actions

### Cognitive

- Clear language
- Consistent icons
- Optional objective hints
- Recipe search
- Pause in single-player
- Confirmation for destructive actions

### Audio

- Separate volume categories
- Visual indicators for important off-screen events
- Captions for meaningful creature and environmental sounds

---

## 37. Visual direction

### Proposed style

A clean stylized 3D world that combines readable constructed shapes with softer terrain details. It may use voxel-inspired modularity without copying Minecraft's texture resolution, proportions, creatures, interface, or exact block language.

### Signature elements

- Purple and pink rift energy
- Cool blue-white Core light
- Dark stone and warm natural materials
- Strong silhouettes
- Soft atmospheric distance
- Glowing cracks and suspended particles around rifts

### Readability rules

- Interactive objects have recognizable silhouettes.
- Dangerous materials use shape and motion, not color alone.
- Resource families remain distinguishable on small phone screens.
- Decorative detail must not hide placement boundaries.
- Low settings preserve gameplay information.

---

## 38. Original asset policy

All project-specific creative content should be made specifically for Shardstead.

### Included asset types

- 3D models
- Character parts
- Creatures
- Plants
- Building pieces
- Tools
- Machines
- Textures and material maps
- Interface icons
- Logos and promotional images
- Particle textures
- Animations

### Allowed technical dependencies

Third-party code libraries may be used when:

- Their license is compatible
- The license and attribution are recorded
- They do not provide Shardstead's creative identity
- They pass security and maintenance review

### Disallowed content practices

- Copying models or textures from another game
- Tracing another game's interface
- Using unverified assets from random downloads
- Including assets without a documented source and license
- Shipping generated content without visual review

### Asset review checklist

- Original appearance
- Correct scale
- Mobile-friendly geometry
- Clean UVs when used
- Correct material setup
- Naming convention
- Collision representation
- Level-of-detail plan if needed
- Tested under all graphics presets

---

## 39. Asset production pipeline

### 39.1 Concept

- Define gameplay purpose
- Create visual description
- Establish silhouette
- Confirm originality

### 39.2 Model

- Build low-complexity base
- Use modular reuse where appropriate
- Create collision shape
- Prepare level-of-detail variants when required

### 39.3 Material

- Create original color and surface data
- Test lighting range
- Confirm compression quality
- Verify low settings

### 39.4 Integration

- Export to a web-friendly format
- Validate scale and orientation
- Assign metadata
- Add to asset registry
- Test memory and draw cost

### 39.5 Review

- Inspect on PC
- Inspect on at least one phone
- Verify visual identity
- Verify performance
- Approve before release content

---

## 40. Animation plan

### Character animation groups

- Idle
- Walk
- Run
- Jump
- Fall
- Land
- Crouch
- Swim
- Use tool
- Place object
- Take damage

### Creature animation groups

- Idle
- Move
- Alert
- Interaction
- Attack where relevant
- Defeat or escape

### Animation principles

- Gameplay state drives animation.
- Important timing remains readable at low frame rates.
- Mobile may reduce secondary animation without changing rules.
- First-person and third-person actions should agree.
- Animation blending should not delay controls.

---

## 41. Audio direction

Audio should make materials and spaces understandable.

### Audio categories

- Interface
- Footsteps
- Tools and impacts
- Building placement
- Weather
- Water
- Creatures
- Machines
- World Core
- Rift ambience
- Music

### Dynamic audio goals

- Footsteps reflect surface material.
- Enclosed caves sound different from open fields.
- The Core gains layers as it upgrades.
- Machines communicate operating or blocked states.
- Important off-screen sounds can be captioned.

Audio scope should remain modest until the visual and gameplay foundation is stable.

---

## 42. Rendering architecture goals

The renderer must support scalable quality rather than one fixed visual target.

### Core rendering features

- WebGL-compatible fallback
- WebGPU evaluation where stable and supported
- Frustum culling
- Chunk mesh batching
- Instancing for repeated props
- Texture atlasing or arrays where appropriate
- Level-of-detail for distant objects
- Fog or atmosphere to hide streaming transitions
- Configurable shadows
- Configurable particles
- Resolution scaling

### Rendering rules

- Gameplay collision does not depend on decorative detail.
- Low settings must remain visually coherent.
- High settings improve atmosphere without changing competitive information.
- Shader complexity must be measured on real phones.
- Transparent materials require strict budgets.

---

## 43. Graphics settings

### Presets

| Setting | Auto | Low | Medium | High |
| --- | --- | --- | --- | --- |
| Resolution scale | Adaptive | 60–75% | 80–90% | 100% |
| Render distance | Device-based | Short | Medium | Long |
| Shadow distance | Adaptive | Off or very short | Medium | Long |
| Shadow resolution | Adaptive | Low | Medium | High |
| Particles | Adaptive | Reduced | Standard | Full |
| Vegetation density | Adaptive | Reduced | Standard | Full |
| Water quality | Adaptive | Basic | Standard | Enhanced |
| Lighting effects | Adaptive | Basic | Balanced | Enhanced |
| Geometry detail | Adaptive | Simplified | Standard | Detailed |
| Post-processing | Adaptive | Off or minimal | Limited | Full |

### Individual settings

- Render distance
- Resolution scale
- Frame-rate limit
- Shadow quality
- Shadow distance
- Particle amount
- Vegetation density
- Water quality
- Ambient effects
- Anti-aliasing option
- Field of view
- Camera motion

### Auto mode behavior

Auto mode should:

1. Start from a conservative device estimate.
2. Observe sustained frame time.
3. Reduce expensive settings gradually if the target is missed.
4. Increase quality slowly after stable performance.
5. Avoid visible quality changes every few seconds.
6. Preserve the player's manual overrides.

---

## 44. Performance targets

### Frame-rate targets

- Mobile baseline: stable 30 FPS
- Capable mobile devices: optional 60 FPS
- Typical PC: 60 FPS
- Background or unfocused tab: reduce work

### Frame-time targets

| Target | Approximate frame budget |
| --- | --- |
| 30 FPS | 33.3 ms |
| 60 FPS | 16.7 ms |

Generation, simulation, rendering, input, and interface work must fit inside the selected budget.

### Provisional mobile budgets

- Keep active dynamic creature counts capped.
- Avoid unbounded particle emitters.
- Limit shadow-casting lights.
- Use pooled temporary objects.
- Keep texture resolution appropriate to screen size.
- Stream large content instead of loading everything.
- Monitor memory after long travel sessions.

### Performance test scenes

- Empty starting field
- Dense forest
- Large player building
- Cave with multiple lights
- Rain or particle event
- Several machines
- Fast movement across chunk boundaries
- Long session with repeated exploration

---

## 45. Heat, battery, and mobile stability

Mobile performance is not only frame rate.

### Mobile goals

- Avoid sustained maximum GPU use when 30 FPS is selected.
- Reduce rendering when menus cover the world.
- Pause or lower simulation when the app is backgrounded.
- Save before expected suspension points.
- Recover safely after the browser discards the page.
- Expose a battery-saver preset.
- Avoid excessive network use in single-player.

### Mobile quality warnings

High settings may display a warning on devices that cannot sustain them. The player may still override the recommendation.

---

## 46. Technology evaluation

The final browser 3D stack should be selected through a prototype, not preference alone.

### Candidate requirements

- TypeScript support
- PC and mobile browser support
- Efficient custom terrain meshes
- Input abstraction
- Asset loading
- Shader customization
- WebGL fallback
- WebGPU path or future readiness
- Maintained ecosystem
- Compatible open-source license
- Practical GitHub Pages deployment

### Prototype comparison

Build the same tiny test in each serious candidate:

- One generated chunk
- First-person movement
- Third-person camera
- Touch controls
- Block placement
- Basic lighting
- Save one modification
- Graphics preset switch

Measure:

- Bundle size
- Startup time
- Mobile frame time
- Memory
- Development complexity
- Debugging quality

### Decision rule

Choose the simplest stack that meets the measured requirements. Do not choose a heavier framework only for features that the first year of development will not use.

---

## 47. Proposed code architecture

### Major modules

- Application bootstrap
- Game state
- Input
- Camera
- Player controller
- World seed
- Chunk generation
- Chunk streaming
- Meshing
- Materials
- Physics and collision
- Interaction
- Inventory
- Crafting
- Building
- World Core
- Creatures
- Audio
- UI
- Settings
- Saving
- Diagnostics

### Architecture principles

- Simulation state should not depend directly on UI components.
- Save data should use explicit versioned schemas.
- Platform input should map to shared game actions.
- Content should be data-driven where possible.
- Rendering detail should not change simulation outcomes.
- Systems should expose diagnostic counters.

---

## 48. Data-driven content

Materials, items, recipes, creatures, and settings should use validated data definitions.

### Material definition fields

- Identifier
- Display name key
- Category
- Visual material
- Collision behavior
- Tool requirement
- Sound family
- Drops
- Tags

### Item definition fields

- Identifier
- Display name key
- Icon
- Stack size
- World model
- Use actions
- Tags

### Recipe definition fields

- Identifier
- Inputs
- Outputs
- Station
- Unlock rule
- Craft time
- Category

### Validation

Build-time checks should catch:

- Duplicate identifiers
- Missing references
- Invalid recipes
- Missing icons
- Impossible stack sizes
- Unsupported asset formats
- Circular unlock requirements

---

## 49. Input architecture

All physical inputs map to shared actions.

Example actions:

- Move vector
- Look vector
- Jump
- Sprint
- Crouch
- Primary action
- Secondary action
- Open inventory
- Open map
- Cycle camera
- Select hotbar slot

This avoids separate gameplay logic for mobile and PC.

### Input testing

- Keyboard only
- Mouse with different sensitivities
- Multi-touch
- Interrupted touch
- Orientation change
- Browser focus loss
- Rebinding conflicts
- Simultaneous movement and camera use

---

## 50. Physics and collision

### Initial needs

- Player movement collision
- Ground detection
- Step handling
- Jumping and falling
- Ray or shape queries for interaction
- Simple dynamic item motion

### Scope control

The first version should avoid:

- Fully simulated structural collapse
- Thousands of active rigid bodies
- Complex cloth
- Destructible physics debris that must be saved

Visual debris can use lightweight particles.

---

## 51. Save system

Reliable saves are a release-blocking requirement.

### Save contents

- Save format version
- World seed
- World options
- Player position and orientation
- Inventory
- Equipment
- Progression
- World Core state
- Discovered map data
- Modified chunks
- Placed functional objects
- Important dynamic entities
- Settings stored separately when appropriate

### Save strategy

- Automatic periodic save
- Save after major progression
- Save before returning to title
- Save before page unload when permitted
- Write changes in recoverable transactions
- Keep a recent backup
- Never overwrite the only valid save with invalid data

### Migration

Every save has a schema version. Updates provide migration steps from supported older versions. Destructive migrations require backup and warning.

### Corruption recovery

- Validate on load
- Fall back to backup
- Isolate corrupted chunk when possible
- Preserve the rest of the world
- Provide a diagnostic export later

---

## 52. Local storage plan

Browser storage capabilities and limits vary.

The prototype should test:

- Structured local database storage
- Large modified-world data
- Storage quota reporting
- Export world to file
- Import world from file
- Save after browser restart
- Behavior in private browsing
- Behavior when device storage is low

Players should be warned before clearing local data if it will erase worlds.

---

## 53. Future cloud saves

Cloud saves are not required for the first playable version.

If added later, requirements include:

- Explicit account system
- Conflict resolution
- Offline changes
- Version compatibility
- Privacy policy
- Data deletion controls
- Secure authentication
- Storage cost planning

Local export and import should exist even if cloud saves are later added.

---

## 54. Multiplayer future plan

Multiplayer is intentionally delayed until single-player is stable.

### Possible multiplayer forms

- Invite-only shared world
- Local or private hosted session
- Persistent small server
- Creative collaboration

### Early architectural preparation

- Use stable entity identifiers.
- Separate input intent from simulation changes.
- Keep save state serializable.
- Avoid UI-owned world state.
- Record ownership for placed functional objects if needed.

### Multiplayer requirements before implementation

- Threat model
- Server authority decision
- Anti-cheat boundaries
- Moderation tools
- Player permissions
- World backups
- Network budget
- Hosting cost
- Child safety and privacy review

No public multiplayer should launch without these foundations.

---

## 55. Privacy and safety

### First release

- No account required
- No unnecessary personal data
- No advertising trackers
- No microphone or camera access
- Clear local-storage explanation

### If analytics are introduced

- Collect only necessary technical events
- Avoid storing world content by default
- Provide disclosure
- Respect applicable consent requirements
- Do not collect precise location
- Do not sell personal data

### User-generated names

World and character names should be escaped safely when displayed or exported.

---

## 56. Security

### Browser security goals

- No secrets in client code
- Strict dependency review
- Content Security Policy evaluation
- Safe file import parsing
- Bounded save-file sizes
- Validate all data loaded from storage
- Escape user-controlled text
- Avoid arbitrary script execution from mods or saves

### Dependency process

- Record dependency purpose and license
- Pin deliberate versions
- Review security advisories
- Remove unused packages
- Avoid packages for trivial functions

---

## 57. Diagnostics

A development diagnostics overlay should display:

- FPS
- Frame time
- Loaded chunks
- Queued chunks
- Visible triangles
- Draw calls
- Texture memory estimate
- Dynamic entity count
- Save status
- Player coordinates
- Active graphics preset

Release builds can hide the overlay behind an advanced option.

### Debug commands

Development-only commands may:

- Teleport
- Change time
- Change weather
- Reload a chunk
- Spawn a test object
- Force save
- Display collision
- Simulate low graphics mode

Debug features must not remain accidentally exposed in public competitive contexts.

---

## 58. Testing strategy

### Unit tests

- Seed determinism
- Recipe validation
- Inventory stacking
- Save migration
- Settings presets
- Coordinate conversion

### Integration tests

- Generate, modify, save, unload, reload
- Place and remove structures
- Upgrade the Core
- Switch camera during movement
- Change preset while playing
- Import and export a world

### Visual tests

- UI at multiple aspect ratios
- Low versus high preset
- Day and night readability
- Material differences
- Touch safe areas

### Performance tests

- Automated benchmark route
- Long travel
- Dense construction
- Rapid chunk crossing
- Repeated save and load
- Background and resume

### Manual playtests

- New player without explanation
- Experienced builder
- Mobile-only player
- Low-end device
- Accessibility settings user

---

## 59. Device test matrix

The exact supported-device list will be established after prototypes.

### Minimum matrix categories

- Recent iPhone
- Older supported iPhone
- Recent Android phone
- Mid-range Android phone
- Desktop Safari
- Desktop Chrome
- Desktop Edge
- Desktop Firefox where supported
- Laptop with integrated graphics
- Desktop with dedicated graphics

### Screen conditions

- Small phone
- Large phone
- Notched or safe-area device
- Standard desktop
- Ultrawide desktop
- High pixel density

### Network conditions

- First load on normal connection
- Slow connection
- Offline after installation
- Interrupted asset download
- Cached return visit

---

## 60. Quality gates

### Foundation gate

- Movement feels responsive.
- Touch controls work while looking and moving.
- Camera switching is stable.
- Terrain streams without major freezes.
- Saving survives reload.

### Content gate

- New assets meet originality and performance checks.
- Recipes validate.
- No required resource is impossible to obtain.
- Low settings remain playable.

### Release gate

- No known save-loss bug
- No critical security issue
- Performance targets met on the agreed minimum device
- Controls documented
- Accessibility basics present
- Privacy information present
- Recovery path for failed load

---

## 61. Repository structure

Proposed future structure:

- **shardstead/README.md** — Project overview
- **shardstead/PLANS.md** — Master plan
- **shardstead/docs/** — Focused design and technical documents
- **shardstead/src/** — Game source
- **shardstead/public/** — Static public assets
- **shardstead/assets-source/** — Editable original asset sources when appropriate
- **shardstead/tests/** — Automated tests
- **shardstead/tools/** — Development and content tools
- **shardstead/.github/** — Project-specific workflows if needed

The exact structure should follow the chosen technology after the prototype.

---

## 62. Git and change workflow

### Branch approach

- Main branch remains stable.
- Focused changes use short branches.
- Large systems use reviewable milestones.
- Generated build output is committed only if the deployment strategy requires it.

### Commit principles

- One understandable purpose per commit
- Clear message
- No unrelated file changes
- Tests or validation included when relevant

### Plan updates

Changes to major approved requirements should update:

- Document version
- Decision log
- Affected milestone
- Risk list when applicable

---

## 63. Build and deployment plan

### Development

- Local development server
- Fast refresh where practical
- Debug diagnostics
- Separate development settings

### Continuous checks

- Type checking
- Formatting
- Linting
- Unit tests
- Data validation
- Production build
- Broken-link check for documentation

### GitHub Pages goal

The final static client should be deployable through GitHub Pages if the selected technology and asset size remain compatible.

Deployment should:

- Build from a known commit
- Use correct base paths
- Cache versioned assets
- Provide a fallback for the application route
- Avoid exposing development source maps unless intentionally enabled
- Verify mobile loading after every release

---

## 64. Release channels

### Internal prototype

- Developer-only
- Debug tools enabled
- Frequent breaking changes

### Private test

- Small invited group
- Save compatibility warnings
- Structured feedback

### Public alpha

- Core foundation works
- Limited content
- Experimental label
- World backups recommended

### Public beta

- Main systems connected
- Broader device testing
- Save migrations expected to work
- Performance optimization

### Version 1.0 direction

- Stable foundation
- Strong building and exploration loop
- Multiple progression stages
- Clear visual identity
- Reliable PC and mobile support
- No requirement to include every long-term feature

---

## 65. Production roadmap

### Phase 0: Pre-production

Deliverables:

- Approve major concept decisions
- Choose first biome
- Create visual target images
- Define minimum device target
- Compare 3D technology candidates
- Establish coding and asset conventions

Exit criteria:

- One approved visual direction
- One selected prototype stack
- One measurable first milestone

### Phase 1: Technical playground

Deliverables:

- Render one terrain chunk
- Desktop movement
- Touch movement
- First-person camera
- F5 and mobile camera cycle
- Place and remove one material
- Graphics preset switch

Exit criteria:

- Runs on at least one PC and one phone
- No major input conflict
- Basic performance measurements captured

### Phase 2: Streaming world

Deliverables:

- Deterministic seed
- Multiple chunks
- Background generation
- Loading and unloading
- Basic terrain materials
- Simple fog and sky

Exit criteria:

- Player can travel continuously
- No uncontrolled memory growth during test route
- Generation does not cause unacceptable pauses

### Phase 3: Persistence

Deliverables:

- Versioned save format
- Modified chunk saving
- Player inventory
- Settings persistence
- Backup and recovery test
- Export and import experiment

Exit criteria:

- Build, leave, return, and see the same result
- Corrupted test save does not erase every backup

### Phase 4: Building foundation

Deliverables:

- Placement preview
- Rotation
- Small building set
- Collision
- Mobile placement tuning
- Storage object

Exit criteria:

- A small house can be built comfortably on PC and phone
- Every piece reloads correctly

### Phase 5: Gathering and crafting

Deliverables:

- Tool families
- Resource drops
- Inventory improvements
- Basic recipes
- Workbench
- Material progression

Exit criteria:

- Player can gather and build without developer commands

### Phase 6: World Core

Deliverables:

- Core visual
- Tier 0 through Tier 2 prototype
- Upgrade requirements
- Map anchor
- One rift signal

Exit criteria:

- Core progression creates a meaningful new ability

### Phase 7: Exploration content

Deliverables:

- Second biome
- Cave improvements
- Ruin system
- Rift destination
- Discovery journal

Exit criteria:

- Thirty-minute exploration trip produces meaningful discoveries

### Phase 8: Living world

Deliverables:

- Day and night
- Weather
- First creature
- Farming prototype
- Environmental audio

Exit criteria:

- World feels active without exceeding entity budgets

### Phase 9: Engineering

Deliverables:

- Simple machine
- Item transfer
- Power or activation rule
- Machine diagnostics

Exit criteria:

- A repeated task can be automated and understood

### Phase 10: Alpha preparation

Deliverables:

- Onboarding
- Accessibility baseline
- Performance presets
- Device matrix testing
- Privacy information
- Deployment workflow

Exit criteria:

- New testers can start without live instruction
- No known critical save-loss issue

---

## 66. First playable milestone

The first public-looking build is successful when a player can:

1. Open Shardstead on a PC or phone.
2. Create a named world with a seed.
3. Enter a generated 3D Greenreach area.
4. Move, jump, look, and switch cameras.
5. Gather at least three basic materials.
6. Place and remove several building pieces.
7. Craft one improved tool.
8. Activate the first World Core stage.
9. Change graphics settings.
10. Leave and return without losing progress.

### Explicitly excluded from the first milestone

- Public multiplayer
- Large creature roster
- Advanced automation
- Many biomes
- Full narrative
- Complex combat
- Cloud accounts
- Mod support

---

## 67. First content target

### Materials

- Soil
- Grass surface
- Stone
- Wood
- Leaves
- Sand
- Water
- One starter ore
- Planks
- Brick or cut stone

### Functional objects

- World Core
- Workbench
- Storage chest
- Light source
- Simple door

### Tools

- Basic cutting tool
- Basic mining tool
- Basic construction tool

### Building pieces

- Full block
- Slab
- Stair
- Wall
- Floor
- Door frame
- Window

Content counts are intentionally small until the systems are proven.

---

## 68. Ninety-day prototype plan

This schedule is directional, not a promise of calendar completion.

### Weeks 1–2: Decisions and benchmarks

- Approve visual direction
- Choose candidate technologies
- Create terrain benchmark
- Test one phone and one PC
- Define code and asset conventions

### Weeks 3–4: Player and input

- Player controller
- First-person camera
- Third-person cameras
- F5 cycle
- Mobile touch layout
- Input diagnostics

### Weeks 5–6: Terrain and streaming

- Seeded chunk generation
- Chunk mesh
- Streaming queue
- Basic culling
- Performance test route

### Weeks 7–8: Interaction and building

- Target selection
- Remove material
- Placement preview
- Place material
- Hotbar
- Mobile placement tuning

### Weeks 9–10: Saving

- Save schema
- Modified chunk persistence
- Settings persistence
- Backup
- Reload testing

### Weeks 11–12: Core and presentation

- Dormant Core model
- First activation
- Basic sounds and effects
- Graphics presets
- Onboarding prompts
- Deployable internal build

---

## 69. Backlog priorities

### Must have

- PC and mobile input
- Camera switching
- Terrain streaming
- Building
- Saving
- Graphics presets
- Original visual content

### Should have

- Crafting
- Core progression
- Second biome
- Basic map
- Accessibility baseline
- Import and export

### Could have

- Farming
- First creature
- Weather
- Simple automation
- Achievements

### Not for early versions

- Massive public servers
- Real-money economy
- User script execution
- Complex mod marketplace
- Photorealistic rendering
- Full physical destruction

---

## 70. Major risks and mitigations

### Risk: Scope becomes too large

Mitigation:

- Protect milestone exclusions
- Add systems in vertical slices
- Require exit criteria
- Delay content quantity

### Risk: Mobile performance is poor

Mitigation:

- Test phones from the first prototype
- Use chunk and entity budgets
- Provide resolution scaling
- Profile real scenes
- Preserve low-quality art direction

### Risk: Save data is lost

Mitigation:

- Version schemas
- Backups
- Transactional writes
- Export and import
- Release-blocking save tests

### Risk: Game feels too similar to Minecraft

Mitigation:

- Center the World Core and rifts
- Use original proportions and materials
- Create distinct building shapes
- Build a separate UI language
- Review every creative asset for originality

### Risk: Touch controls feel frustrating

Mitigation:

- Mobile prototypes before content production
- Custom layouts
- Large targets
- Context actions
- Frequent mobile-only playtests

### Risk: Browser limitations

Mitigation:

- Test storage quotas
- Support WebGL fallback
- Evaluate WebGPU rather than require it
- Provide world export
- Keep deployment static where possible

### Risk: Generated assets are inconsistent

Mitigation:

- Use an art guide
- Require manual review
- Maintain color and scale standards
- Keep editable source files
- Reject assets that do not fit

---

## 71. Success metrics

Metrics should first help improve the game, not maximize addiction.

### Technical

- Stable frame rate on target devices
- Low crash and failed-load rate
- Save success
- Startup time
- Memory stability during travel

### Experience

- New player completes first placement
- Player understands camera switch
- Player can return to a saved world
- Players use more than one activity type
- Testers can describe what makes Shardstead different

### Creative

- Players build structures not shown by the tutorial
- Players create self-directed goals
- Screenshots are recognizable as Shardstead

---

## 72. Decision log

| Decision | Status | Notes |
| --- | --- | --- |
| Game name is Shardstead | Approved | Folder remains lowercase |
| PC and mobile support | Approved | Both are first-class |
| Endless 3D sandbox | Approved | Generated world with technical limits |
| Building and upgrades | Approved | Central experience |
| F5 camera cycle | Approved | Mobile gets equivalent button |
| Adjustable rendering | Approved | Presets plus custom controls |
| Original creative assets | Approved | No copied game assets |
| Single-player first | Proposed | Multiplayer delayed for stability |
| Greenreach as first biome | Proposed | Safe visual and technical baseline |
| Journey as default mode | Proposed | Peaceful, Survival, Creative later |
| Purple/pink rift identity | Proposed | Fits existing brand preference |
| World Core tier structure | Proposed | Requires prototype |

---

## 73. Open decisions

These decisions should be made before their affected phase begins.

### Visual

- Final character proportions
- Smooth terrain versus more modular terrain
- Exact rift color palette
- Day and night contrast

### Gameplay

- Default combat intensity
- Hunger in Survival only or additional modes
- Inventory retention after defeat
- Core upgrade speed
- Building support rules

### Technical

- Final 3D framework
- Physics solution
- Chunk dimensions
- Save storage technology
- WebGPU rollout policy

### Release

- Public alpha timing
- Whether source code becomes open source
- Code license
- Asset license
- Community feedback channel

---

## 74. License plan

The repository is public, but no license is required.

Until a license is deliberately selected:

- Copyright remains with the creator by default.
- Public visibility does not automatically grant permission to reuse the code or assets.
- Do not add MIT, GPL, Creative Commons, or another license without approval.

Code and creative assets may eventually use different licenses. This is especially important if code is open source but game art remains restricted.

---

## 75. Documentation plan

As implementation begins, this master plan should link to smaller documents.

Proposed documents:

- Visual style guide
- Controls specification
- World generation specification
- Save format specification
- Asset naming guide
- Performance budget
- Accessibility checklist
- Test matrix
- Release checklist

The master plan keeps the overall direction; detailed documents hold implementation-level rules.

---

## 76. Definition of done

A feature is not done because it works once.

A feature is done when:

- It meets its acceptance criteria.
- It works on PC and mobile when relevant.
- It saves and reloads correctly when relevant.
- It respects graphics presets.
- It has required accessibility options.
- It has no known critical bug.
- It has tests or a documented validation procedure.
- Its original assets pass review.
- Its documentation is updated.

---

## 77. Immediate next planning tasks

Before full game implementation:

1. Approve or revise the proposed visual direction.
2. Confirm Greenreach as the first biome.
3. Confirm Journey mode as the default.
4. Decide whether early combat is included or delayed.
5. Create a small visual target for the World Core and rifts.
6. Build the technology comparison prototype.
7. Set the minimum mobile device target after benchmarks.
8. Convert the winning prototype into Phase 1 tasks.

---

## 78. Current project state

Completed:

- Repository created
- Shardstead folder created
- Project README created
- Master plan created and expanded
- Core concept established
- PC and mobile requirements recorded
- Original content policy recorded

Not started:

- Playable code
- Engine selection prototype
- Final visual style
- Models and textures
- GitHub Pages deployment
- Device benchmarks

The project remains in pre-production. No playable release should be claimed yet.

---

## Appendix A: Acceptance checklist for the first prototype

### Launch

- Loads without developer tools
- Shows loading progress
- Handles unsupported feature errors
- Fits phone safe areas

### Movement

- Keyboard movement
- Touch movement
- Jump
- Look
- No stuck movement after menu

### Cameras

- First-person
- Third-person behind
- Third-person front
- F5 works
- Mobile camera button works
- Camera avoids terrain clipping

### World

- Same seed produces same untouched terrain
- Multiple chunks load
- Distant chunks unload
- No visible permanent gaps during ordinary movement

### Building

- Target highlight
- Remove piece
- Placement preview
- Validity feedback
- Place piece
- Reload placed piece

### Settings

- Low preset
- Medium preset
- High preset
- Auto preset
- Render distance changes
- Frame-rate cap changes

### Save

- Automatic save
- Manual return to title
- Reload
- Backup
- Recovery test

---

## Appendix B: Content originality checklist

- Is the asset made specifically for Shardstead?
- Does it avoid copying a recognizable asset from another game?
- Is its source recorded?
- Is the editable source retained when appropriate?
- Does it match the Shardstead palette and proportions?
- Is the geometry efficient enough?
- Are textures original?
- Is the icon readable at mobile size?
- Is collision correct?
- Does it work on Low and High settings?
- Has a human reviewed the generated result?

---

## Appendix C: Performance review checklist

- Test cold startup
- Test cached startup
- Record average FPS
- Record slowest frame spikes
- Record memory after ten minutes
- Record memory after long travel
- Test dense building
- Test cave lighting
- Test weather
- Test background and resume
- Test Low preset
- Test Auto preset
- Confirm save during stress

---

## Appendix D: Plan change history

### Version 0.1

- Established the initial Shardstead concept
- Recorded PC and mobile support
- Recorded F5 camera behavior
- Added basic rendering settings
- Added early development phases

### Version 0.2

- Expanded the document into a master development blueprint
- Added design pillars and game modes
- Added full gameplay loops
- Added world, biome, Core, building, crafting, and progression plans
- Added PC and mobile control specifications
- Added UI and accessibility direction
- Added original asset and animation pipelines
- Added rendering and performance budgets
- Added code, save, privacy, security, and testing architecture
- Added production phases, ninety-day prototype plan, risks, decisions, and acceptance checklists

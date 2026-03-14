# SHIFT HQ Venue Scene Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all placeholder 3D geometry with a cinematic representation of the real SHIFT Midtown venue — rounded walls, projection shaders, LED wall, trusses, bar, AV rack, atmospheric effects.

**Architecture:** The venue is decomposed into 8 independent scene components composed in App.jsx. Each component is self-contained with its own geometry, materials, and animations. Agent positions are updated in the store to fit the new 70x20 room. The existing Venue.jsx, Lighting.jsx, and PostProcessing.jsx are fully rewritten.

**Tech Stack:** React Three Fiber, drei, Three.js custom ShaderMaterial, @react-three/postprocessing (Bloom, Vignette, ChromaticAberration, SMAA)

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Rewrite | `src/scene/Venue.jsx` | Room shell: rounded-corner floor, walls, ceiling, entrance opening |
| Rewrite | `src/scene/Lighting.jsx` | Ambient + directional only (2 lights total) |
| Rewrite | `src/scene/PostProcessing.jsx` | Bloom + Vignette + ChromaticAberration + SMAA |
| Create | `src/scene/ProjectionWalls.jsx` | Animated shader material on wall surfaces |
| Create | `src/scene/CeilingRig.jsx` | Trusses, moving head spotlights, perimeter LED strip |
| Create | `src/scene/LEDWall.jsx` | Back wall LED display with animated shader |
| Create | `src/scene/Atmosphere.jsx` | Fog, light beam shafts, dust particles, floor glow pools |
| Create | `src/scene/BarArea.jsx` | Bar counter, back shelving, amber lighting |
| Create | `src/scene/AVRack.jsx` | Server rack with indicator lights, monitor |
| Create | `src/scene/Workstations.jsx` | 7 desks with agent-colored monitor glow |
| Modify | `src/App.jsx` | Compose all new scene components, update camera + controls |
| Modify | `src/store/useStore.js` | Update agent positions for 70x20 room layout |

**DO NOT touch:** Any backend files, socket logic, ChatBar, ActivityFeed, TaskBoard, Agent.jsx (logic), SpeechBubble, DelegationLine.

---

## Task 1: Update agent positions for new room layout

**Files:**
- Modify: `src/store/useStore.js` (lines 4-14, agent position arrays only)

The room is 70 long (X: -35 to +35) x 20 wide (Z: -10 to +10).
- Entrance: left wall (x=-35), center opening
- LED wall: right wall (x=+35)
- Bar: back-right area (~x=25, z=-7)
- AV rack: back-left corner (~x=-30, z=-8)
- Bruno: center of room
- 7 desks in two offset rows along the long axis

New positions (all y=0.8):

```
kim:   [-15, 0.8, -4]    — front-left row
dev:   [-22, 0.8,  4]    — back-left row
marco: [ -5, 0.8, -4]    — front-center-left
zara:  [  5, 0.8, -4]    — front-center-right
riley: [-30, 0.8, -7]    — by AV rack, back-left
dante: [ 27, 0.8, -5]    — behind bar counter
sam:   [ 15, 0.8,  4]    — back-right row
petra: [ -8, 0.8,  4]    — back-center-left
lex:   [  8, 0.8,  4]    — back-center-right
bruno: [  0, 0.8,  0]    — dead center
```

- [ ] Step 1: Update all 10 agent positions in useStore.js
- [ ] Step 2: Verify build passes

---

## Task 2: Rewrite Venue.jsx — room shell with rounded corners

**Files:**
- Rewrite: `src/scene/Venue.jsx`

Build the room using THREE.Shape + ExtrudeGeometry for walls with rounded corners. The Shape traces the interior perimeter with quadraticCurveTo at each corner. Extrude upward for wall height. Separate floor plane, ceiling plane.

Key dimensions:
- Room: 70 x 20, corners rounded with radius 3
- Wall height: 6, thickness: 0.3
- Entrance: 8-unit opening centered on left short wall (x=-35)
- Floor: color #0a0a0a, roughness 0.1, metalness 0.3
- Walls: color #111111, roughness 0.8, emissive #7B5CE6 at 0.08
- Ceiling: color #080808 at y=6
- Faint grid overlay: lineSegments at opacity 0.02, color #7B5CE6

- [ ] Step 1: Write Venue.jsx with Shape-based room geometry
- [ ] Step 2: Verify build + visual check

---

## Task 3: Rewrite Lighting.jsx — dramatic minimal lights

**Files:**
- Rewrite: `src/scene/Lighting.jsx`

Only 2 lights:
1. AmbientLight: #0d0020, intensity 0.4
2. DirectionalLight: #ffffff, intensity 0.6, position [20, 30, 10], no shadows

- [ ] Step 1: Rewrite Lighting.jsx
- [ ] Step 2: Verify build

---

## Task 4: Rewrite PostProcessing.jsx

**Files:**
- Rewrite: `src/scene/PostProcessing.jsx`

Effects: Bloom (intensity 1.8, threshold 0.2, smoothing 0.9), Vignette (darkness 0.7, offset 0.3), ChromaticAberration (offset [0.0008, 0.0008]), SMAA.

- [ ] Step 1: Rewrite PostProcessing.jsx with all 4 effects
- [ ] Step 2: Verify build

---

## Task 5: Create ProjectionWalls.jsx — animated shader walls

**Files:**
- Create: `src/scene/ProjectionWalls.jsx`

Custom ShaderMaterial on wall-hugging planes. Vertex shader: passthrough with UV. Fragment shader: organic purple wave pattern using sin/cos + time uniform. Colors: #1a0533, #7B5CE6, #4B0082, #9333EA. Scanline overlay at 0.03 opacity. Animate time in useFrame at 0.15 speed. Place on both long walls, right short wall, and curved corners. Add 4 dark panel seam lines along long walls.

- [ ] Step 1: Write ProjectionWalls.jsx with shader + placement
- [ ] Step 2: Verify build + visual check

---

## Task 6: Create CeilingRig.jsx — trusses + moving heads + LED strip

**Files:**
- Create: `src/scene/CeilingRig.jsx`

4 trusses at y=5.6, each 0.15x0.15x20 running width-wise, dual rails with cross-braces. 3 spotlights per truss (12 total) at y=5.3, alternating purple/white/indigo, slow pan via sin(clock+offset). Perimeter LED strip: thin emissive box at ceiling edge, #7B5CE6, emissiveIntensity 2.0.

- [ ] Step 1: Write CeilingRig.jsx
- [ ] Step 2: Verify build

---

## Task 7: Create LEDWall.jsx — back wall LED display

**Files:**
- Create: `src/scene/LEDWall.jsx`

PlaneGeometry 18x5 at x=34.5, y=2.5, z=0 facing interior. Custom ShaderMaterial: grid of small bright squares, animated data flow, dominant #7B5CE6 with white accents, subtle curvature distortion, emissiveIntensity 3.0. PointLight in front: #7B5CE6, intensity 15, distance 20.

- [ ] Step 1: Write LEDWall.jsx with shader + point light
- [ ] Step 2: Verify build

---

## Task 8: Create Atmosphere.jsx — fog, beams, particles, glow

**Files:**
- Create: `src/scene/Atmosphere.jsx`

Fog: color #0d0020, near 30, far 80. 6 volumetric beam cones (ConeGeometry, 0.04 opacity, DoubleSide). 200 dust particles via Points + BufferGeometry, drifting upward. 3 floor-level PointLights at room thirds: #7B5CE6, intensity 5, distance 15.

- [ ] Step 1: Write Atmosphere.jsx
- [ ] Step 2: Verify build

---

## Task 9: Create BarArea.jsx — bar counter + back + lights

**Files:**
- Create: `src/scene/BarArea.jsx`

Position: x~25, z~-7. Bar counter: 8x0.2x1.5, dark wood color, emissive front edge strip. Bar back shelving: 6x3x0.3 with 3 amber PointLights (intensity 2, distance 2).

- [ ] Step 1: Write BarArea.jsx
- [ ] Step 2: Verify build

---

## Task 10: Create AVRack.jsx — Riley's station

**Files:**
- Create: `src/scene/AVRack.jsx`

Position: x~-30, z~-8. Server rack: 1x2.5x0.8, dark grey. Front face emissive indicator lights (green + blue). Monitor on top with emissive screen.

- [ ] Step 1: Write AVRack.jsx
- [ ] Step 2: Verify build

---

## Task 11: Create Workstations.jsx — 7 agent desks

**Files:**
- Create: `src/scene/Workstations.jsx`

7 desks (not Bruno, not Riley, not Dante — they have special stations). Each: desk surface 1.8x0.06x0.9 (#1a1a1a), monitor 0.9x0.55x0.04 with agent-color emissive at 0.4. Position at matching agent coordinates from store.

- [ ] Step 1: Write Workstations.jsx
- [ ] Step 2: Verify build

---

## Task 12: Update App.jsx — compose everything + camera

**Files:**
- Modify: `src/App.jsx`

Camera: position [45, 35, 45], fov 35. OrbitControls: enableRotate false, enablePan false, minDistance 30, maxDistance 90, enableDamping true, dampingFactor 0.05. Compose all scene components in correct order. Remove old Venue import, add all new imports.

- [ ] Step 1: Update App.jsx with all new components + camera settings
- [ ] Step 2: Full build verification
- [ ] Step 3: Visual smoke test in browser

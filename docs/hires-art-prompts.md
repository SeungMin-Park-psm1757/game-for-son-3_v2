# High-resolution art prompts

## Delivery contract

- Keep the existing filename and PNG container format. Fish must be `RGBA` with genuine transparent background; scenes are opaque PNGs.
- Keep each fish's orientation, silhouette, framing, and empty margin close to its current sprite. Do not change fish IDs, logical display widths, save key `fishingGameData`, or event aliases.
- Fish: 1024px-class square canvas with new hand-drawn scale, fin, and shading detail; never an interpolated enlargement. Backgrounds: vertical 9:16, at least 720x1280, with a playable centre/lower water area.
- Reject assets with water/scenery behind fish, text, borders, watermarks, flipped direction, or a style that does not match the supplied game art. Verify actual image format, alpha bbox, subject fill, SHA-256, display density, and RGBA memory before replacement.

## Accepted replacements (2026-09-21)

Generated with the built-in image tool and visually compared with the source sprite/background:

| Asset | Reference invariants | Result |
|---|---|---|
| `fish_sunfish.png` | right-facing silver round body, tall fins, navy outline | Accepted: new scales, fin rays, gill and belly shading, transparent background |
| `fish_tuna.png` | right-facing blue/silver body, yellow tail and fins | Accepted: new scales, fin rays, gill and belly shading, transparent background |
| `fish_gwangeo.png` | left-facing tan flatfish, paired eyes at left, spotted body | Accepted: new spots and fin rays, transparent background |
| `fish_striped_jewfish.png` | left-facing charcoal brown body, large lip, raised dorsal fin | Accepted: new scales, fin rays and gill shading, transparent background |
| `bg_freshwater.png` | forest bank, ducks/turtles/reeds, mint pond | Accepted: native vertical pond layout with clear centre water |
| `bg_coast.png` | sunny sand cove, palms, shells, turquoise water | Accepted: native vertical coast layout with clear centre water |
| `bg_sea.png` | distant sailboat/island, bright layered waves | Accepted: native vertical open-sea layout with clear centre water |

## Pending: `bg_treasure_island.png`

The image-generation allocation returned HTTP 429 on 2026-09-21, so the existing 360x640 PNG remains unchanged. Use this prompt when allocation is available:

```text
Use case: style-transfer
Asset type: high-resolution vertical background for the treasure-island region of a children's mobile fishing game.
Input image: assets/images/bg_treasure_island.png is the strict visual and world reference.
Primary request: Create a genuinely high-resolution 9:16 portrait redraw in the same vivid Korean children's-game pixel-art aesthetic, with real new hand-drawn detail (not an upscale). Preserve rich aqua-blue underwater lighting, sunlight shafts from the top, the central small tropical treasure island with palms, coral reef on both sides, shipwreck and open treasure chest at lower left, sandy path/open water at lower centre, colourful reef fish and sea plants.
Composition/framing: vertical 9:16, at least 1024x1792; top 25% bright underwater surface/light shafts, middle 45% island and coral framing with open central swimming space, bottom 30% clear sandy/open-water gameplay space. Keep central and lower area readable for fishing.
Constraints: opaque PNG; no characters, UI, fishing rod, text, logo, watermark, border, or frame. Preserve the supplied scene's saturated aqua palette and black-navy outlines.
```

Acceptance: verify 9:16 native dimensions (minimum 720x1280), opaque alpha bbox covering the canvas, true PNG data behind the `.png` extension, no crop of the chest/island/coral landmarks, and local 360/390/412px screenshots before replacement.

## Replacement measurement audit

`bbox` uses alpha values above 12. Fish density is subject-bbox width / maximum game display width (260px for L, 220px for ML). Scene density is the smallest native-to-720x1280 ratio. Memory is decoded RGBA memory, not compressed file size.

| Asset | Before: format, size, alpha bbox | After: format, size, alpha bbox | Fill X / density before → after | RGBA MiB before → after |
|---|---|---|---:|---:|
| `fish_sunfish.png` | PNG RGBA, 256x256, `[35,2,221,254]` | PNG RGBA, 1254x1254, `[166,9,1099,1245]` | 72.7% / 0.715x → 74.4% / 3.588x | 0.25 → 6.00 |
| `fish_tuna.png` | PNG RGBA, 256x256, `[2,72,254,184]` | PNG RGBA, 1254x1254, `[6,349,1249,921]` | 98.4% / 0.969x → 99.1% / 4.781x | 0.25 → 6.00 |
| `fish_gwangeo.png` | PNG RGBA, 256x256, `[0,48,256,212]` | PNG RGBA, 1254x1254, `[0,237,1254,1057]` | 100.0% / 1.164x → 100.0% / 5.700x | 0.25 → 6.00 |
| `fish_striped_jewfish.png` | PNG RGBA, 256x256, `[2,46,254,211]` | PNG RGBA, 1254x1254, `[0,227,1254,1050]` | 98.4% / 1.145x → 100.0% / 5.700x | 0.25 → 6.00 |
| `bg_freshwater.png` | JPEG RGB, 640x640, no alpha | PNG RGB, 941x1672, no alpha | 0.500x → 1.306x | 1.56 → 6.00 |
| `bg_coast.png` | JPEG RGB, 640x640, no alpha | PNG RGB, 941x1672, no alpha | 0.500x → 1.306x | 1.56 → 6.00 |
| `bg_sea.png` | JPEG RGB, 640x640, no alpha | PNG RGB, 941x1672, no alpha | 0.500x → 1.306x | 1.56 → 6.00 |
| `bg_treasure_island.png` | PNG P, 360x640, no alpha | unchanged | 0.500x → 0.500x | 0.88 → 0.88 |

SHA-256, before → after:

- `fish_sunfish.png`: `33a99536e2a6977c597560859a93b5b2297b1007eb5d69ad977a4d4e8209c6e9` → `3ce4e66f72a8836573edb4a1af9de0f5aa215052ed2422d1a1877fafd53a0a3e`
- `fish_tuna.png`: `41c4bd03cc82d57995eed2895489c822b1443c75a003742b9bf750ab277ee856` → `bf7c4606c30e2d7eb348ec2d5b4d89a698666f141158171f186335188cb7e212`
- `fish_gwangeo.png`: `c7c686debe08d3c0d8d879e136e5c973897d7045377bf617d525db07fc2149dc` → `5735e95d0553e08bd249dad55c8cc3846356e9c5ca4043b82777bc1708f50cc8`
- `fish_striped_jewfish.png`: `e069e3333f5798d81ca45bbab917ff67e2cf38c3dd5e0b584697c6e8c41e1d1f` → `b7e53b95e82b6b8549b4831e0db9014620deef0b2c3115d983f5ff86d22ef4cf`
- `bg_freshwater.png`: `4a292c3575009747c578d1b024e51a7455b814d1d5ba077e3cdadeb6f6daeece` → `9170823a64b994328aeaaa26868fc9ade6f715b789609e12b503967e98d81b8d`
- `bg_coast.png`: `1b3e47e9c1ee6accc8b2b6981fcd1e9848153ecd5dba5baacb85ba18b68fbd8a` → `2134bcb4ddc68f9f886b2d7d570364a16590cf1e8ba5867334d5b065cbca6bad`
- `bg_sea.png`: `d14abc52298778aa7dc2c184bf089ca835b68dd93d75a5b9075bb13d6b827dc1` → `1038a0b3dfc334c5232d5229bbbe39beb78c222b3336db06942b83ee4c001a96`
- `bg_treasure_island.png`: unchanged `be3011ded368f85b7bca4b7fb417fe06880baab9648e0c61233d139c6a07f850`

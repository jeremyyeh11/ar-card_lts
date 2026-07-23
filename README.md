# ar-card_lts

Reusable web AR template for brand activations: scan a QR code, point your
phone at a printed card, and a 3D model appears anchored to the card. No app
install — runs in Safari (iOS) and Chrome (Android).

Built with [MindAR](https://hiukim.github.io/mind-ar-js-doc/) image tracking +
[A-Frame](https://aframe.io/). Plain static site, no build step.

## User journey

1. Scan QR code on the card → web app opens
2. Tap **Start** (grants camera access)
3. Point camera at the card → animated 3D model appears anchored to it
4. Card leaves the frame → model disappears (automatic)

## Repo layout

```
index.html           app shell + overlay UI (start / scanning / error)
css/style.css        styles; brand colors come in via CSS variables
js/config.js         ★ the reskin file — brand, model, theme, copy
js/app.js            scene construction + UI state machine
assets/targets/      card artwork (card-source.png) + compiled tracker (card.mind)
assets/models/       3D model (fox.glb placeholder — animated, CC-BY 4.0 Khronos sample)
tools/               dev-only: local target compiler + dev server
vercel.json          cache headers
```

## Run locally

```bash
node tools/dev-server.js
```

Open http://localhost:8321. Camera access works on `localhost` without HTTPS.
To test the AR flow on a desktop, print the card (or open
`assets/targets/card-source.png` on your phone screen) and point your webcam
at it. To test on a phone, deploy (below) — phones need HTTPS.

## Reskin checklist (per brand)

1. **Card artwork** — design the card face, export ≥1000 px wide, save as
   `assets/targets/card-source.png`. See "Marker requirements" below.
2. **Compile the tracking target** — run the dev server, open
   `http://localhost:8321/tools/compile.html`, pick your artwork, and save the
   result as `assets/targets/card.mind`. (Or use the official
   [MindAR compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile).)
3. **3D model** — drop your `.glb` into `assets/models/` (keep it under ~5 MB;
   Draco-compressed glTF is fine). Animated models play via their built-in clips.
4. **`js/config.js`** — update `brandName`, `targetFile`, `model` (src, scale,
   position, rotation, animationClip), `theme` colors, and `hintText`.
   Scale/position are relative to the card: marker width = 1 unit.
5. **QR code** — after deploying, generate a QR for the live URL (any QR
   generator) and place it on the card artwork. Recompile the `.mind` if the
   artwork changed.

## Marker requirements (what makes tracking work)

The card artwork itself is the tracking marker — no black borders or special
patterns needed. For reliable tracking the artwork should have:

- **High visual detail** spread across the whole face — illustrations,
  detailed logos, photos. Avoid large flat/empty areas.
- **High contrast, non-repetitive patterns** — avoid stripes, grids, and
  minimal line-art on white.
- **Asymmetric composition** — helps the tracker lock orientation.
- **Source image ≥ ~1000 px** on the long edge when compiling.

Print considerations:

- **Matte finish.** Glossy glare breaks tracking.
- Bigger print = tracks from farther away. A business card works at roughly
  15–40 cm; an A5 table card works across a table.
- The QR code can be part of the tracked artwork — compile the whole card
  face including the QR. Keep the QR ≥ 2 cm so phones can scan it.

## Deploy (Vercel)

Camera access requires HTTPS, which Vercel provides out of the box.

```bash
npx vercel --prod
```

Or connect the repo in the Vercel dashboard (no build command, output
directory = repo root). Then generate a QR code pointing at the deployed URL
and add it to the card artwork.

## Placeholder assets

- `assets/models/fox.glb` — animated Fox from
  [Khronos glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets)
  (CC-BY 4.0, model by PixelMannen, rig/animation by @tomkranis). Clips:
  `Survey`, `Walk`, `Run`.
- `assets/targets/card-source.png` — generated demo card (the QR on it is a
  non-scannable placeholder; replace with a real QR after deploying).

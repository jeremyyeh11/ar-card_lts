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
assets/targets/      card artwork (card-source.jpg) + compiled tracker (card.mind)
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
`assets/targets/card-source.jpg` on your phone screen) and point your webcam
at it. To test on a phone, deploy (below) — phones need HTTPS.

## Landing page setting

**Location: `js/config.js`**

```js
showLandingPage: true,
```

- `true` (default) shows the branded landing page and **Start** button.
- `false` hides the landing page and starts MindAR immediately.

This is a code-only setting; it does not add a user-facing toggle. With the
landing page disabled, the browser may still show its required camera-permission
prompt. If camera access fails, the existing error screen remains available.

## Set up your card and 3D model

### 1. Prepare the final card artwork

Design the complete card face, including the real QR code that points to the
production URL. Export it at least 1000 px wide and save a copy as:

```text
assets/targets/card-source.jpg
```

Do not crop, stretch, or edit the printed version after compiling it. Any change
to the artwork—including its QR code, text, layout, or imagery—requires a new
`.mind` file.

### 2. Compile the image target

Use either compiler for a single card:

- **Official MindAR compiler:** open
  [Image Targets Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile),
  upload the final artwork, click **Start**, and download the generated `.mind`
  file. Use this compiler when combining multiple card images.
- **Local single-image compiler:** run `node tools/dev-server.js`, open
  `http://localhost:8321/tools/compile.html`, and select one final artwork file.

Rename the generated file to `card.mind` and place it here:

```text
assets/targets/card.mind
```

`js/config.js` loads that file through `targetFile`. The URL includes a version
query because Vercel caches `/assets/` files as immutable:

```js
targetFile: "assets/targets/card.mind?v=d74690a8",
```

Whenever `card.mind` changes, update the `v` value to a new version or the first
eight characters of the file's SHA-256 hash. Otherwise returning browsers may
keep using the old target bundle.

For multiple cards, use the official compiler and upload all final card images in
the same batch. The compiler produces one combined `.mind` file. Image order
matters: the first compiled image maps to `targets[0]`, the second to
`targets[1]`, and so on.

`maxTrack: 2` allows up to two configured targets to remain anchored
simultaneously. It is a maximum, not a requirement—the app still works with zero
or one visible card. Raising the limit costs more mobile performance.

### 3. Add the 3D model

Put the model in `assets/models/`, for example:

```text
assets/models/player.glb
```

Use `.glb` where possible because it packages the model, materials, and textures
into one file. Keep it under roughly 5 MB for mobile loading; Draco-compressed
glTF is supported.

Point each target config at its model and adjust the transform. Keep `targets` in
the same order as the images compiled into the `.mind` file:

```js
maxTrack: 2,

targets: [
  {
    name: "Card one",
    model: {
      src: "assets/models/player-one.glb",
      scale: 0.008,
      position: [0, 0, 0.1],
      rotation: [90, 0, 0],
      animationClip: "",
    },
  },
  {
    name: "Card two",
    model: {
      src: "assets/models/player-two.glb",
      scale: 0.008,
      position: [0, 0, 0.1],
      rotation: [90, 0, 0],
      animationClip: "",
    },
  },
],
```

Scale and position are relative to the tracked card: the card width equals one
AR unit. Set `animationClip` to a clip name, `"*"` for all clips, or `""` for no
animation.

### 4. Test before deployment

Run `node tools/dev-server.js`, open `http://localhost:8321`, tap **Start**, and
point the camera at the exact `card-source.jpg` artwork on a print or second
screen. Then deploy the source artwork, compiled target, and model together.

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
- `assets/targets/card-source.jpg` — user-supplied source photo used to compile
  the active MindAR target.

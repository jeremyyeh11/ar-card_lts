// ============================================================
// AR CARD TEMPLATE — RESKIN CONFIG
// This is the only JS file you should need to touch to rebrand.
// See README.md for the full reskin checklist.
// ============================================================
window.AR_CONFIG = {
  brandName: "Demo Brand",

  // LANDING PAGE: set to false to skip the Start screen and request camera
  // access immediately. Keep true when you want an explicit Start button.
  showLandingPage: true,

  // Compiled image target. Regenerate with the MindAR compiler
  // (https://hiukim.github.io/mind-ar-js-doc/tools/compile) or tools/compile.html
  // Version query must change whenever card.mind changes; /assets is immutable.
  targetFile: "assets/targets/card.mind?v=9436ea58",

  // Maximum number of image targets that can stay anchored at the same time.
  // This is a ceiling, not a required count: zero or one target still works.
  maxTrack: 2,

  // Keep this array in the same order as the images compiled into card.mind.
  // Array index 0 maps to targetIndex 0, index 1 to targetIndex 1, and so on.
  targets: [
    {
      name: "Architecture model",
      model: {
        src: "assets/models/architecture-original-f36945aa.glb",
        // Keep the uploaded model's original orientation. Its source bounds run
        // from 0..42 on X/Y and -42..0 on Z, so position centers it on the card.
        scale: 0.01,
        position: [-0.21, -0.21, 0.43],
        rotation: [0, 0, 0],
        // This model has no animation clips.
        animationClip: "",
      },
    },
  ],

  theme: {
    accent: "#ff5533",
    background: "#111111",
    text: "#ffffff",
  },

  hintText: "Point your camera at the card",
};

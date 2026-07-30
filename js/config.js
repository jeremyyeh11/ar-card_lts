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
        src: "assets/models/architecture-35b9db4c.glb",
        // Units are relative to the physical card width (marker width == 1).
        scale: 0.008,
        position: [0, -0.05, 0.01],
        rotation: [60, 0, -30],  // isometric view projecting outward from the card
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

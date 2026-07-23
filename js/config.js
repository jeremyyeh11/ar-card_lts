// ============================================================
// AR CARD TEMPLATE — RESKIN CONFIG
// This is the only JS file you should need to touch to rebrand.
// See README.md for the full reskin checklist.
// ============================================================
window.AR_CONFIG = {
  brandName: "Demo Brand",

  // Compiled image target. Regenerate with the MindAR compiler
  // (https://hiukim.github.io/mind-ar-js-doc/tools/compile) or tools/compile.html
  targetFile: "assets/targets/card.mind",

  model: {
    src: "assets/models/fox.glb",
    // Units are relative to the physical card width (marker width == 1).
    scale: 0.008,
    position: [0, 0, 0.1],   // x (right), y (up from card face), z (toward viewer)
    rotation: [90, 0, 0],    // lay the model onto the card plane
    // Animation clip name to play, "*" for all clips, or "" for none.
    // Fox.glb clips: "Survey", "Walk", "Run"
    animationClip: "Survey",
  },

  theme: {
    accent: "#ff5533",
    background: "#111111",
    text: "#ffffff",
  },

  hintText: "Point your camera at the card",
};

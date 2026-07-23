// ============================================================
// AR CARD TEMPLATE — APP LOGIC
// Builds the A-Frame/MindAR scene from AR_CONFIG and runs the
// minimal UI state machine: start → scanning ⇄ tracking, or error.
// You should not need to edit this file to reskin — see js/config.js.
// ============================================================
(function () {
  "use strict";

  const cfg = window.AR_CONFIG;

  const ui = {
    start: document.getElementById("screen-start"),
    scanning: document.getElementById("screen-scanning"),
    error: document.getElementById("screen-error"),
    btnStart: document.getElementById("btn-start"),
    btnStartLabel: document.getElementById("btn-start-label"),
    btnStartSpinner: document.getElementById("btn-start-spinner"),
    btnRetry: document.getElementById("btn-retry"),
    errorText: document.getElementById("error-text"),
  };

  // ---------- theming / copy ----------
  function applyBranding() {
    const root = document.documentElement;
    root.style.setProperty("--accent", cfg.theme.accent);
    root.style.setProperty("--background", cfg.theme.background);
    root.style.setProperty("--text", cfg.theme.text);
    document.getElementById("brand-name").textContent = cfg.brandName;
    document.getElementById("hint-text").textContent = cfg.hintText;
    document.title = cfg.brandName + " AR";
  }

  // ---------- scene ----------
  function buildScene() {
    const scene = document.createElement("a-scene");
    scene.setAttribute(
      "mindar-image",
      "imageTargetSrc: " + cfg.targetFile + "; autoStart: false; " +
        "maxTrack: " + cfg.maxTrack + "; " +
        "uiLoading: no; uiScanning: no; uiError: no;"
    );
    scene.setAttribute("color-space", "sRGB");
    scene.setAttribute("renderer", "colorManagement: true; physicallyCorrectLights: true;");
    scene.setAttribute("vr-mode-ui", "enabled: false");
    scene.setAttribute("device-orientation-permission-ui", "enabled: false");

    const camera = document.createElement("a-camera");
    camera.setAttribute("position", "0 0 0");
    camera.setAttribute("look-controls", "enabled: false");
    scene.appendChild(camera);

    const ambient = document.createElement("a-light");
    ambient.setAttribute("type", "ambient");
    ambient.setAttribute("intensity", "1");
    scene.appendChild(ambient);

    const directional = document.createElement("a-light");
    directional.setAttribute("type", "directional");
    directional.setAttribute("intensity", "1.5");
    directional.setAttribute("position", "0.5 1 1");
    scene.appendChild(directional);

    // Each config entry maps to the target at the same index in the compiled
    // .mind file. Content is shown and hidden automatically per target.
    const anchors = cfg.targets.map(function (target, targetIndex) {
      const anchor = document.createElement("a-entity");
      anchor.setAttribute("mindar-image-target", "targetIndex: " + targetIndex);

      const modelConfig = target.model;
      const model = document.createElement("a-gltf-model");
      model.setAttribute("src", modelConfig.src);
      model.setAttribute(
        "scale",
        modelConfig.scale + " " + modelConfig.scale + " " + modelConfig.scale
      );
      model.setAttribute("position", modelConfig.position.join(" "));
      model.setAttribute("rotation", modelConfig.rotation.join(" "));
      if (modelConfig.animationClip) {
        model.setAttribute("animation-mixer", "clip: " + modelConfig.animationClip);
      }
      anchor.appendChild(model);
      scene.appendChild(anchor);
      return anchor;
    });

    document.getElementById("scene-container").appendChild(scene);
    return { scene, anchors };
  }

  // ---------- state machine ----------
  function show(el) { el.hidden = false; }
  function hide(el) { el.hidden = true; }

  function toScanning() {
    hide(ui.start);
    hide(ui.error);
    show(ui.scanning);
    ui.scanning.classList.remove("tracking");
  }

  function toTracking() {
    ui.scanning.classList.add("tracking"); // fades hint + frame via CSS
  }

  function toError(message) {
    hide(ui.start);
    hide(ui.scanning);
    if (message) ui.errorText.textContent = message;
    show(ui.error);
  }

  function setStartBusy(busy) {
    ui.btnStart.disabled = busy;
    ui.btnStartLabel.hidden = busy;
    ui.btnStartSpinner.hidden = !busy;
  }

  // ---------- boot ----------
  applyBranding();
  const { scene, anchors } = buildScene();
  const activeTargets = new Set();

  scene.addEventListener("arReady", function () {
    toScanning();
  });

  scene.addEventListener("arError", function () {
    setStartBusy(false);
    toError(
      "We couldn't access your camera. Please allow camera access, " +
        "or open this page in Safari or Chrome."
    );
  });

  anchors.forEach(function (anchor, targetIndex) {
    anchor.addEventListener("targetFound", function () {
      activeTargets.add(targetIndex);
      toTracking();
    });
    anchor.addEventListener("targetLost", function () {
      activeTargets.delete(targetIndex);
      if (activeTargets.size === 0) toScanning();
    });
  });

  ui.btnStart.addEventListener("click", function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toError(
        "This browser can't access the camera. " +
          "Please open this page in Safari or Chrome."
      );
      return;
    }
    setStartBusy(true);
    const arSystem = scene.systems["mindar-image-system"];
    arSystem.start();
  });

  ui.btnRetry.addEventListener("click", function () {
    window.location.reload();
  });
})();

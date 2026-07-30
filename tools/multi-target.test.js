const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const configSource = fs.readFileSync(
  path.resolve(__dirname, "../js/config.js"),
  "utf8"
);

const appSource = fs.readFileSync(
  path.resolve(__dirname, "../js/app.js"),
  "utf8"
);

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
}

class FakeElement {
  constructor(tagName, id = "") {
    this.tagName = tagName;
    this.id = id;
    this.attributes = new Map();
    this.children = [];
    this.listeners = new Map();
    this.classList = new FakeClassList();
    this.style = { setProperty() {} };
    this.hidden = false;
    this.disabled = false;
    this.textContent = "";
  }

  appendChild(child) { this.children.push(child); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
}

function bootApp(config) {
  const ids = [
    "screen-start",
    "screen-scanning",
    "screen-error",
    "btn-start",
    "btn-start-label",
    "btn-start-spinner",
    "btn-retry",
    "error-text",
    "brand-name",
    "hint-text",
    "scene-container",
  ];
  const elements = Object.fromEntries(
    ids.map((id) => [id, new FakeElement("div", id)])
  );
  const document = {
    documentElement: new FakeElement("html"),
    title: "",
    getElementById(id) { return elements[id]; },
    createElement(tagName) { return new FakeElement(tagName); },
  };
  const context = {
    document,
    navigator: { mediaDevices: { getUserMedia() {} } },
    window: { AR_CONFIG: config, location: { reload() {} } },
  };

  vm.runInNewContext(appSource, context);

  return {
    elements,
    scene: elements["scene-container"].children[0],
  };
}

function modelConfig(src) {
  return {
    src,
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    animationClip: "",
  };
}

function twoTargetConfig() {
  return {
    brandName: "Test",
    targetFile: "targets.mind",
    maxTrack: 2,
    targets: [
      { name: "First", model: modelConfig("first.glb") },
      { name: "Second", model: modelConfig("second.glb") },
    ],
    theme: { accent: "#f00", background: "#000", text: "#fff" },
    hintText: "Scan",
  };
}

test("disabling the landing page hides it and enables MindAR auto-start", () => {
  const config = twoTargetConfig();
  config.showLandingPage = false;
  const { elements, scene } = bootApp(config);

  assert.equal(elements["screen-start"].hidden, true);
  assert.match(scene.attributes.get("mindar-image"), /autoStart: true;/);
});

test("config keeps the landing page visible by default", () => {
  const context = { window: {} };
  vm.runInNewContext(configSource, context);

  assert.equal(context.window.AR_CONFIG.showLandingPage, true);
});

test("config versions the active target bundle for cache invalidation", () => {
  const context = { window: {} };
  vm.runInNewContext(configSource, context);

  assert.equal(
    context.window.AR_CONFIG.targetFile,
    "assets/targets/card.mind?v=9436ea58"
  );
});

test("config allows two targets to be tracked simultaneously", () => {
  const context = { window: {} };
  vm.runInNewContext(configSource, context);

  assert.equal(context.window.AR_CONFIG.maxTrack, 2);
});

test("config keeps target models in compilation order", () => {
  const context = { window: {} };
  vm.runInNewContext(configSource, context);

  assert.ok(Array.isArray(context.window.AR_CONFIG.targets));
  assert.equal(context.window.AR_CONFIG.targets.length, 1);
  assert.equal(
    context.window.AR_CONFIG.targets[0].model.src,
    "assets/models/architecture-35b9db4c.glb"
  );
  assert.equal(context.window.AR_CONFIG.targets[0].model.animationClip, "");
});

test("app passes the configured simultaneous target limit to MindAR", () => {
  const { scene } = bootApp(twoTargetConfig());

  assert.match(scene.attributes.get("mindar-image"), /maxTrack: 2;/);
});

test("app creates one model anchor for every compiled target", () => {
  const { scene } = bootApp(twoTargetConfig());
  const anchors = scene.children.filter((child) =>
    child.attributes.has("mindar-image-target")
  );

  assert.equal(anchors.length, 2);
  assert.equal(anchors[0].attributes.get("mindar-image-target"), "targetIndex: 0");
  assert.equal(anchors[1].attributes.get("mindar-image-target"), "targetIndex: 1");
  assert.equal(anchors[0].children[0].attributes.get("src"), "first.glb");
  assert.equal(anchors[1].children[0].attributes.get("src"), "second.glb");
});

test("scanning hint stays hidden until every visible target is lost", () => {
  const { elements, scene } = bootApp(twoTargetConfig());
  const anchors = scene.children.filter((child) =>
    child.attributes.has("mindar-image-target")
  );
  const scanning = elements["screen-scanning"];

  scene.listeners.get("arReady")();
  anchors[0].listeners.get("targetFound")();
  anchors[1].listeners.get("targetFound")();
  anchors[0].listeners.get("targetLost")();
  assert.equal(scanning.classList.contains("tracking"), true);

  anchors[1].listeners.get("targetLost")();
  assert.equal(scanning.classList.contains("tracking"), false);
});

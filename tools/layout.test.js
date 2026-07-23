const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const stylesheet = fs.readFileSync(
  path.resolve(__dirname, "../css/style.css"),
  "utf8"
);

test("the dynamically-created AR scene has a fullscreen containing block", () => {
  const rule = stylesheet.match(/#scene-container\s*\{([^}]*)\}/);

  assert.ok(rule, "#scene-container needs an explicit fullscreen rule");
  assert.match(rule[1], /position\s*:\s*fixed\s*;/);
  assert.match(rule[1], /inset\s*:\s*0\s*;/);
});

import test from "node:test";
import assert from "node:assert/strict";

import { getMockClassification, selectRoute } from "../demo/workflow-logic.mjs";


test("live cases enter their requested branches", () => {
  const modelClassification = { category: "general", confidence: 0.5 };

  assert.equal(selectRoute(modelClassification, "respond"), "respond");
  assert.equal(selectRoute(modelClassification, "escalate"), "escalate");
});

test("mock cases contain fixtures for both branches", () => {
  const responseFixture = getMockClassification("respond");
  const reviewFixture = getMockClassification("escalate");

  assert.equal(selectRoute(responseFixture, "respond"), "respond");
  assert.equal(responseFixture.category, "billing");
  assert.equal(selectRoute(reviewFixture, "escalate"), "escalate");
  assert.equal(reviewFixture.category, "general");
});

test("custom tickets route dynamically by confidence", () => {
  assert.equal(selectRoute({ confidence: 0.9 }), "respond");
  assert.equal(selectRoute({ confidence: 0.4 }), "escalate");
});

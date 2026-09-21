import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGraphState,
  getMockClassification,
  selectRoute,
} from "../demo/workflow-logic.mjs";


test("live cases enter their requested branches", () => {
  const modelClassification = { category: "general", confidence: 0.5 };

  assert.equal(selectRoute(modelClassification, "respond"), "respond");
  assert.equal(selectRoute(modelClassification, "escalate"), "escalate");
});

test("mock cases contain fixtures for both branches", () => {
  const responseFixture = getMockClassification("password-reset");
  const reviewFixture = getMockClassification("refund-lockout");

  assert.equal(selectRoute(responseFixture, "respond"), "respond");
  assert.equal(responseFixture.category, "technical");
  assert.equal(selectRoute(reviewFixture, "escalate"), "escalate");
  assert.equal(reviewFixture.category, "general");
});

test("response and review branches expose different output fields", () => {
  const shared = {
    ticket: "Example",
    classification: { category: "general", confidence: 0.5 },
    generatedResponse: "Output",
    mockMode: true,
    requestedOutcome: "respond",
  };
  const responseState = buildGraphState({
    ...shared,
    route: "respond",
    finalNode: "draft_response",
  });
  const reviewState = buildGraphState({
    ...shared,
    route: "escalate",
    finalNode: "escalate_ticket",
  });

  assert.equal(responseState.draft_response, "Output");
  assert.equal("escalation_note" in responseState, false);
  assert.equal(reviewState.escalation_note, "Output");
  assert.equal("draft_response" in reviewState, false);
});

test("custom tickets route dynamically by confidence", () => {
  assert.equal(selectRoute({ confidence: 0.9 }), "respond");
  assert.equal(selectRoute({ confidence: 0.4 }), "escalate");
});

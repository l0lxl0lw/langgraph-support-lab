export function getMockClassification(outcome) {
  return outcome === "respond"
    ? { category: "billing", confidence: 0.94 }
    : { category: "general", confidence: 0.46 };
}

export function selectRoute(classification, requestedOutcome) {
  return requestedOutcome ||
    (classification.confidence < 0.7 ? "escalate" : "respond");
}

export function getMockResponse(route) {
  return route === "respond"
    ? "Thanks for reporting the duplicate charge. The billing team will review the transaction before making any adjustment."
    : "This request combines billing and account-access concerns, so the graph routed it to a human specialist instead of drafting an automated resolution.";
}

export function buildGraphState({
  ticket,
  classification,
  route,
  generatedResponse,
  mockMode,
  requestedOutcome,
  finalNode,
}) {
  return {
    ticket,
    ...classification,
    route,
    draft_response: generatedResponse,
    execution_mode: mockMode ? "mock_fixture" : "live_openrouter",
    requested_outcome: requestedOutcome || "dynamic",
    trace: ["receive_ticket", "classify_ticket", "select_route", finalNode],
  };
}

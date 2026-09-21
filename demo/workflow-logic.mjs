export function getMockClassification(fixture) {
  return fixture === "password-reset"
    ? { category: "technical", confidence: 0.92 }
    : { category: "general", confidence: 0.46 };
}

export function selectRoute(classification, requestedOutcome) {
  return requestedOutcome ||
    (classification.confidence < 0.7 ? "escalate" : "respond");
}

export function getMockResponse(route, category) {
  if (route === "escalate") {
    return "Billing and account-access signals overlap. Assign this ticket to an account-security specialist for human review.";
  }
  return category === "technical"
    ? "Please request a new password-reset link and open it in the same browser where you started the reset. Contact support if the new link also expires."
    : "Thanks for reporting the duplicate charge. The billing team will review the transaction before making any adjustment.";
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
  const state = {
    ticket,
    ...classification,
    route,
    execution_mode: mockMode ? "mock_fixture" : "live_openrouter",
    requested_outcome: requestedOutcome || "dynamic",
    trace: ["receive_ticket", "classify_ticket", "select_route", finalNode],
  };
  if (route === "respond") state.draft_response = generatedResponse;
  else state.escalation_note = generatedResponse;
  return state;
}

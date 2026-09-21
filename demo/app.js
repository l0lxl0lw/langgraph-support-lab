import {
  buildGraphState,
  getMockClassification,
  getMockResponse,
  selectRoute,
} from "./workflow-logic.mjs";

const form = document.querySelector("#ticket-form");
const ticketInput = document.querySelector("#ticket");
const apiKeyInput = document.querySelector("#api-key");
const modelInput = document.querySelector("#model");
const emptyState = document.querySelector("#empty-state");
const result = document.querySelector("#result");
const stateOutput = document.querySelector("#state");
const categoryOutput = document.querySelector("#category");
const confidenceOutput = document.querySelector("#confidence");
const routeOutput = document.querySelector("#route");
const draftOutput = document.querySelector("#draft-response");
const traceOutput = document.querySelector("#trace");
const executionModeOutput = document.querySelector("#execution-mode");
const errorOutput = document.querySelector("#error-message");
const runButton = form.querySelector(".run-button");
const trunkNodes = ["receive-node", "classify-node", "route-node"].map(
  (id) => document.querySelector(`#${id}`),
);
const respondNode = document.querySelector("#respond-node");
const escalateNode = document.querySelector("#escalate-node");
const allNodes = [...trunkNodes, respondNode, escalateNode];
let selectedCase = null;

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

function setNodeExecuted(node) {
  const status = node.querySelector("span");
  status.dataset.readyLabel ||= status.textContent;
  status.textContent = "Executed";
  node.classList.add("executed");
}

function resetGraph() {
  allNodes.forEach((node) => {
    const status = node.querySelector("span");
    node.classList.remove("executed");
    if (status.dataset.readyLabel) status.textContent = status.dataset.readyLabel;
  });
}

function setRunButtonLabel(label) {
  runButton.firstChild.textContent = `${label} `;
}

async function callOpenRouter(apiKey, model, messages, responseFormat) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.href,
      "X-OpenRouter-Title": "Support Agent Lab",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      ...(responseFormat ? { response_format: responseFormat } : {}),
      ...(responseFormat ? { provider: { require_parameters: true } } : {}),
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenRouter request failed (${response.status}).`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }
  return content;
}

async function classifyTicket(apiKey, model, ticket) {
  const content = await callOpenRouter(
    apiKey,
    model,
    [
      {
        role: "system",
        content:
          "Classify a customer support ticket. Use billing for payments, charges, invoices, refunds, or subscriptions; technical for login, account access, errors, or broken behavior; otherwise use general. Confidence must reflect classification certainty.",
      },
      { role: "user", content: ticket },
    ],
    {
      type: "json_schema",
      json_schema: {
        name: "ticket_classification",
        strict: true,
        schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["billing", "technical", "general"] },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
          required: ["category", "confidence"],
          additionalProperties: false,
        },
      },
    },
  );

  let classification;
  try {
    classification = JSON.parse(content);
  } catch {
    throw new Error("The model did not return valid structured classification data.");
  }
  if (
    !["billing", "technical", "general"].includes(classification.category) ||
    typeof classification.confidence !== "number" ||
    !Number.isFinite(classification.confidence) ||
    classification.confidence < 0 ||
    classification.confidence > 1
  ) {
    throw new Error("The model returned an invalid ticket classification.");
  }
  return classification;
}

async function draftResponse(apiKey, model, ticket, classification, route) {
  const instruction =
    route === "escalate"
      ? "Write a concise acknowledgement that tells the customer a human specialist will review the request. Do not claim the issue is resolved."
      : "Write a concise, helpful support reply. Do not invent account details, promise refunds, or claim actions were completed.";

  return callOpenRouter(apiKey, model, [
    {
      role: "system",
      content: `${instruction} The ticket category is ${classification.category}. Return only the customer-facing reply.`,
    },
    { role: "user", content: ticket },
  ]);
}

document.querySelectorAll("[data-ticket]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-ticket]").forEach((sample) => {
      sample.classList.toggle("selected", sample === button);
    });
    selectedCase = {
      execution: button.dataset.execution,
      outcome: button.dataset.outcome,
    };
    ticketInput.value = button.dataset.ticket;
    setRunButtonLabel(
      selectedCase.execution === "mock" ? "Run mock graph" : "Run live workflow",
    );
    ticketInput.focus();
  });
});

ticketInput.addEventListener("input", () => {
  selectedCase = null;
  document.querySelectorAll("[data-ticket]").forEach((sample) => {
    sample.classList.remove("selected");
  });
  setRunButtonLabel("Run live workflow");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const ticket = ticketInput.value.trim();
  const apiKey = apiKeyInput.value.trim();
  const model = modelInput.value.trim();
  const mockMode = selectedCase?.execution === "mock";
  if (!ticket || !model) return;
  if (!apiKey && !mockMode) {
    errorOutput.textContent = "Enter an OpenRouter key or choose one of the Without key cases.";
    errorOutput.hidden = false;
    return;
  }

  runButton.disabled = true;
  setRunButtonLabel(mockMode ? "Running mock graph" : "Calling OpenRouter");
  errorOutput.hidden = true;
  resetGraph();
  result.hidden = true;
  emptyState.hidden = false;

  try {
    setNodeExecuted(trunkNodes[0]);

    const classification = mockMode
      ? getMockClassification(selectedCase.outcome)
      : await classifyTicket(apiKey, model, ticket);
    if (mockMode) await wait(320);
    setNodeExecuted(trunkNodes[1]);

    const route = selectRoute(classification, selectedCase?.outcome);
    const finalNode = route === "respond" ? "draft_response" : "escalate_ticket";
    if (mockMode) await wait(320);
    setNodeExecuted(trunkNodes[2]);

    const generatedResponse = mockMode
      ? getMockResponse(route)
      : await draftResponse(apiKey, model, ticket, classification, route);
    if (mockMode) await wait(320);
    setNodeExecuted(route === "respond" ? respondNode : escalateNode);

    const graphState = buildGraphState({
      ticket,
      classification,
      route,
      generatedResponse,
      mockMode,
      requestedOutcome: selectedCase?.outcome,
      finalNode,
    });

    stateOutput.textContent = JSON.stringify(graphState, null, 2);
    categoryOutput.textContent = graphState.category;
    confidenceOutput.textContent = `${Math.round(graphState.confidence * 100)}%`;
    routeOutput.textContent = graphState.route;
    draftOutput.textContent = graphState.draft_response;
    traceOutput.textContent = graphState.trace.join(" → ");
    executionModeOutput.textContent = mockMode
      ? `Mock · ${route}`
      : `Live · ${route}`;
    emptyState.hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    errorOutput.textContent = error instanceof Error ? error.message : "The workflow failed.";
    errorOutput.hidden = false;
  } finally {
    setRunButtonLabel(mockMode ? "Run mock graph" : "Run live workflow");
    runButton.disabled = false;
  }
});

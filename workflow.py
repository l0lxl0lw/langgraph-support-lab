from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph


class SupportState(TypedDict, total=False):
    ticket: str
    category: Literal["billing", "technical", "general"]
    confidence: float
    route: Literal["respond", "escalate"]
    draft_response: str
    escalation_note: str
    escalation_reason: str
    trace: list[str]


def receive_ticket(state: SupportState) -> SupportState:
    return {"trace": [*state.get("trace", []), "receive_ticket"]}


def classify_ticket(state: SupportState) -> SupportState:
    ticket = state["ticket"].lower()
    billing_terms = ("charge", "charged", "invoice", "payment", "refund", "subscription")
    technical_terms = ("login", "sign in", "password", "error", "broken", "locked")
    has_billing_signal = any(term in ticket for term in billing_terms)
    has_technical_signal = any(term in ticket for term in technical_terms)

    if has_billing_signal and has_technical_signal:
        category, confidence = "general", 0.46
    elif has_billing_signal:
        category, confidence = "billing", 0.94
    elif has_technical_signal:
        category, confidence = "technical", 0.92
    else:
        category, confidence = "general", 0.58

    return {
        "category": category,
        "confidence": confidence,
        "trace": [*state.get("trace", []), "classify_ticket"],
    }


def select_route(state: SupportState) -> SupportState:
    should_escalate = state["confidence"] < 0.7
    return {
        "route": "escalate" if should_escalate else "respond",
        "trace": [*state.get("trace", []), "select_route"],
    }


def route_ticket(state: SupportState) -> Literal["respond", "escalate"]:
    return state["route"]


def draft_response(state: SupportState) -> SupportState:
    responses = {
        "billing": (
            "Thanks for reporting this billing issue. I've flagged the charge for "
            "review, and our billing team will verify it before making any adjustment."
        ),
        "technical": (
            "Thanks for the details. Please try signing in from a private browser window. "
            "If the issue continues, support will review your account access."
        ),
    }
    return {
        "draft_response": responses[state["category"]],
        "trace": [*state.get("trace", []), "draft_response"],
    }


def escalate_ticket(state: SupportState) -> SupportState:
    return {
        "escalation_note": (
            "Classification is uncertain or crosses support domains. Assign this ticket "
            "to a specialist for human review."
        ),
        "escalation_reason": "Classification confidence is below the response threshold.",
        "trace": [*state.get("trace", []), "escalate_ticket"],
    }


def build_workflow():
    builder = StateGraph(SupportState)
    builder.add_node("receive_ticket", receive_ticket)
    builder.add_node("classify_ticket", classify_ticket)
    builder.add_node("select_route", select_route)
    builder.add_node("draft_response", draft_response)
    builder.add_node("escalate_ticket", escalate_ticket)
    builder.add_edge(START, "receive_ticket")
    builder.add_edge("receive_ticket", "classify_ticket")
    builder.add_edge("classify_ticket", "select_route")
    builder.add_conditional_edges(
        "select_route",
        route_ticket,
        {"respond": "draft_response", "escalate": "escalate_ticket"},
    )
    builder.add_edge("draft_response", END)
    builder.add_edge("escalate_ticket", END)
    return builder.compile()


workflow = build_workflow()

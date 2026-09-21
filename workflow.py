from typing import Literal, TypedDict

from langgraph.graph import END, START, StateGraph


class SupportState(TypedDict, total=False):
    ticket: str
    category: Literal["billing", "technical", "general"]
    confidence: float
    route: Literal["respond", "escalate"]
    draft_response: str
    trace: list[str]


def receive_ticket(state: SupportState) -> SupportState:
    return {"trace": [*state.get("trace", []), "receive_ticket"]}


def build_workflow():
    builder = StateGraph(SupportState)
    builder.add_node("receive_ticket", receive_ticket)
    builder.add_edge(START, "receive_ticket")
    builder.add_edge("receive_ticket", END)
    return builder.compile()


workflow = build_workflow()

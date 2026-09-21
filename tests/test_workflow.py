from workflow import workflow


def test_workflow_drafts_billing_response() -> None:
    result = workflow.invoke({"ticket": "I was charged twice.", "trace": []})

    assert result["ticket"] == "I was charged twice."
    assert result["category"] == "billing"
    assert result["confidence"] == 0.94
    assert result["route"] == "respond"
    assert "billing team" in result["draft_response"]
    assert result["trace"] == [
        "receive_ticket",
        "classify_ticket",
        "select_route",
        "draft_response",
    ]


def test_workflow_preserves_existing_trace() -> None:
    result = workflow.invoke(
        {"ticket": "My account is locked.", "trace": ["submitted"]}
    )

    assert result["category"] == "technical"
    assert result["route"] == "respond"
    assert result["trace"] == [
        "submitted",
        "receive_ticket",
        "classify_ticket",
        "select_route",
        "draft_response",
    ]


def test_workflow_escalates_low_confidence_ticket() -> None:
    result = workflow.invoke({"ticket": "Can somebody call me?", "trace": []})

    assert result["category"] == "general"
    assert result["confidence"] == 0.58
    assert result["route"] == "escalate"
    assert "specialist" in result["draft_response"]
    assert result["trace"][-1] == "escalate_ticket"


def test_workflow_escalates_mixed_signal_demo_ticket() -> None:
    result = workflow.invoke(
        {
            "ticket": "A refund is missing and I am locked out of the account.",
            "trace": [],
        }
    )

    assert result["category"] == "general"
    assert result["confidence"] == 0.46
    assert result["route"] == "escalate"
    assert result["trace"] == [
        "receive_ticket",
        "classify_ticket",
        "select_route",
        "escalate_ticket",
    ]

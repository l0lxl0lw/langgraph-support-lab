from workflow import workflow


def test_workflow_receives_ticket() -> None:
    result = workflow.invoke({"ticket": "I was charged twice.", "trace": []})

    assert result["ticket"] == "I was charged twice."
    assert result["trace"] == ["receive_ticket"]


def test_workflow_preserves_existing_trace() -> None:
    result = workflow.invoke(
        {"ticket": "My account is locked.", "trace": ["submitted"]}
    )

    assert result["trace"] == ["submitted", "receive_ticket"]

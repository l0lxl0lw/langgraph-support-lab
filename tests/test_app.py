from pathlib import Path

from streamlit.testing.v1 import AppTest


APP_PATH = Path(__file__).parents[1] / "app.py"


def test_app_requires_a_ticket() -> None:
    app = AppTest.from_file(APP_PATH).run()

    app.button[0].click().run()

    assert not app.exception
    assert app.warning[0].value == "Enter a customer message before running the workflow."


def test_app_displays_workflow_result() -> None:
    app = AppTest.from_file(APP_PATH).run()

    app.text_area[0].set_value("I was charged twice.").run()
    app.button[0].click().run()

    assert not app.exception
    assert app.success[0].value == "Workflow complete"
    assert app.metric[0].value == "1"
    assert app.code[0].value == "receive_ticket"

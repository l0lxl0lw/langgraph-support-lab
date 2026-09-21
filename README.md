# Support Agent Demo

A browser-based project for learning how LangChain model components fit inside a
LangGraph support workflow.

## Hosted demo

The static demo is deployed to
[l0lxl0lw.github.io/support-agent-demo](https://l0lxl0lw.github.io/support-agent-demo/)
when changes reach `main`. It mirrors the implemented workflow in browser-only
JavaScript, so visitors can try it without a backend or API key. The Python app
remains the source of truth for actual LangGraph behavior.

## Local setup

Create `.env` from `.env.example` and replace the placeholder with a newly issued
OpenRouter key. Never commit `.env`.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
streamlit run app.py
```

Run the tests with `python -m pytest`.

## Planned workflow

The application will classify a customer ticket, route it through explicit graph
nodes, draft a response, and escalate uncertain or sensitive requests. The UI will
show the classification, selected route, state, and node execution trace.

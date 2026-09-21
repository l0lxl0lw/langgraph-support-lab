# Support Agent Demo

A browser-based project for learning how LangChain model components fit inside a
LangGraph support workflow.

## Hosted demo

The static demo is deployed to
[l0lxl0lw.github.io/support-agent-demo](https://l0lxl0lw.github.io/support-agent-demo/)
when changes reach `main`. It mirrors the implemented workflow in browser-only
JavaScript and calls OpenRouter directly with a visitor-provided API key, so no
backend is required. The key remains in the browser tab, is not persisted, and is
sent only to OpenRouter. The Python app remains the source of truth for actual
LangGraph behavior.

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

## Current workflow

The application receives and classifies a customer ticket, routes it through
explicit graph nodes, drafts a response, and escalates low-confidence requests.
The current classifier and responses are deterministic demo rules. A later exercise
will replace them with LangChain model calls while preserving the graph structure.

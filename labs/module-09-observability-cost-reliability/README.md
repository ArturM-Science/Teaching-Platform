# Module 09 Lab Starter

This starter supports the "Instrument, Cost-Audit & Harden Your Agent" lab.

It begins with a small customer-support agent that has no real observability. Learners add Langfuse tracing, cost accounting, fallback behavior, SLOs, and a readiness checklist.

Expected deliverables are listed in the lesson page:

- `instrumented_agent.py`
- `cost_audit.md`
- `fallback_agent.py`
- `slo_definitions.yaml`
- `alert_screenshot.png`
- `readiness_checklist.md`

Setup:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python verify_langfuse.py
pytest tests/test_integration.py -v
```

For macOS/Linux activation, use `source .venv/bin/activate`.


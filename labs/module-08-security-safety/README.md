# Module 08 Lab Starter

This starter supports the "Red-team and Harden Your Agent" lab.

It intentionally begins with an over-permissioned customer-support agent so learners can:

- run a baseline red-team scan,
- audit tool permissions,
- remove unjustified tools,
- add an output guardrail,
- rerun tests and compare the hardened behavior.

Expected deliverables are listed in the lesson page:

- `scan_report_baseline.json`
- `scan_report_hardened.json`
- `guardrail.py`
- `permission_audit.md`
- `compliance_posture.md`
- `red_team_findings.md`

Setup:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest tests/test_integration.py -v
```

For macOS/Linux activation, use `source .venv/bin/activate`.


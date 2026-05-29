# Module 13 build notes

Directory: `content/modules/module-13-openai-codex/`

This module is authored as a normal course module, not as a separate docs page. Keep it aligned with the existing lesson pattern:

- `index.mdx` is the module landing page.
- Lesson files are named `lesson-01.mdx` through `lesson-06-lab.mdx`.
- Frontmatter must include `title`, `module`, `lesson`, and `slug`.
- MDX may use the approved components from `components/mdx/`.
- Do not put `'use client'` in MDX.

The module teaches OpenAI Codex as a practical coding-agent case study. The durable teaching goals are agent supervision, task specification, repo context, sandboxing, approvals, verification, reusable project instructions, skills, MCP, subagents, code review, repair loops, and automation.

Official OpenAI sources used while drafting:

- https://developers.openai.com/codex
- https://developers.openai.com/codex/quickstart
- https://developers.openai.com/codex/prompting
- https://developers.openai.com/codex/workflows
- https://developers.openai.com/codex/concepts/sandboxing
- https://developers.openai.com/codex/permissions
- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/skills
- https://developers.openai.com/codex/mcp
- https://developers.openai.com/codex/concepts/subagents
- https://developers.openai.com/codex/github-action
- https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex

Suggested course placement: bonus/practitioner module after the capstone, or an optional track after Module 2 for learners who want to use a real coding agent while building later labs.

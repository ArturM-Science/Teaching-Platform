# Module 14 build notes

Directory: `content/modules/module-14-claude-code/`

This module is authored as a normal course module. Keep it aligned with the existing MDX lesson pattern:

- `index.mdx` is the module landing page.
- Lesson files are named `lesson-01.mdx` through `lesson-07-lab.mdx`.
- Frontmatter must include `title`, `module`, `lesson`, and `slug`.
- MDX may use only approved components from `components/mdx/`.
- Do not put `'use client'` in MDX.
- Avoid raw `<-` text in MDX links; MDX can parse it as JSX.

The module teaches Claude Code as a practical coding-agent operating system: local sessions, cloud sessions, permissions, memory, hooks, skills, MCP, subagents, agent view, dynamic workflows, and Claude Managed Agents.

Official Anthropic sources used while drafting:

- https://code.claude.com/docs/en/overview
- https://code.claude.com/docs/en/how-claude-code-works
- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/permission-modes
- https://code.claude.com/docs/en/permissions
- https://code.claude.com/docs/en/tools-reference
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/agents
- https://code.claude.com/docs/en/agent-view
- https://claude.com/blog/agent-view-in-claude-code
- https://claude.com/blog/introducing-dynamic-workflows-in-claude-code
- https://platform.claude.com/docs/en/managed-agents/overview
- https://platform.claude.com/docs/en/managed-agents/quickstart
- https://platform.claude.com/docs/en/managed-agents/agent-setup
- https://platform.claude.com/docs/en/managed-agents/tools
- https://platform.claude.com/docs/en/managed-agents/permission-policies
- https://claude.com/blog/claude-managed-agents
- https://claude.com/blog/claude-managed-agents-updates

Suggested course placement: after Module 13 as the second practitioner-tool module. Module 13 focuses on OpenAI Codex. Module 14 focuses on Claude Code and the Anthropic agent stack, including Managed Agents as the production-runtime bridge.

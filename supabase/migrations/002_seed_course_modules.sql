-- Seed the AI Agents course and its modules so progress tracking has foreign keys to join against.
-- Uses INSERT ... ON CONFLICT DO NOTHING so re-running is safe.

insert into public.courses (id, slug, title)
values ('00000000-0000-0000-0000-000000000001', 'ai-agents', 'AI Agents')
on conflict (slug) do nothing;

insert into public.modules (course_id, number, slug, title)
values
  ('00000000-0000-0000-0000-000000000001',  0, 'module-00-mental-models',                  'Mental Models & the Bare-Metal Agent'),
  ('00000000-0000-0000-0000-000000000001',  1, 'module-01-prompting-reasoning',            'Prompting & Reasoning'),
  ('00000000-0000-0000-0000-000000000001',  2, 'module-02-tools-function-calling',         'Tools & Function Calling'),
  ('00000000-0000-0000-0000-000000000001',  3, 'module-03-memory-knowledge',               'Memory & Knowledge'),
  ('00000000-0000-0000-0000-000000000001',  4, 'module-04-evaluation',                     'Evaluation'),
  ('00000000-0000-0000-0000-000000000001',  5, 'module-05-workflow-patterns',              'Workflow Patterns & Control Flow'),
  ('00000000-0000-0000-0000-000000000001',  6, 'module-06-multi-agent-systems',            'Multi-Agent Systems'),
  ('00000000-0000-0000-0000-000000000001',  7, 'module-07-deployment-serving',             'Deployment & Serving'),
  ('00000000-0000-0000-0000-000000000001',  8, 'module-08-security-safety',                'Security & Safety'),
  ('00000000-0000-0000-0000-000000000001',  9, 'module-09-observability-cost-reliability', 'Observability, Cost & Reliability'),
  ('00000000-0000-0000-0000-000000000001', 10, 'module-10-agent-ux',                       'Agent UX & Human-Agent Interaction'),
  ('00000000-0000-0000-0000-000000000001', 11, 'module-11-frontiers',                      'Frontiers'),
  ('00000000-0000-0000-0000-000000000001', 12, 'module-12-capstone',                       'Capstone'),
  ('00000000-0000-0000-0000-000000000001', 13, 'module-13-openai-codex',                   'OpenAI Codex: Agentic Software Engineering'),
  ('00000000-0000-0000-0000-000000000001', 14, 'module-14-claude-code',                    'Claude Code: Operating Agentic Coding Workflows')
on conflict (course_id, slug) do nothing;

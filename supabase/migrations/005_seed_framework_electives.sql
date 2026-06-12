-- Seed framework elective modules 15–20.
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

insert into public.modules (course_id, number, slug, title)
values
  ('00000000-0000-0000-0000-000000000001', 15, 'module-15-anthropic-sdk',      'Anthropic Python SDK'),
  ('00000000-0000-0000-0000-000000000001', 16, 'module-16-langgraph',           'LangGraph'),
  ('00000000-0000-0000-0000-000000000001', 17, 'module-17-google-adk',          'Google ADK'),
  ('00000000-0000-0000-0000-000000000001', 18, 'module-18-openai-agents-sdk',   'OpenAI Agents SDK'),
  ('00000000-0000-0000-0000-000000000001', 19, 'module-19-autogen-ag2',         'AutoGen / AG2'),
  ('00000000-0000-0000-0000-000000000001', 20, 'module-20-crewai',              'CrewAI')
on conflict (course_id, slug) do nothing;

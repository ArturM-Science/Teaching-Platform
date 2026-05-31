@AGENTS.md

# AI Agents Teaching Platform — Codebase Guide

## Session Start Protocol

At the beginning of every new conversation in this project, before doing anything else:

1. Read `CLAUDE.md` (this file) fully — especially "What's Next" and any module notes
2. Read any memory files in the project memory folder
3. Tell the user in plain language:
   - What was accomplished in the previous session (modules built, features added, files changed)
   - What the plan is for this session based on "What's Next"
   - Any pending commands or actions that need to be run (migrations, npm install, etc.) — then run them immediately without asking
4. Then wait for the user to confirm or redirect before starting work

## Stack

- **Framework:** Next.js 16, App Router, React Server Components
- **Styling:** Tailwind CSS 4 (no `tailwind.config.ts` — uses CSS-native approach)
- **MDX:** `next-mdx-remote/rsc` + `gray-matter` for frontmatter
- **Database:** Supabase (Postgres + Auth)
- **Email:** Resend

## MDX Pipeline

Lessons are plain `.mdx` files in `content/modules/[moduleSlug]/[lessonSlug].mdx`.

Rendering uses `MDXRemote` from `next-mdx-remote/rsc`. Two rules that must never change:

1. **`blockJS: false` is mandatory.** Without it, `next-mdx-remote` silently strips all JS expressions — `options={[{...}]}` becomes `undefined` and Quiz breaks at runtime.
2. **Never use `'use client'` in MDX files.** Put it only in component source files in `components/mdx/`.

```tsx
<MDXRemote
  source={raw}
  components={mdxComponents}
  options={{ parseFrontmatter: true, blockJS: false }}
/>
```

Components are wired in `app/(learner)/modules/[module]/[lesson]/page.tsx` via the `components` prop — there is no global `mdx-components.tsx` file.

## Content File Conventions

```
content/
  modules/
    module-00-mental-models/
      index.mdx          ← module landing page
      lesson-01.mdx      ← individual lessons (slug matches filename)
      lesson-05-lab.mdx  ← lab lessons follow the same pattern
      failure-museum.mdx ← optional separate failure exhibit file
```

Frontmatter required in every lesson:

```yaml
---
title: "Lesson title"
module: "module-00-mental-models"
lesson: 1
slug: "lesson-01"
---
```

## Pedagogical Scaffold

Every lesson MDX must follow this structure:

1. Plain-language intro (no jargon first, ≤3 sentences)
2. Core concept — prose with inline components
3. `<Callout>` for the key insight or a common misconception
4. `<Quiz>` — at least one per concept section
5. `<Checkpoint>` or `<LabBrief>` at the end of the last lesson / lab lesson
6. Optional: `<FailureMuseum>` for cautionary cases

Maximum 3 interactive elements per concept section.

## Approved Components

All components live in `components/mdx/`. See `components/mdx/README.md` for full prop API.

| Component | Needs `'use client'` | Purpose |
|---|---|---|
| `Callout` | No (server-safe) | Highlighted note, warning, tip, or key insight |
| `Video` | No (server-safe) | Responsive YouTube embed |
| `LearningObjectives` | No (server-safe) | Module outcome list with checkmarks |
| `LabBrief` | No (server-safe) | Lab assignment header with time estimate |
| `Rubric` | No (server-safe) | 4-level grading table |
| `Quiz` | Yes | Multiple-choice question with instant feedback |
| `Checkpoint` | Yes | Interactive self-assessment checklist |
| `FailureMuseum` | Yes | Collapsible failure case study |

## What NOT to Do

- Do not create new components in MDX files. Add them to `components/mdx/` and update `README.md`.
- Do not hardcode colours or spacing. Use Tailwind utility classes; the palette is zinc-based.
- Do not use `next/image` barrel imports — import from `next/image` directly.
- Do not add barrel re-exports that pull client components into server component trees.
- Do not modify `options={{ parseFrontmatter: true, blockJS: false }}` — both flags are required.

## Content Loading

`lib/content.ts` provides:

- `getMdxContent(moduleSlug, lessonSlug)` — reads raw `.mdx` source
- `getLessonsForModule(moduleSlug)` — lists lessons with frontmatter
- `getModuleSlugs()` — lists all modules
- `getModuleMeta(moduleSlug)` — reads module `index.mdx` metadata

## Auth & Progress

Supabase Auth is wired. Progress tracking is live as of 2026-05-31.

Server actions live in `app/auth/actions.ts`. The confirmation callback route is `app/auth/confirm/route.ts`.

Progress server action: `app/progress/actions.ts` → `markModuleComplete(moduleSlug)`. Upserts a `complete` row into `public.progress` and revalidates `/dashboard`.

`Checkpoint` accepts an optional `moduleSlug` prop — when all items are ticked it calls `markModuleComplete`. Add it to every checkpoint in MDX:
```mdx
<Checkpoint moduleSlug="module-00-mental-models" items={[...]} next="..." />
```

## Sidebar Navigation

`components/LessonSidebar.tsx` — client component, uses `usePathname()` to highlight the active lesson. Shows "Overview" (module index) then numbered lessons. Lab lessons show "Lab" instead of a number.

`app/(learner)/modules/[module]/layout.tsx` — server layout that fetches lessons for the current module and renders the two-column layout (256px sidebar + fluid content).

## Database

Migrations in `supabase/migrations/`:
- `001_initial_schema.sql` — users, courses, modules, progress, workshops, RLS policies
- `002_seed_course_modules.sql` — seeds the AI Agents course + all 15 module rows (run this in the Supabase SQL editor if not done yet)

## Dashboard

`app/dashboard/page.tsx` fetches the user's completed slugs from Supabase and shows:
- Green ✓ badge on completed modules
- "Completed" label instead of "Ready"
- Progress widget in the sidebar: "X / 15 modules completed" with a progress bar

## What's Next

- **Run migration 002 in Supabase** — paste `supabase/migrations/002_seed_course_modules.sql` into the Supabase SQL editor (Settings → SQL Editor). Not done yet as of 2026-05-31. After running, verify the app on the Vercel URL.
- Add `moduleSlug` prop to all `<Checkpoint>` usages in existing MDX files (Module 06 lab already has it)
- Mobile sidebar: collapse into a slide-out drawer on small screens
- Workshop scheduling panel (currently placeholder in dashboard sidebar)
- **Next module to build: Module 07** — Evaluation (how evaluation changes with multi-agent systems is a natural bridge from Module 06)

## Module 05 — Workflow Patterns & Control Flow (added 2026-05-31)

5 lessons + lab. Three interactive components built for this module:

| Component | File | Used in |
|---|---|---|
| `<WorkflowDiagram>` | `WorkflowDiagram.tsx` | Lesson 1 — spectrum from single call to stateful workflow |
| `<ClassifierRouter>` | `ClassifierRouter.tsx` | Lesson 3 — classify a ticket and watch it route to a branch |
| `<RepairLoopSim>` | `RepairLoopSim.tsx` | Lesson 4 — two scenarios: converges vs hits MAX_ITERATIONS |

## Module 06 — Multi-Agent Systems (added 2026-06-01)

5 lessons + 6 labs. Four interactive components built for this module:

| Component | File | Used in |
|---|---|---|
| `<AgentVsWorkflow>` | `AgentVsWorkflow.tsx` | Lesson 1 — 4 scenarios: workflow or multi-agent and why |
| `<AgentRoleExplorer>` | `AgentRoleExplorer.tsx` | Lesson 2 — click role → inspect receives/produces/failure impact |
| `<CommunicationPatternSim>` | `CommunicationPatternSim.tsx` | Lesson 3 — pick pattern + failure scenario, see propagation |
| `<FailureCascadeSim>` | `FailureCascadeSim.tsx` | Lesson 4 — memory poisoning + deadlock, with mitigations |

Labs:

| File | Content |
|---|---|
| `lesson-06-lab.mdx` | Framework-agnostic design lab — system prompts, communication pattern, failure mitigations |
| `lesson-07-lab-langgraph.mdx` | LangGraph — `StateGraph`, typed state, fan-out/fan-in, `MemorySaver`, `interrupt_before` |
| `lesson-08-lab-claude-sdk.mdx` | Claude Agent SDK — `AgentDefinition`, `allowed_tools: ['Agent']`, Managed Agents hosted version |
| `lesson-09-lab-autogen.mdx` | AutoGen GroupChat + AG2 `DiGraphGroupChat` upgrade path |
| `lesson-10-lab-crewai.mdx` | CrewAI — `Process.hierarchical` vs `sequential`, token overhead measurement |
| `lesson-11-lab-2.mdx` | Cross-system: LangGraph (System A) → Pydantic boundary → CrewAI (System B) |

Key content sources: Anthropic "Building Effective Agents", MAST taxonomy (NeurIPS 2025), OWASP Top 10 Agentic 2026, bMAS blackboard study, LangGraph/CrewAI/AG2 docs.

## Module 14 — Lesson Structure (8 lessons as of 2026-05-31)

A Routines lesson was added as Lesson 6 (`lesson-06-routines.mdx`), shifting Managed Agents to Lesson 7 and Lab to Lesson 8. Lesson numbers in frontmatter were updated; slugs and URLs were preserved.

| # | Slug | Topic |
|---|------|-------|
| 1 | lesson-01 | What Claude Code is |
| 2 | lesson-02 | Prompting, plan mode, checkpoints |
| 3 | lesson-03 | CLAUDE.md, rules, memory, skills, MCP, hooks |
| 4 | lesson-04 | Permissions, sandboxing, safe autonomy |
| 5 | lesson-05 | Parallel work |
| 6 | lesson-06-routines | Routines: scheduled and triggered cloud automation |
| 7 | lesson-06 | Claude Managed Agents |
| 8 | lesson-07-lab | Lab |

Official routines docs: https://code.claude.com/docs/en/routines

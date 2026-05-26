@AGENTS.md

# AI Agents Teaching Platform — Codebase Guide

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

Supabase Auth is wired. Progress tracking is the next priority — connect the learner dashboard to real Supabase data (currently using placeholders).

Server actions live in `app/auth/actions.ts`. The confirmation callback route is `app/auth/confirm/route.ts`.

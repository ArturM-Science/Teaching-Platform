# MDX Component Library

> **For Claude Code:** This is the authoritative component registry.
> - Only use components listed here in MDX files.
> - Never create new components in MDX content — add to this folder and update this file first.
> - Match prop names and types exactly as documented.

All components are exported from `components/mdx/index.ts`.

---

## Server-Safe Components

These render as React Server Components. No `'use client'` needed.

---

### `<Callout>`

Highlighted block for notes, warnings, tips, or key insights.

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `type` | `'info' \| 'warning' \| 'tip' \| 'key'` | No | `'info'` | Visual style and auto-label |
| `children` | `ReactNode` | Yes | — | Block content (supports inline MDX) |

Auto-labels by type: `info` → "Note", `warning` → "Warning", `tip` → "Tip", `key` → "Key insight".

```mdx
<Callout type="tip">
  Agents fail loudly when the prompt is ambiguous — **this is a feature**, not a bug.
</Callout>

<Callout type="warning">
  Never give an agent write access to a production database before adding a confirmation step.
</Callout>
```

---

### `<Video>`

Responsive 16:9 embed. Accepts full YouTube URLs or any iframe-compatible `src`.

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `src` | `string` | Yes | — | Full YouTube URL or embed URL |
| `title` | `string` | No | `'Video'` | Accessible iframe title |

```mdx
<Video src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Agent loop walkthrough" />
```

---

### `<LearningObjectives>`

Module outcome list rendered with green checkmarks. Use at the top of `index.mdx` module pages.

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `ReactNode` | Yes | A Markdown `ul` list — each `li` gets a ✓ prefix |

```mdx
<LearningObjectives>
- Explain the perceive-reason-act loop without notes
- Write a tool-calling agent in under 50 lines
- Identify when a plain LLM call beats an agent loop
</LearningObjectives>
```

---

### `<LabBrief>`

Lab assignment header block. Use at the top of `lesson-XX-lab.mdx` files.

| Prop | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Lab name shown in the dark header |
| `time` | `string` | Yes | Estimated time (e.g. `"90 minutes"`) |
| `children` | `ReactNode` | Yes | Lab body — objectives, deliverables, instructions |

Use `####` headings and `ul` lists inside the body; they're styled automatically.

```mdx
<LabBrief title="Build a Bare-Metal Agent" time="90 minutes">

#### Objective
Build a tool-calling agent that can answer questions about a local CSV file.

#### Deliverables
- Working agent that reads the file and returns structured answers
- Short written reflection on where the agent surprised you

</LabBrief>
```

---

### `<Rubric>`

4-level grading table (Exceeds / Meets / Approaching / Below). Use at the end of lab lessons.

| Prop | Type | Required | Description |
|---|---|---|---|
| `threshold` | `string` | Yes | Passing requirement shown in the banner |
| `criteria` | `RubricCriterion[]` | Yes | Array of criterion objects |

Each criterion object:

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Criterion label (short, uppercase-style) |
| `exceeds` | `string` | Description for score 4 |
| `meets` | `string` | Description for score 3 (passing) |
| `approaching` | `string` | Description for score 2 |
| `below` | `string` | Description for score 1 |

```mdx
<Rubric
  threshold="Score 3 (Meets) or above on all criteria to pass."
  criteria={[
    {
      name: "Tool use",
      exceeds: "Handles edge cases; retries on failure",
      meets: "Correctly calls tools and parses responses",
      approaching: "Tools called but output not validated",
      below: "Tools not used or always error"
    },
    {
      name: "Reflection",
      exceeds: "Identifies a systemic fix, not just a symptom",
      meets: "Accurately describes one surprising agent behaviour",
      approaching: "Reflection is superficial",
      below: "No reflection submitted"
    }
  ]}
/>
```

---

## Client Components

These use `'use client'` internally. They hydrate in the browser; no special MDX syntax needed.

---

### `<Quiz>`

Multiple-choice question with instant feedback. Required at least once per concept section.

| Prop | Type | Required | Description |
|---|---|---|---|
| `question` | `string` | Yes | The question text |
| `options` | `QuizOption[]` | Yes | Answer choices |

Each option object:

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Answer text shown to the learner |
| `correct` | `boolean` | Mark `true` on the correct answer |
| `explanation` | `string` | Shown after submission (for correct or incorrect) |

Notes:
- Exactly one option should have `correct: true`.
- If only the correct option has an `explanation`, that explanation is shown for both correct and incorrect submissions — useful for short quizzes.
- There is no `id` prop yet; add one when progress tracking is wired.

```mdx
<Quiz
  question="What does an agent do after calling a tool?"
  options={[
    { label: "Stops and returns the tool's raw output", correct: false, explanation: "The agent observes the output and uses it to decide the next action — it doesn't stop." },
    { label: "Observes the output and decides the next action", correct: true, explanation: "The perceive-reason-act loop continues until the agent decides the task is complete." },
    { label: "Calls the same tool again to verify", correct: false, explanation: "Agents don't verify by default — they trust tool output unless prompted to check." }
  ]}
/>
```

---

### `<Checkpoint>`

Interactive self-assessment checklist. Accepts `items` and `next` props.

| Prop | Type | Required | Description |
|---|---|---|---|
| `items` | `string[]` | Yes | List of self-assessment statements shown as checkboxes |
| `next` | `string` | Yes | Message shown when all items are checked (e.g. "Module N complete — move on to Module N+1 →") |

```mdx
<Checkpoint
  items={[
    "I can explain X without notes",
    "I can build Y from scratch",
  ]}
  next="Module N complete — move on to Module N+1 →"
/>
```

---

### `<FailureMuseum>`

Collapsible failure case study. Expand/collapse is client-side.

| Prop | Type | Required | Description |
|---|---|---|---|
| `exhibit` | `string` | Yes | Short name for the failure (shown in the header) |
| `symptom` | `string` | Yes | One-line observable symptom (shown as sub-heading) |
| `children` | `ReactNode` | Yes | Full case study body — what happened, why, how to avoid |

Use `####` headings, `ol` lists, and `pre`/`code` blocks inside the body; they're styled automatically.

```mdx
<FailureMuseum
  exhibit="The Infinite Loop Agent"
  symptom="Agent kept calling the same search tool 47 times and never stopped"
>

#### What happened
The agent's stopping condition was `"answer the question"` — but the search results never contained an exact answer, so it looped.

#### Root cause
No maximum iteration guard. The model kept reasoning "I still don't know, I should search again."

#### How to avoid
Always set a hard `max_iterations` limit. Log when the limit is hit — don't silently stop.

</FailureMuseum>
```

---

## Module 04 — Evaluation Components

These five components are used exclusively in Module 4 lessons.

---

### `<EvalChallengeViz>`

Shows the same research agent prompt run three times producing different outputs. Learner picks the "best" response, then sees two domain experts disagree — making the "no ground truth" problem concrete.

No props. Self-contained with hardcoded scenarios.

```mdx
<EvalChallengeViz />
```

---

### `<EvalSetBuilder>`

Eight test case descriptions. Learner clicks to classify each as Happy Path / Adversarial / Edge Case / Regression. After submitting, shows correct answers, explanations for wrong classifications, and a coverage breakdown by category.

No props. Self-contained.

```mdx
<EvalSetBuilder />
```

---

### `<ScoringPlayground>`

A single agent response (with tool call trace) scored by three different metrics: Exact Match, Rubric Score, and Trajectory Analysis. Learner toggles between metrics to see different verdicts for the same output.

No props. Self-contained.

```mdx
<ScoringPlayground />
```

---

### `<JudgeBiasDemo>`

Demonstrates LLM-as-judge bias interactively. Two modes: **Position bias** (swap response order, watch judge flip verdict) and **Length bias** (longer response scores higher despite lower quality). Learner runs the judge, swaps the order, sees the score change.

No props. Self-contained.

```mdx
<JudgeBiasDemo />
```

---

### `<RegressionRunnerViz>`

CI-style test runner simulation. Eight test cases shown with pass/fail badges. "Introduce Bug" toggle causes three regression cases to fail while happy-path tests continue passing. "Fix Bug" restores all to passing.

No props. Self-contained.

```mdx
<RegressionRunnerViz />
```

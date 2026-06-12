# MDX Component Library

> **For Claude Code:** This is the authoritative component registry.
> - Only use components listed here in MDX files.
> - Never create new components in MDX content — add to this folder and update this file first.
> - Match prop names and types exactly as documented.

All components are exported from `components/mdx/index.ts`.

---

## MDX Authoring Gotchas

MDX treats `{...}` as JavaScript expressions. Literal template placeholders such as `{{input}}`, `{{output}}`, or `{{user}}` must be placed in fenced code blocks:

````mdx
```text
User: {{input}}
Agent: {{output}}
```
````

Do not place those placeholders inline in prose or quoted strings; they can render as `ReferenceError` at runtime.

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
| `time` | `string` | No | Estimated time (e.g. `"90 minutes"`) |
| `duration` | `string` | No | Alternate estimated time prop; used when `time` is omitted |
| `difficulty` | `string` | No | Short difficulty label shown under the lab title |
| `summary` | `string` | No | One-paragraph summary shown before the lab body |
| `objective` | `string` | No | Objective block shown before the lab body |
| `prerequisites` | `string[]` | No | Prerequisite list shown before the lab body |
| `children` | `ReactNode` | No | Lab body - objectives, deliverables, instructions |

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

Rich metadata form:

```mdx
<LabBrief
  title="Launch Readiness Review"
  duration="2-3 hours"
  difficulty="Advanced"
  summary="Review an agent project against production-readiness criteria."
  objective="Produce a launch decision backed by evaluation, safety, and observability evidence."
  prerequisites={[
    "Completed evaluation report",
    "Trace sample or log evidence",
    "Safety review draft"
  ]}
/>
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

### `<ModuleQuiz>`

End-of-module graded quiz. Lives in its own MDX page (`module-quiz.mdx`, frontmatter `lesson: 90`, slug `module-quiz`) placed after the lab. When the learner submits and scores `passPercent` or higher, it calls `markModuleComplete(moduleSlug)` — this is the official module-completion trigger.

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `moduleSlug` | `string` | Yes | — | Module to mark complete on pass |
| `questions` | `QuizQuestion[]` | Yes | — | `{ question, options: [{ label, correct? }], explanation? }` — explanation shown only on wrong answers after submit |
| `passPercent` | `number` | No | `80` | Minimum score to pass |
| `next` | `string` | No | — | Message shown on pass |

Notes:
- All questions must be answered before Submit enables. Failing shows a Retry button that resets the quiz.
- Use 5–8 questions covering the module's core concepts and the lab.

```mdx
<ModuleQuiz
  moduleSlug="module-00-mental-models"
  questions={[
    { question: "…", options: [{ label: "wrong" }, { label: "right", correct: true }], explanation: "Shown when wrong." }
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

### `<Solution>`

Collapsible solution reveal for exercises. Content stays hidden until the learner clicks the button, encouraging them to attempt the exercise first.

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `label` | `string` | No | `'Show solution'` | Button text shown while collapsed |
| `children` | `ReactNode` | Yes | — | Solution body — code blocks, explanations, lists |

Use `####` headings, `ul`/`ol` lists, and fenced code blocks inside the body; they're styled automatically.

````mdx
<Solution>

#### Complete solution

```python
messages.append({"role": "user", "content": user_text})
```

Walkthrough of why each line works.

</Solution>
````

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

---

### `<WorkflowDiagram>`

Step-through visualisation of the four levels of workflow complexity: single call → prompt chain → branching → stateful workflow. User clicks between stages via tabs or prev/next. Each stage shows a node diagram and explains what it adds and what it cannot do. Used in Module 05, Lesson 1.

No props. Self-contained.

```mdx
<WorkflowDiagram />
```

---

### `<ClassifierRouter>`

Interactive classifier simulation. User selects one of four preset support tickets. The component animates the classifier call (with typed JSON output including confidence score), highlights the routed branch, and shows the audit log entry. One ticket deliberately has low confidence to demonstrate the fallback path. Used in Module 05, Lesson 3.

No props. Self-contained.

```mdx
<ClassifierRouter />
```

---

### `<RepairLoopSim>`

Step-through repair loop simulator with two scenarios: one that converges after one repair iteration and one that hits MAX_ITERATIONS=2 and escalates. Shows iteration counter, verifier pass/fail JSON output, and a repair step at each iteration. Teaches stopping conditions by showing what happens when they are and aren't enough. Used in Module 05, Lesson 4.

No props. Self-contained.

```mdx
<RepairLoopSim />
```

---

### `<AgentVsWorkflow>`

Scenario picker that shows whether a described task calls for a multi-agent system or a workflow — and why. Four preset scenarios (deep research, email summarisation, code security review, support email routing). Each shows a verdict badge (Multi-agent / Workflow), a list of reasons, and a key insight. Used in Module 06, Lesson 1.

No props. Self-contained.

```mdx
<AgentVsWorkflow />
```

---

### `<AgentRoleExplorer>`

Interactive explorer for the four agent roles: Orchestrator, Subagent, Specialist, Critic. User clicks a role card to select it, then switches between five field tabs (Receives, Produces, Typical tools, If it fails, Real-world example). Includes a pipeline overview diagram with clickable role buttons. Used in Module 06, Lesson 2.

No props. Self-contained.

```mdx
<AgentRoleExplorer />
```

---

### `<CommunicationPatternSim>`

Interactive simulator for the three multi-agent communication patterns: Direct Handoff, Shared Message Queue, Blackboard / Shared State. User selects a pattern to see pros, trade-offs, and best-fit use cases. Then selects a failure scenario (agent goes offline, bad output) to see how each pattern handles it differently. Used in Module 06, Lesson 3.

No props. Self-contained.

```mdx
<CommunicationPatternSim />
```

---

### `<FailureCascadeSim>`

Step-through failure cascade simulator with two scenarios. **Memory poisoning:** shows a hallucination being written to shared memory and contaminating three downstream agents, then shows the structured-handoff mitigation. **Coordination deadlock:** shows two agents in mutual WAITING state with no error signal, then shows the timeout circuit breaker and design-time contract mitigation. Includes an infection tracker for the memory poisoning scenario. Used in Module 06, Lesson 4.

No props. Self-contained.

```mdx
<FailureCascadeSim />
```

---

## Module 11 - Frontiers Components

### `<AutonomyRunSimulator>`

Interactive long-horizon run state simulator. Learners choose a clean run, tool failure, budget overrun, or approval-required scenario and step through the resulting run states.

No props. Self-contained. Used in Module 11, Lesson 5.

```mdx
<AutonomyRunSimulator />
```

### `<FrontierReadinessScorecard>`

Seven-dimension readiness scorecard for frontier capabilities. Learners score task fit, reliability, observability, control, evaluation, UX, and maintainability from 1-4 and receive a launch decision category.

No props. Self-contained. Used in Module 11, Lesson 6.

```mdx
<FrontierReadinessScorecard />
```

### `<AgentProtocolComparison>`

Interactive comparison of tool protocols, typed handoffs, and agent-to-agent protocols. Learners can switch between protocol types and inspect the flow, best-fit use case, risks, and audit fields.

No props. Self-contained. Used in Module 11, Lesson 4.

```mdx
<AgentProtocolComparison />
```

### `<A2AProtocolMovie>`

Animated step-through explainer for an agent-to-agent protocol exchange. Shows capability discovery, capability advert, task contract, authority check, status update, result return, and ownership closure.

No props. Self-contained. Used in Module 11, Lesson 4.

```mdx
<A2AProtocolMovie />
```

---

## Module 12 - Capstone Components

### `<CapstoneProjectScoper>`

Interactive project scoping scorecard. Learners choose a project shape and score user clarity, data availability, evaluation ease, risk, and build feasibility.

No props. Self-contained. Used in Module 12, Lesson 1.

```mdx
<CapstoneProjectScoper />
```

### `<LaunchReadinessReview>`

Interactive launch-readiness checklist. Learners mark each capstone requirement as Pass, Needs work, or N/A and receive a suggested launch decision.

No props. Self-contained. Used in Module 12, Lesson 6.

```mdx
<LaunchReadinessReview />
```

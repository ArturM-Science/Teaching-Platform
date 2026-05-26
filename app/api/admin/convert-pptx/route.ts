import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { parsePptx, slidesToPrompt } from '@/lib/pptx'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are converting PowerPoint slide content into a structured MDX lesson for an AI Agents teaching platform built with Next.js and next-mdx-remote.

## Approved components (use ONLY these)

- <Callout type="info|warning|tip|key"> — highlighted block. Auto-labels: info→Note, warning→Warning, tip→Tip, key→Key insight
- <Video src="..." title="..." /> — YouTube embed
- <LearningObjectives> — module outcomes list with checkmarks (use at module index pages only)
- <LabBrief title="..." time="..."> — lab assignment header
- <Rubric threshold="..." criteria={[{name, exceeds, meets, approaching, below}]} /> — 4-level grading table
- <Quiz question="..." options={[{label, correct?, explanation?}]} /> — MCQ with instant feedback. Exactly one option must have correct: true.
- <FailureMuseum exhibit="..." symptom="..."> — collapsible failure case study

## Required lesson structure

1. Frontmatter (title, module, lesson number, slug)
2. Plain-language intro — 2-3 sentences, no jargon, acronyms defined on first use
3. Core concept sections (## headings) — prose with Callout and Quiz woven inline, not appended at the end
4. At least one Callout per section
5. At least one Quiz per concept section
6. FailureMuseum if slide content includes a failure case or gotcha

## Constraints

- No 'use client' in the MDX file
- No hardcoded colours or inline styles
- Heading hierarchy: ## for sections, ### for subsections — never skip levels
- Max 3 interactive elements per concept section
- Every Quiz must have exactly one correct: true option
- Every Rubric must have a threshold prop
- Do not invent components not listed above

## Output format

Output ONLY the complete .mdx file — no prose before or after it.`

export async function POST(req: NextRequest) {
  // Auth check — must be signed in as admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Parse multipart form
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const moduleSlug = String(formData.get('module') ?? 'module-00')
  const lessonNumber = String(formData.get('lesson') ?? '1')

  if (!file || !file.name.endsWith('.pptx')) {
    return NextResponse.json({ error: 'A .pptx file is required' }, { status: 400 })
  }

  // Parse PPTX
  const buffer = await file.arrayBuffer()
  const slides = await parsePptx(buffer)

  if (slides.length === 0) {
    return NextResponse.json({ error: 'No text content found in the presentation' }, { status: 422 })
  }

  const slideText = slidesToPrompt(slides)

  // Call Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Convert the following slide content into an MDX lesson.

Module slug: ${moduleSlug}
Lesson number: ${lessonNumber}

${slideText}`,
      },
    ],
  })

  const mdx = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({
    slides: slides.map(s => ({ index: s.index, text: s.text, notes: s.notes })),
    mdx,
  })
}

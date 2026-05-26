import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, temperature } = await req.json()

  if (!prompt || typeof temperature !== 'number') {
    return NextResponse.json({ error: 'prompt and temperature are required' }, { status: 400 })
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 300,
      temperature,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond in 2–4 sentences.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return NextResponse.json({ error: err }, { status: 502 })
  }

  const json = await response.json()
  const text: string = json.choices?.[0]?.message?.content ?? ''

  return NextResponse.json({ text })
}

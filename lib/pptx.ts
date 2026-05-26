import JSZip from 'jszip'

export interface SlideContent {
  index: number
  text: string
  notes: string
}

function extractText(xml: string): string {
  // Extract all <a:t> text nodes, joining runs within a paragraph with space
  // and paragraphs with newline
  const paragraphs: string[] = []
  const paraRegex = /<a:p[\s>][\s\S]*?<\/a:p>/g
  const textRegex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g

  let paraMatch
  while ((paraMatch = paraRegex.exec(xml)) !== null) {
    const paraXml = paraMatch[0]
    const runs: string[] = []
    let textMatch
    while ((textMatch = textRegex.exec(paraXml)) !== null) {
      runs.push(textMatch[1])
    }
    const line = runs.join('').trim()
    if (line) paragraphs.push(line)
  }

  return paragraphs.join('\n')
}

function slideNumber(filename: string): number {
  const m = filename.match(/slide(\d+)\.xml$/)
  return m ? parseInt(m[1], 10) : 0
}

export async function parsePptx(buffer: ArrayBuffer): Promise<SlideContent[]> {
  const zip = await JSZip.loadAsync(buffer)

  // Collect slide files sorted numerically
  const slideFiles = Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => slideNumber(a) - slideNumber(b))

  const slides: SlideContent[] = []

  for (const slideFile of slideFiles) {
    const index = slideNumber(slideFile)
    const slideXml = await zip.files[slideFile].async('string')
    const text = extractText(slideXml)

    // Try to get speaker notes
    const notesFile = `ppt/notesSlides/notesSlide${index}.xml`
    let notes = ''
    if (zip.files[notesFile]) {
      const notesXml = await zip.files[notesFile].async('string')
      notes = extractText(notesXml)
    }

    slides.push({ index, text, notes })
  }

  return slides.filter(s => s.text.trim().length > 0)
}

export function slidesToPrompt(slides: SlideContent[]): string {
  return slides
    .map(s => {
      const parts = [`--- Slide ${s.index} ---`, s.text]
      if (s.notes) parts.push(`[Speaker notes]: ${s.notes}`)
      return parts.join('\n')
    })
    .join('\n\n')
}

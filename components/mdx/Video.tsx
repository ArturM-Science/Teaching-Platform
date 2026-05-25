function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export function Video({ src, title = 'Video' }: { src: string; title?: string }) {
  const youtubeId = getYouTubeId(src)
  const embedSrc = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : src

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  )
}

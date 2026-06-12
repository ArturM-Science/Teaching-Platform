import Link from 'next/link'

interface Props {
  notebook: string
  label?: string
}

const REPO = 'ArturM-Science/Teaching-Platform'
const BRANCH = 'main'

export function ColabButton({ notebook, label = 'Open in Google Colab' }: Props) {
  const href = `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/notebooks/${notebook}.ipynb`

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 hover:border-amber-400"
    >
      {/* Google Colab logo */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" fill="#F9AB00"/>
        <path d="M16.5 7.5a4.5 4.5 0 010 9 4.5 4.5 0 01-4.243-3H9a3 3 0 100-6h3.257A4.5 4.5 0 0116.5 7.5z" fill="#fff"/>
        <circle cx="16.5" cy="12" r="2" fill="#F9AB00"/>
      </svg>
      {label}
    </Link>
  )
}

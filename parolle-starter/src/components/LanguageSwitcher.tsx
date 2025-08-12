import { useTranslation } from 'react-i18next'

const options = [
  { code: 'fr', label: 'Français' },
  { code: 'co', label: 'Corsu' },
  { code: 'en', label: 'English' },
]

const Globe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20z" />
  </svg>
)

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage || 'fr'

  const change = (lng: string) => {
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng // a11y
  }

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => change(e.target.value)}
        aria-label="Langue"
        className="appearance-none bg-slate-900/60 border border-slate-700 text-slate-200
                   pl-9 pr-7 py-2 rounded-lg text-sm
                   hover:bg-slate-800/60
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                   focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {options.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
      </select>

      {/* icône globe */}
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-300">
        <Globe />
      </span>
      {/* chevron */}
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
    </div>
  )
}

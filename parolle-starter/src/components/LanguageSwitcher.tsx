import { useTranslation } from 'react-i18next'

const options = [
  { code: 'fr', label: 'Français' },
  { code: 'co', label: 'Corsu' },
  { code: 'en', label: 'English' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage || 'fr'

  const change = (lng: string) => {
    i18n.changeLanguage(lng)
    // i18next-browser-languagedetector se charge de persister en localStorage (clé i18nextLng)
    document.documentElement.lang = lng // pour l’accessibilité
  }

  return (
    <select
      value={current}
      onChange={(e) => change(e.target.value)}
      className="bg-slate-800 border border-slate-600 rounded-md px-2 py-1 text-xs"
      aria-label="Language"
    >
      {options.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
    </select>
  )
}

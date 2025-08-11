// src/components/HistoricalBanner.tsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type FactPayload = {
  date: string | undefined        // "YYYY-MM-DD" si dispo
  dateText: string
  fact: string | null
  headerText?: string | null      // si dispo via l’API
}

export default function HistoricalBanner() {
  const { i18n, t } = useTranslation()
  const [data, setData] = useState<FactPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let alive = true
    setOpen(false) // referme quand on change de langue
    ;(async () => {
      try {
        setLoading(true)
        setError(false)
        const r = await fetch(`/api/fact?lang=${encodeURIComponent(i18n.language)}`)
        if (!r.ok) throw new Error()
        const j = await r.json()
        if (!alive) return
        setData({
          date: j.date,                 // ← pris si dispo
          dateText: j.dateText,
          fact: j.fact ?? null,
          headerText: j.headerText ?? null, // ← pris si dispo
        })
      } catch {
        if (alive) setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [i18n.language])

  // --- Fallback côté client si l’API ne fournit pas headerText ---
  const clientGreeting = useMemo(() => {
    if (!data) return '—'
    // Dates spéciales simples (fallback) si pas de headerText
    const iso = data.date || '' // "YYYY-MM-DD"
    const mmdd = iso.length === 10 ? iso.slice(5) : ''

    // Messages par langue
    const specials: Record<string, Record<string, string>> = {
      fr: {
        '01-01': `Bonne année ! Nous sommes le ${data.dateText}`,
        '12-25': `Joyeux Noël ! Nous sommes le ${data.dateText}`,
      },
      co: {
        '01-01': `Bon capu d'annu ! Oghje hè u ${data.dateText}`,
        '12-25': `Bon Natale ! Oghje hè u ${data.dateText}`,
      },
      en: {
        '01-01': `Happy New Year! Today is ${data.dateText}`,
        '12-25': `Merry Christmas! Today is ${data.dateText}`,
      },
    }

    const lang = (i18n.language || 'fr').toLowerCase().startsWith('co')
      ? 'co'
      : (i18n.language || 'fr').toLowerCase().startsWith('en')
        ? 'en'
        : 'fr'

    // s’il existe un headerText fourni par l’API, on le privilégie
    if (data.headerText && data.headerText.trim()) return data.headerText

    // sinon petits cas spéciaux en client
    if (mmdd && specials[lang][mmdd]) return specials[lang][mmdd]

    // sinon message par défaut
    if (lang === 'co') return `Bonghjornu, oghje hè u ${data.dateText}`
    if (lang === 'en') return `Hello, today is ${data.dateText}`
    return `Bonjour, nous sommes le ${data.dateText}`
  }, [data, i18n.language])

  return (
    <div className="w-full max-w-2xl mx-auto mb-3">
      {/* Ligne date + message de bienvenue */}
      <div className="rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-slate-200 text-center">
        {loading ? t('banner.loading') : clientGreeting}
      </div>

      {/* Lien “En savoir plus” */}
      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          disabled={loading || error || !data}
          aria-expanded={open}
          className="text-sm underline underline-offset-4 disabled:no-underline disabled:opacity-50 hover:opacity-90"
        >
          {open ? t('banner.less') : t('banner.more')}
        </button>
      </div>

      {/* Contenu déroulant */}
      <div
        className={`transition-[grid-template-rows] duration-300 ease-out grid ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-2 rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-center italic text-slate-300">
            {error && <span className="not-italic text-red-300">{t('errors.server_error')}</span>}
            {!error && !loading && !data?.fact && <span>{t('banner.noFact')}</span>}
            {!error && !loading && data?.fact && <span>{data.fact}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// src/components/HistoricalBanner.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type FactPayload = { dateText: string; fact: string | null }

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
        setData({ dateText: j.dateText, fact: j.fact ?? null })
      } catch {
        if (alive) setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [i18n.language])

  return (
    <div className="w-full max-w-2xl mx-auto mb-3">
      {/* Date */}
      <div className="rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-slate-200 text-center">
        {loading ? t('banner.loading') : (data?.dateText ?? '—')}
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

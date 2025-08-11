// src/components/HistoricalBanner.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type FactPayload = { date: string; dateText: string; fact: string | null }

export default function HistoricalBanner() {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<FactPayload | null>(null)

  useEffect(() => {
    let alive = true
    const load = async () => {
      const r = await fetch(`/api/fact?lang=${i18n.language}`)
      const d = await r.json()
      if (alive && r.ok) setData(d)
    }
    load()
    return () => { alive = false }
  }, [i18n.language])

  if (!data) return null

  return (
    <div className="w-full max-w-2xl mx-auto mb-3 rounded-xl border border-slate-600 bg-slate-800/70 p-3">
      {/* Ligne 1 : phrase avec la date (déjà localisée) */}
      <div className="text-sm text-slate-200 font-medium">
        {t('banner.today_sentence', { date: data.dateText })}
      </div>

      {/* Ligne 2 : fait historique en italique, si présent */}
      {data.fact && (
        <p className="mt-1 text-sm italic text-slate-400">
          {data.fact}
        </p>
      )}
    </div>
  )
}

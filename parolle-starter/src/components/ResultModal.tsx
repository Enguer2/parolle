// src/components/ResultModal.tsx
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  outcome: 'win' | 'lose' | null
  solution?: string
  onClose: () => void
}

export default function ResultModal({ open, outcome, solution, onClose }: Props) {
  const { t } = useTranslation()
  if (!open || !outcome) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-[90%] max-w-sm text-center">
        {outcome === 'win' ? (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-2">{t('victory.title')}</h2>
            <p className="text-slate-300 mb-4">{t('victory.desc')}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-2">{t('defeat.title')}</h2>
            <p className="text-slate-300 mb-4">
              {t('defeat.solution')}{' '}
              <span className="font-mono text-white">{solution}</span>
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 hover:brightness-110"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}

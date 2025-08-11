// src/components/ResultModal.tsx
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  outcome: 'win' | 'lose' | null
  solution?: string
  onClose: () => void
}

// ...
export default function ResultModal({ open, outcome, solution, onClose }: Props) {
  const { t } = useTranslation('common')
  if (!open || !outcome) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-[90%] max-w-sm text-center">
        {outcome === 'win' ? (
          <>
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              {t('victory.title', { defaultValue: 'Bravo !' })}
            </h2>
            <p className="text-slate-300 mb-2">
              {t('victory.desc', { defaultValue: 'Tu as trouvé le mot.' })}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              {t('defeat.title', { defaultValue: 'Raté !' })}
            </h2>
            <p className="text-slate-300 mb-2">
              {t('defeat.desc', { defaultValue: 'Ce sera pour la prochaine fois.' })}
            </p>
          </>
        )}

        {/* Afficher la solution si dispo */}
{/* Afficher la solution si dispo */}
{(solution ?? '').trim() !== '' && (
  <p className="text-slate-200 mb-4">
    {t('labels.solution', { defaultValue: 'Le mot était' })}{' '}
    <span className="font-semibold tracking-wide">{solution}</span>
  </p>
)}


        <button
          type="button"
          onClick={onClose}
          className="mt-2 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 hover:brightness-110"
        >
          {t('common.close', { ns: 'common', defaultValue: 'Fermer' })}
        </button>
      </div>
    </div>
  )
}

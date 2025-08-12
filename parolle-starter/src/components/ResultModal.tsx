import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  outcome: 'win' | 'lose' | null
  solution?: string
  onClose: () => void
}

export default function ResultModal({ open, outcome, solution, onClose }: Props) {
  const { t } = useTranslation('common')
  if (!open) return null

  const isWin = outcome === 'win'
  const hasSolution = (solution ?? '').trim() !== ''

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-6 w-[90%] max-w-sm text-center">
        <h2
          className={`text-2xl font-bold mb-2 ${
            isWin ? 'text-green-400' : outcome === 'lose' ? 'text-red-400' : 'text-slate-200'
          }`}
        >
          {isWin
            ? t('victory.title', { defaultValue: 'Bravo !' })
            : outcome === 'lose'
              ? t('defeat.title', { defaultValue: 'Raté !' })
              : t('labels.result', { defaultValue: 'Partie terminée' })}
        </h2>

        <p className="text-slate-300 mb-3">
          {isWin
            ? t('victory.desc', { defaultValue: 'Tu as trouvé le mot.' })
            : outcome === 'lose'
              ? t('defeat.desc', { defaultValue: 'Ce sera pour la prochaine fois.' })
              : t('labels.pleaseWait', { defaultValue: 'Récupération de la solution…' })}
        </p>

        {/* Solution (loading fallback si pas encore reçue) */}
        <p className="text-slate-200 mb-4 min-h-[1.5rem]">
          {hasSolution ? (
            <>
              {t('labels.solution', { defaultValue: 'Le mot était' })}{' '}
              <span className="font-semibold tracking-wide">{solution}</span>
            </>
          ) : (
            <span className="opacity-70">{t('labels.loading', { defaultValue: '…' })}</span>
          )}
        </p>

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

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import ResultModal from '@/components/ResultModal'
import useGame from '@/store/useGame'
import HistoricalBanner from '@/components/HistoricalBanner'

const LETTERS = /[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜÒÌ]/i

export default function Game() {
  const { t } = useTranslation()
  const {
    setTarget, onKey, applyServerResult,
    grid, currentRow, wordLength,
    gameOver, outcome, solution, setSolution,
  } = useGame()

  const [msg, setMsg] = useState<string | null>(null)
  const [bucket, setBucket] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  const flash = (key: 'incomplete' | 'invalid_word' | 'length_mismatch' | 'server_error') => {
    setMsg(t(`errors.${key}`))
    window.clearTimeout((flash as any)._t)
    ;(flash as any)._t = window.setTimeout(() => setMsg(null), 1500)
  }

  // Init longueur + bucket (reset aussi la solution/modale)
  useEffect(() => {
    const load = async () => {
      const r = await fetch('/api/daily')
      const d = await r.json()
      setTarget('_'.repeat(d.length))
      setBucket(d.bucket ?? null)
      setShowModal(false)
      setSolution(undefined) // reset solution quand le daily change
    }
    load()
  }, [setTarget, setSolution])

  // Ouvre/ferme la modale en suivant l'état du jeu
  useEffect(() => {
    setShowModal(gameOver)
  }, [gameOver])

  // ⚠️ Récupérer la solution une fois la partie finie (win ou lose)
  useEffect(() => {
    if (!gameOver) return
    if (bucket == null) return
    if (solution) return // déjà récupérée

    ;(async () => {
      try {
        const r = await fetch(`/api/solution?bucket=${bucket}`)
        if (!r.ok) throw new Error('server_error')
        const d = await r.json()
        if (d?.text) setSolution(d.text)
        else setSolution('???')
      } catch {
        setSolution('???')
      }
    })()
  }, [gameOver, bucket, solution, setSolution])

  // Soumission commune
  const submit = useMemo(() => {
    return async () => {
      if (gameOver) return
      const row = grid[currentRow]
      if (!row || row.some(c => !c.letter)) {
        throw new Error('incomplete')
      }
      if (bucket == null) {
        throw new Error('server_error')
      }
      const guess = row.map(c => c.letter).join('')

      const resp = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, bucket }),
      })

      if (!resp.ok) {
        let code = 'server_error'
        try { const err = await resp.json(); if (err?.error) code = err.error } catch {}
        throw new Error(code)
      }

      const data = await resp.json()
      if (data?.result && typeof data.result === 'string' && data.result.length === wordLength) {
        applyServerResult(data.result)
      } else {
        throw new Error('server_error')
      }
    }
  }, [grid, currentRow, wordLength, applyServerResult, bucket, gameOver])

  // Clavier physique
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (gameOver) { e.preventDefault(); e.stopPropagation(); return }
      const target = e.target as HTMLElement | null
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return
      if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        try { await submit() }
        catch (err: any) { const code = (err?.message ?? 'server_error') as any; flash(code) }
        e.preventDefault(); e.stopPropagation()
        return
      }
      if (e.key === 'Backspace') { onKey('⌫'); e.preventDefault(); e.stopPropagation(); return }
      const k = e.key.toUpperCase()
      if (LETTERS.test(k) && k.length === 1) { onKey(k); e.preventDefault(); e.stopPropagation() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKey, submit, gameOver])

  return (
    <div className="flex flex-col items-center gap-4">
      <HistoricalBanner />
      <Board />
      {msg && <div className="text-sm text-red-300">{msg}</div>}
      <Keyboard />

      <ResultModal
        open={showModal}
        outcome={outcome}
        solution={solution}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

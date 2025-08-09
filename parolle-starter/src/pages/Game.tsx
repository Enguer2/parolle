import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import useGame from '@/store/useGame'

const LETTERS = /[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜÒÌ]/i

export default function Game() {
  const { t } = useTranslation()
  const { setTarget, onKey, applyServerResult, grid, currentRow, wordLength } = useGame()
  const [msg, setMsg] = useState<string | null>(null)
  const [bucket, setBucket] = useState<number | null>(null)

  const flash = (key: 'incomplete' | 'invalid_word' | 'length_mismatch' | 'server_error') => {
    setMsg(t(`errors.${key}`))
    window.clearTimeout((flash as any)._t)
    ;(flash as any)._t = window.setTimeout(() => setMsg(null), 1500)
  }

  // 1) Initialise longueur (largeur de la grille) + bucket
  useEffect(() => {
    const load = async () => {
      const r = await fetch('/api/daily')
      const d = await r.json()
      // ⬇️ on ne passe plus attemptLimit (la hauteur est figée à 6 dans le store)
      setTarget('_'.repeat(d.length))
      setBucket(d.bucket ?? null)
    }
    load()
  }, [setTarget])

  // 2) Soumission commune (clavier physique & bouton ENTER)
  const submit = useMemo(() => {
    return async () => {
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
        body: JSON.stringify({ guess, bucket }), // on verrouille sur le même bucket
      })

      if (!resp.ok) {
        let code = 'server_error'
        try {
          const err = await resp.json()
          if (err?.error) code = err.error
        } catch {}
        throw new Error(code) // 'invalid_word' | 'length_mismatch' | 'server_error'
      }

      const data = await resp.json()
      if (data?.result && typeof data.result === 'string' && data.result.length === wordLength) {
        applyServerResult(data.result)
      } else {
        throw new Error('server_error')
      }
    }
  }, [grid, currentRow, wordLength, applyServerResult, bucket])

  // 3) Clavier physique
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return
      if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        try {
          await submit()
        } catch (err: any) {
          const code = (err?.message ?? 'server_error') as 'incomplete' | 'invalid_word' | 'length_mismatch' | 'server_error'
          flash(code)
        }
        e.preventDefault()
        e.stopPropagation()
        return
      }

      if (e.key === 'Backspace') {
        onKey('⌫')
        e.preventDefault()
        e.stopPropagation()
        return
      }

      const k = e.key.toUpperCase()
      if (LETTERS.test(k) && k.length === 1) {
        onKey(k)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKey, submit])

  return (
    <div className="flex flex-col items-center gap-4">
      <Board />
      {msg && <div className="text-sm text-red-300">{msg}</div>}
      <Keyboard />
    </div>
  )
}

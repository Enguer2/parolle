import { useCallback, useState } from 'react'
import useGame from '@/store/useGame'

const KEYS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','⌫','ENTER'
]

export default function Keyboard() {
  const { onKey, grid, currentRow, wordLength, applyServerResult } = useGame()
  const [msg, setMsg] = useState<string | null>(null)

  const flash = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(null), 1500)
  }

  const submit = useCallback(async () => {
    const row = grid[currentRow]
    if (!row || row.some(c => !c.letter)) return
    const guess = row.map(c => c.letter).join('')

    const resp = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      if (err?.error === 'invalid_word') {
        flash('Mot inconnu')
        return
      }
      if (err?.error === 'length_mismatch') {
        flash('Longueur incorrecte')
        return
      }
      flash('Erreur serveur')
      return
    }

    const data = await resp.json()
    if (data?.result && typeof data.result === 'string' && data.result.length === wordLength) {
      applyServerResult(data.result)
    }
  }, [grid, currentRow, wordLength, applyServerResult])

  const handleClick = (k: string) => {
    if (k === 'ENTER') return void submit()
    if (k === '⌫') return onKey('⌫')
    onKey(k)
  }

  const cls = (label: string) => {
    if (label === 'ENTER' || label === '⌫')
      return 'bg-slate-700 text-white border border-slate-600'
    return 'border border-slate-600 bg-slate-500 text-white'
  }

  return (
    <div className="flex flex-col items-center gap-3 max-w-xl">
      <div className="flex flex-wrap justify-center gap-2">
        {KEYS.map(k => (
          <button
            key={k}
            onClick={() => handleClick(k)}
            className={`px-3 py-2 rounded-md text-sm hover:brightness-110 active:translate-y-px ${cls(k)}`}
          >
            {k}
          </button>
        ))}
      </div>

      {msg && (
        <div className="text-sm text-red-300">
          {msg}
        </div>
      )}
    </div>
  )
}

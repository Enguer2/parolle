import useGame from '@/store/useGame'
import { useTranslation } from 'react-i18next'

export function useSubmitGuess() {
  const { grid, currentRow, wordLength, applyServerResult } = useGame()
  const { t } = useTranslation()

  const submit = async () => {
    const row = grid[currentRow]
    if (!row || row.some(c => !c.letter)) {
      throw new Error('incomplete')
    }
    const guess = row.map(c => c.letter).join('')
    const resp = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess }),
    })

    if (!resp.ok) {
      let code = 'server_error'
      try { const err = await resp.json(); if (err?.error) code = err.error } catch {}
      throw new Error(code) // 'invalid_word' | 'length_mismatch' | 'server_error'
    }

    const data = await resp.json()
    if (!data?.result || data.result.length !== wordLength) {
      throw new Error('server_error')
    }
    applyServerResult(data.result)
  }

  const toMessage = (code: string) => t(`errors.${code}`)

  return { submit, toMessage }
}

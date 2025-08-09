import { useEffect } from 'react'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import useGame from '@/store/useGame'

const LETTERS = /[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜÒÌ]/i

export default function Game() {
  const { setTarget, onKey } = useGame()

  // Init du mot (exemples)
  useEffect(() => {
    // setTarget('CORSU')    // 5
    // setTarget('BALANCA')  // 7
    setTarget('MUNTAGNA')    // 8
  }, [setTarget])

  // Écoute du clavier physique
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return
      if (e.isComposing) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        onKey('ENTER')
        e.preventDefault()
        return
      }
      if (e.key === 'Backspace') {
        onKey('⌫')
        e.preventDefault()
        return
      }

      const k = e.key.toUpperCase()
      if (LETTERS.test(k) && k.length === 1) {
        onKey(k)
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onKey])

  return (
    <div className="flex flex-col items-center gap-6">
      <Board />
      <Keyboard />
    </div>
  )
}

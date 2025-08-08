import { create } from 'zustand'

type CellState = 'empty' | 'correct' | 'present' | 'absent'
type Cell = { letter: string; state: CellState }

type GameState = {
  word: string
  wordLength: number
  attempts: number
  grid: Cell[][]
  currentRow: number
  onKey: (k: string) => void
  setTarget: (w: string, attempts?: number) => void
  reset: () => void
}

const normalize = (s: string) => s.normalize('NFC').toUpperCase()

const makeEmptyRow = (len: number): Cell[] =>
  Array.from({ length: len }, () => ({ letter: '', state: 'empty' as CellState }))

const makeGrid = (attempts: number, len: number): Cell[][] =>
  Array.from({ length: attempts }, () => makeEmptyRow(len))

const scoreGuess = (guess: string, target: string): CellState[] => {
  // Gestion correcte des doublons via un compteur par lettre
  const res: CellState[] = Array(guess.length).fill('absent')
  const counts: Record<string, number> = {}

  for (const ch of target) {
    const c = normalize(ch)
    counts[c] = (counts[c] || 0) + 1
  }

  // Pass 1: correct
  for (let i = 0; i < guess.length; i++) {
    if (normalize(guess[i]) === normalize(target[i])) {
      res[i] = 'correct'
      counts[normalize(guess[i])]!--
    }
  }

  // Pass 2: present
  for (let i = 0; i < guess.length; i++) {
    if (res[i] === 'correct') continue
    const g = normalize(guess[i])
    if (counts[g] > 0) {
      res[i] = 'present'
      counts[g]!--
    }
  }

  return res
}

export default create<GameState>((set, get) => ({
  // Valeurs par défaut (tu peux mettre ce que tu veux)
  word: 'CORSU',
  wordLength: 5,
  attempts: 6,
  grid: makeGrid(6, 5),
  currentRow: 0,

  setTarget: (w: string, attempts = 6) => {
    const word = normalize(w)
    const len = word.length
    set({
      word,
      wordLength: len,
      attempts,
      grid: makeGrid(attempts, len),
      currentRow: 0,
    })
  },

  reset: () => {
    const { word, attempts, wordLength } = get()
    set({
      grid: makeGrid(attempts, wordLength),
      currentRow: 0,
    })
  },

  onKey: (k: string) => {
    const state = get()
    const { grid, currentRow, wordLength, word } = state
    const next = grid.map(r => r.slice())

    // Backspace
    if (k === '⌫') {
      for (let i = wordLength - 1; i >= 0; i--) {
        if (next[currentRow][i].letter) {
          next[currentRow][i].letter = ''
          break
        }
      }
      return set({ grid: next })
    }

    // Enter
    if (k === 'ENTER') {
      const guess = next[currentRow].map(c => c.letter || ' ').join('')
      if (guess.length < wordLength || next[currentRow].some(c => !c.letter)) {
        return // ligne incomplète
      }

      const states = scoreGuess(guess, state.word)
      for (let i = 0; i < wordLength; i++) {
        next[currentRow][i].state = states[i]
      }

      return set({
        grid: next,
        currentRow: Math.min(currentRow + 1, state.attempts - 1),
      })
    }

    // Lettre (y compris accents)
    if (k.length === 1) {
      for (let i = 0; i < wordLength; i++) {
        if (!next[currentRow][i].letter) {
          next[currentRow][i].letter = k
          break
        }
      }
      return set({ grid: next })
    }
  },
}))

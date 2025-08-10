import { create } from 'zustand'

type CellState = 'empty' | 'correct' | 'present' | 'absent'
type Cell = { letter: string; state: CellState }

type KeyState = 'unused' | 'correct' | 'present' | 'absent'
const rank: Record<KeyState, number> = { correct: 3, present: 2, absent: 1, unused: 0 }
const bump = (prev: KeyState = 'unused', next: KeyState): KeyState =>
  rank[next] > rank[prev] ? next : prev

// retire les accents pour agréger sur A–Z (E couvre É/È, etc.)
const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

type Outcome = 'win' | 'lose' | null

type GameState = {
  word: string
  wordLength: number
  attempts: number
  grid: Cell[][]
  currentRow: number
  onKey: (k: string) => void
  setTarget: (w: string) => void
  reset: () => void
  keyStatesBase: Record<string, KeyState>
  /** Applique un pattern "GYBBG" renvoyé par l'API à la ligne courante,
   * met à jour la grille et les couleurs du clavier, puis passe à la ligne suivante. */
  applyServerResult: (pattern: string) => void

  // Fin de partie
  gameOver: boolean
  outcome: Outcome
  solution?: string
  setSolution: (s?: string) => void
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
  // Valeurs par défaut
  word: 'CORSU',
  wordLength: 5,
  attempts: 6,
  grid: makeGrid(6, 5),
  currentRow: 0,
  keyStatesBase: {},

  // État de fin de partie
  gameOver: false,
  outcome: null,
  solution: undefined,
  setSolution: (s) => set({ solution: s }),

  setTarget: (w: string) => {
    const word = normalize(w)
    const len = word.length
    const FIXED_ATTEMPTS = 6
    set({
      word,
      wordLength: len,
      attempts: FIXED_ATTEMPTS,
      grid: makeGrid(FIXED_ATTEMPTS, len),
      currentRow: 0,
      keyStatesBase: {},
      gameOver: false,
      outcome: null,
      solution: undefined,
    })
  },

  reset: () => {
    const { wordLength } = get()
    const FIXED_ATTEMPTS = 6
    set({
      grid: makeGrid(FIXED_ATTEMPTS, wordLength),
      currentRow: 0,
      keyStatesBase: {},
      gameOver: false,
      outcome: null,
      solution: undefined,
    })
  },

  onKey: (k: string) => {
    const state = get()
    if (state.gameOver) return // 🔒 bloque la saisie si partie terminée

    const { grid, currentRow, wordLength } = state
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

    // Enter (LOCAL scoring : à garder uniquement si 100% client)
    if (k === 'ENTER') {
      const guess = next[currentRow].map(c => c.letter || ' ').join('')
      if (guess.length < wordLength || next[currentRow].some(c => !c.letter)) return

      const states = scoreGuess(guess, state.word)
      for (let i = 0; i < wordLength; i++) {
        next[currentRow][i].state = states[i]
      }

      // MAJ clavier A–Z (optionnel en mode local)
      const base = { ...state.keyStatesBase }
      for (let i = 0; i < wordLength; i++) {
        const ch = next[currentRow][i].letter
        const b = toBase(ch)
        const st = next[currentRow][i].state as KeyState
        base[b] = bump(base[b], st)
      }

      const isWinLocal = next[currentRow].every(c => c.state === 'correct')
      const isLastRowUsed = currentRow === state.attempts - 1

      return set({
        grid: next,
        keyStatesBase: base,
        currentRow: isWinLocal ? currentRow : Math.min(currentRow + 1, state.attempts - 1),
        gameOver: isWinLocal || isLastRowUsed,
        outcome: isWinLocal ? 'win' : (isLastRowUsed ? 'lose' : null),
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

  applyServerResult: (pattern: string) => {
    const st = get()
    const { grid, currentRow, wordLength, attempts } = st
    if (!pattern || pattern.length !== wordLength) return

    const next = grid.map(r => r.slice())

    // 1) Appliquer "G/Y/B" sur la ligne courante
    for (let i = 0; i < wordLength; i++) {
      const p = pattern[i]
      next[currentRow][i].state =
        p === 'G' ? 'correct' : p === 'Y' ? 'present' : 'absent'
    }

    // 2) Mettre à jour le clavier A–Z
    const base = { ...st.keyStatesBase }
    for (let i = 0; i < wordLength; i++) {
      const ch = next[currentRow][i].letter
      const b = toBase(ch)
      const ks = next[currentRow][i].state as KeyState
      base[b] = bump(base[b], ks)
    }

    // 3) Victoire / Défaite
    const isWin = pattern.split('').every(c => c === 'G')
    const isLastRowUsed = currentRow === attempts - 1

    set({
      grid: next,
      keyStatesBase: base,
      currentRow: isWin ? currentRow : Math.min(currentRow + 1, attempts - 1),
      gameOver: isWin || isLastRowUsed,
      outcome: isWin ? 'win' : (isLastRowUsed ? 'lose' : null),
    })
  },
}))

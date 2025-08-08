
import { create } from 'zustand'

type CellState = 'empty' | 'correct' | 'present' | 'absent'
type Cell = { letter: string; state: CellState }

type GameState = {
  grid: Cell[][]
  currentRow: number
  onKey: (k: string) => void
}

const emptyRow = (): Cell[] => Array.from({ length: 5 }, () => ({ letter: '', state: 'empty' as CellState }))
const initialGrid: Cell[][] = Array.from({ length: 6 }, emptyRow)

const TARGET = 'CORSU' // placeholder; will be served by API later

const normalize = (s: string) => s.normalize('NFC').toUpperCase()

export default create<GameState>((set, get) => ({
  grid: initialGrid,
  currentRow: 0,
  onKey: (k: string) => {
    const row = get().currentRow
    const grid = get().grid.map(r => r.slice())
    if (k === '⌫') {
      for (let i = 4; i >= 0; i--) {
        if (grid[row][i].letter) { grid[row][i].letter = ''; break }
      }
      return set({ grid })
    }
    if (k === 'ENTER') {
      // very naive evaluation for now
      const guess = normalize(grid[row].map(c => c.letter || ' ').join('')).trim()
      if (guess.length < 5) return
      const target = normalize(TARGET)
      for (let i = 0; i < 5; i++) {
        const letter = grid[row][i].letter
        if (!letter) continue
        if (normalize(letter) === target[i]) grid[row][i].state = 'correct'
        else if (target.includes(normalize(letter))) grid[row][i].state = 'present'
        else grid[row][i].state = 'absent'
      }
      return set({ grid, currentRow: Math.min(row + 1, 5) })
    }
    // Add letter
    for (let i = 0; i < 5; i++) {
      if (!grid[row][i].letter) { grid[row][i].letter = k; break }
    }
    set({ grid })
  },
}))

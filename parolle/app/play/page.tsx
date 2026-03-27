'use client'
import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getFromLocal, saveToLocal, defaultSettings } from '@/lib/store'

export default function PlayGame() {
  const [solution, setSolution] = useState<string>("")
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""))
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- 1. CHARGEMENT INITIAL (MOT + RESTAURATION SAVE) ---
  useEffect(() => {
    const initGame = async () => {
      // Récupérer le mot (cycle 10min défini en DB)
      const { data, error } = await supabase.rpc('get_word_of_the_day')
      const dailyWord = error ? "CASA" : data.toUpperCase()
      setSolution(dailyWord)

      // Charger la sauvegarde locale
      const saved = getFromLocal()
      
      if (saved?.gameState?.solution === dailyWord) {
        setGuesses(saved.gameState.guesses)
        setCurrentGuessIndex(saved.gameState.currentGuessIndex)
        setIsGameOver(saved.gameState.isGameOver)
      } else {
        const newStart = {
          ...defaultSettings,
          gameState: {
            solution: dailyWord,
            guesses: Array(6).fill(""),
            currentGuessIndex: 0,
            isGameOver: false
          }
        }
        setGuesses(newStart.gameState.guesses)
        setCurrentGuessIndex(0)
        setIsGameOver(false)
        saveToLocal(newStart)
      }
      setLoading(false)
    }
    initGame()
  }, [])

  // --- 2. SAUVEGARDE AUTOMATIQUE À CHAQUE CHANGEMENT ---
  useEffect(() => {
    if (!loading && solution) {
      const currentStore = getFromLocal() || defaultSettings
      const updatedStore = {
        ...currentStore,
        gameState: {
          solution,
          guesses,
          currentGuessIndex,
          isGameOver
        }
      }
      saveToLocal(updatedStore)
    }
  }, [guesses, currentGuessIndex, isGameOver, solution, loading])

  // --- LOGIQUE DU CLAVIER DYNAMIQUE ---
  const keyStatuses = useMemo(() => {
    const statuses: Record<string, string> = {}
    guesses.forEach((guess, rowIndex) => {
      if (rowIndex >= currentGuessIndex) return
      guess.split('').forEach((char, i) => {
        if (char === solution[i]) statuses[char] = 'bg-[#38a169] text-white'
        else if (solution.includes(char) && statuses[char] !== 'bg-[#38a169] text-white') {
          statuses[char] = 'bg-[#d69e2e] text-white'
        } else if (!solution.includes(char) && !statuses[char]) {
          statuses[char] = 'bg-[#2d3748] opacity-30 text-gray-500'
        }
      })
    })
    return statuses
  }, [guesses, currentGuessIndex, solution])

  // --- GESTION DU CLAVIER (PHYSIQUE + VIRTUEL) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return
      const key = e.key.toUpperCase()
      if (key === 'ENTER') onKeyPress('ENTER')
      else if (key === 'BACKSPACE') onKeyPress('BACKSPACE')
      else if (/^[A-Z]$/.test(key)) onKeyPress(key)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [guesses, currentGuessIndex, solution, isGameOver])

  const onKeyPress = (key: string) => {
    if (currentGuessIndex >= 6 || loading || isGameOver) return
    const currentGuess = guesses[currentGuessIndex]
    if (key === 'BACKSPACE') updateCurrentGuess(currentGuess.slice(0, -1))
    else if (key === 'ENTER' && currentGuess.length === solution.length) submitGuess()
    else if (currentGuess.length < solution.length && /^[A-Z]$/.test(key)) updateCurrentGuess(currentGuess + key)
  }

  const updateCurrentGuess = (val: string) => {
    const newGuesses = [...guesses]
    newGuesses[currentGuessIndex] = val
    setGuesses(newGuesses)
  }

  const submitGuess = () => {
    const currentGuess = guesses[currentGuessIndex]
    const nextIndex = currentGuessIndex + 1
    setCurrentGuessIndex(nextIndex)

    if (currentGuess === solution) {
      setIsGameOver(true)
      setTimeout(() => alert("BRAVO ! Ai vintu ! 🏆"), 800)
    } else if (nextIndex === 6) {
      setIsGameOver(true)
      setTimeout(() => alert(`Peccatu... U nome era : ${solution}`), 800)
    }
  }

  const getCellColor = (guess: string, index: number, rowIndex: number) => {
    if (rowIndex >= currentGuessIndex) return ''
    const char = guess[index]
    if (char === solution[index]) return 'bg-[#38a169] border-[#38a169] text-white'
    if (solution.includes(char)) return 'bg-[#d69e2e] border-[#d69e2e] text-white'
    return 'bg-[#4a5568] border-[#4a5568] text-gray-300'
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
      <p className="animate-pulse tracking-widest uppercase">Caricamentu...</p>
    </div>
  )

  return (
    <main className="flex flex-col items-center p-4 min-h-screen bg-[#1a202c] text-white">
      <h1 className="text-2xl font-bold mb-8 tracking-[0.3em] opacity-40 uppercase">Parolle</h1>

      <div className="grid grid-rows-6 gap-2 mb-10 perspective-1000">
        {guesses.map((guess, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array.from({ length: solution.length }).map((_, colIndex) => {
              const char = guess[colIndex]
              const colorClass = getCellColor(guess, colIndex, rowIndex)
              return (
                <div 
                  key={colIndex}
                  className={`w-14 h-14 border-2 flex items-center justify-center text-3xl font-bold rounded transition-all duration-700
                    ${colorClass ? colorClass : (char ? 'border-gray-400 scale-105' : 'border-gray-600')}
                    ${rowIndex < currentGuessIndex ? 'rotate-x-360' : ''}`}
                  style={{ transitionDelay: rowIndex < currentGuessIndex ? `${colIndex * 150}ms` : '0ms' }}
                >
                  {char || ""}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md px-2">
        {["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"].map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {i === 2 && <button onClick={() => onKeyPress('ENTER')} className="px-3 h-14 bg-[#4a5568] hover:bg-gray-500 rounded-md font-bold text-xs">ENTRER</button>}
            {row.split("").map(char => (
              <button key={char} onClick={() => onKeyPress(char)}
                className={`flex-1 h-14 rounded-md font-bold transition-all duration-500 ${keyStatuses[char] || 'bg-[#4a5568] hover:bg-[#718096]'}`}
              >
                {char}
              </button>
            ))}
            {i === 2 && <button onClick={() => onKeyPress('BACKSPACE')} className="px-4 h-14 bg-[#4a5568] hover:bg-gray-500 rounded-md font-bold text-xl">⌫</button>}
          </div>
        ))}
      </div>
      
      <p className="mt-8 text-[10px] text-gray-700 uppercase tracking-[0.4em] select-none">
        Solution: {solution}
      </p>
    </main>
  )
}
'use client'
import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getFromLocal, saveToLocal, defaultSettings } from '@/lib/store'
import { translations, languageNames, Language } from '@/lib/translations'

import HelpModal from './HelpModal'
import ResultModal from './ResultModal'
import StatsModal from './StatsModal'

export default function PlayGame() {
  const [solution, setSolution] = useState<string>("")
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""))
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const [language, setLanguage] = useState<Language>('fr')
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showModal, setShowModal] = useState(false) 
  const [showHelpModal, setShowHelpModal] = useState(false) 
  const [showStatsModal, setShowStatsModal] = useState(false)

  const t = translations[language]

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const initGame = async () => {
      const savedLang = localStorage.getItem('parolle_lang') as Language
      if (savedLang) setLanguage(savedLang)

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data, error } = await supabase.rpc('get_word_of_the_day')
      const dailyWord = error ? "CASA" : data.toUpperCase()
      setSolution(dailyWord)

      const saved = getFromLocal()
      if (saved?.gameState?.solution === dailyWord) {
        setGuesses(saved.gameState.guesses)
        setCurrentGuessIndex(saved.gameState.currentGuessIndex)
        setIsGameOver(saved.gameState.isGameOver)
        if (saved.gameState.isGameOver) setShowModal(true)
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
        setShowModal(false)
        saveToLocal(newStart)
        setShowHelpModal(true)
      }
      setLoading(false)
    }
    initGame()
  }, [])

  useEffect(() => {
    if (!loading && solution) {
      const currentStore = getFromLocal() || defaultSettings
      saveToLocal({
        ...currentStore,
        gameState: { solution, guesses, currentGuessIndex, isGameOver }
      })
    }
  }, [guesses, currentGuessIndex, isGameOver, solution, loading])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowUserMenu(false)
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setShowLangMenu(false)
    localStorage.setItem('parolle_lang', lang) 
  }

  const keyStatuses = useMemo(() => {
    const statuses: Record<string, string> = {}
    guesses.forEach((guess, rowIndex) => {
      if (rowIndex >= currentGuessIndex) return
      guess.split('').forEach((char, i) => {
        if (char === solution[i]) statuses[char] = 'bg-[#38a169] text-white'
        else if (solution.includes(char) && statuses[char] !== 'bg-[#38a169] text-white') statuses[char] = 'bg-[#d69e2e] text-white'
        else if (!solution.includes(char) && !statuses[char]) statuses[char] = 'bg-[#2d3748] opacity-30 text-gray-500'
      })
    })
    return statuses
  }, [guesses, currentGuessIndex, solution])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || showModal || showHelpModal) return 
      const key = e.key.toUpperCase()
      if (key === 'ENTER') onKeyPress('ENTER')
      else if (key === 'BACKSPACE') onKeyPress('BACKSPACE')
      else if (/^[A-Z]$/.test(key)) onKeyPress(key)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [guesses, currentGuessIndex, solution, isGameOver, showModal, showHelpModal])

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

    if (currentGuess === solution || nextIndex === 6) {
      setIsGameOver(true)
      setTimeout(() => setShowModal(true), 800) 
    }
  }

  const getCellColor = (guess: string, index: number, rowIndex: number) => {
    if (rowIndex >= currentGuessIndex) return ''
    const char = guess[index]
    if (char === solution[index]) return 'bg-[#38a169] border-[#38a169] text-white'
    if (solution.includes(char)) return 'bg-[#d69e2e] border-[#d69e2e] text-white'
    return 'bg-[#4a5568] border-[#4a5568] text-gray-300'
  }

  const isWon = guesses.includes(solution)
  const nbTries = isWon ? guesses.findIndex(g => g === solution) + 1 : 6

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
      <p className="animate-pulse tracking-widest uppercase">{t.loading}</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#1a202c] font-sans relative">
      <header className="w-full bg-[#1a202c] border-b border-[#2d3748] shadow-md z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase select-none">Parolle</h1>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
            <button className="hover:text-white transition">{t.play}</button>
            <button onClick={() => setShowHelpModal(true)} className="hover:text-white transition">{t.rules}</button>
            <button onClick={() => setShowStatsModal(true)} className="hover:text-white transition">{t.stats}</button>
            <button className="hover:text-white transition">{t.settings}</button>
            

            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="hover:text-white transition flex items-center space-x-1">
                <span className="material-icons text-[18px]">language</span>
                <span>{languageNames[language]}</span>
                <span className="material-icons text-[18px]">arrow_drop_down</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-md shadow-lg bg-[#2d3748] border border-gray-600 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {(Object.keys(languageNames) as Language[]).map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${language === lang ? 'font-bold bg-gray-600' : ''}`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="bg-[#2d3748] border border-[#4a5568] text-white text-sm font-bold px-4 py-2 rounded-md hover:bg-[#4a5568] transition flex items-center gap-2">
                  <img src={user.user_metadata?.avatar_url || "https://www.gravatar.com/avatar/?d=mp"} alt="Avatar" className="w-5 h-5 rounded-full" />
                  {user.user_metadata?.full_name?.split(' ')[0] || t.player} 
                  <span className="material-icons text-[18px]">arrow_drop_down</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-[#2d3748] border border-gray-600 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="block px-4 py-2 text-xs text-gray-400 border-b border-gray-600">{user.email}</div>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 font-bold">
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleLogin} className="bg-[#6b5cd6] text-white text-sm font-bold px-5 py-2 rounded-md hover:bg-[#5849bc] transition flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 bg-white rounded-full p-0.5" />
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 text-white pt-8 pb-8">
        <div className="grid grid-rows-6 gap-2 mb-12 perspective-1000">
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: solution.length || 4 }).map((_, colIndex) => {
                const char = guess[colIndex]
                const colorClass = getCellColor(guess, colIndex, rowIndex)
                return (
                  <div key={colIndex} className={`w-14 h-14 md:w-16 md:h-16 border-2 flex items-center justify-center text-3xl font-bold rounded transition-all duration-700 ${colorClass ? colorClass : (char ? 'border-gray-400 scale-105' : 'border-gray-600')} ${rowIndex < currentGuessIndex ? 'rotate-x-360' : ''}`} style={{ transitionDelay: rowIndex < currentGuessIndex ? `${colIndex * 150}ms` : '0ms' }}>
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
              {i === 2 && (
                <button onClick={() => onKeyPress('ENTER')} className="px-3 h-14 bg-[#4a5568] hover:bg-gray-500 rounded-md font-bold text-xs transition-colors">
                  {t.enterKey}
                </button>
              )}
              {row.split("").map(char => (
                <button key={char} onClick={() => onKeyPress(char)} className={`flex-1 h-14 rounded-md font-bold transition-all duration-500 ${keyStatuses[char] || 'bg-[#4a5568] hover:bg-[#718096]'}`}>
                  {char}
                </button>
              ))}
              {i === 2 && (
                <button onClick={() => onKeyPress('BACKSPACE')} className="px-4 h-14 bg-[#4a5568] hover:bg-gray-500 rounded-md font-bold transition-colors text-xl">
                  ⌫
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* --- APPEL DES MODALES EXTERNALISÉES --- */}
      {showHelpModal && (
        <HelpModal 
          t={t} 
          onClose={() => setShowHelpModal(false)} 
        />
      )}

      {showModal && (
        <ResultModal 
          t={t} 
          isWon={isWon} 
          nbTries={nbTries} 
          solution={solution} 
          onClose={() => setShowModal(false)} 
        />
      )}
      
      {showStatsModal && (
        <StatsModal 
          t={t} 
          onClose={() => setShowStatsModal(false)} 
        />
      )}
    </div>
  )
}
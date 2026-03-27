'use client'
import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { getFromLocal, saveToLocal, defaultSettings } from '@/lib/store'
import { translations, Language } from '@/lib/translations'

export default function PlayGame() {
  const [solution, setSolution] = useState<string>("")
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""))
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  const [isGuest, setIsGuest] = useState<boolean>(true)
  const [language, setLanguage] = useState<'co' | 'fr' | 'en'>('fr') // Langue d'interface
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showModal, setShowModal] = useState(false) 
  const [showHelpModal, setShowHelpModal] = useState(false) 

  // Raccourci pour utiliser les traductions facilement
  const t = translations[language]

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- 1. CHARGEMENT INITIAL ---
  useEffect(() => {
    const initGame = async () => {
      // Chargement de la langue sauvegardée dans le navigateur
      const savedLang = localStorage.getItem('parolle_lang') as 'co' | 'fr' | 'en'
      if (savedLang) setLanguage(savedLang)

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

  // --- 2. SAUVEGARDE AUTOMATIQUE DU JEU ---
  useEffect(() => {
    if (!loading && solution) {
      const currentStore = getFromLocal() || defaultSettings
      saveToLocal({
        ...currentStore,
        gameState: { solution, guesses, currentGuessIndex, isGameOver }
      })
    }
  }, [guesses, currentGuessIndex, isGameOver, solution, loading])

  // --- FONCTION DE CHANGEMENT DE LANGUE ---
  const handleLanguageChange = (lang: 'co' | 'fr' | 'en') => {
    setLanguage(lang)
    setShowLangMenu(false)
    localStorage.setItem('parolle_lang', lang) // Sauvegarde pour la prochaine visite
    
    // TODO plus tard : Si !isGuest, envoyer le choix au profil Supabase
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
  const languageLabels = { co: 'Corsu', fr: 'Français', en: 'English' }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
      <p className="animate-pulse tracking-widest uppercase">{t.loading}</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#1a202c] font-sans relative">
      
      {/* --- HEADER --- */}
      <header className="w-full bg-[#1a202c] border-b border-[#2d3748] shadow-md z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-white uppercase select-none">Parolle</h1>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
            <button className="hover:text-white transition">{t.play}</button>
            <button onClick={() => setShowHelpModal(true)} className="hover:text-white transition">{t.rules}</button>
            <button className="hover:text-white transition">{t.stats}</button>
            <button className="hover:text-white transition">{t.settings}</button>

            <div className="relative">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="hover:text-white transition flex items-center space-x-1"
              >
                <span className="material-icons text-[18px]">language</span>
                <span>{languageLabels[language]}</span>
                <span className="material-icons text-[18px]">arrow_drop_down</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-32 rounded-md shadow-lg bg-[#2d3748] border border-gray-600 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {(['co', 'fr', 'en'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 ${language === lang ? 'font-bold bg-gray-600' : ''}`}
                      >
                        {languageLabels[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isGuest && (
              <button className="bg-[#6b5cd6] text-white text-sm font-bold px-5 py-2 rounded-md hover:bg-[#5849bc] transition">
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- ZONE DE JEU --- */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-white pt-8 pb-8">
        <div className="grid grid-rows-6 gap-2 mb-12 perspective-1000">
          {guesses.map((guess, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: solution.length || 4 }).map((_, colIndex) => {
                const char = guess[colIndex]
                const colorClass = getCellColor(guess, colIndex, rowIndex)
                return (
                  <div 
                    key={colIndex}
                    className={`w-14 h-14 md:w-16 md:h-16 border-2 flex items-center justify-center text-3xl font-bold rounded transition-all duration-700
                      ${colorClass ? colorClass : (char ? 'border-gray-400 scale-105' : 'border-gray-600')}
                      ${rowIndex < currentGuessIndex ? 'rotate-x-360' : ''}
                    `}
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
              {i === 2 && (
                <button onClick={() => onKeyPress('ENTER')} className="px-3 h-14 bg-[#4a5568] hover:bg-gray-500 rounded-md font-bold text-xs transition-colors">
                  ENTRER
                </button>
              )}
              {row.split("").map(char => (
                <button 
                  key={char} 
                  onClick={() => onKeyPress(char)}
                  className={`flex-1 h-14 rounded-md font-bold transition-all duration-500 ${keyStatuses[char] || 'bg-[#4a5568] hover:bg-[#718096]'}`}
                >
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

      {/* --- MODALE D'AIDE (RÈGLES) --- */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#2c2c2d] w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative border border-gray-700">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
              <span className="material-icons">close</span>
            </button>
            
            <h2 className="text-2xl font-black uppercase tracking-widest mb-6 text-white text-center">{t.howToPlay}</h2>
            
            <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
              <p>{t.instruction1}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#38a169] flex-shrink-0 flex items-center justify-center rounded font-bold text-white text-xl">C</div>
                  <p dangerouslySetInnerHTML={{ __html: t.correctSpot.replace("bonne place", "<span class='text-white font-bold'>bonne place</span>").replace("piazza ghjusta", "<span class='text-white font-bold'>piazza ghjusta</span>").replace("correct spot", "<span class='text-white font-bold'>correct spot</span>") }}></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#d69e2e] flex-shrink-0 flex items-center justify-center rounded font-bold text-white text-xl">A</div>
                  <p dangerouslySetInnerHTML={{ __html: t.wrongSpot.replace("mauvaise place", "<span class='text-white font-bold'>mauvaise place</span>").replace("gattiva piazza", "<span class='text-white font-bold'>gattiva piazza</span>").replace("wrong spot", "<span class='text-white font-bold'>wrong spot</span>") }}></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#4a5568] flex-shrink-0 flex items-center justify-center rounded font-bold text-white text-xl">S</div>
                  <p dangerouslySetInnerHTML={{ __html: t.notInWord.replace("pas dans le mot", "<span class='text-white font-bold'>pas dans le mot</span>").replace("ùn hè micca in a parolla", "<span class='text-white font-bold'>ùn hè micca in a parolla</span>").replace("not in the word", "<span class='text-white font-bold'>not in the word</span>") }}></p>
                </div>
              </div>

              <p className="pt-4 border-t border-gray-700 text-xs italic opacity-70">{t.newWordTime}</p>
            </div>

            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full mt-8 py-4 bg-[#6b5cd6] text-white font-black rounded-xl hover:bg-[#5849bc] transition-all"
            >
              {t.letsGo}
            </button>
          </div>
        </div>
      )}

      {/* --- MODALE DE FIN DE PARTIE --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#2c2c2d]/90 backdrop-blur-md w-full max-w-sm md:max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-4">
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="px-8 pt-10 pb-10 flex flex-col items-center">
              <div className={`mb-3 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase ${isWon ? 'bg-[#aff4a6]/20 text-[#aff4a6]' : 'bg-red-500/20 text-red-400'}`}>
                {isWon ? t.magnificent : t.tooBad}
              </div>
              
              <h2 className={`text-4xl font-extrabold tracking-tight mb-8 text-center ${isWon ? 'text-[#aff4a6]' : 'text-red-400'}`}>
                {isWon ? t.congrats : t.gameOver}
              </h2>
              
              <div className="w-full mb-8 overflow-hidden rounded-2xl bg-[#131314] p-6 text-center shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                  {isWon ? t.foundIn : t.secretWordWas}
                </h3>
                
                <div className="flex justify-center items-end">
                  {isWon ? (
                    <div className="flex flex-col items-center">
                      <span className="text-6xl font-black text-white">{nbTries}</span>
                      <span className="text-[12px] font-bold uppercase text-gray-400 tracking-tighter mt-1">{nbTries > 1 ? t.tryPlural : t.trySingular}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-white tracking-[0.2em]">{solution}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setShowModal(false)}
                className={`w-full py-4 font-black text-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg ${isWon ? 'bg-[#aff4a6] text-[#002a04] hover:bg-[#9ee095]' : 'bg-gray-200 text-gray-900 hover:bg-white'}`}
              >
                {isWon ? t.continueBtn : t.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
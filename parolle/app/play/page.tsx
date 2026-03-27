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

  const [isValidating, setIsValidating] = useState(false)
  const [shakeRow, setShakeRow] = useState<number | null>(null)

  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
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

      if (user) {
        const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single()
        if (stats) setUserStats(stats)
      }

      const { data, error } = await supabase.rpc('get_word_of_the_day')
      const dailyWord = error ? "CASA" : data.toUpperCase()
      setSolution(dailyWord)

      const saved = getFromLocal()

      if (saved?.gameState?.solution === dailyWord) {
        setGuesses(saved.gameState.guesses)
        setCurrentGuessIndex(saved.gameState.currentGuessIndex)
        setIsGameOver(saved.gameState.isGameOver)

        if (saved.gameState.isGameOver) {
          setShowModal(true)
          setShowHelpModal(false)
        }
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
    setUserStats(null)
    setShowUserMenu(false)
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setShowLangMenu(false)
    localStorage.setItem('parolle_lang', lang)
  }

  const updateStatsInDB = async (won: boolean, tries: number) => {
    if (!user) return;

    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!currentStats) {
      const initialStats = {
        user_id: user.id,
        games_played: 1,
        games_won: won ? 1 : 0,
        current_streak: won ? 1 : 0,
        max_streak: won ? 1 : 0,
        guess_distribution: won
          ? [tries === 1 ? 1 : 0, tries === 2 ? 1 : 0, tries === 3 ? 1 : 0, tries === 4 ? 1 : 0, tries === 5 ? 1 : 0, tries === 6 ? 1 : 0]
          : [0, 0, 0, 0, 0, 0]
      };
      await supabase.from('user_stats').insert(initialStats);
      setUserStats(initialStats);
      return;
    }

    const newPlayed = currentStats.games_played + 1;
    const newWon = won ? currentStats.games_won + 1 : currentStats.games_won;
    const newStreak = won ? currentStats.current_streak + 1 : 0;
    const newMaxStreak = Math.max(currentStats.max_streak, newStreak);

    let newDistribution = [...currentStats.guess_distribution];
    if (won && tries >= 1 && tries <= 6) {
      newDistribution[tries - 1] += 1;
    }

    const updatedStats = {
      games_played: newPlayed,
      games_won: newWon,
      current_streak: newStreak,
      max_streak: newMaxStreak,
      guess_distribution: newDistribution,
      last_won_at: won ? new Date().toISOString() : currentStats.last_won_at,
      updated_at: new Date().toISOString()
    };

    await supabase.from('user_stats').update(updatedStats).eq('user_id', user.id);
    setUserStats({ ...currentStats, ...updatedStats });
  };

  const keyStatuses = useMemo(() => {
    const statuses: Record<string, 'correct' | 'present' | 'absent'> = {}
    guesses.forEach((guess, rowIndex) => {
      if (rowIndex >= currentGuessIndex) return
      guess.split('').forEach((char, i) => {
        if (char === solution[i]) statuses[char] = 'correct'
        else if (solution.includes(char) && statuses[char] !== 'correct') statuses[char] = 'present'
        else if (!solution.includes(char) && !statuses[char]) statuses[char] = 'absent'
      })
    })
    return statuses
  }, [guesses, currentGuessIndex, solution])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || showModal || showHelpModal || showStatsModal) return
      const key = e.key.toUpperCase()
      if (key === 'ENTER') { e.preventDefault(); onKeyPress('ENTER') }
      else if (key === 'BACKSPACE') onKeyPress('BACKSPACE')
      else if (/^[A-Z]$/.test(key)) onKeyPress(key)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [guesses, currentGuessIndex, solution, isGameOver, showModal, showHelpModal, showStatsModal, isValidating])

  const onKeyPress = (key: string) => {
    if (currentGuessIndex >= 6 || loading || isGameOver || isValidating) return
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

  const isWordValid = async (word: string) => {
    const { data } = await supabase
      .from('dictionary')
      .select('word')
      .ilike('word', word)
      .maybeSingle();
    return !!data;
  };

  const submitGuess = async () => {
    if (isValidating) return;
    const currentGuess = guesses[currentGuessIndex]
    if (currentGuess.length !== solution.length) return;

    setIsValidating(true);
    const valid = await isWordValid(currentGuess);
    setIsValidating(false);

    if (!valid) {
      setShakeRow(currentGuessIndex);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    const nextIndex = currentGuessIndex + 1
    setCurrentGuessIndex(nextIndex)

    if (currentGuess === solution) {
      setIsGameOver(true)
      setShowHelpModal(false)
      setShowStatsModal(false)
      await updateStatsInDB(true, nextIndex)
      setTimeout(() => setShowModal(true), 800)
    } else if (nextIndex === 6) {
      setIsGameOver(true)
      setShowHelpModal(false)
      setShowStatsModal(false)
      await updateStatsInDB(false, 6)
      setTimeout(() => setShowModal(true), 800)
    }
  }

  const getCellStyle = (guess: string, index: number, rowIndex: number) => {
    if (rowIndex >= currentGuessIndex) return ''
    const char = guess[index]
    if (char === solution[index])
      return 'bg-[#6fb069] text-[#002a04] shadow-[0_0_20px_rgba(111,176,105,0.3)]'
    if (solution.includes(char))
      return 'bg-[#6e5e03] text-[#f9e281] shadow-[0_0_20px_rgba(249,226,129,0.15)]'
    return 'bg-[#262627] text-[#adaaab] border-[#484849]'
  }

  const getKeyStyle = (char: string) => {
    const status = keyStatuses[char]
    if (status === 'correct')
      return 'bg-[#6fb069] text-[#002a04]'
    if (status === 'present')
      return 'bg-[#6e5e03] text-[#f9e281]'
    if (status === 'absent')
      return 'bg-[#131314] text-[#484849]'
    return 'bg-[#1f1f21] text-white hover:bg-[#2c2c2d]'
  }

  const isWon = guesses.includes(solution)
  const nbTries = isWon ? guesses.findIndex(g => g === solution) + 1 : 6

  if (loading) return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#0e0e0f]">
      <p
        className="animate-pulse tracking-[0.3em] uppercase text-[#aff4a6] font-black text-sm"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {t.loading}
      </p>
    </div>
  )

  return (
    <div
      className="flex flex-col h-[100dvh] bg-[#0e0e0f] text-white overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}} />

      {/* ── TopAppBar ── */}
      <header className="shrink-0 z-50 bg-[#0e0e0f]">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 py-2 sm:py-3 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl sm:text-2xl font-black tracking-tighter text-[#aff4a6] uppercase select-none"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              PAROLLE
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex gap-3 sm:gap-4 items-center">
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 text-white/50 hover:text-[#aff4a6] transition-colors"
                  title="Langue"
                >
                  <span className="material-icons text-[18px] sm:text-[20px]">language</span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">{language}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-2 w-32 sm:w-36 rounded-xl shadow-xl bg-[#1f1f21] border border-[#484849]/40 z-50 overflow-hidden">
                    {(Object.keys(languageNames) as Language[]).map(lang => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`block w-full text-left px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
                          language === lang
                            ? 'bg-[#aff4a6]/10 text-[#aff4a6] font-bold'
                            : 'text-white/70 hover:bg-[#2c2c2d] hover:text-white'
                        }`}
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowStatsModal(true)}
                className="text-white/50 hover:text-[#aff4a6] transition-colors"
                title={t.stats}
              >
                <span className="material-icons text-[20px] sm:text-[22px]">leaderboard</span>
              </button>

              <button
                onClick={() => setShowHelpModal(true)}
                className="text-white/50 hover:text-[#aff4a6] transition-colors"
                title={t.rules}
              >
                <span className="material-icons text-[20px] sm:text-[22px]">help</span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-[#1f1f21] border border-[#484849]/40 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:border-[#aff4a6]/30 transition-all"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#aff4a6] text-[#002a04] flex items-center justify-center text-[10px] sm:text-xs font-black uppercase">
                      {(user.user_metadata?.full_name?.split(' ')[0] || t.player)?.[0]}
                    </span>
                    <span className="hidden sm:inline">{user.user_metadata?.full_name?.split(' ')[0] || t.player}</span>
                    <span className="material-icons text-[14px] sm:text-[16px] text-white/40">arrow_drop_down</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl bg-[#1f1f21] border border-[#484849]/40 z-50 overflow-hidden">
                      <div className="px-4 py-2.5 text-xs text-white/40 border-b border-[#484849]/40 truncate">
                        {user.email}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-[#ff7351] hover:bg-[#2c2c2d] font-bold transition-colors"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        {t.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-1.5 sm:gap-2 bg-[#aff4a6]/10 border border-[#aff4a6]/20 text-[#aff4a6] text-[10px] sm:text-xs font-black px-3 py-1 sm:py-1.5 rounded-full hover:bg-[#aff4a6]/20 transition-all uppercase tracking-widest"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-white rounded-full p-0.5" />
                  <span className="hidden sm:inline">{t.login}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#484849]/40 to-transparent" />
      </header>

      {/* ── Main ── */}
      <main className="flex-grow flex flex-col items-center justify-between px-2 sm:px-4 py-2 sm:py-4 max-w-3xl mx-auto w-full min-h-0">

        {/* Game header */}
        <div className="w-full shrink-0 mb-2 sm:mb-4 text-center">
          <h2
            className="font-black text-2xl sm:text-3xl md:text-4xl tracking-tighter mb-1.5 sm:mb-2"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Truvate a Parolla
          </h2>
          {userStats && (
            <div className="flex justify-center items-center gap-2">
              <span className="bg-[#1f1f21] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-[#aff4a6] border border-[#aff4a6]/10"
                style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t.stats}: {userStats.games_played}
              </span>
              {userStats.current_streak > 0 && (
                <span className="bg-[#1f1f21] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-[#f9e281]/80 border border-[#f9e281]/10"
                    style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {t.streak}: {userStats.current_streak}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Word Grid ── */}
        <div className="flex-1 w-full max-w-[280px] sm:max-w-[350px] flex flex-col justify-center gap-1.5 sm:gap-2 min-h-0 mb-4">
          {guesses.map((guess, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex justify-center gap-1.5 sm:gap-2 w-full ${shakeRow === rowIndex ? 'animate-shake' : ''}`}
            >
              {Array.from({ length: solution.length || 5 }).map((_, colIndex) => {
                const char = guess[colIndex]
                const isRevealed = rowIndex < currentGuessIndex
                const isCurrentRow = rowIndex === currentGuessIndex
                const colorClass = getCellStyle(guess, colIndex, rowIndex)
                const isCursor = isCurrentRow && colIndex === guess.length && !isGameOver

                return (
                  <div
                    key={colIndex}
                    className={`flex-1 aspect-square max-w-[55px] sm:max-w-[60px] flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-black rounded-lg sm:rounded-xl border transition-all duration-300 ${
                      isRevealed && colorClass
                        ? `${colorClass} border-transparent`
                        : isCurrentRow && char
                        ? 'bg-[#2c2c2d] border-[#aff4a6]/40 scale-105'
                        : isCursor
                        ? 'bg-[#1f1f21] border-[#aff4a6]/30 text-[#aff4a6]/30'
                        : 'bg-[#19191b] border-[#484849]/20'
                    }`}
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      transitionDelay: isRevealed ? `${colIndex * 120}ms` : '0ms'
                    }}
                  >
                    {isCursor ? '|' : (char || '')}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* ── Keyboard ── */}
        <div className="w-full shrink-0 flex flex-col items-center gap-1.5 sm:gap-2 max-w-[500px] pb-2">
          {['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'].map((row, rowIdx) => (
            <div key={rowIdx} className={`flex gap-1 sm:gap-1.5 ${rowIdx === 1 ? 'w-[95%]' : 'w-full'}`}>
              {rowIdx === 2 && (
                <button
                  onClick={() => onKeyPress('ENTER')}
                  className="px-2 sm:px-3 h-10 sm:h-12 bg-[#262627] hover:bg-[#2c2c2d] rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all active:scale-95 flex items-center justify-center"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {t.enterKey ?? 'ENTER'}
                </button>
              )}
              {row.split('').map(char => (
                <button
                  key={char}
                  onClick={() => onKeyPress(char)}
                  className={`flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 flex items-center justify-center ${getKeyStyle(char)}`}
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {char}
                </button>
              ))}
              {rowIdx === 2 && (
                <button
                  onClick={() => onKeyPress('BACKSPACE')}
                  className="px-2 sm:px-3 h-10 sm:h-12 bg-[#262627] hover:bg-[#2c2c2d] rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center"
                >
                  <span className="material-icons text-white text-[18px] sm:text-[20px]">backspace</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full shrink-0 py-2 sm:py-4 mt-auto">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 w-full max-w-screen-xl mx-auto px-4 sm:px-6">
          <span
            className="text-[#aff4a6] font-black tracking-tight text-sm sm:text-base hidden sm:inline"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            PAROLLE
          </span>
          <div className="flex gap-4 sm:gap-6">
            {['Privacy', 'Termini', 'Archiviu'].map(link => (
              <a
                key={link}
                href="#"
                className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium text-white/30 hover:text-white transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {showHelpModal && (
        <HelpModal t={t} onClose={() => setShowHelpModal(false)} />
      )}

      {showModal && (
        <ResultModal
          t={t}
          isWon={isWon}
          nbTries={nbTries}
          solution={solution}
          stats={userStats}
          user={user}
          onLogin={handleLogin}
          onClose={() => setShowModal(false)}
        />
      )}

      {showStatsModal && (
        <StatsModal
          t={t}
          stats={userStats}
          user={user}
          onLogin={handleLogin}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  )
}
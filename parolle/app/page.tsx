'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { getFromLocal, saveToLocal, defaultSettings } from '@/lib/store'
import Link from 'next/link'
import { translations, Language } from '@/lib/translations'

export default function Home() {
  // 1. ÉTATS (States)
  const [config, setConfig] = useState(defaultSettings)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<Language>('co')
  const [globalStats, setGlobalStats] = useState({ players: 12402, words: 2150 })

  const t = translations[language]

  // 2. INITIALISATION SUPABASE
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 3. EFFETS (useEffect)
  useEffect(() => {
    const initApp = async () => {
      const savedLang = localStorage.getItem('parolle_lang') as Language
      if (savedLang) setLanguage(savedLang)

      const savedData = getFromLocal()
      if (savedData) {
        setConfig(savedData)
      } else {
        saveToLocal(defaultSettings)
      }

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // --- NOUVEAU : Récupération des stats globales ---
      const { data: statsData } = await supabase.from('global_stats').select('*').eq('id', 1).single()
      if (statsData) {
        setGlobalStats({ players: statsData.total_players, words: statsData.total_words_discovered })
      }
      
      setLoading(false)
    }

    initApp()
  }, [])

  // 4. LOGIQUE (Handlers)
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    localStorage.setItem('parolle_lang', newLang)
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // 5. AFFICHAGE (Render)
  if (loading) return <div className="bg-[#0e0e0f] min-h-screen" />

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0e0e0f] text-white font-sans selection:bg-[#aff4a6] selection:text-[#1f5e21]">
      
      {/* TopAppBar */}
      <nav className="docked full-width top-0 sticky z-50 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm border-b border-[#484849]/20">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-[0.2em] text-[#f4f7f9] uppercase">PAROLLE</span>
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/play" className="text-[#aff4a6] font-bold border-b-2 border-[#aff4a6] pb-1 tracking-tight">
                {t.theGame}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="text-xs opacity-70 hover:opacity-100 uppercase tracking-widest hidden sm:flex items-center gap-1 transition-all hover:text-[#aff4a6]">
                {t.selectedLang}: {language.toUpperCase()}
                <span className="material-icons text-sm">arrow_drop_down</span>
              </button>
              <div className="absolute right-0 mt-2 bg-[#262627] border border-[#484849]/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                <button 
                  onClick={() => handleLanguageChange('co')}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#2c2c2d] transition-colors ${language === 'co' ? 'text-[#aff4a6] font-bold' : 'text-white'}`}
                >
                   Corsu
                </button>
                <button 
                  onClick={() => handleLanguageChange('fr')}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#2c2c2d] transition-colors ${language === 'fr' ? 'text-[#aff4a6] font-bold' : 'text-white'}`}
                >
                  Français
                </button>
                <button 
                  onClick={() => handleLanguageChange('en')}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#2c2c2d] transition-colors ${language === 'en' ? 'text-[#aff4a6] font-bold' : 'text-white'}`}
                >
                  English
                </button>
              </div>
            </div>
            {/*<button className="material-icons text-[#f4f7f9] opacity-70 hover:opacity-100 hover:text-[#aff4a6] transition-all duration-300">leaderboard</button>
            <button className="material-icons text-[#f4f7f9] opacity-70 hover:opacity-100 hover:text-[#aff4a6] transition-all duration-300">help_outline</button>
            <button className="material-icons text-[#f4f7f9] opacity-70 hover:opacity-100 hover:text-[#aff4a6] transition-all duration-300">settings</button>*/}
          </div>
        </div>
      </nav>

      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#aff4a6]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f9e281]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col md:flex-row items-center gap-16 relative z-10">
        <div className="w-full md:w-1/2 space-y-8">
          
          {user ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#484849]/30 bg-[#131314] text-[#aff4a6] text-xs font-semibold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#aff4a6] animate-pulse"></span>
              {t.welcome}, {user.user_metadata?.full_name?.split(' ')[0]} !
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#484849]/30 bg-[#131314] text-[#aff4a6] text-xs font-semibold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#aff4a6] animate-pulse"></span>
              {t.dailyChallenge}
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] text-white">
            {t.dailyChallengeTitle} <br/><span className="text-[#aff4a6] italic">{t.dailyChallengeSubtitle}</span>
          </h1>
          
          <p className="text-[#adaaab] text-xl max-w-lg leading-relaxed font-light">
            {t.heroDescription}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            {user ? (
              <>
                <Link href="/play" className="w-full sm:w-auto">
                  <button className="w-full px-8 py-4 bg-gradient-to-r from-[#aff4a6] to-[#6fb069] text-[#002a04] font-extrabold text-lg rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(175,244,166,0.2)] flex items-center justify-center gap-2">
                    {t.startGame}
                    <span className="material-icons">play_arrow</span>
                  </button>
                </Link>
                <button onClick={handleLogout} className="px-8 py-4 bg-[#262627] text-white font-bold text-lg rounded-xl hover:bg-[#2c2c2d] transition-all flex items-center justify-center gap-2 border border-[#484849]/30">
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/play" className="w-full sm:w-auto">
                  <button className="w-full px-8 py-4 bg-gradient-to-r from-[#aff4a6] to-[#6fb069] text-[#002a04] font-extrabold text-lg rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(175,244,166,0.2)] flex items-center justify-center gap-2">
                    {t.playGuest}
                    <span className="material-icons">play_arrow</span>
                  </button>
                </Link>
                <button onClick={handleLogin} className="px-8 py-4 bg-white text-[#0e0e0f] font-bold text-lg rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  {t.continueGoogle}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Game Grid Representation */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="bg-[#2c2c2d]/70 backdrop-blur-md p-8 rounded-3xl border border-[#484849]/20 shadow-2xl relative">
            <div className="absolute -top-4 -right-4 px-4 py-2 bg-[#f9e281] text-[#4b3f00] font-black rounded-lg rotate-12 shadow-lg text-sm z-20">
              {t.newRecord}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {/* Row 1 */}
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">P</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">E</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">S</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">C</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">E</div>
              {/* Row 2 */}
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">C</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">O</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#f9e281] text-[#4b3f00]">R</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#262627] text-white">S</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">A</div>
              {/* Row 3 */}
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">T</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">E</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">R</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">R</div>
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-2xl font-black rounded-lg border border-[#484849]/40 bg-[#6fb069] text-[#002a04]">A</div>
              {/* Row 4 */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-[#484849]/10 bg-[#19191b]"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-[#484849]/10 bg-[#19191b]"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-[#484849]/10 bg-[#19191b]"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-[#484849]/10 bg-[#19191b]"></div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-[#484849]/10 bg-[#19191b]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-[#131314] border border-[#484849]/10 flex flex-col justify-between group hover:bg-[#19191b] transition-all">
            <span className="material-icons text-[#aff4a6] text-4xl mb-4">star</span>
            <div>
              <h3 className="text-3xl font-bold">{globalStats.players.toLocaleString('fr-FR')}</h3>
              <p className="text-[#adaaab] text-sm uppercase tracking-wider mt-1">{t.activePlayers}</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl border border-[#484849]/10 flex flex-col justify-between group hover:bg-[#19191b] transition-all md:scale-110 md:z-20 bg-gradient-to-br from-[#131314] to-[#262627]">
            <span className="material-icons text-[#f9e281] text-4xl mb-4">language</span>
            <div>
              <h3 className="text-3xl font-bold">{t.language}</h3>
              <p className="text-[#adaaab] text-sm uppercase tracking-wider mt-1">{t.preserveFuture}</p>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-[#131314] border border-[#484849]/10 flex flex-col justify-between group hover:bg-[#19191b] transition-all">
            <span className="material-icons text-[#f4f7f9] text-4xl mb-4">history</span>
            <div>
              <h3 className="text-3xl font-bold">{globalStats.words.toLocaleString('fr-FR')}</h3>
              <p className="text-[#adaaab] text-sm uppercase tracking-wider mt-1">{t.wordsDiscovered}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e0e0f] w-full py-12 border-t border-gray-800/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold text-[#f4f7f9] tracking-tight">PAROLLE</span>
            <p className="text-gray-500 text-sm tracking-wide">&copy; 2026 Parolle - {t.footerCreated}</p>
          </div>
          <div className="flex gap-8">
            <a className="text-gray-500 hover:text-[#aff4a6] transition-colors text-sm tracking-wide" href="#">{t.privacy}</a>
            <a className="text-gray-500 hover:text-[#aff4a6] transition-colors text-sm tracking-wide" href="#">{t.terms}</a>
            <a className="text-gray-500 hover:text-[#aff4a6] transition-colors text-sm tracking-wide" href="#">{t.contact}</a>
          </div>
          <div className="flex gap-4 items-center">
            <a 
              href="https://github.com/Enguer2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1f1f21] border border-[#484849]/30 text-gray-400 hover:bg-[#aff4a6] hover:text-[#002a04] hover:border-[#aff4a6] transition-all group"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/25/25231.png" 
                alt="GitHub" 
                className="w-5 h-5 invert group-hover:invert-0 transition-all" 
              />
              <span className="text-xs font-bold tracking-widest uppercase">Enguer2</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-[#1f1f21] flex items-center justify-center text-white hover:bg-[#aff4a6] hover:text-[#1f5e21] transition-all" href="#">
              <span className="material-icons text-sm">share</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
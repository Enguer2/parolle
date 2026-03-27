'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { getFromLocal, saveToLocal, defaultSettings } from '@/lib/store'
import Link from 'next/link'
import { translations, Language } from '@/lib/translations' // Importation des traductions

export default function Home() {
  // 1. ÉTATS (States)
  const [config, setConfig] = useState(defaultSettings)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<Language>('co') // Langue par défaut

  const t = translations[language] // Raccourci de traduction

  // 2. INITIALISATION SUPABASE
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 3. EFFETS (useEffect)
  useEffect(() => {
    const initApp = async () => {
      // Charger la langue depuis le navigateur (Synchronisation avec la page de jeu)
      const savedLang = localStorage.getItem('parolle_lang') as Language
      if (savedLang) setLanguage(savedLang)

      // Charger la sauvegarde locale
      const savedData = getFromLocal()
      if (savedData) {
        setConfig(savedData)
      } else {
        saveToLocal(defaultSettings)
      }

      // Vérifier l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      setLoading(false)
    }

    initApp()
  }, [])

  // 4. LOGIQUE (Handlers)
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
  if (loading) return <div className="bg-[#1a2332] min-h-screen" />

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1a2332] text-white p-5">
      
      {/* SECTION LOGO STYLE WORDLE */}
      <div className="flex gap-2 mb-8">
        {[
          { l: 'P', c: 'bg-[#22C55E]' },
          { l: 'A', c: 'bg-[#EAB308]' },
          { l: 'R', c: 'bg-[#4a5568]' },
          { l: 'O', c: 'bg-[#4a5568]' },
          { l: 'L', c: 'bg-[#22C55E]' },
          { l: 'L', c: 'bg-[#EAB308]' },
          { l: 'E', c: 'bg-[#4a5568]' },
        ].map((item, i) => (
          <div 
            key={i} 
            className={`${item.c} w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-3xl font-bold rounded shadow-lg`}
          >
            {item.l}
          </div>
        ))}
      </div>

      <p className="text-lg md:text-xl text-[#cbd5e0] font-light mb-12 tracking-wide text-center">
        {t.subtitle}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-[420px]">
        {user ? (
          <div className="text-center">
            <div className="bg-[#2d3748] p-8 rounded-xl border border-[#4a5568] mb-6 shadow-lg">
              <p className="text-xl mb-2 italic text-[#38a169]">{t.hello}</p>
              <h2 className="text-2xl font-bold mb-6">{user.user_metadata.full_name}</h2>
              <Link href="/play" className="w-full">
                <button className="w-full py-4 bg-[#38a169] hover:bg-[#2f855a] text-white rounded-lg font-bold text-lg transition-all transform hover:-translate-y-1 shadow-md">
                  {t.startGame}
                </button>
              </Link>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 text-sm underline transition-colors"
            >
              {t.logout}
            </button>
          </div>
        ) : (
          <>
            <Link href="/play" className="w-full">
              <button className="w-full py-4 bg-[#38a169] hover:bg-[#2f855a] text-white rounded-lg font-bold text-lg transition-all transform hover:-translate-y-1 shadow-md">
                {t.playGuest}
              </button>
            </Link>

            <button 
              onClick={handleLogin}
              className="w-full py-4 bg-white hover:bg-[#f7fafc] text-[#1a2332] rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-md"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {t.continueGoogle}
            </button>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-20 text-[#4a5568] text-sm flex flex-col items-center gap-2">
        <div>&copy; 2026 Parolle - {t.footerCreated}</div>
        <div className="text-xs opacity-50 uppercase tracking-widest">
          {t.selectedLang} : {language.toUpperCase()}
        </div>
      </footer>
    </main>
  )
}
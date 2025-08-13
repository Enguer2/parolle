import { useState, useCallback } from 'react'
import { setToken, apiFetch } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const canSubmit =
    (mode === 'login' && email.trim() && password.length >= 6) ||
    (mode === 'register' && email.trim() && username.trim() && password.length >= 6)

  const submit = useCallback(async () => {
    if (!canSubmit || loading) return
    try {
      setErr(null)
      setLoading(true)
      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : { email: email.trim(), username: username.trim(), password }

      const route = mode === 'login' ? '/api/login' : '/api/register'
      const data = await apiFetch(route, { method: 'POST', body: JSON.stringify(body) })
      if (!data?.token) throw new Error('server_error')
      setToken(data.token)
      nav('/game')
    } catch (e: any) {
      setErr(e?.message || 'server_error')
    } finally {
      setLoading(false)
    }
  }, [mode, email, username, password, canSubmit, loading, nav])

  async function loginWithGoogle() {
    try {
      setErr(null)
      setLoadingGoogle(true)
  
      const redirectTo = 'http://localhost:5173/auth/callback' // force pour éviter toute surprise
      console.log('[OAuth] redirectTo =', redirectTo)
      console.log('[ENV] VITE_SUPABASE_URL =', import.meta.env.VITE_SUPABASE_URL)
  
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // 👈 on récupère l’URL au lieu de rediriger tout de suite
        },
      })
  
      console.log('[OAuth] signInWithOAuth ->', { data, error })
      if (error) {
        throw error
      }
      if (data?.url) {
        // Ouvre nous-mêmes l’URL construite par Supabase (ça aide à diagnostiquer)
        window.location.assign(data.url)
      } else {
        throw new Error('Pas d’URL OAuth renvoyée par Supabase')
      }
    } catch (e: any) {
      console.error('[OAuth] error:', e)
      setErr(e?.message || 'server_error')
      setLoadingGoogle(false)
    }
  }
  
  

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); submit() }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="bg-slate-900 text-white min-h-[100svh] grid place-items-center px-4"
    >
      <main className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 shadow-xl">
          <h1 className="mb-4 text-[clamp(18px,2.4vw,22px)] font-bold">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h1>

          {/* Google */}
          <button
            onClick={loginWithGoogle}
            disabled={loadingGoogle}
            className={`w-full py-2 rounded-lg font-bold transition ${
              loadingGoogle ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loadingGoogle ? 'Redirection…' : 'Continuer avec Google'}
          </button>

          <div className="my-4 flex items-center gap-3 text-slate-400 text-xs">
            <div className="h-px flex-1 bg-slate-700" />
            <span>ou</span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* Email */}
          <label htmlFor="email" className="text-sm text-slate-300">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="w-full mt-1 mb-3 px-3 py-2 rounded bg-slate-700 outline-none"
          />

          {/* Username only when registering */}
          {mode === 'register' && (
            <>
              <label htmlFor="username" className="text-sm text-slate-300">Nom d’utilisateur</label>
              <input
                id="username"
                autoComplete="username"
                placeholder="engu"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                className="w-full mt-1 mb-3 px-3 py-2 rounded bg-slate-700 outline-none"
              />
            </>
          )}

          {/* Password */}
          <label htmlFor="password" className="text-sm text-slate-300">Mot de passe</label>
          <div className="relative mb-4">
            <input
              id="password"
              type={showPwd ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 pr-10 rounded bg-slate-700 outline-none"
            />
            <button
              type="button"
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              aria-pressed={showPwd}
              onClick={() => setShowPwd(v => !v)}
              className="absolute inset-y-0 right-2 mt-1 grid place-items-center px-2 rounded hover:bg-slate-600/60"
              tabIndex={0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   className="h-5 w-5 fill-current text-slate-200 opacity-80">
                {showPwd ? (
                  <path d="M12 5c5.523 0 10 5 10 7s-4.477 7-10 7S2 14 2 12s4.477-7 10-7zm0 2C8.134 7 4.88 10.028 4.118 12 4.88 13.972 8.134 17 12 17s7.12-3.028 7.882-5C19.12 10.028 15.866 7 12 7zm0 2a3 3 0 110 6 3 3 0 010-6z"/>
                ) : (
                  <path d="M3.707 2.293 21.707 20.293l-1.414 1.414-2.284-2.284C16.167 20.37 14.147 21 12 21 6.477 21 2 16 2 14c0-.98 1.024-2.83 2.85-4.62L2.293 3.707 3.707 2.293zM7.06 8.474 8.49 9.905A4.002 4.002 0 0012 16c.62 0 1.204-.141 1.724-.392l1.46 1.46A8.27 8.27 0 0112 19c-4.252 0-7.636-3.32-8.747-5 .5-.74 1.53-1.971 3.807-3.526zM12 7c.753 0 1.468.167 2.108.463l-1.566 1.566A2.99 2.99 0 0012 9a3 3 0 00-3 3c0 .364.065.712.185 1.032l-1.53 1.53A4.98 4.98 0 017 12a5 5 0 015-5z"/>
                )}
              </svg>
            </button>
          </div>

          {err && <div className="mb-2 text-sm text-red-300">{err}</div>}

          <button
            onClick={submit}
            disabled={!canSubmit || loading}
            className={`w-full py-2 rounded-lg font-bold transition ${
              (!canSubmit || loading)
                ? 'bg-slate-600 cursor-not-allowed'
                : 'bg-[rgb(22,163,74)] hover:bg-green-700'
            }`}
          >
            {loading ? 'Veuillez patienter…' : (mode === 'login' ? 'Se connecter' : 'Créer le compte')}
          </button>

          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="w-full mt-3 text-sm text-slate-300 underline"
            type="button"
          >
            {mode === 'login' ? 'Créer un compte' : "J'ai déjà un compte"}
          </button>
        </div>
      </main>
    </div>
  )
}

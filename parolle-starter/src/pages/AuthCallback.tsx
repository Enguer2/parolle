// src/pages/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const nav = useNavigate()

  useEffect(() => {
    console.log('[Callback] location.href =', window.location.href)
    console.log('[Callback] referrer     =', document.referrer)

    let unsub: (() => void) | undefined

    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Callback] getSession() ->', session)
      if (session) { nav('/game'); return }

      const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
        console.log('[Callback] auth event:', event, !!sess)
        if (sess) nav('/game')
      })
      unsub = sub?.subscription?.unsubscribe

      setTimeout(async () => {
        const { data: { session: s2 } } = await supabase.auth.getSession()
        console.log('[Callback] recheck session ->', s2)
        if (s2) nav('/game')
      }, 1500)
    })()

    return () => { try { unsub?.() } catch {} }
  }, [nav])

  // Affiche un éventuel message d’erreur renvoyé sur l’URL (utile si tu reviens à / avec ?error=…)
  const params = new URLSearchParams(window.location.search)
  const err = params.get('error') || params.get('error_description')

  return (
    <div className="min-h-[100svh] grid place-items-center text-slate-200">
      <div>
        <div>Connexion en cours…</div>
        {err && <div className="mt-2 text-red-300">Erreur: {err}</div>}
      </div>
    </div>
  )
}

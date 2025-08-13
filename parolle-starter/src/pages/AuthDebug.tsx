// src/pages/AuthDebug.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [session, setSession] = useState<any>(null)
  useEffect(() => {
    supabase.auth.getSession().then(r => setSession(r.data.session))
  }, [])
  return (
    <pre className="p-4 text-xs text-white bg-slate-800 rounded">
      {JSON.stringify({ href: window.location.href, session }, null, 2)}
    </pre>
  )
}

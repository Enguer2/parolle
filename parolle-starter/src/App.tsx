// src/App.tsx
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function App() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  // Petites pages "techniques" (callback OAuth) sans padding inutile
  const isNarrowPage = pathname.startsWith('/auth/callback')

  return (
    <div className="min-h-[100svh] flex flex-col bg-slate-900 text-white">
      <header className="border-b border-slate-700">
        <div className="mx-auto w-full max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="text-xl md:text-2xl font-extrabold tracking-wide">
            {t('brand')}
          </Link>

          <nav className="flex items-center gap-3 text-sm flex-wrap justify-end">
            <NavLink to="/game" className={({isActive}) => isActive ? 'underline' : ''}>
              {t('nav.play')}
            </NavLink>
            <NavLink to="/how-to-play" className={({isActive}) => isActive ? 'underline' : ''}>
              {t('nav.rules')}
            </NavLink>
            <NavLink to="/stats" className={({isActive}) => isActive ? 'underline' : ''}>
              {t('nav.stats')}
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? 'underline' : ''}>
              {t('nav.settings')}
            </NavLink>
            <NavLink to="/login" className={({isActive}) => isActive ? 'underline' : ''}>
              {t('nav.login')}
            </NavLink>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div
          className={
            isNarrowPage
              ? 'mx-auto w-full max-w-5xl px-4 py-2'
              : 'mx-auto w-full max-w-3xl px-4 py-6'
          }
        >
          <Outlet />
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        {t('footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}

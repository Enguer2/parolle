import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-wide">{t('brand')}</Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to="/game" className={({isActive}) => isActive ? 'underline' : ''}>{t('nav.play')}</NavLink>
            <NavLink to="/how-to-play" className={({isActive}) => isActive ? 'underline' : ''}>{t('nav.rules')}</NavLink>
            <NavLink to="/stats" className={({isActive}) => isActive ? 'underline' : ''}>{t('nav.stats')}</NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? 'underline' : ''}>{t('nav.settings')}</NavLink>
            <NavLink to="/login" className={({isActive}) => isActive ? 'underline' : ''}>{t('nav.login')}</NavLink>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="text-center text-xs text-slate-400 py-6">
        {t('footer', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}

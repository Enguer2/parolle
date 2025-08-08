import { Outlet, Link, NavLink } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-wide">PAROLLE</Link>
          <nav className="flex gap-4 text-sm">
            <NavLink to="/game" className={({isActive}) => isActive ? 'underline' : ''}>Jouer</NavLink>
            <NavLink to="/how-to-play" className={({isActive}) => isActive ? 'underline' : ''}>Règles</NavLink>
            <NavLink to="/stats" className={({isActive}) => isActive ? 'underline' : ''}>Stats</NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? 'underline' : ''}>Réglages</NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="text-center text-xs text-slate-400 py-6">
        © {new Date().getFullYear()} Parolle — Wordle corsu
      </footer>
    </div>
  )
}

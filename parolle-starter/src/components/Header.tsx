import { Link, NavLink } from "react-router-dom"
// ...imports inchangés
import LanguageSwitcher from "@/components/LanguageSwitcher"

function CtaButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
                 bg-indigo-600 hover:bg-indigo-500 text-white
                 shadow-[0_6px_20px_rgba(79,70,229,0.35)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    />
  )
}

export default function Header() {
  const linkBase = "px-3 py-2 rounded-lg text-sm font-medium transition"
  const linkActive = "bg-slate-800 text-white"
  const linkIdle = "text-slate-300 hover:text-white hover:bg-slate-800/60"

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800
                       bg-slate-900/90 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70
                       rounded-tl-2xl">
      {/* PLEINE LARGEUR + GUTTERS */}
      <div className="w-full h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* GAUCHE : LOGO collé côté gauche (avec 16–24px de marge interne) */}
        <Link to="/" className="text-white font-extrabold tracking-[0.2em]">PAROLLE</Link>

        {/* DROITE : nav + langue + CTA */}
        <div className="flex items-center gap-3">
          {/* Nav visible à partir de lg pour garder la responsivité */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/" end className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Giuvà</NavLink>
            <NavLink to="/how-to-play" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Regule</NavLink>
            <NavLink to="/stats" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Statistiche</NavLink>
            <NavLink to="/settings" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Paràmetri</NavLink>
          </nav>

          {/* Langue visible dès sm */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* CTA toujours visible */}
          <CtaButton onClick={() => {/* open login */}}>
            Cunnessione
          </CtaButton>
        </div>
      </div>
    </header>
  )
}

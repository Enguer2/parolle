import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white relative">
      <h1 className="text-5xl font-extrabold tracking-widest mb-4">
        {t('home.title')}
      </h1>

      {/* Sous-titre */}
      <p className="text-lg text-slate-400 mb-12">
        U ghjocu di parolle in lingua corsa
      </p>

      <div className="flex flex-col gap-4 w-60">
        <button
          onClick={() => navigate('/game')}
          className="bg-[rgb(22,163,74)] hover:bg-green-700 text-white font-bold py-3 rounded-lg"
        >
          {t('home.playGuest')}
        </button>
        <button
          onClick={() => navigate('/login')}
          className="bg-[rgb(234,179,8)] hover:bg-yellow-600 text-black font-bold py-3 rounded-lg"
        >
          {t('home.login')}
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-slate-500 text-sm">
        <p>Fattu cù ❤️ in Corsica</p>
      </footer>
    </div>
  )
}

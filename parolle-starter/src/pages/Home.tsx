import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TitleTiles from '@/components/TitleTiles'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const title = t('home.title')

  return (
    // hauteur viewport, centrage, et espace pour le footer (safe-area iOS inclus)
    <div className="min-h-dvh flex items-center justify-center bg-slate-900 text-white relative pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* container fluide et centré */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto px-4 sm:px-6">
        <div className="mb-3 sm:mb-4 text-center">
          <TitleTiles text={title} />
        </div>

        {/* Sous-titre responsive */}
        <p className="text-center text-base sm:text-lg text-slate-400 mb-8 sm:mb-12 px-2">
          U ghjocu di parolle in lingua corsa
        </p>

        {/* Boutons fluides, confort tactile et focus visible */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full">
          <button
            onClick={() => navigate('/game')}
            className="w-full bg-[rgb(22,163,74)] hover:bg-green-700 text-white font-bold
                       py-3 sm:py-3.5 md:py-4 rounded-lg text-sm sm:text-base
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {t('home.playGuest')}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[rgb(234,179,8)] hover:bg-yellow-600 text-black font-bold
                       py-3 sm:py-3.5 md:py-4 rounded-lg text-sm sm:text-base
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {t('home.login')}
          </button>
        </div>
      </div>

      {/* Footer collé bas, avec marge safe-area et taille de texte adaptative */}
      <footer className="absolute inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] px-4 text-center text-xs sm:text-sm text-slate-500">
        <p>Fattu cù ❤️ in Corsica</p>
      </footer>
    </div>
  )
}

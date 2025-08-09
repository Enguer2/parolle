import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import des ressources (tu peux splitter par fichiers JSON)
import en from '@/locales/en/common.json'
import co from '@/locales/co/common.json'
import fr from '@/locales/fr/common.json'

i18n
  .use(LanguageDetector)        // détecte navigateur + localStorage
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: fr },
      en: { common: en },
      co: { common: co },
    },
    fallbackLng: 'fr',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      // ordre de détection (le localStorage prime; clé: 'i18nextLng')
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n

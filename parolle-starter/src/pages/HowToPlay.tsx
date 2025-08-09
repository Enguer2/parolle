import { useTranslation } from 'react-i18next'

export default function HowToPlay() {
  const { t } = useTranslation()
  const steps = t('howto.steps', { returnObjects: true }) as string[]

  return (
    <section className="prose prose-invert max-w-xl">
      <h1>{t('howto.title')}</h1>
      <ol>
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </section>
  )
}

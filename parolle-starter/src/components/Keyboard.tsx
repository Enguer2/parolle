import useGame from '@/store/useGame'

const KEYS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','⌫','ENTER'
]

const toBase = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

export default function Keyboard() {
  const { onKey, keyStatesBase } = useGame()

  const cls = (label: string) => {
    if (label === 'ENTER' || label === '⌫')
      return 'bg-slate-700 text-white border border-slate-600'

    const base = toBase(label)                   // È/É -> E
    const st = keyStatesBase[base] ?? 'unused'

    if (st === 'correct') return 'bg-parolle-green text-white border border-parolle-green'
    if (st === 'present') return 'bg-parolle-yellow text-black border border-parolle-yellow'
    if (st === 'absent')  return 'bg-slate-800 text-slate-300 border border-slate-800' // gris foncé
    return 'border border-slate-600' // unused
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xl">
      {KEYS.map(k => (
        <button
          key={k}
          onClick={() => onKey(k)}
          className={`px-3 py-2 rounded-md text-sm hover:brightness-110 active:translate-y-px ${cls(k)}`}
        >
          {k}
        </button>
      ))}
    </div>
  )
}
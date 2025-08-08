
import useGame from '@/store/useGame'

const KEYS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','⌫','ENTER']

export default function Keyboard() {
  const { onKey } = useGame()
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-xl">
      {KEYS.map(k => (
        <button
          key={k}
          onClick={() => onKey(k)}
          className="px-3 py-2 rounded-md border border-slate-600 text-sm hover:bg-slate-800 active:translate-y-px"
        >
          {k}
        </button>
      ))}
    </div>
  )
}

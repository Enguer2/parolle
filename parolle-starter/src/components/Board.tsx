
import useGame from '@/store/useGame'

export default function Board() {
  const { grid } = useGame()
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
      {grid.map((row, rIdx) =>
        row.map((cell, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            className={`w-14 h-14 border-2 grid place-items-center rounded-md font-bold text-xl
              ${cell.state === 'correct' ? 'bg-parolle-green border-parolle-green' : ''}
              ${cell.state === 'present' ? 'bg-parolle-yellow border-parolle-yellow' : ''}
              ${cell.state === 'absent' ? 'bg-slate-700 border-slate-700' : ''}
              ${cell.state === 'empty' ? 'border-slate-600' : ''}
            `}
          >
            {cell.letter}
          </div>
        ))
      )}
    </div>
  )
}

import { useEffect } from 'react'
import Board from '@/components/Board'
import Keyboard from '@/components/Keyboard'
import useGame from '@/store/useGame'

export default function Game() {
  const { setTarget } = useGame()

  useEffect(() => {
    // Exemples : change pour tester différentes longueurs
    // setTarget('CORSU')     // 5
    // setTarget('BALANCA')   // 7
    setTarget('MUNTAGNA')     // 8
  }, [setTarget])

  return (
    <div className="flex flex-col items-center gap-6">
      <Board />
      <Keyboard />
    </div>
  )
}

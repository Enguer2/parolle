import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-extrabold tracking-widest mb-12">PAROLLE</h1>

      <div className="flex flex-col gap-4 w-60">
        <button
          onClick={() => navigate("/game")}
          className="bg-parolle-green hover:bg-green-600 text-white font-bold py-3 rounded-lg"
        >
          Jouer sans connexion
        </button>
        <button
          onClick={() => navigate("/login")}
          className="bg-parolle-yellow hover:bg-yellow-500 text-black font-bold py-3 rounded-lg"
        >
          Connexion
        </button>
      </div>
    </div>
  )
}

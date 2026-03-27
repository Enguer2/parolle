interface ResultModalProps {
  t: any;
  isWon: boolean;
  nbTries: number;
  solution: string;
  stats?: any; // <-- NOUVEAU : On récupère les stats
  onClose: () => void;
}

export default function ResultModal({ t, isWon, nbTries, solution, stats, onClose }: ResultModalProps) {
  // --- Calcul des statistiques ---
  const played = stats?.games_played || (isWon ? 1 : 0);
  const won = stats?.games_won || (isWon ? 1 : 0);
  const winPct = played > 0 ? Math.round((won / played) * 100) : 0;
  const currentStreak = stats?.current_streak || (isWon ? 1 : 0);
  const maxStreak = stats?.max_streak || (isWon ? 1 : 0);
  
  // Timer fictif pour correspondre à ta maquette (à dynamiser plus tard)
  const nextWordle = "14:22:08";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="bg-[#2c2c2d]/90 backdrop-blur-md w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative border border-[#484849]">
        
        {/* Bouton fermer */}
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 text-[#adaaab] hover:text-white transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="px-8 pt-10 pb-12 flex flex-col items-center">
          
          {/* Badge Gagné / Perdu */}
          <div className={`mb-2 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase ${isWon ? 'bg-[#aff4a6]/20 text-[#aff4a6]' : 'bg-red-500/20 text-red-400'}`}>
            {isWon ? t.magnificent : t.tooBad}
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-center ${isWon ? 'text-[#aff4a6]' : 'text-red-400'}`}>
            {isWon ? t.congrats : t.gameOver}
          </h2>
          
          {/* Boîte de statistiques (Design intégré) */}
          <div className="w-full mb-10 overflow-hidden rounded-2xl bg-[#131314] p-6 shadow-inner">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#adaaab] mb-6 text-center">
              {t.statsTitle || "Statistiques"}
            </h3>
            
            <div className="flex justify-around items-end">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">{played}</span>
                <span className="text-[10px] font-bold uppercase text-[#adaaab] tracking-tighter">Joués</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">{winPct}<span className="text-sm ml-0.5">%</span></span>
                <span className="text-[10px] font-bold uppercase text-[#adaaab] tracking-tighter">Victoires</span>
              </div>
              
              <div className="flex flex-col items-center relative">
                {currentStreak > 0 && currentStreak === maxStreak && (
                  <div className="absolute -top-6 bg-[#aff4a6] px-2 py-0.5 rounded text-[8px] font-black text-[#002a04]">
                    NEW BEST
                  </div>
                )}
                <span className={`text-3xl font-black ${isWon ? 'text-[#aff4a6]' : 'text-white'}`}>{currentStreak}</span>
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isWon ? 'text-[#aff4a6]' : 'text-[#adaaab]'}`}>Série</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-white">{maxStreak}</span>
                <span className="text-[10px] font-bold uppercase text-[#adaaab] tracking-tighter">Max</span>
              </div>
            </div>
          </div>
          
          {/* Affichage du mot si le joueur a PERDU */}
          {!isWon && (
             <div className="w-full mb-8 text-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#adaaab] block mb-2">{t.secretWordWas}</span>
               <span className="text-4xl font-black text-white tracking-[0.2em]">{solution}</span>
             </div>
          )}
          
          {/* Zone d'action : Compte à rebours et Bouton Partager */}
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between text-[#adaaab] text-sm px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest">Next Parolle</span>
                <span className="text-xl font-black text-white">{nextWordle}</span>
              </div>
              
              <div className="h-10 w-px bg-[#484849]/50"></div>
              
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest">Share Result</span>
                <span className="text-white">Parolle #842</span>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className={`w-full py-4 font-black text-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_12px_32px_rgba(175,244,166,0.2)] ${isWon ? 'bg-gradient-to-r from-[#aff4a6] to-[#7ce071] text-[#002a04]' : 'bg-[#4a5568] text-white hover:bg-[#718096]'}`}
            >
              {isWon ? 'SHARE RESULT' : t.closeBtn}
              {isWon && <span className="material-icons font-black">share</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
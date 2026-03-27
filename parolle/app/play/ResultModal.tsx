import { useState, useEffect } from 'react';

interface ResultModalProps {
  t: any;
  isWon: boolean;
  nbTries: number;
  solution: string;
  stats?: any; 
  user?: any;           // <-- NOUVEAU : Pour vérifier s'il est connecté
  onLogin?: () => void; // <-- NOUVEAU : Fonction pour lancer Google OAuth
  onClose: () => void;
}

export default function ResultModal({ t, isWon, nbTries, solution, stats, user, onLogin, onClose }: ResultModalProps) {
  // --- Calcul des statistiques dynamiques ---
  const played = stats?.games_played || (isWon ? 1 : 0);
  const won = stats?.games_won || (isWon ? 1 : 0);
  const winPct = played > 0 ? Math.round((won / played) * 100) : 0;
  const currentStreak = stats?.current_streak || (isWon ? 1 : 0);
  const maxStreak = stats?.max_streak || (isWon ? 1 : 0);
  
  // --- Compte à rebours dynamique (Cycle de 10 min) ---
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextInterval = new Date(now);
      
      const currentMinutes = now.getMinutes();
      const next10 = Math.ceil((currentMinutes + 1) / 10) * 10;
      nextInterval.setMinutes(next10, 0, 0);

      const diff = nextInterval.getTime() - now.getTime();
      if (diff <= 0) return;

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer(); 
    const timerId = setInterval(updateTimer, 1000); 
    return () => clearInterval(timerId); 
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="bg-[#2c2c2d]/90 backdrop-blur-md w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative border border-[#484849]">
        
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="p-2 text-[#adaaab] hover:text-white transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="px-8 pt-10 pb-12 flex flex-col items-center">
          
          <div className={`mb-2 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase ${isWon ? 'bg-[#aff4a6]/20 text-[#aff4a6]' : 'bg-red-500/20 text-red-400'}`}>
            {isWon ? t.magnificent : t.tooBad}
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-center ${isWon ? 'text-[#aff4a6]' : 'text-red-400'}`}>
            {isWon ? t.congrats : t.gameOver}
          </h2>
          
          {/* BOÎTE CENTRALE INTELLIGENTE */}
          <div className="w-full mb-10 overflow-hidden rounded-2xl bg-[#131314] p-6 shadow-inner">
            {user ? (
              // Affichage des VRAIES stats si l'utilisateur est connecté
              <>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#adaaab] mb-6 text-center">
                  {t.statsTitle || "Statistiques"}
                </h3>
                <div className="flex justify-around items-end">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{played}</span>
                    <span className="text-[10px] font-bold uppercase text-[#adaaab] tracking-tighter">{t.statsPlayed || "Joués"}</span>
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
              </>
            ) : (
              // Invitation à se connecter si c'est un invité
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-[#2d3748] rounded-full flex items-center justify-center mb-3">
                  <span className="material-icons text-2xl text-[#8e98a8]">save</span>
                </div>
                <p className="text-[#8e98a8] text-xs mb-4 leading-relaxed px-2">
                  {t.loginForStats || "Connectez-vous pour sauvegarder votre progression et vos statistiques."}
                </p>
                <button 
                  onClick={onLogin} 
                  className="w-full py-3 bg-[#6b5cd6] text-white font-bold text-sm rounded-xl hover:bg-[#5849bc] transition-all flex items-center justify-center gap-2"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 bg-white rounded-full p-0.5" />
                  {t.login || "Connexion"}
                </button>
              </div>
            )}
          </div>
          
          {/* Affichage du mot si PERDU */}
          {!isWon && (
             <div className="w-full mb-8 text-center">
               <span className="text-[10px] font-bold uppercase tracking-widest text-[#adaaab] block mb-2">{t.secretWordWas}</span>
               <span className="text-4xl font-black text-white tracking-[0.2em]">{solution}</span>
             </div>
          )}
          
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between text-[#adaaab] text-sm px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest">Next Parolle</span>
                <span className="text-xl font-black text-white">{timeLeft}</span>
              </div>
              <div className="h-10 w-px bg-[#484849]/50"></div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest">Share Result</span>
                <span className="text-white">Parolle</span>
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
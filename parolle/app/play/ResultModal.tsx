import { useState, useEffect } from 'react';

interface ResultModalProps {
  t: any;
  isWon: boolean;
  nbTries: number;
  solution: string;
  guesses: string[];
  language: string; // <-- AJOUTE CECI
  stats?: any;
  user?: any;
  onLogin?: () => void;
  onClose: () => void;
}

export default function ResultModal({ t, isWon, nbTries,language, solution, guesses, stats, user, onLogin, onClose }: ResultModalProps) {
  const played = stats?.games_played || (isWon ? 1 : 0);
  const won = stats?.games_won || (isWon ? 1 : 0);
  const winPct = played > 0 ? Math.round((won / played) * 100) : 0;
  const currentStreak = stats?.current_streak || (isWon ? 1 : 0);
  const maxStreak = stats?.max_streak || (isWon ? 1 : 0);

  const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
  const [isCopied, setIsCopied] = useState(false);

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

  const handleShare = () => {
  const grid = guesses
    .filter(g => g !== "")
    .map(guess => {
      return guess.split('').map((char, i) => {
        if (char === solution[i]) return '🟩';
        if (solution.includes(char)) return '🟨';
        return '⬜';
      }).join('');
    })
    .join('\n');

  const shareText = `🎯 Parolle (${language.toUpperCase()}) ${isWon ? nbTries : 'X'}/6\n\n${grid}\n\n🕹️ Ghjucate quì : https://parolle-corsica.vercel.app`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div
        className="bg-[#131314] w-full max-w-[450px] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] relative border border-[#484849]/30 overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className={`h-px bg-gradient-to-r from-transparent ${isWon ? 'via-[#aff4a6]/40' : 'via-red-500/40'} to-transparent`} />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors"
          >
            <span className="material-icons text-[22px]">close</span>
          </button>

          <div className="text-center mb-8 mt-2">
            <div
              className={`inline-block mb-3 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                isWon ? 'bg-[#aff4a6]/10 text-[#aff4a6] border-[#aff4a6]/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {isWon ? t.magnificent : t.tooBad}
            </div>

            <h2
              className={`text-3xl font-black uppercase tracking-tighter ${isWon ? 'text-white' : 'text-white/80'}`}
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {isWon ? t.congrats : t.gameOver}
            </h2>
          </div>

          {!isWon && (
            <div className="w-full mb-8 text-center bg-[#1f1f21] border border-[#484849]/20 rounded-xl py-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">
                {t.secretWordWas}
              </span>
              <span
                className="text-3xl font-black text-red-400 tracking-[0.1em]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {solution}
              </span>
            </div>
          )}

          <div className="w-full mb-8">
            {user ? (
              <>
                <h3
                  className="text-xs font-black uppercase tracking-widest text-white/60 mb-3 text-center"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {t.statsTitle || "Statistiques"}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center bg-[#1f1f21] rounded-xl py-3 px-1 border border-[#484849]/20">
                    <div className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>{played}</div>
                    <div className="text-[9px] text-white/40 leading-tight uppercase tracking-wider">{t.statsPlayed || "Joués"}</div>
                  </div>
                  <div className="text-center bg-[#1f1f21] rounded-xl py-3 px-1 border border-[#484849]/20">
                    <div className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>{winPct}<span className="text-sm">%</span></div>
                    <div className="text-[9px] text-white/40 leading-tight uppercase tracking-wider">Victoires</div>
                  </div>
                  <div className="text-center bg-[#1f1f21] rounded-xl py-3 px-1 border border-[#484849]/20 relative">
                    {currentStreak > 0 && currentStreak === maxStreak && (
                      <div className="absolute -top-2 -right-1 bg-[#aff4a6] px-1.5 py-0.5 rounded text-[8px] font-black text-[#002a04] shadow-[0_0_10px_rgba(175,244,166,0.3)]">
                        NEW
                      </div>
                    )}
                    <div className={`text-2xl font-black mb-0.5 ${isWon ? 'text-[#aff4a6]' : 'text-white'}`} style={{ fontFamily: 'Manrope, sans-serif' }}>{currentStreak}</div>
                    <div className={`text-[9px] leading-tight uppercase tracking-wider ${isWon ? 'text-[#aff4a6]/70' : 'text-white/40'}`}>Série</div>
                  </div>
                  <div className="text-center bg-[#1f1f21] rounded-xl py-3 px-1 border border-[#484849]/20">
                    <div className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>{maxStreak}</div>
                    <div className="text-[9px] text-white/40 leading-tight uppercase tracking-wider">Max</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#1f1f21] border border-[#484849]/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-[#131314] border border-[#484849]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-[#aff4a6]/60">save</span>
                </div>
                <p className="text-white/40 text-xs mb-5 leading-relaxed px-2">
                  {t.loginForStats || "Connectez-vous pour sauvegarder votre progression et vos statistiques."}
                </p>
                <button
                  onClick={onLogin}
                  className="w-full py-3 bg-[#aff4a6]/10 text-[#aff4a6] border border-[#aff4a6]/20 font-black rounded-xl hover:bg-[#aff4a6]/20 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 bg-white rounded-full p-0.5" />
                  {t.login || "Connexion"}
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#484849]/40 to-transparent mb-6" />

          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between text-[#adaaab] px-2 mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">Next Parolle</span>
                <span className="text-2xl font-black text-white tracking-tighter" style={{ fontFamily: 'Manrope, sans-serif' }}>{timeLeft}</span>
              </div>
              <div className="h-10 w-px bg-[#484849]/50"></div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">Share Result</span>
                <span className="text-sm font-black text-white uppercase tracking-widest" style={{ fontFamily: 'Manrope, sans-serif' }}>Parolle</span>
              </div>
            </div>

            {isWon ? (
              <button
                onClick={handleShare}
                className={`w-full py-4 font-black rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest ${
                  isCopied 
                    ? 'bg-white text-[#002a04] shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                    : 'bg-[#aff4a6] text-[#002a04] hover:bg-[#a2e599] shadow-[0_4px_24px_rgba(175,244,166,0.2)]'
                }`}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {isCopied ? 'COPIÉ ! ✅' : 'SHARE RESULT'}
                {!isCopied && <span className="material-icons text-[18px]">share</span>}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#262627] text-white/70 font-black rounded-xl hover:bg-[#2c2c2d] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest border border-[#484849]/40"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {t.closeBtn}
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#484849]/20 to-transparent" />
      </div>
    </div>
  );
}